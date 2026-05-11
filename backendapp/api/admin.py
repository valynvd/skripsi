from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

# Register your models here.
from . import models

class MataKuliahAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  list_display = ('name', 'kode', 'sks_total', 'sks_praktikum', 'prodi_name', 'semester')
  list_filter = ('sks_total', 'sks_praktikum', 'name', 'prodi__name', 'semester')
  search_fields = ('name', 'kode')

  def prodi_name(self, obj):
      return obj.prodi.name if obj.prodi else None
  prodi_name.short_description = 'Prodi'

class PenugasanPengajaranAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class DosenAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  search_fields = ('name', 'inisial', 'nidn')

class KurikulumAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class CycleAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class DokumenPembelajaranAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class KurikulumAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class ProgramStudiAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  search_fields = ('name', 'kode', 'kode_sap')

class SuratPenugasanAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class DataMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  list_display = ('nama', 'nim', 'mahasiswa_id', 'get_prodi_name', 'angkatan')
  list_filter = ('angkatan', 'prodi__name')
  search_fields = ('nim', 'nama')

  def get_prodi_name(self, obj):
    return obj.prodi.name if obj.prodi else "-"
  
  get_prodi_name.short_description = 'Program Studi'

class GrupMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class BroadCastPesanAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class KonsolChatbotAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class AssignMahasiswatoGrupAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class MonitoringMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  list_display = (
      'get_mahasiswa_name', 
      'get_mata_kuliah_name', 
      # 'get_prodi_name',
      'get_earned_credits',
      'grade_symbol'
  )
  
  list_filter = ('prodi__name', 'mata_kuliah__name', 'grade_symbol')
  search_fields = ('mahasiswa__nama',)
  
  def get_mahasiswa_name(self, obj):
      return obj.mahasiswa.nama if obj.mahasiswa else "-"
  
  def get_mata_kuliah_name(self, obj):
      return obj.mata_kuliah.name if obj.mata_kuliah else "-"
  
  # def get_prodi_name(self, obj):
  #     return obj.prodi.name if obj.prodi else "-"
  def get_earned_credits(self, obj):
    return obj.earned_credits if obj.earned_credits else "-"
  
  get_mahasiswa_name.short_description = 'Nama Mahasiswa'
  get_mata_kuliah_name.short_description = 'Mata Kuliah'
  # get_prodi_name.short_description = 'Program Studi'
  get_earned_credits.short_description = 'SKS Lulus'

class ValidasiMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class TranskripNilaiAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  list_display = (
      'get_mahasiswa_name', 
      'get_mata_kuliah_name', 
      # 'get_prodi_name',
      'get_earned_credits',
      'grade_symbol'
  )
  
  list_filter = ( 'mata_kuliah__name', 'grade_symbol')
  search_fields = ('mahasiswa__nama',)
  
  def get_mahasiswa_name(self, obj):
      return obj.mahasiswa.nama if obj.mahasiswa else "-"
  
  def get_mata_kuliah_name(self, obj):
      return obj.mata_kuliah.name if obj.mata_kuliah else "-"
  
  # def get_prodi_name(self, obj):
  #     return obj.prodi.name if obj.prodi else "-"
  def get_earned_credits(self, obj):
    return obj.earned_credits if obj.earned_credits else "-"
  
  get_mahasiswa_name.short_description = 'Nama Mahasiswa'
  get_mata_kuliah_name.short_description = 'Mata Kuliah'
  # get_prodi_name.short_description = 'Program Studi'
  get_earned_credits.short_description = 'SKS Lulus'

class BahanKajianAdmin(admin.ModelAdmin):
  list_display = ('prodi_name', 'kode', 'deskripsi', 'kategori', 'referensi')
  list_filter = ('prodi__name', 'kategori')
  search_fields = ('kode', 'deskripsi')

  def prodi_name(self, obj):
      return obj.prodi.name
  prodi_name.admin_order_field = 'prodi__name' 
  prodi_name.short_description = 'Prodi'

class NilaiMahasiswaAdmin(admin.ModelAdmin):
  list_display = (
      'get_mahasiswa_name', 
      'get_mata_kuliah_name', 
      'earned_credits', 
      'get_penilaian_name', 
      'nilai_penilaian', 
      'bobot'
  )
  
  list_filter = ('penilaian__nama_penilaian', 'mata_kuliah__name')
  search_fields = ('mahasiswa__nama',)

  def get_mahasiswa_name(self, obj):
      return obj.mahasiswa.nama if obj.mahasiswa else "-"
  
  def get_mata_kuliah_name(self, obj):
      return obj.mata_kuliah.name if obj.mata_kuliah else "-"
  
  def get_penilaian_name(self, obj):
      return obj.penilaian.nama_penilaian if obj.penilaian else "-"
  
  get_mahasiswa_name.short_description = 'Nama Mahasiswa'
  get_mata_kuliah_name.short_description = 'Mata Kuliah'
  get_penilaian_name.short_description = 'Penilaian'
  
