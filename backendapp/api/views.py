from django.shortcuts import render
from rest_framework import viewsets
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from account.models import CustomUser
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.db.models.functions import Length
from . import models
from . import serializers
from collections import namedtuple
from rest_framework import status
from django.template.loader import render_to_string
from django.core.mail import send_mail
from backendapp import settings
import json
from pathlib import Path
from datetime import datetime
from django.db.models import Q
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from rest_framework.decorators import action
from django.db.models import Sum
import re

LMS_OUTPUT_DIR = Path(settings.BASE_DIR).parent / 'lms' / 'output'


def _normalize_program_label(value):
    return ' '.join(str(value or '').strip().split())


def _load_latest_lms_json(prefix, exclude_prefixes=None):
    exclude_prefixes = exclude_prefixes or []

    if not LMS_OUTPUT_DIR.exists():
        return None, []

    candidates = []
    for file_path in LMS_OUTPUT_DIR.glob(f'{prefix}-*.json'):
        if any(file_path.name.startswith(excluded) for excluded in exclude_prefixes):
            continue
        candidates.append(file_path)

    if not candidates:
        return None, []

    latest_file = max(candidates, key=lambda path: path.stat().st_mtime)

    try:
        with latest_file.open('r', encoding='utf-8') as file:
            data = json.load(file)
    except (OSError, json.JSONDecodeError):
        data = []

    if not isinstance(data, list):
        data = [data] if data else []

    return latest_file, data


def _build_lms_response(kind, latest_file, data):
    programs = sorted(
        {
            item.get('program')
            for item in data
            if isinstance(item, dict) and item.get('program')
        }
    )

    return Response(
        {
            'kind': kind,
            'source_file': latest_file.name if latest_file else None,
            'generated_at': datetime.fromtimestamp(latest_file.stat().st_mtime).isoformat()
            if latest_file
            else None,
            'count': len(data),
            'programs': programs,
            'items': data,
        }
    )


def _filter_lms_by_program(request, data):
    program = _normalize_program_label(request.query_params.get('program'))
    if not program or program.lower() == 'all':
        return data

    filtered = []
    for item in data:
        if not isinstance(item, dict):
            continue

        item_program = _normalize_program_label(item.get('program'))
        if item_program == program:
            filtered.append(item)

    return filtered


class LmsAttendanceLatestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        latest_file, data = _load_latest_lms_json(
            'attendance', exclude_prefixes=['attendance-discovery-']
        )
        data = _filter_lms_by_program(request, data)
        return _build_lms_response('attendance', latest_file, data)


class LmsMaterialsLatestView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        latest_file, data = _load_latest_lms_json('materials')
        data = _filter_lms_by_program(request, data)
        return _build_lms_response('materials', latest_file, data)


class ProgramStudiViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProgramStudiSerializers
    queryset = models.ProgramStudi.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class KurikulumViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.KurikulumSerializers
    queryset = models.Kurikulum.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()


class MataKuliahViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.MataKuliahSerializers
    queryset = models.MataKuliah.objects.all()
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        if getattr(instance, '_prefetched_objects_cache', None):
            instance._prefetched_objects_cache = {}
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()


class CycleViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CycleSerializers
    queryset = models.Cycle.objects.all()

    def list(self, request, *args, **kwargs):
        queryset = list(self.filter_queryset(self.get_queryset()).order_by('start_year', '-semester'))
        queryset_length = len(queryset)

        for index, item in enumerate(queryset):
            if(queryset_length - 1 == index):
                pass
            elif(item.semester == 'Odd Short' and queryset[index + 1].semester == 'Odd'):
                queryset[index] = queryset[index + 1]
                queryset[index + 1] = item
            elif(item.semester == 'Even Short' and queryset[index + 1].semester == 'Even'):
                queryset[index] = queryset[index + 1]
                queryset[index + 1] = item

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class DosenViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DosenSerializers
    queryset = models.Dosen.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class SuratPenugasanViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SuratPenugasanSerializers
    queryset = models.SuratPenugasan.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPenelitianViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PenugasanPenelitianSerializers
    queryset = models.PenugasanPenelitian.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPenelitianByDosenViewSet(generics.ListAPIView):
    serializer_class = serializers.PenugasanPenelitianSerializers
    queryset = models.PenugasanPenelitian.objects.all()

    def get(self, request, *args, **kwargs):
        penugasanPenelitianByDosen = models.PenugasanPenelitian.objects.filter(dosen_pengampu__user__id = self.kwargs['dosenId'] )
        serializer = self.get_serializer(penugasanPenelitianByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PublikasiKaryaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PublikasiKaryaSerializers
    queryset = models.PublikasiKarya.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PublikasiKaryaByDosenViewSet(generics.ListAPIView):
    serializer_class = serializers.PublikasiKaryaSerializers
    queryset = models.PublikasiKarya.objects.all()

    def get(self, request, *args, **kwargs):
        publikasiKaryaByDosen = models.PublikasiKarya.objects.filter(dosen_pengampu__user__id = self.kwargs['dosenId'] )
        serializer = self.get_serializer(publikasiKaryaByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PublikasiKaryaByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.PublikasiKaryaSerializers
    queryset = models.PublikasiKarya.objects.all()

    def get(self, request, *args, **kwargs):
        publikasiKaryaByProdi = models.PublikasiKarya.objects.filter(dosen_pengampu__prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(publikasiKaryaByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PatenHKIViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PatenHKISerializers
    queryset = models.PatenHKI.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PatenHKIByDosenViewSet(generics.ListAPIView):
    serializer_class = serializers.PatenHKISerializers
    queryset = models.PatenHKI.objects.all()

    def get(self, request, *args, **kwargs):
        patenHKIByDosen = models.PatenHKI.objects.filter(dosen_pengampu__user__id = self.kwargs['dosenId'] )
        serializer = self.get_serializer(patenHKIByDosen, many=True)
        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PatenHKIByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.PatenHKISerializers
    queryset = models.PatenHKI.objects.all()

    def get(self, request, *args, **kwargs):
        patenHKIByProdi = models.PatenHKI.objects.filter(dosen_pengampu__prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(patenHKIByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()


class PenugasanPengabdianViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PenugasanPengabdianSerializers
    queryset = models.PenugasanPengabdian.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPengabdianByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.PenugasanPengabdianSerializers
    queryset = models.PenugasanPengabdian.objects.all()

    def get(self, request, *args, **kwargs):
        penugasanPengabdianByProdi = models.PenugasanPengabdian.objects.filter(dosen_pengampu__prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(penugasanPengabdianByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPengabdianByDosenViewSet(generics.ListAPIView):
    serializer_class = serializers.PenugasanPengabdianSerializers
    queryset = models.PenugasanPengabdian.objects.all()

    def get(self, request, *args, **kwargs):
        penugasanPengabdianByDosen = models.PenugasanPengabdian.objects.filter(dosen_pengampu__user__id = self.kwargs['dosenId'] )
        serializer = self.get_serializer(penugasanPengabdianByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()


class PembicaraViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PembicaraSerializers
    queryset = models.Pembicara.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PengelolaJurnalViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PengelolaJurnalSerializers
    queryset = models.PengelolaJurnal.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class RiwayatJabatanStrukturalViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.RiwayatJabatanStrukturalSerializers
    queryset = models.RiwayatJabatanStruktural.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPengajaranViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PenugasanPengajaranSerializers
    queryset = models.PenugasanPengajaran.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPengajaranByExcelViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PenugasanPengajaranSerializers
    queryset = models.PenugasanPengajaran.objects.all()

    def create(self, request, *args, **kwargs):
        convert_to = json.dumps(request.data, indent=4)
        data_dict = json.loads(convert_to)

        subject = data_dict.get('Subject')
        subject_short = data_dict.get('Subject Short')
        graded_credits = data_dict.get('Graded Credits')
        surat_penugasan = data_dict.get('Surat Penugasan')

        matakuliah, created= models.MataKuliah.objects.get_or_create(name=subject, kode=subject_short, sks_total=graded_credits)
        
        suratpenugasan, created= models.SuratPenugasan.objects.get_or_create(judul=surat_penugasan)

        nama_dosen = data_dict.get('Name')
        nama_dosen_split = str(nama_dosen).split("/")
        inisial = data_dict.get('Initial')
        inisial_split = str(inisial).split("/")
        nik_dosen = data_dict.get('NIK')
        nik_dosen_split = str(nik_dosen).split("/")

        for i in range(len(inisial_split)-1): 
            dosen_fm, created = models.Dosen.objects.get_or_create(
                name=nama_dosen_split[i], nik=nik_dosen_split[i], inisial=inisial_split[i]  
            )
            penugasan_pengajaran, created = models.PenugasanPengajaran.objects.get_or_create(
                sks_realisasi=graded_credits, dosen_pengampu=dosen_fm, mata_kuliah=matakuliah, surat_penugasan=suratpenugasan
            )

        serializer = self.get_serializer(instance=penugasan_pengajaran, many=True)
        headers = self.get_success_headers(serializer.data)
        return Response({'nama_dosen': nama_dosen, 'nik_dosen': nik_dosen, 'inisial_dosen':inisial,  'mata_kuliah': subject, 'kode_mk': subject_short, 'sks': graded_credits, 'surat_penugasan': surat_penugasan, 'error': False }, status=status.HTTP_201_CREATED, headers=headers)
        

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class DokumenPembelajaranViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DokumenPembelajaranSerializers
    queryset = models.DokumenPembelajaran.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class DokumenPembelajaranByDosenViewSet(generics.ListAPIView):
    serializer_class = serializers.DokumenPembelajaranSerializers
    queryset = models.DokumenPembelajaran.objects.all()

    def get(self, request, *args, **kwargs):
        dokumenPembelajaranByDosen = models.DokumenPembelajaran.objects.filter(penugasanPengajaranId__dosen_pengampu__user__id=self.kwargs['userId'])
        serializer = self.get_serializer(dokumenPembelajaranByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
        
class DokumenPembelajaranByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.DokumenPembelajaranSerializers
    queryset = models.DokumenPembelajaran.objects.all()

    def get(self, request, *args, **kwargs):
        dokumenPembelajaranByProdi = models.DokumenPembelajaran.objects.filter(penugasanPengajaranId__dosen_pengampu__prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(dokumenPembelajaranByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class RiwayatDokumenPembelajaranViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.RiwayatDokumenPembelajaranSerializers
    queryset = models.RiwayatDokumenPembelajaran.objects.all()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        prodiDosen = models.DokumenPembelajaran.objects.get(id=serializer.data['dokumenPembelajaranId']).penugasanPengajaranId.dosen_pengampu.prodi.name

        if prodiDosen:
            kaprodiByProdi = models.Dosen.objects.filter(prodi__name=prodiDosen, user__jabatan='Kaprodi')

            if len(kaprodiByProdi):
                subject = ""
                email_template_name = ""

                if(request.data['type'] == 'rps'):
                    subject = "upload RPS"
                    email_template_name = "notification/uploadRPS.txt"
                elif(request.data['type'] == 'rubrik'):
                    subject = "upload Rubrik"
                    email_template_name = "notification/uploadRubrik.txt"

                email = kaprodiByProdi[0].user.email
                c = {
                    'site_name' : 'master.d3anppu24t60so.amplifyapp.com',
                    'domain' : 'master.d3anppu24t60so.amplifyapp.com/pelaksanaan-pendidikan/dokumen-pembelajaran',
                    'dokumenPembelajaranId' : request.data['dokumenPembelajaranId'],
                    'protocol' : 'http',
                }

                email_description = render_to_string(email_template_name, c)

                send_mail(subject, email_description, settings.EMAIL_HOST_USER, [email], fail_silently=False)
                
                self.perform_create(serializer)
                headers = self.get_success_headers(serializer.data)

                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
            else:
                return Response('Kaprodi tidak ditemukan', status=status.HTTP_406_NOT_ACCEPTABLE)
        else:
            return Response('Mata Kuliah Dosen tidak ditemukan', status=status.HTTP_406_NOT_ACCEPTABLE)
            

    def perform_create(self, serializer):
        serializer.save()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class RiwayatDokumenPembelajaranByDokumenPembelajaranViewSet(generics.ListAPIView):
    serializer_class = serializers.RiwayatDokumenPembelajaranSerializers
    queryset = models.RiwayatDokumenPembelajaran.objects.all()

    def get(self, request, *args, **kwargs):
        dokumenPembelajaranByDosen = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId=self.kwargs['dokumenPembelajaranId'])
        serializer = self.get_serializer(dokumenPembelajaranByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPengabdianBySuratPenugasan(generics.ListAPIView):
    serializer_class = serializers.PenugasanPengabdianSerializers
    queryset = models.PenugasanPengabdian.objects.all()

    def get(self, request, *args, **kwargs):
        penugasanPengabdianBySuratPenugasan = models.PenugasanPengabdian.objects.filter(surat_penugasan__id=self.kwargs['suratPenugasanId'])
        serializer = self.get_serializer(penugasanPengabdianBySuratPenugasan, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPenelitianBySuratPenugasan(generics.ListAPIView):
    serializer_class = serializers.PenugasanPenelitianSerializers
    queryset = models.PenugasanPenelitian.objects.all()

    def get(self, request, *args, **kwargs):
        penugasanPenelitianBySuratPenugasan = models.PenugasanPenelitian.objects.filter(surat_penugasan__id=self.kwargs['suratPenugasanId'])
        serializer = self.get_serializer(penugasanPenelitianBySuratPenugasan, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PenugasanPenelitianByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.PenugasanPenelitianSerializers
    queryset = models.PenugasanPenelitian.objects.all()

    def get(self, request, *args, **kwargs):
        penugasanPenelitianByProdi = models.PenugasanPenelitian.objects.filter(dosen_pengampu__prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(penugasanPenelitianByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()


class PenugasanPengajaranBySuratPenugasan(generics.ListAPIView):
    serializer_class = serializers.PenugasanPengajaranSerializers
    queryset = models.PenugasanPengajaran.objects.all()

    def get(self, request, *args, **kwargs):
        dokumenPembelajaranByDosen = models.PenugasanPengajaran.objects.filter(surat_penugasan__id=self.kwargs['suratPenugasanId'])
        serializer = self.get_serializer(dokumenPembelajaranByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PortofolioPerkuliahanViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PortofolioPerkuliahanSerializers
    queryset = models.PortofolioPerkuliahan.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class PortofolioPerkuliahanByDosenViewSet(generics.ListAPIView):
    serializer_class = serializers.PortofolioPerkuliahanSerializers
    queryset = models.PortofolioPerkuliahan.objects.all()

    def get(self, request, *args, **kwargs):
        portofolioPerkuliahanByDosen = models.PortofolioPerkuliahan.objects.filter(penugasan__dosen_pengampu__id=self.kwargs['dosenId'])
        serializer = self.get_serializer(portofolioPerkuliahanByDosen, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class DataMahasiswaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DataMahasiswaSerializers
    queryset = models.DataMahasiswa.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class DataMahasiswaByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.DataMahasiswaSerializers
    queryset = models.DataMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        dataMahasiswaByProdi = models.DataMahasiswa.objects.filter(prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(dataMahasiswaByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class GrupMahasiswaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.GrupMahasiswaSerializers
    queryset = models.GrupMahasiswa.objects.all()

    def create(self, request, *args, **kwargs):
        convert_to = json.dumps(request.data, indent=4)
        data_dict = json.loads(convert_to)

        nama_mahasiswa = data_dict.get('nama_mahasiswa')
        nim_mahasiswa = data_dict.get('nim_mahasiswa')
        angkatan = data_dict.get('angkatan')
        telephone_mahasiswa = data_dict.get('telephone')
        email = data_dict.get('email')
        email_universitas = data_dict.get('email_universitas')



        name_prody = data_dict.get('nama_prody')

        try:
            programstudi = models.ProgramStudi.objects.get(name=name_prody)
        except models.DataMahasiswa.DoesNotExist:
            programstudi, created = models.ProgramStudi.objects.create(name=name_prody)

        try:
            datamahasiswa = models.DataMahasiswa.objects.get(nim=nim_mahasiswa)
            datamahasiswa.telephone = telephone_mahasiswa
            datamahasiswa.email = email
            datamahasiswa.email_universitas = email_universitas
            datamahasiswa.save()
        except models.DataMahasiswa.DoesNotExist:
            datamahasiswa = models.DataMahasiswa.objects.create(
                nama=nama_mahasiswa,
                nim=nim_mahasiswa,
                angkatan=angkatan,
                prodi=programstudi,
                telephone=telephone_mahasiswa,
                email=email,
                email_universitas=email_universitas)
            
        nama_grup = data_dict.get('nama_grup')
            
        grup_mahasiswa, created = models.GrupMahasiswa.objects.get_or_create(namagrup=nama_grup)

        assigntogrup, created = models.AssignMahasiswatoGrup.objects.get_or_create(nama_mahasiswa=datamahasiswa, nama_grup=grup_mahasiswa)

        serializer = self.get_serializer(instance=assigntogrup)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class BroadCastPesanViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.BroadcastPesanSerializers
    queryset = models.BroadcastPesan.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class KonsolChatbotViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.KonsolChatbotSerializers
    queryset = models.KonsolChatbot.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class AssignMahasiswatoGrupViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.AssignMahasiswatoGrupSerializers
    queryset = models.AssignMahasiswatoGrup.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class AssignMahasiswatoGrupByNamaGrupViewSet(generics.ListAPIView):
    serializer_class = serializers.AssignMahasiswatoGrupSerializers
    queryset = models.AssignMahasiswatoGrup.objects.all()

    def get(self, request, *args, **kwargs):
        asiignMahasiswatoGrupByNamaGrup = models.AssignMahasiswatoGrup.objects.filter(nama_grup__namagrup=self.kwargs['assignMahasiswaGrupName'])
        serializer = self.get_serializer(asiignMahasiswatoGrupByNamaGrup, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class MonitoringMahasiswaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.MonitoringMahasiswaSerializers
    queryset = models.MonitoringMahasiswa.objects.all()

    def create(self, request, *args, **kwargs):

        convert_to = json.dumps(request.data, indent=4)
        data_dict = json.loads(convert_to)

        name_prody = data_dict.get('Program (Desc.)')
        program_study = data_dict.get('Program of study')

        # get mahasiswa
        nama_mahasiswa = data_dict.get('Name')
        nim_mahasiswa = data_dict.get('NIM')
        angkatan = data_dict.get('Angkatan')

        # get subject
        # kode_sap = data_dict.get('Program of study')
        
        # get credit
        earned_credits = data_dict.get('Earned Credits')

        # get grade
        grade_symbol = data_dict.get('Grade symbol')

        # Check if ProgramStudi already exists
        if name_prody == "Computer Systems Engineering" :
            kode = "CSE"
        elif name_prody == "Software Engineering" :
            kode = "SE"
        elif name_prody == "Mathematics" :
            kode = "BM"
        elif name_prody == "Product Design Engineering" :
            kode = "PDE"
        elif name_prody == "Renewable Energy Engineering" :
            kode = "REE"
        elif name_prody == "Food Technology" :
            kode = "FBT"

        # programstudi = models.ProgramStudi.objects.get(kode_sap=program_study)
        try:
            programstudi = models.ProgramStudi.objects.get(kode_sap=program_study)
        except models.ProgramStudi.DoesNotExist:
            programstudi, created = models.ProgramStudi.objects.get_or_create(
                name = name_prody,
                kode = kode,
                kode_sap = program_study
            )

        try:
            datamahasiswa = models.DataMahasiswa.objects.get(nim=nim_mahasiswa)
        except models.DataMahasiswa.DoesNotExist:
            datamahasiswa, created = models.DataMahasiswa.objects.get_or_create(
                nama=nama_mahasiswa,
                nim=nim_mahasiswa,
                angkatan=angkatan,
                prodi=programstudi)
    

        subject = data_dict.get('Subject')
        subject_short = data_dict.get('Subject Short')
        graded_credits = data_dict.get('Graded Credits')
        academic_year = data_dict.get('Academic Year')
        academic_session = data_dict.get('Academic Session')
        sm_objid = data_dict.get('SM Objid')
        st_object_type = data_dict.get('Object type')
        st_objid = data_dict.get('ST Objid')
        student_id = data_dict.get('Student ID')
        appraisal_type = data_dict.get('Appraisal Type')
        sm_object_type = data_dict.get('Object type')
        sm_objid = data_dict.get('SM Objid')
        event_package_objid = data_dict.get('Event Package Objid')
        event_package_short = data_dict.get('Event Package Short')
        event_package_text = data_dict.get('Event Package Text')

        if (data_dict.get('Grade symbol') == ""):
            grade_symbol = "T"
        else :
            grade_symbol = data_dict.get('Grade symbol')
        credit_type = data_dict.get('Credit Type')
        mentor = data_dict.get('Mentor')

        i_angkatan = int(angkatan)
        i_academic_year = int(academic_year)
        semester_count = (i_academic_year - i_angkatan) * 2

        if academic_session == '10':
            semester = f"{semester_count + 1}"
        elif academic_session == '20':
            semester = f"SP{semester_count + 1}"
        elif academic_session == '30':
            semester = f"{semester_count + 2}"
        elif academic_session == '40':
            semester = f"SP{semester_count + 2}"


        # Create MataKuliah
        try:
            matakuliah = models.MataKuliah.objects.get(kode=subject_short)
            if matakuliah.prodi != programstudi or matakuliah.semester != semester or matakuliah.sks_total != graded_credits:
                matakuliah, created = models.MataKuliah.objects.get_or_create(
                    name = subject,
                    kode = subject_short,
                    sks_total = graded_credits,
                    sm_objid = sm_objid,
                    prodi = programstudi,
                    semester = semester
            )
                
        except models.MataKuliah.DoesNotExist:
            matakuliah, created = models.MataKuliah.objects.get_or_create(
                name = subject,
                kode = subject_short,
                sks_total = graded_credits,
                sm_objid = sm_objid,
                prodi = programstudi,
                semester = semester
            )
        except models.MataKuliah.MultipleObjectsReturned:
            matakuliah = models.MataKuliah.objects.filter(kode=subject_short).order_by('created_at').first()

        

        try :
            get_monitoring_mahasiswa = models.MonitoringMahasiswa.objects.get(
                mahasiswa = datamahasiswa,
                mata_kuliah = matakuliah,
                academic_session = academic_session,
                academic_year = academic_year,
            )

            if(get_monitoring_mahasiswa.grade_symbol == "T"):
                get_monitoring_mahasiswa.earned_credits = earned_credits,
                get_monitoring_mahasiswa.grade_symbol = grade_symbol,
                get_monitoring_mahasiswa.save()
            
            else:
                monitoring_mahasiswa, created = models.MonitoringMahasiswa.objects.get_or_create(
                    st_object_type = st_object_type,
                    st_objid = st_objid,
                    mahasiswa = datamahasiswa,
                    student_id = student_id,
                    appraisal_type = appraisal_type,
                    sm_object_type = sm_object_type,
                    sm_objid = sm_objid,
                    mata_kuliah = matakuliah,
                    event_package_objid = event_package_objid,
                    event_package_short = event_package_short,
                    event_package_text = event_package_text,
                    grade_symbol = grade_symbol,
                    earned_credits = earned_credits,
                    credit_type = credit_type,
                    prodi = programstudi,
                    mentor = mentor,
                    academic_session = academic_session,
                    academic_year = academic_year,
                )

        except models.MonitoringMahasiswa.DoesNotExist:
            monitoring_mahasiswa, created = models.MonitoringMahasiswa.objects.get_or_create(
                st_object_type = st_object_type,
                st_objid = st_objid,
                mahasiswa = datamahasiswa,
                student_id = student_id,
                appraisal_type = appraisal_type,
                sm_object_type = sm_object_type,
                sm_objid = sm_objid,
                mata_kuliah = matakuliah,
                event_package_objid = event_package_objid,
                event_package_short = event_package_short,
                event_package_text = event_package_text,
                grade_symbol = grade_symbol,
                earned_credits = earned_credits,
                credit_type = credit_type,
                prodi = programstudi,
                mentor = mentor,
                academic_session = academic_session,
                academic_year = academic_year,
            )

        try :
            get_transkrip_nilai = models.TranskripNilai.objects.get(
                mahasiswa = datamahasiswa,
                mata_kuliah = matakuliah,
            )
            
            if (get_transkrip_nilai.grade_symbol == "AB" and grade_symbol == "A"):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "B" and (grade_symbol == "A" or grade_symbol == "AB")) :
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "BC" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B")):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "C" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC")):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "D" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC" or grade_symbol == "C")):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "E" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC" or grade_symbol == "C" or grade_symbol == "D")):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "T" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC" or grade_symbol == "C" or grade_symbol == "D" or grade_symbol == "E")):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC" or grade_symbol == "C" or grade_symbol == "D" or grade_symbol == "E" or grade_symbol == "T")):
                get_transkrip_nilai.earned_credits = earned_credits
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            serializer = self.get_serializer(instance=get_transkrip_nilai)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except models.TranskripNilai.DoesNotExist:
            transkrip_nilai, created = models.TranskripNilai.objects.get_or_create(
                academic_year = academic_year,
                academic_session = academic_session,
                grade_symbol = grade_symbol,
                mahasiswa = datamahasiswa,
                mata_kuliah = matakuliah,
                earned_credits = earned_credits
            )
            # serializer = self.get_serializer(instance=transkrip_nilai)
            # headers = self.get_success_headers(serializer.data)
            # return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

        # serializer = self.get_serializer(instance=monitoring_mahasiswa)
        serializer = self.get_serializer(instance=monitoring_mahasiswa)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK, headers=headers)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

    
class MonitoringMahasiswaByNIMViewSet(generics.ListAPIView):
    serializer_class = serializers.MonitoringMahasiswaSerializers
    queryset = models.MonitoringMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        MonitoringMahasiswaByNIM = models.MonitoringMahasiswa.objects.filter(mahasiswa__nim=self.kwargs['monitoringMahasiswaNIM'])
        serializer = self.get_serializer(MonitoringMahasiswaByNIM, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class MonitoringMahasiswaByKodeMatakuliahViewSet(generics.ListAPIView):
    serializer_class = serializers.MonitoringMahasiswaSerializers
    queryset = models.MonitoringMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        MonitoringMahasiswaByKodeMataKuliah = models.MonitoringMahasiswa.objects.filter(mata_kuliah__kode=self.kwargs['monitoringMahasiswaKodeMataKuliah'])
        serializer = self.get_serializer(MonitoringMahasiswaByKodeMataKuliah, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class MonitoringMahasiswaByNoGradedViewSet(generics.ListAPIView):
    serializer_class = serializers.MonitoringMahasiswaSerializers
    queryset = models.MonitoringMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        MonitoringMahasiswaByNoGraded = models.MonitoringMahasiswa.objects.filter(grade_symbol="T")
        serializer = self.get_serializer(MonitoringMahasiswaByNoGraded, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class MonitoringMahasiswaByNoGradedKodeMataKuliahViewSet(generics.ListAPIView):
    serializer_class = serializers.MonitoringMahasiswaSerializers
    queryset = models.MonitoringMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        MonitoringMahasiswaByNoGradedKodeMataKuliah = models.MonitoringMahasiswa.objects.filter(Q(grade_symbol="T") & Q(mata_kuliah__kode=self.kwargs['monitoringMahasiswaKodeMataKuliah']))
        serializer = self.get_serializer(MonitoringMahasiswaByNoGradedKodeMataKuliah, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class BahanKajianViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.BahanKajianSerializers
    queryset = models.BahanKajian.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class BahanKajianByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.BahanKajianSerializers
    queryset = models.BahanKajian.objects.all()

    def get(self, request, *args, **kwargs):
        bahanKajianByProdi = models.BahanKajian.objects.filter(prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(bahanKajianByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class CapaianPembelajaranViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CapaianPembelajarSerializers
    queryset = models.CapaianPembelajaran.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class CapaianPembelajaranByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.CapaianPembelajarSerializers
    queryset = models.CapaianPembelajaran.objects.all()

    def get(self, request, *args, **kwargs):
        capaianPembelajaranByProdi = models.CapaianPembelajaran.objects.filter(prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(capaianPembelajaranByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class ValidasiMahasiswaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ValidasiMahasiswaSerializers
    queryset = models.ValidasiMahasiswa.objects.all()

    def create(self, request, *args, **kwargs):
        convert_to = json.dumps(request.data, indent=4)
        data_dict = json.loads(convert_to)

        # Check if Data Mahasiswa is Exists
        nim_mahasiswa = data_dict.get('nim_mahasiswa')
        mahasiswa = models.DataMahasiswa.objects.get(nim=nim_mahasiswa)

        jumlah_sks = data_dict.get('jumlah_sks')
        nilaiE = data_dict.get('nilaie')
        nilaiD = data_dict.get('nilaid')
        status_kelulusan = data_dict.get('status_kelulusan')
        nilaiIPK = data_dict.get('nilai_ipk')
        keterangan_lulus = data_dict.get('keterangan_lulus')

        if (status_kelulusan == "") :
            None
        else :
            try :
                get_validasi = models.ValidasiMahasiswa.objects.get(
                    mahasiswa = mahasiswa,
                )
                get_validasi.jumlah_sks = jumlah_sks
                get_validasi.nilaid = nilaiD
                get_validasi.nilaie = nilaiE
                get_validasi.nilai_ipk = nilaiIPK
                get_validasi.status_kelulusan = status_kelulusan
                get_validasi.keterangan_lulus = keterangan_lulus
                get_validasi.save()

                serializer = self.get_serializer(instance=get_validasi)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except models.ValidasiMahasiswa.DoesNotExist:
                validasi, created = models.ValidasiMahasiswa.objects.get_or_create(
                    mahasiswa = mahasiswa,
                    jumlah_sks = jumlah_sks,
                    nilaie = nilaiE,
                    nilaid = nilaiD,
                    status_kelulusan = status_kelulusan,
                    nilai_ipk = nilaiIPK,
                    keterangan_lulus = keterangan_lulus
                )   
            serializer = self.get_serializer(instance=validasi)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        # return Response("Bebek")

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class ValidasiMahasiswaByNIMViewSet(generics.ListAPIView):
    serializer_class = serializers.ValidasiMahasiswaSerializers
    queryset = models.ValidasiMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        ValidasiMahasiswaByNIM = models.ValidasiMahasiswa.objects.filter(mahasiswa__nim=self.kwargs['validasiMahasiswaNIM'])
        serializer = self.get_serializer(ValidasiMahasiswaByNIM, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class TranskripNilaiViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TranskripNilaiSerializers
    queryset = models.TranskripNilai.objects.all()

    def create(self, request, *args, **kwargs):
        convert_to = json.dumps(request.data, indent=4)
        data_dict = json.loads(convert_to)

        academic_year = data_dict.get("academic_year")
        academic_session =data_dict.get('academic_session')
        grade_symbol = data_dict.get('grade_symbol')
        mahasiswa = data_dict.get('mahasiswa')
        mata_kuliah = data_dict.get('mata_kuliah')
        earned_credits = data_dict.get('earned_credits')

        mahasiswa_id = models.DataMahasiswa.objects.get(id = mahasiswa)
        mata_kuliah_id = models.MataKuliah.objects.get(id = mata_kuliah)

        try :
            get_transkrip_nilai = models.TranskripNilai.objects.get(
                mahasiswa = mahasiswa_id,
                mata_kuliah = mata_kuliah_id,
            )
            
            if (get_transkrip_nilai.grade_symbol == "AB" and grade_symbol == "A"):
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "B" and (grade_symbol == "A" or grade_symbol == "AB")) :
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "BC" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B")):
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "C" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC")):
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "D" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC" or grade_symbol == "C")):
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            elif (get_transkrip_nilai.grade_symbol == "E" and (grade_symbol == "A" or grade_symbol == "AB" or grade_symbol == "B" or grade_symbol == "BC" or grade_symbol == "C" or grade_symbol == "D")):
                get_transkrip_nilai.grade_symbol = grade_symbol
                get_transkrip_nilai.save()

            serializer = self.get_serializer(instance=get_transkrip_nilai)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except models.TranskripNilai.DoesNotExist:
            transkrip_nilai, created = models.TranskripNilai.objects.get_or_create(
                academic_year = academic_year,
                academic_session = academic_session,
                grade_symbol = grade_symbol,
                mahasiswa = mahasiswa_id,
                mata_kuliah = mata_kuliah_id,
                earned_credits = earned_credits
            )
            serializer = self.get_serializer(instance=transkrip_nilai)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class TranskripNilaiaByNIMViewSet(generics.ListAPIView):
    serializer_class = serializers.TranskripNilaiSerializers
    queryset = models.TranskripNilai.objects.all()

    def get(self, request, *args, **kwargs):
        TranskripNilaiByNIM = models.TranskripNilai.objects.filter(mahasiswa__nim=self.kwargs['transkripNilaiNIM'])
        serializer = self.get_serializer(TranskripNilaiByNIM, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()


# Kurikulum OBE
class ProfilLulusanViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProfilLulusanSerializers
    queryset = models.ProfilLulusan.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class ProfilLulusanByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.ProfilLulusanSerializers
    queryset = models.ProfilLulusan.objects.all()

    def get(self, request, *args, **kwargs):
        profilLulusanByProdi = models.ProfilLulusan.objects.filter(prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(profilLulusanByProdi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class CapaianPembelajaranMataKuliahViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CapaianPembelajaranMataKuliahSerializers
    queryset = models.CapaianPembelajaranMataKuliah.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class CapaianPembelajaranMataKuliahByProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.CapaianPembelajaranMataKuliahSerializers
    queryset = models.CapaianPembelajaranMataKuliah.objects.all()

    def get(self, request, *args, **kwargs):
        prodi_id = self.kwargs['prodiId']
        cpl_by_prodi = models.CapaianPembelajaran.objects.filter(prodi__id=prodi_id)
        cpmk_by_prodi = models.CapaianPembelajaranMataKuliah.objects.filter(cpl__in=cpl_by_prodi).distinct()
        # cpmkByProdi = models.CapaianPembelajaranMataKuliah.objects.filter(prodi__id=self.kwargs['prodiId'])
        serializer = self.get_serializer(cpmk_by_prodi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        # return super(self.__class__, self).get_permissions()
        return super(CapaianPembelajaranMataKuliahByProdiViewSet, self).get_permissions()


class PenilaianViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PenilaianSerializers
    queryset = models.Penilaian.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class NilaiMahasiswaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.NilaiMahasiswaSerializers
    queryset = models.NilaiMahasiswa.objects.all()

    def _normalize_academic_year(self, academic_year):
        value = str(academic_year or '').strip()
        return value[:4] if value.isdigit() and len(value) >= 6 else value

    def _normalize_academic_session(self, academic_year, academic_session):
        session = str(academic_session or '').strip()
        if session:
            return session

        year = str(academic_year or '').strip()
        return year[-2:] if year.isdigit() and len(year) >= 6 else session

    def _get_course_key(self, transkrip):
        mata_kuliah = getattr(transkrip, 'mata_kuliah', None)
        return (
            getattr(mata_kuliah, 'kode', None)
            or getattr(mata_kuliah, 'name', None)
            or getattr(transkrip, 'mata_kuliah_id', None)
            or transkrip.id
        )

    def _get_grade_rank(self, grade_symbol):
        grade_rank = {
            'A': 7,
            'AB': 6,
            'B': 5,
            'BC': 4,
            'C': 3,
            'D': 2,
            'E': 1,
            'T': 0,
        }
        return grade_rank.get(str(grade_symbol or '').strip().upper(), -1)

    def _deduplicate_transkrip_data(self, transkrip_data):
        transkrip_by_course_semester = {}

        for transkrip in transkrip_data:
            key = (
                self._normalize_academic_year(transkrip.academic_year),
                self._normalize_academic_session(
                    transkrip.academic_year,
                    transkrip.academic_session,
                ),
                self._get_course_key(transkrip),
            )
            existing = transkrip_by_course_semester.get(key)

            if (
                existing is None
                or self._get_grade_rank(transkrip.grade_symbol)
                > self._get_grade_rank(existing.grade_symbol)
            ):
                transkrip_by_course_semester[key] = transkrip

        return list(transkrip_by_course_semester.values())

    def _normalize_academic_period(self, academic_year, academic_session):
        year = str(academic_year or '').strip()
        session = str(academic_session or '').strip()

        if year.isdigit() and len(year) >= 6:
            return year[:4], session or year[-2:]

        return year, session

    def _legacy_academic_year(self, academic_year, academic_session):
        year = str(academic_year or '').strip()
        session = str(academic_session or '').strip()
        return f"{year}{session}" if year and session else None

    def _rebuild_validasi_mahasiswa(self, mahasiswa):
        transkrip_qs = (
            models.TranskripNilai.objects
            .filter(mahasiswa=mahasiswa)
            .select_related('mata_kuliah')
            .order_by('academic_year', 'academic_session', 'id')
        )
        transkrip_data = self._deduplicate_transkrip_data(list(transkrip_qs))

        grade_values = {
            'A': 4.0,
            'AB': 3.5,
            'B': 3.0,
            'BC': 2.5,
            'C': 2.0,
            'D': 1.0,
            'E': 0.0,
            'T': 0.0,
        }
        grade_rank = {
            'A': 4,
            'AB': 3,
            'B': 2,
            'BC': 1,
            'C': 0,
            'D': -1,
            'E': -2,
            'T': -3,
        }

        total_sks = 0
        total_nilai_d = 0
        total_nilai_e = 0
        total_weighted_points = 0.0
        seen_course_names = set()
        repeated_course = False
        english_sc_ii_grade = None
        final_project_grade = None

        for transkrip in transkrip_data:
            grade_symbol = transkrip.grade_symbol or ''
            sks_total = getattr(getattr(transkrip, 'mata_kuliah', None), 'sks_total', None)
            try:
                sks_total = int(sks_total)
            except (TypeError, ValueError):
                sks_total = 0

            if sks_total <= 0:
                try:
                    sks_total = int(transkrip.earned_credits)
                except (TypeError, ValueError):
                    sks_total = 0

            course_name = getattr(getattr(transkrip, 'mata_kuliah', None), 'name', '')

            if course_name in seen_course_names:
                repeated_course = True
            elif course_name:
                seen_course_names.add(course_name)

            if grade_symbol != 'T':
                total_sks += sks_total
                total_weighted_points += grade_values.get(grade_symbol, 0.0) * sks_total

            if grade_symbol == 'D':
                total_nilai_d += sks_total
            if grade_symbol == 'E':
                total_nilai_e += sks_total
            if course_name == 'English Scientific Communication II':
                english_sc_ii_grade = grade_symbol
            if course_name in ['Final Project', 'Final Project II']:
                final_project_grade = grade_symbol

        nilai_ipk = round(total_weighted_points / total_sks, 2) if total_sks else 0.0
        english_ok = (grade_rank.get(english_sc_ii_grade, -99)) >= grade_rank['B']

        if (
            nilai_ipk > 3.5
            and total_nilai_d == 0
            and total_nilai_e == 0
            and total_sks >= 144
            and not repeated_course
            and english_ok
            and final_project_grade in ['A', 'AB', 'B']
        ):
            status_kelulusan = 'Cum Laude'
        elif (
            nilai_ipk > 3.0
            and total_nilai_d <= 7
            and total_nilai_e == 0
            and total_sks >= 144
            and english_ok
            and final_project_grade
        ):
            status_kelulusan = 'Sangat Memuaskan'
        elif (
            nilai_ipk > 2.75
            and total_nilai_d <= 7
            and total_nilai_e == 0
            and total_sks >= 144
            and english_ok
            and final_project_grade
        ):
            status_kelulusan = 'Memuaskan'
        elif (
            nilai_ipk >= 2.0
            and total_nilai_d <= 7
            and total_nilai_e == 0
            and total_sks >= 144
            and english_ok
            and final_project_grade
        ):
            status_kelulusan = 'Cukup'
        else:
            status_kelulusan = 'Tidak Lulus'

        models.ValidasiMahasiswa.objects.update_or_create(
            mahasiswa=mahasiswa,
            defaults={
                'jumlah_sks': total_sks,
                'nilaid': total_nilai_d,
                'nilaie': total_nilai_e,
                'nilai_ipk': f'{nilai_ipk:.2f}',
                'status_kelulusan': status_kelulusan,
                'keterangan_lulus': 'Pernah Mengulang' if repeated_course else 'Aman',
            },
        )

    def _first_value(self, data_dict, keys, default=''):
        for key in keys:
            value = data_dict.get(key)
            if value not in (None, ''):
                return value
        return default

    def _normalize_prodi_info(self, prodi_value, prodi_mapping):
        normalized = str(prodi_value or '').strip().lower().replace(' ', '')
        if not normalized:
            return None

        alias_map = {
            'BM': {'s1bm', 'mathematics', 'math'},
            'FBT': {'s1fbt', 'foodtechnology', 'food tech'},
            'REE': {'s1ree', 'renewableenergyengineering', 'renewable energy engineering'},
            'CSE': {'s1cse', 'computersystemsengineering', 'computer systems engineering'},
            'SE': {
                's1se',
                's1ese',
                'ese',
                'softwareengineering',
                'software engineering',
            },
            'PDE': {'s1pde', 'productdesignengineering', 'product design engineering'},
        }

        for info in prodi_mapping.values():
            kode = str(info['kode']).strip().lower().replace(' ', '')
            name = str(info['name']).strip().lower().replace(' ', '')
            kode_sap = str(info['kode_sap']).strip().lower().replace(' ', '')
            aliases = {
                kode,
                name,
                kode_sap,
                f"s1{kode}",
                f"s1{name}",
            }
            aliases.update(alias_map.get(info['kode'], set()))
            if normalized in aliases:
                return info

        return None

    def _extract_year_value(self, value, fallback=''):
        text = str(value or '').strip()
        match = re.search(r'(19|20)\d{2}', text)
        if match:
            return match.group(0)
        return str(fallback or '').strip()

    def _normalize_final_grade_symbol(self, value):
        text = str(value or '').strip()
        if not text:
            return None

        upper_text = text.upper()
        if upper_text in {'0', '0.0', 'T'}:
            return None

        if upper_text in {'A', 'AB', 'B', 'BC', 'C', 'D', 'E'}:
            return upper_text

        try:
            score = float(text.replace(',', '.'))
        except ValueError:
            return None

        if score <= 0:
            return None
        if score >= 80:
            return 'A'
        if score >= 75:
            return 'AB'
        if score >= 70:
            return 'B'
        if score >= 65:
            return 'BC'
        if score >= 60:
            return 'C'
        if score >= 50:
            return 'D'
        return 'E'

    def create(self, request, *args, **kwargs):
        def resolve_credits(new_value, existing_value=None, default_value=None):
            if new_value not in (None, '', 0, 0.0, '0', '0.0'):
                return new_value
            if default_value not in (None, '', 0, 0.0, '0', '0.0'):
                return default_value
            if existing_value not in (None, '', 0, 0.0, '0', '0.0'):
                return existing_value
            return new_value

        def replace_nilai_mahasiswa(mahasiswa, mata_kuliah, penilaian, academic_year, academic_session, earned_credits, nilai_penilaian, bobot):
            existing_qs = models.NilaiMahasiswa.objects.filter(
                mahasiswa=mahasiswa,
                mata_kuliah=mata_kuliah,
                penilaian=penilaian,
            ).order_by("-id")

            if existing_qs.exists():
                primary = existing_qs.first()
                if existing_qs.count() > 1:
                    existing_qs.exclude(id=primary.id).delete()
                primary.earned_credits = resolve_credits(
                    earned_credits,
                    primary.earned_credits,
                    getattr(mata_kuliah, 'sks_total', None),
                )
                primary.academic_year = academic_year
                primary.academic_session = academic_session
                primary.nilai_penilaian = nilai_penilaian
                primary.bobot = bobot
                primary.save()
                return primary

            return models.NilaiMahasiswa.objects.create(
                mahasiswa=mahasiswa,
                mata_kuliah=mata_kuliah,
                penilaian=penilaian,
                earned_credits=resolve_credits(
                    earned_credits,
                    getattr(mata_kuliah, 'sks_total', None),
                    getattr(mata_kuliah, 'sks_total', None),
                ),
                academic_year=academic_year,
                academic_session=academic_session,
                nilai_penilaian=nilai_penilaian,
                bobot=bobot,
            )

        def replace_monitoring_mahasiswa(payload):
            legacy_academic_year = self._legacy_academic_year(
                payload["academic_year"],
                payload["academic_session"],
            )
            base_qs = models.MonitoringMahasiswa.objects.filter(
                mahasiswa=payload["mahasiswa"],
                mata_kuliah=payload["mata_kuliah"],
                academic_session=payload["academic_session"],
            ).order_by("-id")
            existing_qs = base_qs.filter(academic_year=payload["academic_year"])
            if not existing_qs.exists() and legacy_academic_year:
                existing_qs = base_qs.filter(academic_year=legacy_academic_year)

            if existing_qs.exists():
                primary = existing_qs.first()
                for field, value in payload.items():
                    if field == "earned_credits":
                        value = resolve_credits(
                            value,
                            primary.earned_credits,
                            getattr(primary.mata_kuliah, 'sks_total', None),
                        )
                    setattr(primary, field, value)
                primary.save()
                return primary

            payload = payload.copy()
            payload["earned_credits"] = resolve_credits(
                payload.get("earned_credits"),
                getattr(payload.get("mata_kuliah"), 'sks_total', None),
                getattr(payload.get("mata_kuliah"), 'sks_total', None),
            )
            return models.MonitoringMahasiswa.objects.create(**payload)

        def replace_transkrip_nilai(mahasiswa, mata_kuliah, academic_year, academic_session, earned_credits, grade_symbol):
            legacy_academic_year = self._legacy_academic_year(
                academic_year,
                academic_session,
            )
            base_qs = models.TranskripNilai.objects.filter(
                mahasiswa=mahasiswa,
                mata_kuliah=mata_kuliah,
                academic_session=academic_session,
            ).order_by("-id")
            existing_qs = base_qs.filter(academic_year=academic_year)
            if not existing_qs.exists() and legacy_academic_year:
                existing_qs = base_qs.filter(academic_year=legacy_academic_year)

            if existing_qs.exists():
                primary = existing_qs.first()
                primary.earned_credits = resolve_credits(
                    earned_credits,
                    primary.earned_credits,
                    getattr(mata_kuliah, 'sks_total', None),
                )
                primary.academic_year = academic_year
                primary.academic_session = academic_session
                primary.grade_symbol = grade_symbol
                primary.save()
                return primary

            return models.TranskripNilai.objects.create(
                mahasiswa=mahasiswa,
                mata_kuliah=mata_kuliah,
                academic_year=academic_year,
                academic_session=academic_session,
                earned_credits=resolve_credits(
                    earned_credits,
                    getattr(mata_kuliah, 'sks_total', None),
                    getattr(mata_kuliah, 'sks_total', None),
                ),
                grade_symbol=grade_symbol,
            )

        def convert_to_float(value):
            if isinstance(value, str):
                try:
                    return float(value.replace(',', '.'))
                except ValueError:
                    return 0.0  # Nilai default jika konversi gagal
            elif isinstance(value, (float, int)):
                return float(value)  # Langsung kembalikan jika sudah float atau int
            else:
                return 0.0  # Nilai default untuk tipe data lain

        convert_to = json.dumps(request.data, indent=4)
        data_dict = json.loads(convert_to)

        prodi_mapping = {
            '10': {'name': 'Mathematics', 'kode': 'BM', 'kode_sap': '50000632'},
            '20': {'name': 'Food Technology', 'kode': 'FBT', 'kode_sap': '50000633'},
            '30': {'name': 'Renewable Energy Engineering', 'kode': 'REE', 'kode_sap': '50000634'},
            '40': {'name': 'Computer Systems Engineering', 'kode': 'CSE', 'kode_sap': '50000636'},
            '50': {'name': 'Software Engineering', 'kode': 'SE', 'kode_sap': '50000635'},
            '60': {'name': 'Product Design Engineering', 'kode': 'PDE', 'kode_sap': '50000631'},
        }

        # mahasiswa
        nama_mahasiswa = self._first_value(data_dict, ['Student Name', 'Nama Mahasiswa', 'Nama'])
        nim_mahasiswa = self._first_value(data_dict, ['NIM', 'Student ID'])
        if not nim_mahasiswa:
            return Response({"error": "NIM wajib diisi"}, status=status.HTTP_400_BAD_REQUEST)

        subject = self._first_value(data_dict, ['Subject', 'Nama MK', 'Mata Kuliah'])
        subject_short = self._first_value(data_dict, ['Subject Short', 'Kode MK'])
        academic_year = self._first_value(data_dict, ['Academic Year', 'Tahun Akademik'])
        academic_session = self._first_value(data_dict, ['Academic Session', 'Semester'])
        academic_year, academic_session = self._normalize_academic_period(
            academic_year,
            academic_session,
        )

        grade_nilai_raw = self._first_value(data_dict, ['Grade Nilai', 'GradeNIlai'])
        grade_symbol = self._normalize_final_grade_symbol(grade_nilai_raw)
        if grade_symbol is None:
            message = "Grade Nilai kosong/0, data dilewati"
            return Response(
                {
                    "status": "skipped",
                    "message": message,
                },
                status=status.HTTP_200_OK,
            )

        angkatan_raw = self._first_value(data_dict, ['Angkatan', 'Angkatan Mahasiswa'])
        if angkatan_raw:
            angkatan = str(angkatan_raw).strip()
        else:
            angkatan_prefix = str(nim_mahasiswa)[4:6]
            angkatan = f"20{angkatan_prefix}"

        id_mahasiswa = self._first_value(data_dict, ['Student ID', 'NIM'])

        # prodi
        prodi_value = self._first_value(data_dict, ['Prodi', 'Program Studi', 'Jurusan'])
        if prodi_value:
            prodi_info = self._normalize_prodi_info(prodi_value, prodi_mapping)
            if not prodi_info:
                return Response({"error": "Program studi tidak dikenali"}, status=status.HTTP_400_BAD_REQUEST)
        else:
            prodi_prefix = str(nim_mahasiswa)[2:4]
            prodi_info = prodi_mapping.get(prodi_prefix)
            if not prodi_info:
                return Response({"error": "Kode prodi tidak valid"}, status=status.HTTP_400_BAD_REQUEST)

        program_study = prodi_info['kode_sap']
        name_prody = prodi_info['name']
        kode = prodi_info['kode']

        try:
            programstudi = models.ProgramStudi.objects.get(kode_sap=program_study)
        except models.ProgramStudi.DoesNotExist:
            programstudi, created = models.ProgramStudi.objects.get_or_create(
                name=name_prody,
                kode=kode,
                kode_sap=program_study
            )

        try:
            datamahasiswa = models.DataMahasiswa.objects.get(nim=nim_mahasiswa)

            datamahasiswa.mahasiswa_id = id_mahasiswa
            datamahasiswa.save()
        except models.DataMahasiswa.DoesNotExist:
            datamahasiswa, created = models.DataMahasiswa.objects.get_or_create(
                nama=nama_mahasiswa,
                nim=nim_mahasiswa,
                angkatan=angkatan,
                mahasiswa_id=id_mahasiswa,
                prodi=programstudi)
            
        graded_credits_raw = self._first_value(data_dict, ['Graded Credits', 'SKS'])
        graded_credits = convert_to_float(graded_credits_raw) if graded_credits_raw != '' else 0.0
        if graded_credits.is_integer():
            graded_credits = int(graded_credits)
        sm_objid = data_dict.get('SM Objid')
        st_object_type = data_dict.get('Object type')
        st_objid = data_dict.get('ST Objid')
        student_id = data_dict.get('Student ID')
        appraisal_type = data_dict.get('Appraisal Type')
        sm_object_type = data_dict.get('Object type')
        # sm_objid = data_dict.get('SM Objid')
        event_package_objid = data_dict.get('EP Objid')
        event_package_short = data_dict.get('EP ID')
        event_package_text = data_dict.get('Event Package')
        earned_credits_raw = self._first_value(data_dict, ['Earned Credits', 'Graded Credits', 'SKS'])
        earned_credits = convert_to_float(earned_credits_raw) if earned_credits_raw != '' else 0.0
        if earned_credits.is_integer():
            earned_credits = int(earned_credits)
        credit_type = data_dict.get('Credit Type')
        mentor = data_dict.get('Mentor')

        angkatan_year = self._extract_year_value(angkatan, fallback=str(nim_mahasiswa)[4:8])
        if not angkatan_year:
            return Response({"error": "Angkatan tidak valid"}, status=status.HTTP_400_BAD_REQUEST)

        i_angkatan = int(angkatan_year)
        i_academic_year = int(str(academic_year)[:4]) if academic_year else 0
        semester_count = (i_academic_year - i_angkatan) * 2

        academic_session_raw = str(academic_session).strip()
        if academic_session_raw in {'10', 'GANJIL', 'ODD'}:
            semester = f"{semester_count + 1}"
        elif academic_session_raw in {'20', 'SP1', 'SHORT1'}:
            semester = f"SP{semester_count + 1}"
        elif academic_session_raw in {'30', 'GENAP', 'EVEN'}:
            semester = f"{semester_count + 2}"
        elif academic_session_raw in {'40', 'SP2', 'SHORT2'}:
            semester = f"SP{semester_count + 2}"
        else:
            semester = str(academic_session_raw or '')

        # Create MataKuliah
        # matakuliah_list = models.MataKuliah.objects.filter(kode=subject_short)

        # matakuliah = matakuliah_list.filter(prodi=programstudi, semester=semester, sks_total=graded_credits).first()

        # if not matakuliah:
        #     matakuliah, created = models.MataKuliah.objects.get_or_create(
        #         name=subject,
        #         kode=subject_short,
        #         sks_total=graded_credits,
        #         sm_objid=sm_objid,
        #         prodi=programstudi,
        #         semester=semester
        #     )

        # 1. Cek mata kuliah dari data matakuliah berdasarkan kode dan prodi
        matakuliah_list = models.MataKuliah.objects.filter(
            kode=subject_short,
            prodi=programstudi
        )

        # 2. Cari mata kuliah yang sudah ada, prioritaskan yang sudah punya SKS master.
        matakuliah = None
        for mk in matakuliah_list:
            monitoring_exists = models.MonitoringMahasiswa.objects.filter(
                mahasiswa=datamahasiswa,
                mata_kuliah=mk
            ).exists()

            if monitoring_exists or mk.sks_total not in (None, '', 0, 0.0, '0', '0.0'):
                matakuliah = mk
                break

        if not matakuliah and matakuliah_list.exists():
            matakuliah = matakuliah_list.first()

        # 3. jika belum ada mata kuliah yang cocok, tolak import supaya master tetap jadi sumber utama.
        if not matakuliah:
            return Response(
                {
                    "error": (
                        f"Mata kuliah {subject_short} untuk prodi {programstudi.name} belum ada di master. "
                        "Tambahkan ke data master mata kuliah dulu sebelum import nilai."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        elif matakuliah.sks_total in (None, '', 0, 0.0, '0', '0.0') and graded_credits not in (None, '', 0, 0.0, '0', '0.0'):
            matakuliah.sks_total = graded_credits
            matakuliah.save()

        # Penilaian
        bobot_mid_sem = convert_to_float(self._first_value(data_dict, ['(%) Mid Sem', '% UTS', 'Bobot UTS'], 0.0))
        bobot_end_sem = convert_to_float(self._first_value(data_dict, ['(%) End Sem', '% UAS', 'Bobot UAS'], 0.0))
        bobot_teaching = convert_to_float(self._first_value(data_dict, ['(%) Teaching', '% TA', 'Bobot TA'], 0.0))
        # bobot_project = convert_to_float(data_dict.get('(%) Project', 0.0))
        # bobot_quiz = convert_to_float(data_dict.get('(%) Quiz', 0.0))

        # Nilai Mahasiswa
        nilai_uas = convert_to_float(self._first_value(data_dict, ['End Sem.', 'UAS', 'Nilai UAS'], 0.0))
        nilai_uts = convert_to_float(self._first_value(data_dict, ['Mid Sem.', 'UTS', 'Nilai UTS'], 0.0))
        nilai_ta = convert_to_float(self._first_value(data_dict, ['Teaching Ass.', 'TeachingAss', 'Nilai TA'], 0.0))
        # nilai_project = convert_to_float(data_dict.get('Project', 0.0))
        # nilai_quiz = convert_to_float(data_dict.get('Quiz', 0.0))

        total_bobot = bobot_mid_sem + bobot_end_sem + bobot_teaching

        # Pengecekan total bobot
        if total_bobot == 0:
            bobot_mid_sem = 30.0
            bobot_end_sem = 30.0
            bobot_teaching = 40.0
        elif total_bobot > 100:
            return Response({"error": "Total bobot tidak boleh lebih dari 100"}, status=status.HTTP_400_BAD_REQUEST)
        elif total_bobot < 100:
            if bobot_teaching == 0:
                bobot_teaching = 100 - bobot_mid_sem - bobot_end_sem
            elif bobot_mid_sem == 0:
                bobot_mid_sem = 100 - bobot_end_sem - bobot_teaching
            elif bobot_end_sem == 0:
                bobot_end_sem = 100 - bobot_mid_sem - bobot_teaching


        # Penilaian UTS
        # penilaian_uts, _ = models.Penilaian.objects.get_or_create(
        #     implementasi_kurikulum=implementasi_kurikulum,
        #     nama_penilaian='UTS'
        # )

        # # Penilaian UAS
        # penilaian_uas, _ = models.Penilaian.objects.get_or_create(
        #     implementasi_kurikulum=implementasi_kurikulum,
        #     nama_penilaian='UAS'
        # )

        # # Penilaian Teaching Assessment
        # penilaian_ta, _ = models.Penilaian.objects.get_or_create(
        #     implementasi_kurikulum=implementasi_kurikulum,
        #     nama_penilaian='Teaching Assessment'
        # )

        penilaian_uts, _ = models.Penilaian.objects.get_or_create(
            mata_kuliah=matakuliah,
            nama_penilaian='UTS'
        )

        # Penilaian UAS
        penilaian_uas, _ = models.Penilaian.objects.get_or_create(
            mata_kuliah=matakuliah,
            nama_penilaian='UAS'
        )

        # Penilaian Teaching Assessment
        penilaian_ta, _ = models.Penilaian.objects.get_or_create(
            mata_kuliah=matakuliah,
            nama_penilaian='Teaching Assessment'
        )

        # # Penilaian UAS
        # penilaian_project, _ = models.Penilaian.objects.get_or_create(
        #     mata_kuliah=matakuliah,
        #     nama_penilaian='Project'
        # )

        # # Penilaian Teaching Assessment
        # penilaian_quiz, _ = models.Penilaian.objects.get_or_create(
        #     mata_kuliah=matakuliah,
        #     nama_penilaian='Quiz'
        # )

        # Nilai UAS
        nilai_uas_obj = replace_nilai_mahasiswa(
            mahasiswa=datamahasiswa,
            mata_kuliah=matakuliah,
            penilaian=penilaian_uas,
            academic_year=academic_year,
            academic_session=academic_session,
            earned_credits=graded_credits,
            nilai_penilaian=nilai_uas,
            bobot=bobot_end_sem,
        )

        # Nilai UTS
        nilai_uts_obj = replace_nilai_mahasiswa(
            mahasiswa=datamahasiswa,
            mata_kuliah=matakuliah,
            penilaian=penilaian_uts,
            academic_year=academic_year,
            academic_session=academic_session,
            earned_credits=graded_credits,
            nilai_penilaian=nilai_uts,
            bobot=bobot_mid_sem,
        )

        # Nilai Teaching Assessment
        nilai_ta_obj = replace_nilai_mahasiswa(
            mahasiswa=datamahasiswa,
            mata_kuliah=matakuliah,
            penilaian=penilaian_ta,
            academic_year=academic_year,
            academic_session=academic_session,
            earned_credits=graded_credits,
            nilai_penilaian=nilai_ta,
            bobot=bobot_teaching,
        )
            
        
        monitoring_mahasiswa = replace_monitoring_mahasiswa(
            {
                "st_object_type": st_object_type,
                "st_objid": st_objid,
                "mahasiswa": datamahasiswa,
                "student_id": student_id,
                "appraisal_type": appraisal_type,
                "sm_object_type": sm_object_type,
                "sm_objid": sm_objid,
                "mata_kuliah": matakuliah,
                "event_package_objid": event_package_objid,
                "event_package_short": event_package_short,
                "event_package_text": event_package_text,
                "grade_symbol": grade_symbol,
                "earned_credits": earned_credits,
                "credit_type": credit_type,
                "prodi": programstudi,
                "mentor": mentor,
                "academic_session": academic_session,
                "academic_year": academic_year,
            }
        )

        transkrip_nilai = replace_transkrip_nilai(
            mahasiswa=datamahasiswa,
            mata_kuliah=matakuliah,
            academic_year=academic_year,
            academic_session=academic_session,
            earned_credits=earned_credits,
            grade_symbol=grade_symbol,
        )

        self._rebuild_validasi_mahasiswa(datamahasiswa)

        serializer = self.get_serializer(instance=nilai_uas_obj)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class NilaiMahasiswaByNIMViewSet(generics.ListAPIView):
    serializer_class = serializers.NilaiMahasiswaSerializers
    queryset = models.NilaiMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        NilaiMahasiswaByNIM = models.NilaiMahasiswa.objects.filter(mahasiswa__nim=self.kwargs['nilaiMahasiswaNIM'])
        serializer = self.get_serializer(NilaiMahasiswaByNIM, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    

class SkpiRecapByIdProdiViewSet(generics.ListAPIView):
    serializer_class = serializers.NilaiMahasiswaSerializers
    queryset = models.NilaiMahasiswa.objects.all()

    def get(self, request, idProdi, *args, **kwargs):
        search = self.request.GET.get('search', None)
        angkatan = self.request.GET.get('angkatan', None)
        # print('idprodi', idProdi)
        
        NilaiMahasiswaByProdi = models.NilaiMahasiswa.objects.filter(mahasiswa__prodi__id=idProdi)
        if search and search !='undefined':
            NilaiMahasiswaByProdi = NilaiMahasiswaByProdi.filter(mahasiswa__nama__icontains=search)
        if angkatan and angkatan !='undefined':
            NilaiMahasiswaByProdi = NilaiMahasiswaByProdi.filter(mahasiswa__angkatan=angkatan)
        # serializer = self.get_serializer(NilaiMahasiswaByProdi, many=True)
        
        unique_code = []
        skpi_mahasiswa = []

        CplByIdProdi = models.CapaianPembelajaran.objects.filter(prodi__id=idProdi)
        for cpl in CplByIdProdi:
            unique_code.append({
                'code': cpl.kode
            })

        # unique_id_mahasiswa = NilaiMahasiswaByProdi.filter(mahasiswa__nim='23201810001').values_list('mahasiswa', flat=True).distinct()
        unique_id_mahasiswa = NilaiMahasiswaByProdi.values_list('mahasiswa', flat=True).distinct()
        for id_mahasiswa in unique_id_mahasiswa:
            mahasiswa = models.DataMahasiswa.objects.get(id=id_mahasiswa)
            serializer_mahasiswa = serializers.DataMahasiswaSerializers(mahasiswa, many=False)

            cpls = []
            for cpl in CplByIdProdi:
                total_score = 0
                unique_nilai_id = []
                NilaiMahasiswa = models.NilaiMahasiswa.objects.filter(
                    mahasiswa__id=id_mahasiswa
                ).filter(penilaian__cpmks__cpl__kode=cpl.kode)
                for nilai in NilaiMahasiswa:
                    if nilai.id not in unique_nilai_id:
                        unique_nilai_id.append(nilai.id)
                
                nilai_mahasiswa2 = models.NilaiMahasiswa.objects.filter(id__in=unique_nilai_id)
                # Hitung total bobot
                total_bobot = nilai_mahasiswa2.aggregate(total_bobot=Sum('bobot'))['total_bobot']
                for nilai_mhs in nilai_mahasiswa2:
                    bobot = nilai_mhs.bobot
                    nilai_cpl = nilai_mhs.nilai_penilaian
                    score = (nilai_cpl*bobot)/total_bobot
                    total_score += score

                cpls.append({
                    'cpl_kode': cpl.kode,
                    'total_score': total_score
                })

            skpi_mahasiswa.append({
                'mahasiswa_detail': serializer_mahasiswa.data,
                'cpmks': cpls
            })


        resp = skpi_mahasiswa
        return Response(resp)

    
class NilaiMahasiswaByKodeMatakuliahViewSet(generics.ListAPIView):
    serializer_class = serializers.NilaiMahasiswaSerializers
    queryset = models.NilaiMahasiswa.objects.all()

    def get(self, request, *args, **kwargs):
        NilaiMahasiswaByKodeMataKuliah = models.NilaiMahasiswa.objects.filter(mata_kuliah__kode=self.kwargs['nilaiMahasiswaKodeMataKuliah'])
        serializer = self.get_serializer(NilaiMahasiswaByKodeMataKuliah, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class SettingsParameterSuratViews(viewsets.ModelViewSet):
    serializer_class = serializers.SettingsParameterSuratSerializers
    queryset = models.SettingsParameterSurat.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class SuratKeteranganPendampingIjazahViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SuratKeteranganPendampingIjazahSerializer
    queryset = models.SuratKeteranganPendampingIjazah.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def create_if_not_exists(self, request):
        nim = request.data.get('nim')
        if not nim:
            return Response({"detail": "NIM is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            mahasiswa = models.DataMahasiswa.objects.get(nim=nim)
        except models.DataMahasiswa.DoesNotExist:
            return Response({"detail": "Mahasiswa not found"}, status=status.HTTP_404_NOT_FOUND)

        if models.SuratKeteranganPendampingIjazah.objects.filter(mahasiswa=mahasiswa).exists():
            return Response({"detail": "SKPI already exists for this mahasiswa"}, status=status.HTTP_200_OK)

        # Membuat SKPI baru jika belum ada
        skpi = models.SuratKeteranganPendampingIjazah.objects.create(
            mahasiswa=mahasiswa,
            # tanggal_kelulusan=None,  # Disesuaikan dengan kebutuhan Anda
        )

        serializer = self.get_serializer(skpi)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated])
    def update_by_nim(self, request, nim=None):
        try:
            mahasiswa = models.DataMahasiswa.objects.get(nim=nim)
            skpi = models.SuratKeteranganPendampingIjazah.objects.get(mahasiswa=mahasiswa)
        except models.DataMahasiswa.DoesNotExist:
            return Response({"detail": "Mahasiswa not found"}, status=status.HTTP_404_NOT_FOUND)
        except models.SuratKeteranganPendampingIjazah.DoesNotExist:
            return Response({"detail": "SKPI not found for this mahasiswa"}, status=status.HTTP_404_NOT_FOUND)

        prodi = mahasiswa.prodi
        fields_to_update = {}
        
        def compare_and_update_parameter(parameter_name, new_value):
            # Cari parameter yang sesuai di SettingsParameterSurat
            try:
                parameter = models.SettingsParameterSurat.objects.filter(
                    parameter=parameter_name,
                    prodi__in=[prodi]
                ).latest('created_at')
            except models.SettingsParameterSurat.DoesNotExist:
                parameter = None

            if parameter and parameter.nilai_parameter_char != new_value:
                # Jika nilai berbeda, buat parameter baru
                new_param = models.SettingsParameterSurat.objects.create(
                    parameter=parameter_name,
                    nilai_parameter_char=new_value
                )
                new_param.prodi.set([prodi])
                return new_value
            elif not parameter:
                # Jika parameter tidak ditemukan, buat parameter baru
                new_param = models.SettingsParameterSurat.objects.create(
                    parameter=parameter_name,
                    nilai_parameter_char=new_value
                )
                new_param.prodi.set([prodi])
                return new_value
            return None

        # Bandingkan dan update parameter jika perlu
        no_surat_keputusan_pendirian = request.data.get('no_surat_keputusan_pendirian')
        if no_surat_keputusan_pendirian:
            new_value = compare_and_update_parameter(
                'No. Surat Keputusan Pendirian Perguruan Tinggi',
                no_surat_keputusan_pendirian
            )
            if new_value:
                fields_to_update['no_surat_keputusan_pendirian'] = new_value

        no_surat_akreditasi_pt = request.data.get('no_surat_keputusan_akreditasi_perguruan_tinggi')
        if no_surat_akreditasi_pt:
            new_value = compare_and_update_parameter(
                'No. Surat Keputusan Akreditasi Perguruan Tinggi',
                no_surat_akreditasi_pt
            )
            if new_value:
                fields_to_update['no_surat_keputusan_akreditasi_pt'] = new_value

        no_surat_akreditasi_prodi = request.data.get('no_surat_keputusan_akreditasi_prodi')
        if no_surat_akreditasi_prodi:
            new_value = compare_and_update_parameter(
                'No. Surat Keputusan Akreditasi Program Studi',
                no_surat_akreditasi_prodi
            )
            if new_value:
                fields_to_update['no_surat_keputusan_akreditasi_prodi'] = new_value

        # Update data dengan fields_to_update jika ada
        data = request.data.copy()
        data.update(fields_to_update)

        serializer = serializers.SuratKeteranganPendampingIjazahSerializer(skpi, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class SuratKeteranganPendampingIjazahByNIMViewSet(generics.ListAPIView):
    serializer_class = serializers.SuratKeteranganPendampingIjazahSerializer
    queryset = models.SuratKeteranganPendampingIjazah.objects.all()

    def get(self, request, *args, **kwargs):
        SKPIByNim = models.SuratKeteranganPendampingIjazah.objects.filter(mahasiswa__nim=self.kwargs['skpiByNIM'])
        serializer = self.get_serializer(SKPIByNim, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class SuratPenugasanSekreViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SuratPenugasanSekreSerializers
    queryset = models.SuratPenugasanSekre.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

