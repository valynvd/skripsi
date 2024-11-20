from django.db import models
from django.utils import timezone
from api.models import Dosen, ProgramStudi, SuratPenugasan, UniqueNameFileField
from api.validation import validate_file_extension

# Create your models here.
class DokumenAkreditasi(models.Model):
    prodiId = models.ForeignKey(
        ProgramStudi,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    name = models.CharField(max_length=100)
    file = UniqueNameFileField(upload_to='evaluasi/dokumen-akreditasi/', blank=True, null=True, validators=[validate_file_extension])

class SimulasiMatriks(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    updated_at =  models.DateTimeField(default=timezone.now)
    dokumenAkreditasiId = models.ForeignKey(
        DokumenAkreditasi,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    title = models.CharField(max_length=200)

class Kriteria(models.Model):
    dokumenAkreditasiId = models.ForeignKey(
        DokumenAkreditasi,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    nama = models.CharField(max_length=100)
    deskripsi = models.TextField(blank=True, null=True)
    def __str__(self) -> str:
        return '{} - {}'.format(self.nama, self.deskripsi)

class File(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/file/', blank=True, null=True, validators=[validate_file_extension])

class PoinPenilaian(models.Model):
    kriteriaId = models.ForeignKey(
        Kriteria,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    prodiId = models.ForeignKey(
        ProgramStudi,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    document_reference = models.CharField(max_length=200, blank=True, null=True)
    type = models.CharField(max_length=10, blank=True, null=True)
    order_number = models.IntegerField(blank=True, null=True)
    item_number = models.CharField(max_length=20, blank=True, null=True)
    max_score = models.FloatField(blank=True, null=True)
    element = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    description_grade_1 = models.TextField(blank=True, null=True)
    description_grade_2 = models.TextField(blank=True, null=True)
    description_grade_3 = models.TextField(blank=True, null=True)
    description_grade_4 = models.TextField(blank=True, null=True)

    def __str__(self) -> str:
        return '{}'.format(self.element)

class RiwayatPoinPenilaian(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    poinPenilaianId = models.ForeignKey(
        PoinPenilaian,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    simulasiMatriksId = models.ForeignKey(
        SimulasiMatriks,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
    score = models.FloatField(default=0)
    dokumenPendukungSuratPenugasan = models.ManyToManyField(SuratPenugasan, blank=True)
    dokumenPendukungFile = models.ManyToManyField(File, blank=True)
    audit_upm_score = models.FloatField(default=0)
    upm_comment = models.TextField(blank=True, null=True)
    upm_follow_up = models.TextField(blank=True, null=True)

class FileFolder(models.Model):
    matrix = models.ForeignKey(
        PoinPenilaian,
        on_delete=models.CASCADE,
        blank=True, 
        null=True
    )
    kriteria = models.ForeignKey(
        Kriteria,
        on_delete=models.CASCADE,
        blank=True, 
        null=True
    )
    dosen = models.ForeignKey(
        Dosen,
        on_delete=models.CASCADE,
        blank=True, 
        null=True
    )
    prodi = models.ForeignKey(
        ProgramStudi,
        on_delete=models.CASCADE,
        blank=True, 
        null=True
    )
    parent_folder = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        blank=True, 
        null=True
    )
    nama = models.CharField(max_length=100)
    JENIS = (
        ('file', 'file'),
        ('folder', 'folder'),
    )
    jenis = models.CharField(max_length=100, choices=JENIS, default='file')
    files = models.FileField(upload_to='akreditasi/files/', blank=True, null=True, validators=[validate_file_extension])

    def __str__(self) -> str:
        return '{}-{}'.format(self.matrix, self.nama)
    
    