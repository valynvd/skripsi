from django.contrib import admin

# Register your models here.
from . import models

# Register your models here.
admin.site.register(models.Kurikulum)
admin.site.register(models.MataKuliah)
admin.site.register(models.Dosen)
admin.site.register(models.ProgramStudi)
admin.site.register(models.PenugasanPengajaran)
admin.site.register(models.SuratPenugasan)
admin.site.register(models.EvaluasiPerkuliahan)
