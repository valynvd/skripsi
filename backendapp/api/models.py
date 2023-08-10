from django.db import models
from django.utils import timezone
from account.models import CustomUser
from django_rest_passwordreset.signals import reset_password_token_created
from django.dispatch import receiver
from django.template.loader import render_to_string
from django.core.mail import send_mail
from backendapp import settings
import os, uuid

class UniqueNameFileField(models.FileField):
    def generate_filename(self, instance, filename):
        _, ext = os.path.splitext(filename) 
        name = f'{uuid.uuid4().hex}{ext}'
        return super().generate_filename(instance, name)

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
			('SP1', 'SP1'),
			('2', '2'),
			('SP2', 'SP2'),
			('3', '3'),
			('SP3', 'SP3'),
			('4', '4'),
			('SP4', 'SP4'),
			('5', '5'),
			('SP5', 'SP5'),
			('6', '6'),
			('SP6', 'SP6'),
			('7', '7'),
			('SP7', 'SP7'),
			('8', '8'),
			('SP8', 'SP8'),
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

class Cycle(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	start_year = models.IntegerField()
	end_year = models.IntegerField()
	LIST_SEMESTER = (
			('Odd', 'Odd'),
			('Odd Short', 'Odd Short'),
			('Even', 'Even'),
			('Even Short', 'Even Short'),
	)
	semester = models.CharField(max_length=40, choices=LIST_SEMESTER, blank=True, null=True)

	def __str__(self) -> str:
		return '{}/{}-{}'.format(self.start_year, self.end_year, self.semester)

class SuratPenugasan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	judul = models.CharField(max_length=100)
	files = UniqueNameFileField(upload_to='suratpenugasan/', blank=True, null=True)
	approved = models.BooleanField(default=False)
	cycle = models.ForeignKey(
			Cycle,
			on_delete=models.SET_NULL,
			blank=True, null=True
	)
	LIST_CATEGORY = (
			('pengabdian', 'pengabdian'),
			('pengajaran', 'pengajaran'),
			('penelitian', 'penelitian'),
	)
	category = models.CharField(max_length=40, choices=LIST_CATEGORY, blank=True, null=True)

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
	# tahun = models.CharField(max_length=30)
	class_code = models.CharField(max_length=50, blank=True, null=True)
	students_amount = models.IntegerField(null=True, blank=True)
	# LIST_PERIODE = (
	# 		('ganjil', 'ganjil'),
	# 		('genap', 'genap'),
	# 		('semester pendek', 'semester pendek'),
	# )
	# periode = models.CharField(max_length=100, choices=LIST_PERIODE, blank=True, null=True)
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
		return '{}-{}'.format(self.dosen_pengampu.inisial, self.mata_kuliah.name)

class DokumenPembelajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	penugasanPengajaranId = models.ForeignKey(
			PenugasanPengajaran,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	rubrik = UniqueNameFileField(upload_to='evaluasi/rubrik/', blank=True, null=True)
	notes  = models.TextField(blank=True, null=True)

	def delete(self, *args, **kwargs):
		self.rubrik.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
		return '{}-{}'.format(self.penugasanPengajaranId.dosen_pengampu.name, self.penugasanPengajaranId.mata_kuliah.name)

class RiwayatDokumenPembelajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	updated_at = models.DateTimeField(auto_now=True)
	dokumenPembelajaranId = models.ForeignKey(
			DokumenPembelajaran,
			on_delete=models.CASCADE,
	)
	initial_document = UniqueNameFileField(upload_to='evaluasi/initial_document/', blank=True, null=True)
	revised_document = UniqueNameFileField(upload_to='evaluasi/revised_document/', blank=True, null=True)
	LIST_STATUS = (
			('waiting review', 'waiting review'),
			('revision', 'revision'),
			('accepted', 'accepted'),
	)
	status = models.CharField(max_length=40, choices=LIST_STATUS, default='waiting review')
	LIST_TYPE = (
			('rps', 'rps'),
			('rubrik', 'rubrik'),
	)
	type = models.CharField(max_length=20, choices=LIST_TYPE, blank=True, null=True)
	notes  = models.TextField(blank=True, null=True)

	def delete(self, *args, **kwargs):
		self.initial_document.delete()
		self.revised_document.delete()
		super().delete(*args, **kwargs)

	def __str__(self) -> str:
			return '[{} {}]-{}-{}'.format(self.created_at, self.updated_at, self.initial_document, self.revised_document)

class PortofolioPerkuliahan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	penugasan = models.ForeignKey(
			PenugasanPengajaran,
			on_delete=models.CASCADE,
	)
	LIST_TYPE = (
			('UTS', 'UTS'),
			('UAS', 'UAS'),
	)
	type = models.CharField(max_length=20, choices=LIST_TYPE, blank=True, null=True)
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
		return '{}-{}'.format(self.penugasan.dosen_pengampu.name, self.penugasan.mata_kuliah.name)
	
class GrupMahasiswa(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	namagrup = models.CharField(blank=True, null=True, max_length=100)

	def __str__(self) -> str:
		return '{}'.format(self.namagrup) 
	
class DataMahasiswa(models.Model):
	nim = models.CharField(blank=True, null=True, max_length=50)
	nama = models.CharField(blank=True, null=True, max_length=100)
	prodi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE)
	telephone = models.CharField(blank=True, null=True, max_length=20)
	email = models.CharField(blank=True, null=True, max_length=100)
	grup = models.ForeignKey(GrupMahasiswa, on_delete=models.CASCADE)

	def __str__(self) -> str:
		return '{}-{}'.format(self.nama, self.prodi)
	
class BroadcastPesan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	pesan = models.TextField(blank=True, null=True)
	title = models.CharField(blank=True, null=True, max_length=100)

	def __str__(self) -> str:
		return '{}-{}'.format(self.created_at, self.title)
	
class KonsolChatbot(models.Model):
	LIST_CATEGORY = (
			('periode pembayaran', 'periodepembayaran'),
			('pertanyaan umum', 'pertanyaanumum'),
			('seputar lms', 'seputarlms'),
			('seputar sap', 'seputarsap'),
			('timeline akademik', 'timelineakademik'),
	)
	pertanyaan  = models.TextField(blank=True, null=True)
	jawaban  = models.TextField(blank=True, null=True)
	kategory = models.CharField(max_length=20, choices=LIST_CATEGORY, blank=True, null=True)