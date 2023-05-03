from django.db import models
from django.utils import timezone
from account.models import CustomUser
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.core.mail import send_mail
from backendapp import settings

@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):

    email = reset_password_token.user.email
    subject = "Password Reset Requested"
    email_template_name = "registration/resetpasswordapi.txt"
    c = {
        'site_name' : 'master.d3anppu24t60so.amplifyapp.com',
        'domain' : 'master.d3anppu24t60so.amplifyapp.com/reset-password',
        'user' : reset_password_token.user.email,
        'token' : reset_password_token.key,
        'protocol' : 'http',
    }

    email_description = render_to_string(email_template_name, c)

    send_mail(subject, email_description, settings.EMAIL_HOST_USER, [email], fail_silently=False)

class Kurikulum(models.Model):
    name = models.CharField(max_length=100)
    file_panduan_kurikulum = models.FileField(upload_to='kurikulum/', blank=True, null=True)
    file_pendukung = models.FileField(upload_to='kurikulum_pendukung/', blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    def __str__(self) -> str:
      return '{}'.format(self.name)

class MataKuliah(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	kurikulum = models.ForeignKey(
			Kurikulum,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
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
			('7', '7'),
			('8', '8'),
	)
	semester = models.CharField(max_length=100, choices=LIST_SEMESTER, default='1')
	def __str__(self) -> str:
		return '{} ({})'.format(self.name, self.kode)

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
	approved = models.BooleanField(default=False)

	def delete(self, *args, **kwargs):
		self.files.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
		return '{}'.format(self.judul)

class PenugasanPengajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	sks_realisasi = models.FloatField(default=0)
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

class DokumenPembelajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	penugasanPengajaranId = models.ForeignKey(
			PenugasanPengajaran,
			on_delete=models.CASCADE,
	)
	rubrik = models.FileField(upload_to='evaluasi/rubrik/', blank=True, null=True)
	notes  = models.TextField(blank=True, null=True)

	def delete(self, *args, **kwargs):
		self.rubrik.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
		return '[{} {}]-{}-{}'.format(self.penugasanPengajaranId.tahun, self.penugasanPengajaranId.periode, self.penugasanPengajaranId.dosen_pengampu.name, self.penugasanPengajaranId.mata_kuliah.name)

class RiwayatDokumenPembelajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	updated_at = models.DateTimeField(auto_now=True)
	dokumenPembelajaranId = models.ForeignKey(
			DokumenPembelajaran,
			on_delete=models.CASCADE,
	)
	rps = models.FileField(upload_to='evaluasi/rps/', blank=True, null=True)
	evaluation_report = models.FileField(upload_to='evaluasi/survey/', blank=True, null=True)

	def delete(self, *args, **kwargs):
		self.rps.delete()
		self.evaluation_report.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
			return '[{} {}]-{}-{}'.format(self.created_at, self.updated_at, self.rps, self.evaluation_report)

class PortofolioPerkuliahan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	penugasan = models.ForeignKey(
			PenugasanPengajaran,
			on_delete=models.CASCADE,
	)
	outcomes_mata_kuliah  = models.TextField(blank=True, null=True)
	metode_mata_kuliah  = models.TextField(blank=True, null=True)
	sistem_penilaian  = models.TextField(blank=True, null=True)
	statistik_kelas  = models.TextField(blank=True, null=True)
	analisis_statistik_ketercapaian  = models.TextField(blank=True, null=True)
	komentar_questioner  = models.TextField(blank=True, null=True)
	refleksi_pelaksanaan  = models.TextField(blank=True, null=True)
	rekomendasi_perbaikan_dosen  = models.TextField(blank=True, null=True)
	rekomendasi_perbaikan_univ  = models.TextField(blank=True, null=True)

	def __str__(self) -> str:
		return '[{} {}]-{}-{}'.format(self.penugasan.tahun, self.penugasan.periode, self.penugasan.dosen_pengampu.name, self.penugasan.mata_kuliah.name)
