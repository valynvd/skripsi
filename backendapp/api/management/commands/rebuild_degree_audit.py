from django.core.management.base import BaseCommand
from django.db import transaction

from api import models


class Command(BaseCommand):
  help = 'Rebuild degree audit summary for students from current transcript data.'

  def add_arguments(self, parser):
    parser.add_argument(
      '--nim',
      dest='nim',
      default=None,
      help='Optional NIM filter to rebuild a single student only.',
    )

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

  def _normalize_academic_year(self, academic_year):
    value = str(academic_year or '').strip()
    return value[:4] if value.isdigit() and len(value) >= 6 else value

  def _normalize_academic_session(self, academic_year, academic_session):
    session = str(academic_session or '').strip()
    if session:
      return session

    year = str(academic_year or '').strip()
    return year[-2:] if year.isdigit() and len(year) >= 6 else session

  def _get_course_key(self, transkrip):
    mata_kuliah = getattr(transkrip, 'mata_kuliah', None)
    return (
      getattr(mata_kuliah, 'kode', None)
      or getattr(mata_kuliah, 'name', None)
      or getattr(transkrip, 'mata_kuliah_id', None)
      or transkrip.id
    )

  def _get_grade_rank(self, grade_symbol):
    grade_rank = {
      'A': 7,
      'AB': 6,
      'B': 5,
      'BC': 4,
      'C': 3,
      'D': 2,
      'E': 1,
      'T': 0,
    }
    return grade_rank.get(str(grade_symbol or '').strip().upper(), -1)

  def _deduplicate_transkrip_data(self, transkrip_data):
    transkrip_by_course_semester = {}

    for transkrip in transkrip_data:
      key = (
        self._normalize_academic_year(transkrip.academic_year),
        self._normalize_academic_session(
          transkrip.academic_year,
          transkrip.academic_session,
        ),
        self._get_course_key(transkrip),
      )
      existing = transkrip_by_course_semester.get(key)

      if (
        existing is None
        or self._get_grade_rank(transkrip.grade_symbol)
        > self._get_grade_rank(existing.grade_symbol)
      ):
        transkrip_by_course_semester[key] = transkrip

    return list(transkrip_by_course_semester.values())

  def _build_summary(self, mahasiswa):
    transkrip_qs = (
      models.TranskripNilai.objects
      .filter(mahasiswa=mahasiswa)
      .select_related('mata_kuliah')
      .order_by('academic_year', 'academic_session', 'id')
    )
    transkrip_data = self._deduplicate_transkrip_data(list(transkrip_qs))

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

    return {
      'jumlah_sks': total_sks,
      'nilaid': total_nilai_d,
      'nilaie': total_nilai_e,
      'nilai_ipk': f'{nilai_ipk:.2f}',
      'status_kelulusan': status_kelulusan,
      'keterangan_lulus': 'Pernah Mengulang' if repeated_course else 'Aman',
    }

  def handle(self, *args, **options):
    nim = options.get('nim')

    mahasiswa_qs = models.DataMahasiswa.objects.all().order_by('nim')
    if nim:
      mahasiswa_qs = mahasiswa_qs.filter(nim=nim)

    total_processed = 0
    total_created = 0
    total_updated = 0

    with transaction.atomic():
      for mahasiswa in mahasiswa_qs.iterator():
        summary = self._build_summary(mahasiswa)
        obj, created = models.ValidasiMahasiswa.objects.update_or_create(
          mahasiswa=mahasiswa,
          defaults=summary,
        )
        total_processed += 1
        if created:
          total_created += 1
        else:
          total_updated += 1

    self.stdout.write(
      self.style.SUCCESS(
        f'Rebuild degree audit selesai. processed={total_processed}, created={total_created}, updated={total_updated}'
      )
    )
