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
from django.db.models import Q

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

class ProgramStudiViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ProgramStudiSerializers
    queryset = models.ProgramStudi.objects.all()

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

        programstudi = models.ProgramStudi.objects.get(kode_sap=program_study)

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

        try:
            matakuliah = models.MataKuliah.objects.get(kode = subject_short)
        except models.MataKuliah.DoesNotExist:
            matakuliah, created = models.MataKuliah.objects.get_or_create(
                name = subject,
                kode = subject_short,
                sks_total = graded_credits,
                sm_objid = sm_objid
            )

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

class CapaianPembelajarViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.CapaianPembelajarSerializers
    queryset = models.CapaianPembelajar.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
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
