from django.db import models

from api.models import Dosen, ProgramStudi

# Create your models here.
class Kriteria(models.Model):
    nama = models.CharField(max_length=100)
    deskripsi = models.TextField(blank=True, null=True)
    def __str__(self) -> str:
        return '{} - {}'.format(self.nama, self.deskripsi)

class PoinPenilaian(models.Model):
    kriteriaId = models.ForeignKey(
        Kriteria,
        on_delete=models.SET_NULL,
        blank=True,
        null=True
	)
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
    files = models.FileField(upload_to='akreditasi/files/', blank=True, null=True)
    def __str__(self) -> str:
        return '{}-{}'.format(self.matrix, self.nama)