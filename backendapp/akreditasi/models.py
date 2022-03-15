from django.db import models

from api.models import Dosen, ProgramStudi

# Create your models here.
class PoinPenilaian(models.Model):
    kode = models.CharField(max_length=100)
    element = models.CharField(max_length=100)
    indikator = models.TextField(blank=True, null=True)
    skor_maksimal = models.TextField(blank=True, null=True)
    def __str__(self) -> str:
        return '{}. {}'.format(self.kode, self.element)

class Kriteria(models.Model):
    nama = models.CharField(max_length=100)
    deskripsi = models.TextField(blank=True, null=True)
    def __str__(self) -> str:
        return '{} - {}'.format(self.nama, self.deskripsi)

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