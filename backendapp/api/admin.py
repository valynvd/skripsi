from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

# Register your models here.
from . import models

class MataKuliahAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

# Register your models here.
admin.site.register(models.Kurikulum)
admin.site.register(models.MataKuliah, MataKuliahAdmin)
admin.site.register(models.Dosen)
admin.site.register(models.ProgramStudi)
admin.site.register(models.PenugasanPengajaran)
admin.site.register(models.SuratPenugasan)
admin.site.register(models.DokumenPembelajaran)
admin.site.register(models.RiwayatDokumenPembelajaran)
admin.site.register(models.PortofolioPerkuliahan)