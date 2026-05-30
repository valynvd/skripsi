from rest_framework import serializers
from account.models import CustomUser
from . import models

class CustomUserSerializers(serializers.ModelSerializer):
  class Meta:
      model = CustomUser
      fields = ['email', 'fullname', 'role', 'phone', 'jabatan', 'jabatan_fungsional']

class ProgramStudiSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.ProgramStudi
      fields = '__all__'

class KurikulumSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  class Meta:
      model = models.Kurikulum
      fields = '__all__'

class BahanKajianSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  class Meta:
      model = models.BahanKajian
      fields = '__all__'
      # extra_kwargs = {
      #       'prodi': {'write_only': True}
      #   }

class CapaianPembelajarSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  bk_details = BahanKajianSerializers(source='bahan_kajian', read_only=True)
  # prodi_from_bahan_kajian = serializers.SerializerMethodField()

  class Meta:
      model = models.CapaianPembelajaran
      fields = '__all__'
  
class CapaianPembelajaranMataKuliahSerializers(serializers.ModelSerializer):
  cpl_detail = CapaianPembelajarSerializers(source='cpl', read_only=True)
  # cpl_detail = CapaianPembelajarSerializers(many=True ,source='cpl', read_only=True)
  class Meta:
      model = models.CapaianPembelajaranMataKuliah
      fields = '__all__'

class PenilaianSerializers(serializers.ModelSerializer):
  cpmk_details = CapaianPembelajaranMataKuliahSerializers(many=True, source='cpmks', read_only=True)
  # cpmk_detail = serializers.SerializerMethodField()
  # cpmks = serializers.PrimaryKeyRelatedField(queryset=models.CapaianPembelajaranMataKuliah.objects.all(), many=True)

  class Meta:
      model = models.Penilaian
      # fields = ['id', 'nama_penilaian', 'implementasi_kurikulum', 'cpmks', 'cpmk_detail']
      fields = ['id', 'nama_penilaian', 'mata_kuliah', 'cpmks', 'cpmk_details']
  
  def get_cpmk_detail(self, obj):
        cpmks = obj.cpmks.all()
        return CapaianPembelajaranMataKuliahSerializers(cpmks, many=True).data

