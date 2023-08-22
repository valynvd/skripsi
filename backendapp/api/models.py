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

class CapaianPembelajar(models.Model):
	LIST_ASPECT = (
		('sikap', 'sikap'),
		('pengetahuan', 'pengetahuan'),
		('keterampilan umum', 'keterampilan umum'),
		('keterampilan khusus', 'keterampilan khusus'),
	)
	aspect = models.CharField(max_length=100, choices=LIST_ASPECT)
	number = models.IntegerField()	
	description = models.TextField(null=True, blank=True)

	def __str__(self) -> str:
		return '{}-{}'.format(self.aspect, self.number)

class ProgramStudi(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	name = models.CharField(max_length=100, blank=True, null=True)
	kode = models.CharField(max_length=8, blank=True, null=True)
	kode_sap = models.CharField(max_length=100, blank=True, null=True)
	def __str__(self) -> str:
		return '{}({})'.format(self.name, self.kode)

class Kurikulum(models.Model):
	programStudiId = models.ForeignKey(ProgramStudi, on_delete=models.SET_NULL, blank=True, null=True)
	name = models.CharField(max_length=100)
	file_panduan_kurikulum = models.FileField(upload_to='kurikulum/', blank=True, null=True)
	file_pendukung = models.FileField(upload_to='kurikulum_pendukung/', blank=True, null=True)
	created_at = models.DateTimeField(default=timezone.now)
	def __str__(self) -> str:
		return '{}'.format(self.name)

class MataKuliah(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	kurikulum = models.ManyToManyField(
			Kurikulum,
			blank=True,
	)
	capaianPembelajar = models.ManyToManyField(CapaianPembelajar ,blank=True)
	name = models.CharField(max_length=100, blank=True, null=True)
	kode = models.CharField(max_length=8, blank=True, null=True)
	sks_total = models.IntegerField(default=0, blank=True, null=True)
	sks_praktikum = models.IntegerField(default=0, blank=True, null=True)
	is_elective = models.BooleanField(default=False, blank=True, null=True)

	def __str__(self) -> str:
		return '{} ({})'.format(self.name, self.kode)

class Dosen(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	user = models.ForeignKey(
			CustomUser,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	name = models.CharField(max_length=30, blank=True, null=True)
	inisial = models.CharField(max_length=8, blank=True, null=True)
	is_fulltime = models.BooleanField(default=True)
	nidn = models.CharField(max_length=100, blank=True, null=True)
	nik = models.CharField(max_length=20, blank=True, null=True)
	prodi = models.ForeignKey(
			ProgramStudi,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	def __str__(self) -> str:
		return '{} ({})'.format(self.name, self.inisial)

class AssignMataKuliah(models.Model):
	mataKuliahId = models.ForeignKey(
			MataKuliah,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	programStudiId = models.ForeignKey(
			ProgramStudi,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
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

class PublikasiKarya(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	dosen_pengampu = models.ForeignKey(Dosen, on_delete=models.SET_NULL, blank=True, null=True)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/publikasi_karya/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.title)

class PatenHKI(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	dosen_pengampu = models.ForeignKey(Dosen, on_delete=models.SET_NULL, blank=True, null=True)
	title = models.CharField(max_length=100)
	description = models.TextField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/paten/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.title)

class Pembicara(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	dosen_pengampu = models.ForeignKey(Dosen, on_delete=models.SET_NULL, blank=True, null=True)
	title = models.CharField(max_length=100)
	LIST_SPEAKER_CATEGORY = (
			('Pembicara pada pertemuan ilmiah', 'Pembicara pada pertemuan ilmiah'),
			('Pembicara kunci', 'Pembicara kunci'),
			('Pembicara/narasumber pada pelatihan/penyuluhan/ceramah', 'Pembicara/narasumber pada pelatihan/penyuluhan/ceramah'),
	)
	speaker_category = models.CharField(max_length=200, choices=LIST_SPEAKER_CATEGORY, blank=True, null=True)
	LIST_MEETING_LEVEL = (
			('Lokal', 'Lokal'),
			('Daerah', 'Daerah'),
			('Nasional', 'Nasional'),
			('Internasional', 'Internasional'),
			('Lain-lain', 'Lain-lain'),
	)
	meeting_level = models.CharField(max_length=40, choices=LIST_MEETING_LEVEL, blank=True, null=True)
	organizer = models.CharField(max_length=100)
	start_date = models.DateField(blank=True, null=True)
	language = models.CharField(max_length=20, blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/pembicara/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.title)

class PengelolaJurnal(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	dosen_pengampu = models.ForeignKey(Dosen, on_delete=models.SET_NULL, blank=True, null=True)
	role = models.CharField(max_length=100)
	publication_media = models.CharField(max_length=100)
	assignment_letter_number = models.IntegerField()
	start_date = models.DateField(blank=True, null=True)
	end_date = models.DateField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/pengelola_jurnal/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.role)

class RiwayatJabatanStruktural(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	dosen_pengampu = models.ForeignKey(Dosen, on_delete=models.SET_NULL, blank=True, null=True)
	LIST_POSITION_TITLE = (
			('Kepala Dinas', 'Kepala Dinas'),
			('Kepala Badan', 'Kepala Badan'),
			('Anggota BPK', 'Anggota BPK'),
			('Ketua MA', 'Ketua MA'),
			('Wakil Ketua MA', 'Wakil Ketua MA'),
			('Ketua Muda Ma', 'Ketua Muda Ma'),
			('Hakim MA', 'Hakim MA'),
			('Anggota DPA', 'Anggota DPA'),
			('Menteri', 'Menteri'),
			('Duta Besar', 'Duta Besar'),
			('Kepala Pusat', 'Kepala Pusat'),
			('Kepala Biro', 'Kepala Biro'),
	)
	position_title = models.CharField(max_length=50, choices=LIST_POSITION_TITLE, blank=True, null=True)
	structural_position_decree_number = models.IntegerField()
	start_date = models.DateField(blank=True, null=True)
	end_date = models.DateField(blank=True, null=True)
	location = models.TextField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/riwayat_jabatan_struktural/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.position_title)

class PenugasanPengajaran(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	sks_realisasi = models.IntegerField(default=0)
	surat_penugasan = models.ForeignKey(
			SuratPenugasan,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	class_code = models.CharField(max_length=50, blank=True, null=True)
	students_amount = models.IntegerField(null=True, blank=True)
	dosen_pengampu = models.ForeignKey(
			Dosen,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	mata_kuliah = models.ForeignKey(
			MataKuliah,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	def __str__(self) -> str:
		return '{}'.format(self.dosen_pengampu.inisial)

class PenugasanPengabdian(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	surat_penugasan = models.ForeignKey(
			SuratPenugasan,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	dosen_pengampu = models.ForeignKey(
			Dosen,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	title = models.CharField(max_length=100, blank=True, null=True)
	start_year = models.IntegerField(blank=True, null=True)
	total_year = models.IntegerField(blank=True, null=True)
	location = models.TextField(blank=True, null=True)
	dikti_total_fund = models.FloatField(blank=True, null=True)
	college_total_fund = models.FloatField(blank=True, null=True)
	other_institution_total_fund = models.FloatField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/pengabdian/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.title)

class PenugasanPenelitian(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	surat_penugasan = models.ForeignKey(
			SuratPenugasan,
			on_delete=models.SET_NULL,
			blank=True,
			null=True,
	)
	dosen_pengampu = models.ForeignKey(
			Dosen,
			on_delete=models.CASCADE,
			blank=True,
			null=True,
	)
	title = models.CharField(max_length=100,blank=True, null=True)
	start_year = models.IntegerField(blank=True, null=True)
	total_year = models.IntegerField(blank=True, null=True)
	location = models.TextField(blank=True, null=True)
	dikti_total_fund = models.FloatField(blank=True, null=True)
	college_total_fund = models.FloatField(blank=True, null=True)
	other_institution_total_fund = models.FloatField(blank=True, null=True)
	file = UniqueNameFileField(upload_to='evaluasi/penelitian/', blank=True, null=True)

	def __str__(self) -> str:
		return '{}'.format(self.title)


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
	angkatan = models.CharField(blank=True, null=True, max_length=100)
	prodi = models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, blank=True, null=True)
	telephone = models.CharField(blank=True, null=True, max_length=20)
	email = models.CharField(blank=True, null=True, max_length=100)
	email_universitas = models.CharField(blank=True, null=True, max_length=100)

	def __str__(self) -> str:
		return '{}-{}'.format(self.nama, self.prodi)
	
class AssignMahasiswatoGrup(models.Model):
	nama_mahasiswa = models.ForeignKey(DataMahasiswa, on_delete=models.CASCADE)
	nama_grup = models.ForeignKey(GrupMahasiswa, on_delete=models.CASCADE)

	def __str__(self) -> str:
		return '{} - {}'.format(self.nama_mahasiswa, self.nama_grup) 
	
class BroadcastPesan(models.Model):
	created_at = models.DateTimeField(default=timezone.now)
	pesan = models.TextField(blank=True, null=True)
	title = models.CharField(blank=True, null=True, max_length=100)
	received = models.CharField(blank=True, null=True, max_length=100)

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

class MonitoringMahasiswa(models.Model):
	st_object_type = models.CharField(blank=True, null=True, max_length=100)
	st_objid = models.CharField(blank=True, null=True, max_length=100)
	mahasiswa = models.ForeignKey(DataMahasiswa, on_delete=models.CASCADE, blank=True, null=True)
	student_id = models.CharField(blank=True, null=True, max_length=100)
	appraisal_type = models.CharField(blank=True, null=True, max_length=100)
	sm_object_type = models.CharField(blank=True, null=True, max_length=100)
	sm_objid = models.CharField(blank=True, null=True, max_length=100)
	# mata_kuliah = models.ForeignKey(MataKuliah, on_delete=models.CASCADE, null=True, blank=True)
	penugasan_pengajaran = models.ManyToManyField(PenugasanPengajaran, blank=True)
	event_package_objid = models.CharField(blank=True, null=True, max_length=100)
	event_package_short = models.CharField(blank=True, null=True, max_length=100)
	event_package_text = models.CharField(blank=True, null=True, max_length=100)
	# dosen = models.ForeignKey(Dosen, on_delete=models.CASCADE, blank=True, null=True)
	LIST_GRADE = (
			('A', 'A'),
			('AB', 'AB'),
			('B', 'B'),
			('BC', 'BC'),
			('C', 'C'),
			('D', 'D'),
			('E', 'E'),
			('T', 'T'),
	)
	grade_symbol = models.CharField(max_length=20, choices=LIST_GRADE, blank=True, null=True)
	earned_credits = models.CharField(blank=True, null=True, max_length=100)
	credit_type = models.CharField(blank=True, null=True, max_length=100)
	prodi= models.ForeignKey(ProgramStudi, on_delete=models.CASCADE, blank=True, null=True)
	academic_year = models.CharField(blank=True, null=True, max_length=100)
	academic_session = models.CharField(blank=True, null=True, max_length=100)
	
	mentor = models.CharField(blank=True, null=True, max_length=100)

	def __str__(self) -> str:
		return '{} '.format(self.mahasiswa.nama)
	

class ValidasiMahasiswa(models.Model):
	mahasiswa = models.ForeignKey(DataMahasiswa, on_delete=models.CASCADE, blank=True, null=True)
	jumlah_sks = models.IntegerField(default=0, blank=True, null=True)
	nilaie = models.IntegerField(default=0, blank=True, null=True)
	nilaid = models.IntegerField(default=0, blank=True, null=True)
	LIST_STATUS = (
		('Cum Laude', 'Cum Laude'),
		('Sangat Memuaskan', 'Sangat Memuaskan' ),
		('Memuaskan', 'Memuaskan'),
		('Cukup', 'Cukup'),
		('Tidak Lulus', 'Tidak Lulus'),
	)
	status_kelulusan = models.CharField(max_length=100, choices=LIST_STATUS, blank=True, null=True)
	nilai_ipk = models.CharField(max_length=100, blank=True, null=True)
	
	def __str__(self) -> str:
		return '{} - {}'.format(self.mahasiswa.nama, self.status_kelulusan)

class TranskripNilai(models.Model):
	mahasiswa = models.ForeignKey(DataMahasiswa, on_delete=models.CASCADE, blank=True, null=True)
	mata_kuliah = models.ForeignKey(MataKuliah, on_delete=models.CASCADE, blank=True, null=True)
	earned_credits = models.CharField(blank=True, null=True, max_length=100)
	academic_year = models.CharField(max_length=20, null=True, blank=True)
	academic_session = models.CharField(max_length=20, null=True, blank=True)
	LIST_GRADE = (
			('A', 'A'),
			('AB', 'AB'),
			('B', 'B'),
			('BC', 'BC'),
			('C', 'C'),
			('D', 'D'),
			('E', 'E'),
			('T', 'T')
	)
	grade_symbol = models.CharField(max_length=20, choices=LIST_GRADE, blank=True, null=True)

	def __str__(self) -> str:
		return '{} - {}'.format(self.mahasiswa.nama, self.mata_kuliah.name)