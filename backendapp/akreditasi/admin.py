from django.contrib import admin
from import_export.admin import ImportExportModelAdmin

# Register your models here.
from . import models

class KriteriaAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  pass

class PoinPenilaianAdmin(ImportExportModelAdmin, admin.ModelAdmin):
  search_fields = ['element', 'kriteriaId__nama']

# Register your models here.
admin.site.register(models.PoinPenilaian, PoinPenilaianAdmin)
admin.site.register(models.FileFolder)
admin.site.register(models.Kriteria, KriteriaAdmin)