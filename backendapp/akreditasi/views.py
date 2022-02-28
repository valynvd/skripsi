from django.shortcuts import render
from rest_framework import viewsets
from rest_framework import generics
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

    # def get_permissions(self):
    #     if self.action in ['list','retrieve']:
    #         self.permission_classes = [AllowAny]
    #     else:
    #         self.permission_classes = [IsAuthenticated]
    #     return super(self.__class__, self).get_permissions()