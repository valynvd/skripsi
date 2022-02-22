from rest_framework import serializers
from account.models import CustomUser
from . import models

class PoinPenilaianSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PoinPenilaian
      fields = '__all__'

class FileFolder1Serializers(serializers.ModelSerializer):
  class Meta:
      model = models.FileFolder1
      fields = '__all__'

class FileFolder2Serializers(serializers.ModelSerializer):
  class Meta:
      model = models.FileFolder2
      fields = '__all__'

class FileFolder3Serializers(serializers.ModelSerializer):
  class Meta:
      model = models.FileFolder3
      fields = '__all__'

class FileFolder4Serializers(serializers.ModelSerializer):
  class Meta:
      model = models.FileFolder4
      fields = '__all__'
