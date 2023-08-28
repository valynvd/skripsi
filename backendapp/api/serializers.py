from rest_framework import serializers
from account.models import CustomUser
from . import models

class CustomUserSerializers(serializers.ModelSerializer):
  class Meta:
      model = CustomUser
      fields = ['email', 'fullname', 'role', 'phone', 'jabatan', 'jabatan_fungsional']

class KurikulumSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.Kurikulum
      fields = '__all__'

class CapaianPembelajarSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.CapaianPembelajar
      fields = '__all__'

class MataKuliahSerializers(serializers.ModelSerializer):
  kurikulum_detail = KurikulumSerializers(source='kurikulum', many=True, read_only=True)
  capaian_pembelajar_detail = CapaianPembelajarSerializers(source='capaianPembelajar', many=True, read_only=True)

  class Meta:
      model = models.MataKuliah
      fields = '__all__'
      
class CycleSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.Cycle
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
  cycle_detail = CycleSerializers(source='cycle', many=False, read_only=True)
  class Meta:
      model = models.SuratPenugasan
      fields = '__all__'

class PublikasiKaryaSerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  class Meta:
      model = models.PublikasiKarya
      fields = '__all__'

class PatenHKISerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  class Meta:
      model = models.PatenHKI
      fields = '__all__'

class PenugasanPenelitianSerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  surat_penugasan_detail = SuratPenugasanSerializers(source='surat_penugasan', many=False, read_only=True)

  class Meta:
      model = models.PenugasanPenelitian
      fields = '__all__'

class PenugasanPengabdianSerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  class Meta:
      model = models.PenugasanPengabdian
      fields = '__all__'

class PembicaraSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.Pembicara
      fields = '__all__'

class PengelolaJurnalSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PengelolaJurnal
      fields = '__all__'

class RiwayatJabatanStrukturalSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.RiwayatJabatanStruktural
      fields = '__all__'

class PenugasanPengajaranSerializers(serializers.ModelSerializer):
  surat_penugasan_detail = SuratPenugasanSerializers(source='surat_penugasan', many=False, read_only=True)
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', many=False, read_only=True)
  class Meta:
      model = models.PenugasanPengajaran
      fields = '__all__'

class PortofolioPerkuliahanSerializers(serializers.ModelSerializer):
  class Meta:
    model = models.PortofolioPerkuliahan
    fields = '__all__'

class DokumenPembelajaranSerializers(serializers.ModelSerializer):
  penugasan_pengajaran_detail = PenugasanPengajaranSerializers(source='penugasanPengajaranId', many=False, read_only=True)
  rps_status = serializers.SerializerMethodField(read_only=True)
  rubrik_status = serializers.SerializerMethodField(read_only=True)
  portofolio_perkuliahan = serializers.SerializerMethodField(read_only=True) 

  class Meta:
      model = models.DokumenPembelajaran
      fields = '__all__'

  def get_rps_status(self, obj):
    riwayatDokumenPembelajaranByDokumenPembelajaran = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId = obj.id, type="rps")

    print(riwayatDokumenPembelajaranByDokumenPembelajaran)
    if(len(riwayatDokumenPembelajaranByDokumenPembelajaran) == 0):
      return 'empty'

    if(riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status == 'accepted'):
      return {'accepted': True, "link":"https://stem-management.s3.amazonaws.com/" + str(riwayatDokumenPembelajaranByDokumenPembelajaran[0].initial_document )}

    return riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status

  def get_rubrik_status(self, obj):
    riwayatDokumenPembelajaranByDokumenPembelajaran = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId = obj.id, type="rubrik")

    print(riwayatDokumenPembelajaranByDokumenPembelajaran)
    if(len(riwayatDokumenPembelajaranByDokumenPembelajaran) == 0):
      return 'empty'

    if(riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status == 'accepted'):
      return {'accepted': True, "link":"https://stem-management.s3.amazonaws.com/" + str(riwayatDokumenPembelajaranByDokumenPembelajaran[0].initial_document )}

    return riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status
  
  def get_portofolio_perkuliahan(self, obj):
    portofolioPerkuliahanByPenugasanPengajaran = models.PortofolioPerkuliahan.objects.filter(penugasan=obj.penugasanPengajaranId)

    if len(portofolioPerkuliahanByPenugasanPengajaran):
      checkUTS = False
      checkUAS = False

      for portofolioPerkuliahan in portofolioPerkuliahanByPenugasanPengajaran:
        if(portofolioPerkuliahan.type == 'UTS'):
          checkUTS = True
        if(portofolioPerkuliahan.type == 'UAS'):
          checkUAS = True

      if(checkUTS & checkUAS):
        return True
      
      return False

    return False
      
class RiwayatDokumenPembelajaranSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.RiwayatDokumenPembelajaran
      fields = '__all__'

class PortofolioPerkuliahanSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PortofolioPerkuliahan
      fields = '__all__'

class GrupMahasiswaSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.GrupMahasiswa
      fields = '__all__'

class DataMahasiswaSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  class Meta:
      model = models.DataMahasiswa
      fields = '__all__'
      
class BroadcastPesanSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.BroadcastPesan
      fields = '__all__'

class KonsolChatbotSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.KonsolChatbot
      fields = '__all__'

class AssignMahasiswatoGrupSerializers(serializers.ModelSerializer):
  nama_grup = GrupMahasiswaSerializers(read_only=True)
  nama_mahasiswa = DataMahasiswaSerializers(read_only=True)

  class Meta:
      model = models.AssignMahasiswatoGrup
      fields = '__all__'

class MonitoringMahasiswaSerializers(serializers.ModelSerializer):
  # nama_mahasiswa = serializers.CharField(write_only=True)
  # nim_mahasiswa = serializers.CharField(write_only=True)
  # angkatan = serializers.CharField(write_only=True)

  # subject_short = serializers.CharField(write_only=True)
  # subject = serializers.CharField(write_only=True)
  # graded_credits = serializers.CharField(write_only=True)

  # program_study = serializers.CharField(write_only=True)
  # name_prody = serializers.CharField(write_only=True)

  # nik_dosen = serializers.CharField(write_only=True)
  # initial_dosen = serializers.CharField(write_only=True),
  # nama_dosen = serializers.CharField(write_only=True)

  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  # dosen_detail = DosenSerializers(source='dosen', read_only=True)
  # penugasan_pengajaran_detail = PenugasanPengajaranSerializers(source='penugasan_pengajaran', read_only=True, many=True)

  class Meta:
      model = models.MonitoringMahasiswa
      fields = 	'__all__'

class ValidasiMahasiswaSerializers(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  
  class Meta:
      model = models.ValidasiMahasiswa
      fields = '__all__'

class TranskripNilaiSerializers(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', read_only=True)
  class Meta:
      model = models.TranskripNilai
      fields = '__all__'
