from django.core.management.base import BaseCommand
from penjadwalan.models import BatchJadwal
from penjadwalan.services import generate_and_save_batch


class Command(BaseCommand):
    help = "Generate ulang jadwal dari snapshot batch penjadwalan"

    def add_arguments(self, parser):
        parser.add_argument("--batch-id", type=int, required=True, help="ID batch yang akan digenerate")

    def handle(self, *args, **options):
        batch = BatchJadwal.objects.filter(id=options["batch_id"]).first()
        if not batch:
            self.stderr.write("Batch jadwal tidak ditemukan.")
            return

        if not batch.input_snapshot:
            self.stderr.write("Batch belum memiliki snapshot input.")
            return

        hasil, gagal = generate_and_save_batch(batch)

        self.stdout.write(self.style.SUCCESS(f"Generate selesai. Jadwal dibuat: {len(hasil)}"))
        if gagal:
            self.stdout.write(self.style.WARNING("Tidak terjadwalkan:"))
            for item in gagal:
                self.stdout.write(
                    f"- {item['nama_matkul']} | {item['kelas']} | {item['alasan']}"
                )
