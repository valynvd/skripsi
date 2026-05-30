from django.core.management.base import BaseCommand
from django.db import transaction

from api import models
from api.management.commands.rebuild_degree_audit import Command as RebuildDegreeAuditCommand


class Command(BaseCommand):
  help = 'Delete 2025 Even grade data for 2022 cohort and rebuild degree audit summaries.'

  def add_arguments(self, parser):
    parser.add_argument(
      '--force',
      action='store_true',
      help='Run the cleanup without asking for confirmation.',
    )

  def handle(self, *args, **options):
    force = options.get('force', False)

    target_filter = {
      'mahasiswa__angkatan': '2022',
      'academic_year': '2025',
      'academic_session': '30',
    }

    transkrip_qs = models.TranskripNilai.objects.filter(**target_filter)
    monitoring_qs = models.MonitoringMahasiswa.objects.filter(**target_filter)
    nilai_qs = models.NilaiMahasiswa.objects.filter(**target_filter)

    transkrip_count = transkrip_qs.count()
    monitoring_count = monitoring_qs.count()
    nilai_count = nilai_qs.count()

    if not force:
      self.stdout.write(
        self.style.WARNING(
          'Target cleanup: angkatan 2022, academic_year=2025, academic_session=30'
        )
      )
      self.stdout.write(
        f'Transkrip={transkrip_count}, Monitoring={monitoring_count}, Nilai={nilai_count}'
      )
      self.stdout.write(
        self.style.WARNING('Rerun with --force to delete these records.')
      )
      return

    affected_mahasiswa_ids = set(
      transkrip_qs.values_list('mahasiswa_id', flat=True)
    )
    affected_mahasiswa_ids.update(
      monitoring_qs.values_list('mahasiswa_id', flat=True)
    )
    affected_mahasiswa_ids.update(nilai_qs.values_list('mahasiswa_id', flat=True))
    affected_mahasiswa_ids.discard(None)

    with transaction.atomic():
      deleted_transkrip = transkrip_qs.delete()
      deleted_monitoring = monitoring_qs.delete()
      deleted_nilai = nilai_qs.delete()

    rebuild_command = RebuildDegreeAuditCommand()
    rebuild_command.stdout = self.stdout
    rebuild_command.stderr = self.stderr

    for mahasiswa_id in sorted(affected_mahasiswa_ids):
      mahasiswa = models.DataMahasiswa.objects.filter(id=mahasiswa_id).first()
      if not mahasiswa:
        continue
      summary = rebuild_command._build_summary(mahasiswa)
      models.ValidasiMahasiswa.objects.update_or_create(
        mahasiswa=mahasiswa,
        defaults=summary,
      )

    self.stdout.write(
      self.style.SUCCESS(
        'Cleanup selesai. '
        f'Transkrip deleted={deleted_transkrip[0] if isinstance(deleted_transkrip, tuple) else deleted_transkrip}, '
        f'Monitoring deleted={deleted_monitoring[0] if isinstance(deleted_monitoring, tuple) else deleted_monitoring}, '
        f'Nilai deleted={deleted_nilai[0] if isinstance(deleted_nilai, tuple) else deleted_nilai}, '
        f'Affected students={len(affected_mahasiswa_ids)}'
      )
    )
