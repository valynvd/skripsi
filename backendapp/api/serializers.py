from rest_framework import serializers
from account.models import CustomUser
from . import models

class CustomUserSerializers(serializers.ModelSerializer):
  class Meta:
      model = CustomUser
      fields = ['email', 'fullname', 'role', 'phone', 'jabatan']

class KurikulumSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.Kurikulum
      fields = '__all__'

class MataKuliahSerializers(serializers.ModelSerializer):
  kurikulum_detail = KurikulumSerializers(source='kurikulum', many=False, read_only=True)
  class Meta:
      model = models.MataKuliah
      fields = '__all__'

class ProgramStudiSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.ProgramStudi
      fields = '__all__'

class DosenSerializers(serializers.ModelSerializer):
  user_detail = CustomUserSerializers(source='user', many=False, read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', many=False, read_only=True)
  class Meta:
      model = models.Dosen
      fields = '__all__'

class DosenSerializersAuthMe(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', many=False, read_only=True)
  class Meta:
      model = models.Dosen
      fields = '__all__'

class SuratPenugasanSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.SuratPenugasan
      fields = '__all__'

class PenugasanPengajaranSerializers(serializers.ModelSerializer):
  surat_penugasan_detail = SuratPenugasanSerializers(source='surat_penugasan', many=False, read_only=True)
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', many=False, read_only=True)
  class Meta:
      model = models.PenugasanPengajaran
      fields = '__all__'

class DokumenPembelajaranSerializers(serializers.ModelSerializer):
  penugasan_pengajaran_detail = PenugasanPengajaranSerializers(source='penugasanPengajaranId', many=False, read_only=True)
  accepted_rps = serializers.SerializerMethodField(read_only=True)
  accepted_rubrik = serializers.SerializerMethodField(read_only=True)
  class Meta:
      model = models.DokumenPembelajaran
      fields = '__all__'

  def get_accepted_rps(self, obj):
    riwayatDokumenPembelajaranByDokumenPembelajaran = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId = obj.id, status="accepted", type="rps")
    
    if riwayatDokumenPembelajaranByDokumenPembelajaran:
      return "https://stem-management.s3.amazonaws.com/" + str(riwayatDokumenPembelajaranByDokumenPembelajaran[0].initial_document)
      
    return None

  def get_accepted_rubrik(self, obj):
    riwayatDokumenPembelajaranByDokumenPembelajaran = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId = obj.id, status="accepted", type="rubrik")
    
    if riwayatDokumenPembelajaranByDokumenPembelajaran:
      return "https://stem-management.s3.amazonaws.com/" + str(riwayatDokumenPembelajaranByDokumenPembelajaran[0].initial_document)
      
    return None
      
class RiwayatDokumenPembelajaranSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.RiwayatDokumenPembelajaran
      fields = '__all__'

class PortofolioPerkuliahanSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PortofolioPerkuliahan
      fields = '__all__'