class CapaianPembelajaranAdmin(admin.ModelAdmin):
  list_display = ('get_prodi_name', 'kode', 'deskripsi', 'get_bk_kode', 'aspect')
  list_filter = ('prodi__name', 'kode', 'aspect')
  search_fields = ('kode', 'deskripsi')

  def get_prodi_name(self, obj):
      return obj.prodi.name if obj.prodi else "-"
  get_prodi_name.short_description = 'Prodi'

  def get_bk_kode(self, obj):
      return obj.bahan_kajian.kode if obj.bahan_kajian else "-"
  get_bk_kode.short_description = 'Bahan Kajian'

class CapaianPembelajaranMataKuliahAdmin(admin.ModelAdmin):
  list_display = ('get_prodi_name', 'kode', 'deskripsi', 'get_cpl_kode')
  list_filter = ('cpl__prodi__name', 'cpl__kode', 'kode')
  search_fields = ('kode', 'deskripsi')

  def get_prodi_name(self, obj):
      return obj.cpl.prodi.name if obj.cpl and obj.cpl.prodi else "-"
  get_prodi_name.short_description = 'Prodi'

  def get_cpl_kode(self, obj):
      return obj.cpl.kode if obj.cpl else "-"
  get_cpl_kode.short_description = 'CPL'

class PenilaianAdmin(admin.ModelAdmin):
    list_display = ('get_nama_matakuliah', 'nama_penilaian', 'get_cpmks')
    list_filter = ('nama_penilaian', 'mata_kuliah__name', 'cpmks__kode')
    search_fields = ('mata_kuliah__name',)
    
    # Method untuk menampilkan nama mata kuliah
    def get_nama_matakuliah(self, obj):
        return obj.mata_kuliah.name
    get_nama_matakuliah.admin_order_field = 'mata_kuliah__name'
    get_nama_matakuliah.short_description = 'Nama Mata Kuliah'

    def get_cpmks(self, obj):
        return ", ".join([cpmk.kode for cpmk in obj.cpmks.all()])
    get_cpmks.short_description = 'CPMK'
    

# Register your models here.
admin.site.register(models.Kurikulum, KurikulumAdmin)
admin.site.register(models.MataKuliah, MataKuliahAdmin)
admin.site.register(models.Dosen, DosenAdmin)
admin.site.register(models.ProgramStudi, ProgramStudiAdmin)
admin.site.register(models.PenugasanPengajaran, PenugasanPengajaranAdmin)
admin.site.register(models.SuratPenugasan, SuratPenugasanAdmin)
admin.site.register(models.PenugasanPenelitian)
admin.site.register(models.PenugasanPengabdian)
admin.site.register(models.PublikasiKarya)
admin.site.register(models.PatenHKI)
admin.site.register(models.Pembicara)
admin.site.register(models.PengelolaJurnal)
admin.site.register(models.RiwayatJabatanStruktural)
admin.site.register(models.DokumenPembelajaran, DokumenPembelajaranAdmin)
admin.site.register(models.RiwayatDokumenPembelajaran)
admin.site.register(models.PortofolioPerkuliahan)
admin.site.register(models.Cycle, CycleAdmin)
admin.site.register(models.DataMahasiswa, DataMahasiswaAdmin)
admin.site.register(models.GrupMahasiswa, GrupMahasiswaAdmin)
admin.site.register(models.BroadcastPesan, BroadCastPesanAdmin)
admin.site.register(models.KonsolChatbot, KonsolChatbotAdmin)
admin.site.register(models.AssignMahasiswatoGrup, AssignMahasiswatoGrupAdmin)
admin.site.register(models.MonitoringMahasiswa, MonitoringMahasiswaAdmin)
admin.site.register(models.ValidasiMahasiswa, ValidasiMahasiswaAdmin)
admin.site.register(models.TranskripNilai, TranskripNilaiAdmin)
admin.site.register(models.CapaianPembelajaran, CapaianPembelajaranAdmin)
# admin.site.register(models.CapaianPembelajaran, CapaianPembelajaranAdmin)
admin.site.register(models.CapaianPembelajaranMataKuliah, CapaianPembelajaranMataKuliahAdmin)
admin.site.register(models.ProfilLulusan)
admin.site.register(models.Penilaian, PenilaianAdmin)
admin.site.register(models.NilaiMahasiswa, NilaiMahasiswaAdmin)
admin.site.register(models.BahanKajian, BahanKajianAdmin)
# admin.site.register(models.ImplementasiKurikulum, ImplementasiKurikulumAdmin)
admin.site.register(models.SuratKeteranganPendampingIjazah)
admin.site.register(models.SettingsParameterSurat)
admin.site.register(models.SuratPenugasanSekre)


