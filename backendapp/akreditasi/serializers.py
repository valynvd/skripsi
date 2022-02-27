from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField
from account.models import CustomUser
from . import models

class PoinPenilaianSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PoinPenilaian
      fields = '__all__'

class FileFolderSerializers(serializers.ModelSerializer):
  parent_folder = RecursiveField(allow_null=True)
  class Meta:
      model = models.FileFolder
      fields = '__all__'


