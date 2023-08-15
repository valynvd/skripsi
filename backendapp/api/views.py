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

        # Check if ProgramStudi already exists
        name_prody = validated_data.data.get('name_prody')
        program_study = validated_data.data.get('program_study')
        if name_prody == "Computer System Engineering" :
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
        programstudi, created = models.ProgramStudi.objects.get_or_create(name=name_prody, kode_sap=program_study, kode=kode)

        # Check if DataMahasiswa already exists
        nama_mahasiswa = validated_data.data.get('nama_mahasiswa')
        nim_mahasiswa = validated_data.data.get('nim_mahasiswa')
        angkatan = validated_data.data.get('angkatan')
        datamahasiswa, created= models.DataMahasiswa.objects.get_or_create(nama=nama_mahasiswa, nim=nim_mahasiswa, angkatan=angkatan, prodi=programstudi)

        # Check if Dosen already exists
        nama_dosen = validated_data.data.get('nama_dosen')
        # print(nama_dosen)
        nama_dosen_split = str(nama_dosen).split("/")
        # print(nama_dosen_split)
        inisial = validated_data.data.get('initial_dosen')
        inisial_split = str(inisial).split("/")
        nik_dosen = validated_data.data.get('nik_dosen')
        nik_dosen_split = str(nik_dosen).split("/")
        nidn_dosen = validated_data.data.get('nidn_dosen')
        nidn_dosen_split = str(nidn_dosen).split("/")

        if (len(inisial_split) >= 1) :
            for i in range(len(nama_dosen_split)):
                dosen, created = models.Dosen.objects.get_or_create(
                    name=nama_dosen_split[i],
                    inisial=inisial_split[i],
                    nik=nik_dosen_split[i],
                    nidn=nidn_dosen_split[i]
                )
        else :
            dosen, created = models.Dosen.objects.get_or_create(
                    name=nama_dosen,
                    inisial=inisial,
                    nik=nik_dosen,
                    nidn=nidn_dosen
                )

        # Check if MataKuliah already exists
        subject = validated_data.data.get('subject')
        subject_short = validated_data.data.get('subject_short')
        graded_credits = validated_data.data.get('graded_credits')
        academic_year = validated_data.data.get('academic_year')
        academic_session = validated_data.data.get('academic_session')
    
        if (academic_year == angkatan) :
            if (academic_session == '10') :
                session = '1'
            elif (academic_session == '20') :
                session = 'SP1'
            elif (academic_session == '30') :
                session = '2'
            elif (academic_session == '40') :
                session = 'SP2'
        elif (int(academic_year) - int(angkatan) == 1 ) :
            if (academic_session == '10') :
                session = '3'
            elif (academic_session == '20') :
                session = 'SP3'
            elif (academic_session == '30') :
                session = '4'
            elif (academic_session == '40') :
                session = 'SP4'
        elif (int(academic_year) - int(angkatan) == 2 ) :
            if (academic_session == '10') :
                session = '5'
            elif (academic_session == '20') :
                session = 'SP5'
            elif (academic_session == '30') :
                session = '6'
            elif (academic_session == '40') :
                session = 'SP6'
        elif (int(academic_year) - int(angkatan) == 3 ) :
            if (academic_session == '10') :
                session = '7'
            elif (academic_session == '20') :
                session = 'SP7'
            elif (academic_session == '30') :
                session = '8'
            elif (academic_session == '40') :
                session = 'SP8'

        matakuliah, created = models.MataKuliah.objects.get_or_create(
            name = subject,
            kode = subject_short,
            sks_total = graded_credits,
            semester = session
        )

        st_object_type = validated_data.data.get('st_object_type')
        st_objid = validated_data.data.get('st_objid')
        nim_mahasiswa = validated_data.data.get('nim_mahasiswa')
        student_id = validated_data.data.get('student_id')
        nama_mahasiswa = validated_data.data.get('nama_mahasiswa')
        appraisal_type = validated_data.data.get('appraisal_type')
        sm_object_type = validated_data.data.get('sm_object_type')
        sm_objid = validated_data.data.get('sm_objid')
        subject_short = validated_data.data.get('subject_short')
        subject = validated_data.data.get('subject')
        event_package_objid = validated_data.data.get('event_package_objid')
        event_package_short = validated_data.data.get('event_package_short')
        event_package_text = validated_data.data.get('event_package_text')
        nik_dosen = validated_data.data.get('nik_dosen')
        initial_dosen = validated_data.data.get('initial_dosen')
        nama_dosen = validated_data.data.get('nama_dosen')
        nidn_dosen = validated_data.data.get('nidn_dosen')
        academic_year = validated_data.data.get('academic_year')
        academic_session = validated_data.data.get('academic_session')
        grade_symbol = validated_data.data.get('grade_symbol')
        earned_credits = validated_data.data.get('earned_credits')
        graded_credits = validated_data.data.get('graded_credits')
        credit_type = validated_data.data.get('credit_type')
        program_study = validated_data.data.get('program_study')
        name_prody = validated_data.data.get('name_prody')
        angkatan = validated_data.data.get('angkatan')
        mentor = validated_data.data.get('mentor')

        # matakuliah = models.MataKuliah.objects.create(name=validated_data.data.get('subject'), kode=validated_data.data.get('sm_objid'), sks_total=validated_data.data.get('graded_credits'))

        monitoring_mahasiswa, created = models.MonitoringMahasiswa.objects.get_or_create(
            st_object_type=st_object_type,
            st_objid=st_objid,
            nim_mahasiswa=nim_mahasiswa,
            student_id=student_id,
            nama_mahasiswa=nama_mahasiswa,
            appraisal_type=appraisal_type,
            sm_object_type=sm_object_type,
            sm_objid=sm_objid,
            subject_short=subject_short,
            subject=subject,
            event_package_objid=event_package_objid,
            event_package_short=event_package_short,
            event_package_text=event_package_text,
            nik_dosen=nik_dosen,
            initial_dosen=initial_dosen,
            nama_dosen=nama_dosen,
            nidn_dosen=nidn_dosen,
            academic_year=academic_year,
            academic_session=academic_session,
            grade_symbol=grade_symbol,
            earned_credits=earned_credits,
            graded_credits=graded_credits,
            credit_type=credit_type,
            program_study=program_study,
            name_prody=name_prody,
            angkatan=angkatan,
            mentor=mentor
        )

        # serializer = self.get_serializer(instance=monitoring_mahasiswa)
        serializer = self.get_serializer(instance=monitoring_mahasiswa)
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

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
    
class TranskripNilaiViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.TranskripNilaiSerializers
    queryset = models.TranskripNilai.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

