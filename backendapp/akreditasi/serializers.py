from rest_framework import serializers
from rest_framework_recursive.fields import RecursiveField
from api.serializers import DosenSerializers, ProgramStudiSerializers
from . import models

class PoinPenilaianSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PoinPenilaian
      fields = '__all__'

class KriteriaSerializers(serializers.ModelSerializer):
  poin_penilaian_detail = serializers.SerializerMethodField(read_only=True)

  class Meta:
      model = models.Kriteria
      fields = '__all__'
  
  def get_poin_penilaian_detail(self, obj):
    poinPenilaianByKriteria = models.PoinPenilaian.objects.filter(kriteriaId=obj)

    return PoinPenilaianSerializers(poinPenilaianByKriteria, many=True).data

class FileFolderSerializers(serializers.ModelSerializer):
  kriteria_detail = KriteriaSerializers(source='kriteria', many=False, read_only=True)
  dosen_detail = DosenSerializers(source='dosen', many=False, read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', many=False, read_only=True)
  parent_folder = RecursiveField(allow_null=True)
  class Meta:
      model = models.FileFolder
      fields = '__all__'

class ListFileFolderSerializers(serializers.ModelSerializer):
  kriteria_detail = KriteriaSerializers(source='kriteria', many=False, read_only=True)
  dosen_detail = DosenSerializers(source='dosen', many=False, read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', many=False, read_only=True)
  class Meta:
      model = models.FileFolder
      fields = '__all__'