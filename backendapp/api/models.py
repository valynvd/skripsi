from django.db import models
from django.utils import timezone
from account.models import CustomUser


class Kurikulum(models.Model):
    name = models.CharField(max_length=100)
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self) -> str:
      return '{}'.format(self.name)

class MataKuliah(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	name = models.CharField(max_length=100)
	kode = models.CharField(max_length=8)
	sks_total = models.IntegerField(default=0)
	sks_praktikum = models.IntegerField(default=0)
	is_elective = models.BooleanField(default=False)
	LIST_SEMESTER = (
			('1', '1'),
			('2', '2'),
			('3', '3'),
			('4', '4'),
			('5', '5'),
			('6', '6'),
	)
	semester = models.CharField(max_length=100, choices=LIST_SEMESTER, default='1')
	def __str__(self) -> str:
		return '({}) {}'.format(self.name, self.kode)

class ProgramStudi(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	name = models.CharField(max_length=100)
	kode = models.CharField(max_length=8)
	def __str__(self) -> str:
		return '{}({})'.format(self.name, self.kode)

class Dosen(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	user = models.ForeignKey(
			CustomUser,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	name = models.CharField(max_length=30)
	inisial = models.CharField(max_length=8)
	is_fulltime = models.BooleanField(default=True)
	prodi = models.ForeignKey(
			ProgramStudi,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	def __str__(self) -> str:
		return '{} ({})'.format(self.name, self.inisial)

class SuratPenugasan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	judul = models.CharField(max_length=100)
	files = models.FileField(upload_to='suratpenugasan/', blank=True, null=True)

	def delete(self, *args, **kwargs):
		self.files.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
		return '{}'.format(self.judul)

class PenugasanPengajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	surat_penugasan = models.ForeignKey(
			SuratPenugasan,
			on_delete=models.CASCADE,
	)
	tahun = models.CharField(max_length=30)
	LIST_PERIODE = (
			('ganjil', 'ganjil'),
			('genap', 'genap'),
			('semester pendek', 'semester pendek'),
	)
	periode = models.CharField(max_length=100, choices=LIST_PERIODE, default='1')
	dosen_pengampu = models.ForeignKey(
			Dosen,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	mata_kuliah = models.ForeignKey(
			MataKuliah,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	def __str__(self) -> str:
		return '[{} {}]-{}-{}'.format(self.tahun, self.periode, self.dosen_pengampu.inisial, self.mata_kuliah.name)

class EvaluasiPerkuliahan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	penugasan = models.ForeignKey(
			PenugasanPengajaran,
			on_delete=models.CASCADE,
	)
	rps = models.FileField(upload_to='evaluasi/rps/', blank=True, null=True)
	evaluation_report = models.FileField(upload_to='evaluasi/survey/', blank=True, null=True)
	rubrik = models.FileField(upload_to='evaluasi/rubrik/', blank=True, null=True)
	notes  = models.TextField(blank=True, null=True)

	def delete(self, *args, **kwargs):
		self.rps.delete()
		self.nilai_survey_perkuliahan.delete()
		self.rubrik.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
		return '[{} {}]-{}-{}'.format(self.penugasan.tahun, self.penugasan.periode, self.penugasan.dosen_pengampu.name, self.penugasan.mata_kuliah.name)
