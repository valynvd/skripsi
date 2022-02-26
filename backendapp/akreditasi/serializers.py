from rest_framework import serializers
from account.models import CustomUser
from . import models

class PoinPenilaianSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PoinPenilaian
      fields = '__all__'

class FileFolderSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.FileFolder
      fields = '__all__'

