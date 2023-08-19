from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

# Register your models here.
from . import models

class MataKuliahAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class PenugasanPengajaranAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class DosenAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class KurikulumAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class CycleAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class DokumenPembelajaranAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class KurikulumAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class ProgramStudiAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class SuratPenugasanAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class DataMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class GrupMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class BroadCastPesanAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class KonsolChatbotAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class AssignMahasiswatoGrupAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class MonitoringMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class ValidasiMahasiswaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class TranskripNilaiAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

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
admin.site.register(models.CapaianPembelajar)