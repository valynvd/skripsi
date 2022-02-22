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

class FileFolder1ViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolder1Serializers
    queryset = models.FileFolder1.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class FileFolder2ViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolder2Serializers
    queryset = models.FileFolder2.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class FileFolder3ViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolder3Serializers
    queryset = models.FileFolder3.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()

class FileFolder4ViewSet(viewsets.ModelViewSet):
    serializer_class = serializers.FileFolder4Serializers
    queryset = models.FileFolder4.objects.all()

    def get_permissions(self):
        if self.action in ['list','retrieve']:
            self.permission_classes = [AllowAny]
        else:
            self.permission_classes = [IsAuthenticated]
        return super(self.__class__, self).get_permissions()