class MataKuliahSerializers(serializers.ModelSerializer):
  kurikulum_detail = KurikulumSerializers(source='kurikulum', many=True, read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  penilaian_set = PenilaianSerializers(many=True, required=False)
  cpmk_detail = serializers.SerializerMethodField()

  class Meta:
      model = models.MataKuliah
      fields = '__all__'
  
  def get_cpmk_detail(self, obj):
    penilaians = obj.penilaian_set.all()
    cpmk_ids = set()
    for penilaian in penilaians:
      cpmk_ids.update(penilaian.cpmks.values_list('id', flat=True))
    cpmks = models.CapaianPembelajaranMataKuliah.objects.filter(id__in=cpmk_ids)
    return CapaianPembelajaranMataKuliahSerializers(cpmks, many=True).data
  
  def validate(self, data):
    kode = data.get('kode')
    prodi = data.get('prodi')
    semester = data.get('semester')
    sks_total = data.get('sks_total')
    effective_prodi = prodi or (self.instance.prodi if self.instance else None)
    effective_kurikulum = (
      data.get('kurikulum')
      if 'kurikulum' in data
      else (self.instance.kurikulum.all() if self.instance else [])
    )
    
    if self.instance is None and models.MataKuliah.objects.filter(kode=kode, prodi=prodi, semester=semester, sks_total=sks_total).exists():
        raise serializers.ValidationError({"non_field_errors": "Matakuliah dengan kombinasi kode, prodi, semester, dan sks yang sama sudah ada."})

    if effective_kurikulum and not effective_prodi:
      raise serializers.ValidationError({
        "kurikulum": "Program studi wajib diisi jika kurikulum dipilih."
      })

    invalid_kurikulum = [
      kurikulum.name
      for kurikulum in effective_kurikulum
      if kurikulum.prodi_id != effective_prodi.id
    ] if effective_prodi else []

    if invalid_kurikulum:
      raise serializers.ValidationError({
        "kurikulum": (
          "Kurikulum tidak sesuai prodi mata kuliah: "
          + ", ".join(invalid_kurikulum)
        )
      })
    return data
  
  def create(self, validated_data):
    kurikulum_data = validated_data.pop('kurikulum', [])
    penilaian_data = validated_data.pop('penilaian_set', [])
    mata_kuliah = models.MataKuliah.objects.create(**validated_data)
    mata_kuliah.kurikulum.set(kurikulum_data)
    for penilaian in penilaian_data:
      cpmk_data = penilaian.pop('cpmks', [])
      penilaian_obj = models.Penilaian.objects.create(mata_kuliah=mata_kuliah, **penilaian)
      penilaian_obj.cpmks.set(cpmk_data)
    return mata_kuliah

  def update(self, instance, validated_data):
    
    kurikulum_data = validated_data.pop('kurikulum', None)
    penilaian_data = validated_data.pop('penilaian_set', [])   
    
    instance.name = validated_data.get('name', instance.name)
    instance.kode = validated_data.get('kode', instance.kode)
    instance.sks_total = validated_data.get('sks_total', instance.sks_total)
    instance.sks_praktikum = validated_data.get('sks_praktikum', instance.sks_praktikum)
    instance.is_elective = validated_data.get('is_elective', instance.is_elective)
    instance.semester = validated_data.get('semester', instance.semester)
    instance.prodi = validated_data.get('prodi', instance.prodi)
    instance.save()

    if kurikulum_data is not None:
      instance.kurikulum.set(kurikulum_data)

    # existing_penilaian_ids = [penilaian.id for penilaian in instance.penilaian_set.all()]
    # existing_penilaian_ids = [penilaian.id for penilaian in instance.penilaian_set.all()]
    existing_penilaian_dict = {penilaian.id: penilaian for penilaian in instance.penilaian_set.all()}
    existing_penilaian_name_dict = {penilaian.nama_penilaian: penilaian for penilaian in instance.penilaian_set.all()}
    
    for penilaian in penilaian_data:
      penilaian_id = penilaian.get('id', None)
      penilaian_nama = penilaian.get('nama_penilaian', None)
      cpmk_data = penilaian.pop('cpmks', [])

      if penilaian_id and penilaian_id in existing_penilaian_dict:
          # Update penilaian berdasarkan ID
          penilaian_instance = existing_penilaian_dict[penilaian_id]
          penilaian_instance.nama_penilaian = penilaian.get('nama_penilaian', penilaian_instance.nama_penilaian)
          penilaian_instance.cpmks.set(cpmk_data)
          penilaian_instance.save()
          # Remove from the dict as we already processed this penilaian
          del existing_penilaian_dict[penilaian_id]
      elif penilaian_nama and penilaian_nama in existing_penilaian_name_dict:
          # Update penilaian berdasarkan nama jika ID tidak ada
          penilaian_instance = existing_penilaian_name_dict[penilaian_nama]
          penilaian_instance.nama_penilaian = penilaian.get('nama_penilaian', penilaian_instance.nama_penilaian)
          penilaian_instance.cpmks.set(cpmk_data)
          penilaian_instance.save()
          # Remove from the name dict as we already processed this penilaian
          del existing_penilaian_name_dict[penilaian_nama]
      else:
          # Create penilaian baru jika ID atau nama tidak ditemukan
          
          penilaian_obj = models.Penilaian.objects.create(mata_kuliah=instance, **penilaian)
          penilaian_obj.cpmks.set(cpmk_data)

    # Menghapus penilaian yang tidak digunakan lagi
    for penilaian_instance in existing_penilaian_dict.values():
        if penilaian_instance.nilaimahasiswa_set.exists():
            continue
        penilaian_instance.delete()

    # for penilaian in penilaian_data:
    #     penilaian_id = penilaian.get('id', None)
    #     cpmk_data = penilaian.pop('cpmks', [])

    #     if penilaian_id and penilaian_id in existing_penilaian_dict:
    #         penilaian_instance = existing_penilaian_dict[penilaian_id]
    #         penilaian_instance.nama_penilaian = penilaian.get('nama_penilaian', penilaian_instance.nama_penilaian)
    #         penilaian_instance.cpmks.set(cpmk_data)
    #         penilaian_instance.save()
    #         # Remove from the dict as we already processed this penilaian
    #         del existing_penilaian_dict[penilaian_id]
    #     else:
    #         # penilaian_obj = models.Penilaian.objects.create(mata_kuliah=instance, **penilaian)
    #         # penilaian_obj.cpmks.set(cpmk_data)
    #         if any(value for key, value in penilaian.items() if key != 'id'):
    #             
    #             penilaian_obj = models.Penilaian.objects.create(mata_kuliah=instance, **penilaian)
    #             penilaian_obj.cpmks.set(cpmk_data)

    # for penilaian_instance in existing_penilaian_dict.values():
    #     if penilaian_instance.nilaimahasiswa_set.exists():
    #         continue
    #     penilaian_instance.delete()

    return instance


class CycleSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.Cycle
      fields = '__all__'


class DosenSerializers(serializers.ModelSerializer):
  user_detail = CustomUserSerializers(source='user', many=False, read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', many=False, read_only=True)
  class Meta:
      model = models.Dosen
      fields = '__all__'

class DosenSerializersAuthMe(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', many=False, read_only=True)
  class Meta:
      model = models.Dosen
      fields = '__all__'

class SuratPenugasanSerializers(serializers.ModelSerializer):
  cycle_detail = CycleSerializers(source='cycle', many=False, read_only=True)
  class Meta:
      model = models.SuratPenugasan
      fields = '__all__'

class PublikasiKaryaSerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  class Meta:
      model = models.PublikasiKarya
      fields = '__all__'

class PatenHKISerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  class Meta:
      model = models.PatenHKI
      fields = '__all__'

class PenugasanPenelitianSerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  surat_penugasan_detail = SuratPenugasanSerializers(source='surat_penugasan', many=False, read_only=True)

  class Meta:
      model = models.PenugasanPenelitian
      fields = '__all__'

class PenugasanPengabdianSerializers(serializers.ModelSerializer):
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  class Meta:
      model = models.PenugasanPengabdian
      fields = '__all__'

class PembicaraSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.Pembicara
      fields = '__all__'

class PengelolaJurnalSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PengelolaJurnal
      fields = '__all__'

class RiwayatJabatanStrukturalSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.RiwayatJabatanStruktural
      fields = '__all__'

class PenugasanPengajaranSerializers(serializers.ModelSerializer):
  surat_penugasan_detail = SuratPenugasanSerializers(source='surat_penugasan', many=False, read_only=True)
  dosen_pengampu_detail = DosenSerializers(source='dosen_pengampu', many=False, read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', many=False, read_only=True)
  class Meta:
      model = models.PenugasanPengajaran
      fields = '__all__'

class PortofolioPerkuliahanSerializers(serializers.ModelSerializer):
  class Meta:
    model = models.PortofolioPerkuliahan
    fields = '__all__'

class DokumenPembelajaranSerializers(serializers.ModelSerializer):
  penugasan_pengajaran_detail = PenugasanPengajaranSerializers(source='penugasanPengajaranId', many=False, read_only=True)
  rps_status = serializers.SerializerMethodField(read_only=True)
  rubrik_status = serializers.SerializerMethodField(read_only=True)
  portofolio_perkuliahan = serializers.SerializerMethodField(read_only=True) 

  class Meta:
      model = models.DokumenPembelajaran
      fields = '__all__'

  def get_rps_status(self, obj):
    riwayatDokumenPembelajaranByDokumenPembelajaran = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId = obj.id, type="rps")

    if(len(riwayatDokumenPembelajaranByDokumenPembelajaran) == 0):
      return 'empty'

    if(riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status == 'accepted'):
      return {'accepted': True, "link":"https://stem-management.s3.amazonaws.com/" + str(riwayatDokumenPembelajaranByDokumenPembelajaran[0].initial_document )}

    return riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status

  def get_rubrik_status(self, obj):
    riwayatDokumenPembelajaranByDokumenPembelajaran = models.RiwayatDokumenPembelajaran.objects.filter(dokumenPembelajaranId = obj.id, type="rubrik")

    if(len(riwayatDokumenPembelajaranByDokumenPembelajaran) == 0):
      return 'empty'

    if(riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status == 'accepted'):
      return {'accepted': True, "link":"https://stem-management.s3.amazonaws.com/" + str(riwayatDokumenPembelajaranByDokumenPembelajaran[0].initial_document )}

    return riwayatDokumenPembelajaranByDokumenPembelajaran.latest('created_at').status
  
  def get_portofolio_perkuliahan(self, obj):
    portofolioPerkuliahanByPenugasanPengajaran = models.PortofolioPerkuliahan.objects.filter(penugasan=obj.penugasanPengajaranId)

    if len(portofolioPerkuliahanByPenugasanPengajaran):
      checkUTS = False
      checkUAS = False

      for portofolioPerkuliahan in portofolioPerkuliahanByPenugasanPengajaran:
        if(portofolioPerkuliahan.type == 'UTS'):
          checkUTS = True
        if(portofolioPerkuliahan.type == 'UAS'):
          checkUAS = True

      if(checkUTS & checkUAS):
        return True
      
      return False

    return False
      
class RiwayatDokumenPembelajaranSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.RiwayatDokumenPembelajaran
      fields = '__all__'

class PortofolioPerkuliahanSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.PortofolioPerkuliahan
      fields = '__all__'

class GrupMahasiswaSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.GrupMahasiswa
      fields = '__all__'

class DataMahasiswaSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  jumlah_sks = serializers.SerializerMethodField()
  nilaid = serializers.SerializerMethodField()
  nilaie = serializers.SerializerMethodField()
  nilai_ipk = serializers.SerializerMethodField()
  status_kelulusan = serializers.SerializerMethodField()
  keterangan_lulus = serializers.SerializerMethodField()

  def _get_credit_value(self, transkrip):
    sks_total = getattr(getattr(transkrip, 'mata_kuliah', None), 'sks_total', None)
    try:
      sks_total = int(sks_total)
    except (TypeError, ValueError):
      sks_total = 0

    if sks_total > 0:
      return sks_total

    try:
      earned_credits = int(transkrip.earned_credits)
    except (TypeError, ValueError):
      earned_credits = 0

    return earned_credits

  def _get_grade_weight(self, grade_symbol):
    grade_values = {
      'A': 4.0,
      'AB': 3.5,
      'B': 3.0,
      'BC': 2.5,
      'C': 2.0,
      'D': 1.0,
      'E': 0.0,
      'T': 0.0,
    }
    return grade_values.get(grade_symbol, 0.0)

  def _is_grade_at_least_b(self, grade_symbol):
    grade_rank = {
      'A': 4,
      'AB': 3,
      'B': 2,
      'BC': 1,
      'C': 0,
      'D': -1,
      'E': -2,
      'T': -3,
    }
    return (grade_rank.get(grade_symbol, -99)) >= grade_rank['B']

  def _get_degree_audit_summary(self, obj):
    cache = getattr(self, '_degree_audit_cache', {})
    if obj.pk in cache:
      return cache[obj.pk]

    transkrip_qs = (
      models.TranskripNilai.objects
      .filter(mahasiswa=obj)
      .select_related('mata_kuliah')
      .order_by('academic_year', 'academic_session', 'id')
    )
    transkrip_data = list(transkrip_qs)

    total_sks = 0
    total_nilai_d = 0
    total_nilai_e = 0
    total_weighted_points = 0.0
    seen_course_names = set()
    repeated_course = False
    english_sc_ii_grade = None
    final_project_grade = None

    for transkrip in transkrip_data:
      grade_symbol = transkrip.grade_symbol or ''
      credit_value = self._get_credit_value(transkrip)
      course_name = getattr(getattr(transkrip, 'mata_kuliah', None), 'name', '')

      if course_name in seen_course_names:
        repeated_course = True
      elif course_name:
        seen_course_names.add(course_name)

      if grade_symbol != 'T':
        total_sks += credit_value
        total_weighted_points += self._get_grade_weight(grade_symbol) * credit_value

      if grade_symbol == 'D':
        total_nilai_d += credit_value
      if grade_symbol == 'E':
        total_nilai_e += credit_value
      if course_name == 'English Scientific Communication II':
        english_sc_ii_grade = grade_symbol
      if course_name in ['Final Project', 'Final Project II']:
        final_project_grade = grade_symbol

    nilai_ipk = round(total_weighted_points / total_sks, 2) if total_sks else 0.0
    english_ok = self._is_grade_at_least_b(english_sc_ii_grade)

    if (
      nilai_ipk > 3.5
      and total_nilai_d == 0
      and total_nilai_e == 0
      and total_sks >= 144
      and not repeated_course
      and english_ok
      and final_project_grade in ['A', 'AB', 'B']
    ):
      status_kelulusan = 'Cum Laude'
    elif (
      nilai_ipk > 3.0
      and total_nilai_d <= 7
      and total_nilai_e == 0
      and total_sks >= 144
      and english_ok
      and final_project_grade
    ):
      status_kelulusan = 'Sangat Memuaskan'
    elif (
      nilai_ipk > 2.75
      and total_nilai_d <= 7
      and total_nilai_e == 0
      and total_sks >= 144
      and english_ok
      and final_project_grade
    ):
      status_kelulusan = 'Memuaskan'
    elif (
      nilai_ipk >= 2.0
      and total_nilai_d <= 7
      and total_nilai_e == 0
      and total_sks >= 144
      and english_ok
      and final_project_grade
    ):
      status_kelulusan = 'Cukup'
    else:
      status_kelulusan = 'Tidak Lulus'

    summary = {
      'jumlah_sks': total_sks,
      'nilaid': total_nilai_d,
      'nilaie': total_nilai_e,
      'nilai_ipk': f'{nilai_ipk:.2f}',
      'status_kelulusan': status_kelulusan,
      'keterangan_lulus': 'Pernah Mengulang' if repeated_course else 'Aman',
    }

    cache[obj.pk] = summary
    self._degree_audit_cache = cache
    return summary

  def get_jumlah_sks(self, obj):
    return self._get_degree_audit_summary(obj)['jumlah_sks']

  def get_nilaid(self, obj):
    return self._get_degree_audit_summary(obj)['nilaid']

  def get_nilaie(self, obj):
    return self._get_degree_audit_summary(obj)['nilaie']

  def get_nilai_ipk(self, obj):
    return self._get_degree_audit_summary(obj)['nilai_ipk']

  def get_status_kelulusan(self, obj):
    return self._get_degree_audit_summary(obj)['status_kelulusan']

  def get_keterangan_lulus(self, obj):
    return self._get_degree_audit_summary(obj)['keterangan_lulus']

  class Meta:
      model = models.DataMahasiswa
      fields = '__all__'
      
class BroadcastPesanSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.BroadcastPesan
      fields = '__all__'

class KonsolChatbotSerializers(serializers.ModelSerializer):
  class Meta:
      model = models.KonsolChatbot
      fields = '__all__'

class AssignMahasiswatoGrupSerializers(serializers.ModelSerializer):
  nama_grup = GrupMahasiswaSerializers(read_only=True)
  nama_mahasiswa = DataMahasiswaSerializers(read_only=True)

  class Meta:
      model = models.AssignMahasiswatoGrup
      fields = '__all__'

class MonitoringMahasiswaSerializers(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', read_only=True)
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  
  class Meta:
      model = models.MonitoringMahasiswa
      fields = 	'__all__'

class ValidasiMahasiswaSerializers(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  
  class Meta:
      model = models.ValidasiMahasiswa
      fields = '__all__'

class TranskripNilaiSerializers(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', read_only=True)
  class Meta:
      model = models.TranskripNilai
      fields = '__all__'


# Implementasi kurikulum OBE
class ProfilLulusanSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True)
  class Meta:
      model = models.ProfilLulusan
      fields = '__all__'


class NilaiMahasiswaSerializers(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  mk_detail = MataKuliahSerializers(source='mata_kuliah', read_only=True)
  # mata_kuliah_detail = MataKuliahSerializers(source='mata_kuliah', read_only=True)
  penilaian_detail = PenilaianSerializers(source='penilaian', read_only=True)
  
  class Meta:
      model = models.NilaiMahasiswa
      # fields = 	'__all__'
      fields = ['id', 'mahasiswa', 'mata_kuliah', 'earned_credits', 'academic_year', 'academic_session', 'penilaian', 'nilai_penilaian', 'bobot', 'mahasiswa_detail', 'mk_detail', 'penilaian_detail']


# Form
class FormCreateMataKuliahSerializer(serializers.Serializer):
    kurikulum = serializers.PrimaryKeyRelatedField(queryset=models.Kurikulum.objects.all(), many=True, allow_null=True, required=False)
    prodi = serializers.PrimaryKeyRelatedField(queryset=models.ProgramStudi.objects.all(), allow_null=True, required=False)
    name = serializers.CharField()
    kode = serializers.CharField()
    sks_total = serializers.IntegerField()
    sks_praktikum = serializers.IntegerField()
    is_elective = serializers.BooleanField(default=False, required=False)
    # semester = serializers.CharField()
    semester = serializers.CharField(write_only=True)
    komponen_penilaian = serializers.ListField(
        child=serializers.DictField(),
        write_only=True
    )

    def create_or_update(self, validated_data, instance=None):
        kurikulum_data = validated_data.pop('kurikulum', None)
        prodi = validated_data.get('prodi', None)
        # komponen_penilaian_data = validated_data.get('komponen_penilaian', [])
        # semester = validated_data.get('semester', None)
        komponen_penilaian_data = validated_data.pop('komponen_penilaian', [])
        semester = validated_data.pop('semester', None)

        effective_kurikulum = kurikulum_data if kurikulum_data is not None else []
        if effective_kurikulum and not prodi:
            raise serializers.ValidationError({
                "kurikulum": "Program studi wajib diisi jika kurikulum dipilih."
            })

        invalid_kurikulum = [
            kurikulum.name
            for kurikulum in effective_kurikulum
            if kurikulum.prodi_id != prodi.id
        ] if prodi else []
        if invalid_kurikulum:
            raise serializers.ValidationError({
                "kurikulum": (
                    "Kurikulum tidak sesuai prodi mata kuliah: "
                    + ", ".join(invalid_kurikulum)
                )
            })

        if instance is None:
            mata_kuliah, created = models.MataKuliah.objects.get_or_create(
                kode=validated_data['kode'],
                prodi=prodi,
                semester=semester,
                defaults={
                    'name': validated_data['name'],
                    'sks_total': validated_data['sks_total'],
                    'sks_praktikum': validated_data['sks_praktikum'],
                    'is_elective': validated_data.get('is_elective', False),
                    'prodi': prodi,
                    'semester': semester,
                }
            )
            if kurikulum_data is not None:
                mata_kuliah.kurikulum.set(kurikulum_data)
            mata_kuliah.save()
        else:
            mata_kuliah = instance
            mata_kuliah.name = validated_data.get('name', mata_kuliah.name)
            mata_kuliah.kode = validated_data.get('kode', mata_kuliah.kode)
            mata_kuliah.sks_total = validated_data.get('sks_total', mata_kuliah.sks_total)
            mata_kuliah.sks_praktikum = validated_data.get('sks_praktikum', mata_kuliah.sks_praktikum)
            mata_kuliah.is_elective = validated_data.get('is_elective', mata_kuliah.is_elective)
            if kurikulum_data is not None:
                mata_kuliah.kurikulum.set(kurikulum_data)
            mata_kuliah.save()

        existing_penilaian_ids = [penilaian.id for penilaian in models.Penilaian.objects.filter(mata_kuliah=mata_kuliah)]
        updated_penilaian_ids = []

        for penilaian_data in komponen_penilaian_data:
            nama_penilaian = penilaian_data.get('nama_penilaian')
            cpmks = penilaian_data.get('cpmks', [])

            penilaian, created = models.Penilaian.objects.get_or_create(
                # implementasi_kurikulum=implementasi_kurikulum,
                mata_kuliah=mata_kuliah,
                nama_penilaian=nama_penilaian
            )
            if cpmks:
                penilaian.cpmks.set(cpmks)
            penilaian.save()

            updated_penilaian_ids.append(penilaian.id)

        # Hapus Penilaian yang tidak ada dalam data yang diperbarui
        to_delete_ids = set(existing_penilaian_ids) - set(updated_penilaian_ids)
        if to_delete_ids:
            models.Penilaian.objects.filter(id__in=to_delete_ids).delete()

        return mata_kuliah

    def create(self, validated_data):
        return self.create_or_update(validated_data)

    def update(self, instance, validated_data):
        return self.create_or_update(validated_data, instance=instance)
    
class SettingsParameterSuratSerializers(serializers.ModelSerializer):
  prodi_detail = ProgramStudiSerializers(source='prodi', read_only=True, many=True)
  prodi = serializers.PrimaryKeyRelatedField(queryset=models.ProgramStudi.objects.all(), many=True)

  class Meta:
      model = models.SettingsParameterSurat
      fields = '__all__'

  def create(self, validated_data):
    prodi_data = validated_data.pop('prodi', [])
    settings_parameter_surat = models.SettingsParameterSurat.objects.create(**validated_data)
    settings_parameter_surat.prodi.set(prodi_data)
    return settings_parameter_surat
  
  def update(self, instance, validated_data):
    prodi_data = validated_data.pop('prodi', [])
    instance.parameter = validated_data.get('parameter', instance.parameter)
    instance.nilai_parameter_char = validated_data.get('nilai_parameter_char', instance.nilai_parameter_char)
    instance.nilai_parameter_date = validated_data.get('nilai_parameter_date', instance.nilai_parameter_date)
    instance.save()

    # Update prodi many-to-many relationship
    instance.prodi.set(prodi_data)

    return instance

class SuratKeteranganPendampingIjazahSerializer(serializers.ModelSerializer):
  mahasiswa_detail = DataMahasiswaSerializers(source='mahasiswa', read_only=True)
  no_surat_keputusan_pendirian_pt = serializers.SerializerMethodField()
  no_surat_akreditasi_pt = serializers.SerializerMethodField()
  no_surat_akreditasi_prodi = serializers.SerializerMethodField()
  tanggal_pengesahan_kelulusan = serializers.SerializerMethodField()

  class Meta:
      model = models.SuratKeteranganPendampingIjazah
      fields = '__all__'

  def get_no_surat_keputusan_pendirian_pt(self, obj):
      return self._get_latest_parameter(obj, 'No. Surat Keputusan Pendirian Perguruan Tinggi')

  def get_no_surat_akreditasi_pt(self, obj):
      return self._get_latest_parameter(obj, 'No. Surat Keputusan Akreditasi Perguruan Tinggi')

  def get_no_surat_akreditasi_prodi(self, obj):
      return self._get_latest_parameter(obj, 'No. Surat Keputusan Akreditasi Program Studi')

  def get_tanggal_pengesahan_kelulusan(self, obj):
      # parameter = self._get_latest_parameter(obj, 'Tanggal Pengesahan Kelulusan')
      # return parameter if isinstance(parameter, str) else None
      parameter = self._get_latest_parameter(obj, 'Tanggal Pengesahan Kelulusan')
      if isinstance(parameter, str): 
          return None
      return parameter

  def _get_latest_parameter(self, obj, parameter_name):
      try:
          parameter = models.SettingsParameterSurat.objects.filter(
              parameter=parameter_name,
              prodi__in=[obj.mahasiswa.prodi]
          ).latest('created_at')
          return parameter.nilai_parameter_date or parameter.nilai_parameter_char
      except models.SettingsParameterSurat.DoesNotExist:
          return None

class SuratPenugasanSekreSerializers(serializers.ModelSerializer):
  hari = serializers.CharField(source='get_hari_display', read_only=True)
  ditugaskan_detail = DosenSerializers(source='ditugaskan', many=True, read_only=True)

  class Meta:
      model = models.SuratPenugasanSekre
      fields = ['id', 'nomor_surat', 'pelaksana', 'agenda', 'tanggal_kegiatan', 'waktu_mulai_kegiatan', 'waktu_selesai_kegiatan', 'tempat_kegiatan', 'tanggal_surat', 'ditugaskan', 'ditugaskan_detail', 'hari']
