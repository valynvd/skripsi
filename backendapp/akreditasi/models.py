from django.db import models

# Create your models here.
class PoinPenilaian(models.Model):
    kode = models.CharField(max_length=100)
    element = models.CharField(max_length=100)
    indikator = models.TextField(blank=True, null=True)
    skor_maksimal = models.TextField(blank=True, null=True)
    def __str__(self) -> str:
        return '{}. {}'.format(self.kode, self.element)

class FileFolder1(models.Model):
    parent = models.ForeignKey(
        PoinPenilaian,
        on_delete=models.CASCADE,
    )
    nama = models.CharField(max_length=100)
    JENIS = (
        ('file', 'file'),
        ('folder', 'folder'),
    )
    jenis = models.CharField(max_length=100, choices=JENIS, default='file')
    files = models.FileField(upload_to='akreditasi/files/', blank=True, null=True)
    def __str__(self) -> str:
        return '{}-{}'.format(self.parent, self.nama)

class FileFolder2(models.Model):
    parent = models.ForeignKey(
        FileFolder1,
        on_delete=models.CASCADE,
    )
    nama = models.CharField(max_length=100)
    JENIS = (
        ('file', 'file'),
        ('folder', 'folder'),
    )
    jenis = models.CharField(max_length=100, choices=JENIS, default='file')
    files = models.FileField(upload_to='akreditasi/files/', blank=True, null=True)
    def __str__(self) -> str:
        return '{}-{}'.format(self.parent, self.nama)

class FileFolder3(models.Model):
    parent = models.ForeignKey(
        FileFolder2,
        on_delete=models.CASCADE,
    )
    nama = models.CharField(max_length=100)
    JENIS = (
        ('file', 'file'),
        ('folder', 'folder'),
    )
    jenis = models.CharField(max_length=100, choices=JENIS, default='file')
    files = models.FileField(upload_to='akreditasi/files/', blank=True, null=True)
    def __str__(self) -> str:
        return '{}-{}'.format(self.parent, self.nama)

class FileFolder4(models.Model):
    parent = models.ForeignKey(
        FileFolder3,
        on_delete=models.CASCADE,
    )
    nama = models.CharField(max_length=100)
    JENIS = (
        ('file', 'file'),
        ('folder', 'folder'),
    )
    jenis = models.CharField(max_length=100, choices=JENIS, default='file')
    files = models.FileField(upload_to='akreditasi/files/', blank=True, null=True)
    def __str__(self) -> str:
        return '{}-{}'.format(self.parent, self.nama)