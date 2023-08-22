from django.shortcuts import render
from rest_framework import viewsets
from rest_framework import generics
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from . import models
from . import serializers
from collections import namedtuple

class PoinPenilaianViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.PoinPenilaianSerializers
    queryset = models.PoinPenilaian.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class RiwayatPoinPenilaianViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.RiwayatPoinPenilaianSerializers
    queryset = models.RiwayatPoinPenilaian.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class FileViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.FileSerializers
    queryset = models.File.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class FolderFileByPoinPenilaian(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolderSerializers
    queryset = models.FileFolder.objects.all()

    def get_queryset(self):
        matrix_id = self.kwargs['matrix_id']
        return models.FileFolder.objects.filter(matrix__id = matrix_id).order_by('-jenis','nama')

class FolderFileByFolder(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolderSerializers
    queryset = models.FileFolder.objects.all()

    def get_queryset(self):
        folder_id = self.kwargs['folder_id']
        return models.FileFolder.objects.filter(parent_folder__id = folder_id).order_by('-jenis','nama')

class FileFolderViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolderSerializers
    queryset = models.FileFolder.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class ListFileFolderViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.ListFileFolderSerializers
    queryset = models.FileFolder.objects.all()

class KriteriaViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.KriteriaSerializers
    queryset = models.Kriteria.objects.all()

class FolderFileByKriteria(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolderSerializers
    queryset = models.FileFolder.objects.all()

    def get_queryset(self):
        kriteria_id = self.kwargs['kriteria_id']
        return models.FileFolder.objects.filter(kriteria__id = kriteria_id).order_by('nama')

    # def get_permissions(self):
    #     if self.action in ['list','retrieve']:
    #         self.permission_classes = [AllowAny]
    #     else:
    #         self.permission_classes = [IsAuthenticated]
    #     return super(self.__class__, self).get_permissions()

@api_view(('GET',))
def MatriksPenilaianByProdi(request, prodiId):
    poinPenilaianByProdi = models.PoinPenilaian.objects.filter(prodiId__id=prodiId).order_by("order_number")
    formattedMatriksPenilaian = []
    storedIndex = 0

    for index, item in enumerate(poinPenilaianByProdi):
        if(item.kriteriaId == None):
            poinPenilaianData = serializers.PoinPenilaianSerializers(item).data
            poinPenilaianData['nama'] = None

            formattedMatriksPenilaian.append(poinPenilaianData)
        else:
            if(item.kriteriaId.nama == formattedMatriksPenilaian[storedIndex]['nama']):
                formattedMatriksPenilaian[storedIndex]['poin_penilaian_detail'].append(serializers.PoinPenilaianSerializers(item).data)
            else:
                formattedMatriksPenilaian.append(serializers.KriteriaSerializers(item.kriteriaId).data)
                formattedMatriksPenilaian[-1]['poin_penilaian_detail'] = [serializers.PoinPenilaianSerializers(item).data]
                storedIndex = len(formattedMatriksPenilaian) - 1

    return Response(formattedMatriksPenilaian, status=status.HTTP_200_OK)
    
class DokumenAkreditasiViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.DokumenAkreditasiSerializers
    queryset = models.DokumenAkreditasi.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class SimulasiMatriksViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.SimulasiMatriksSerializers
    queryset = models.SimulasiMatriks.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class KriteriaByDokumenAkreditasiViewSet(generics.ListAPIView):
    serializer_class = serializers.KriteriaSerializers
    queryset = models.Kriteria.objects.all()

    def get(self, request, *args, **kwargs):
        kriteriaByDokumenAkreditasi = models.Kriteria.objects.filter(dokumenAkreditasiId = self.kwargs['dokumenAkreditasiId']) 
        serializer = self.get_serializer(kriteriaByDokumenAkreditasi, many=True)

        return Response(serializer.data)

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
