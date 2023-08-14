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

class PenugasanPengajaranViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PenugasanPengajaranSerializers
    queryset = models.PenugasanPengajaran.objects.all()

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
        print(self)
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
        print(self)
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
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        
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
        validated_data = self.get_serializer(data=request.data)
        validated_data.is_valid(raise_exception=True)
        programstudi = models.ProgramStudi.objects.create(name=validated_data.data.get('name_prody'), kode=validated_data.data.get('program_study'))
        matakuliah = models.MataKuliah.objects.create(name=validated_data.data.get('subject'), kode=validated_data.data.get('sm_objid'), sks_total=validated_data.data.get('graded_credits'))

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

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
        MonitoringMahasiswaByNIM = models.MonitoringMahasiswa.objects.filter(nim_mahasiswa=self.kwargs['monitoringMahasiswaNIM'])
        serializer = self.get_serializer(MonitoringMahasiswaByNIM, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.request.method == 'GET':
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()