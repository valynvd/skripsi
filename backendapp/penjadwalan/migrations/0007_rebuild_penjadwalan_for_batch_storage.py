from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ("penjadwalan", "0006_pembelajaran_detail_ruangan"),
    ]

    operations = [
        migrations.DeleteModel(
            name="JadwalKuliah",
        ),
        migrations.DeleteModel(
            name="Pembelajaran",
        ),
        migrations.DeleteModel(
            name="Ruang",
        ),
        migrations.DeleteModel(
            name="Semester",
        ),
        migrations.DeleteModel(
            name="Angkatan",
        ),
        migrations.CreateModel(
            name="BatchJadwal",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("nama", models.CharField(max_length=120)),
                ("tahun_akademik", models.CharField(max_length=20)),
                ("semester", models.CharField(choices=[("GANJIL", "Ganjil"), ("GENAP", "Genap"), ("PENDEK", "Pendek")], max_length=10)),
                ("versi", models.PositiveIntegerField(default=1)),
                ("status", models.CharField(choices=[("DRAFT", "Draft"), ("GENERATED", "Generated"), ("PUBLISHED", "Published")], default="DRAFT", max_length=20)),
                ("file_input", models.FileField(blank=True, null=True, upload_to="penjadwalan/uploads/")),
                ("input_snapshot", models.JSONField(blank=True, default=dict)),
                ("catatan", models.TextField(blank=True, null=True)),
                ("total_jadwal", models.PositiveIntegerField(default=0)),
                ("total_gagal", models.PositiveIntegerField(default=0)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("generated_at", models.DateTimeField(blank=True, null=True)),
            ],
            options={
                "ordering": ["-created_at", "-id"],
            },
        ),
        migrations.CreateModel(
            name="JadwalKuliah",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("matkul_id", models.CharField(blank=True, max_length=50, null=True)),
                ("kode_matkul", models.CharField(max_length=30)),
                ("nama_matkul", models.CharField(max_length=150)),
                ("dosen_id", models.CharField(blank=True, max_length=50, null=True)),
                ("dosen_nama", models.CharField(max_length=150)),
                ("kelas", models.CharField(max_length=50)),
                ("kelas_list", models.JSONField(blank=True, default=list)),
                ("sks", models.PositiveSmallIntegerField(default=0)),
                ("kapasitas", models.PositiveIntegerField(default=0)),
                ("tipe_ruang", models.CharField(choices=[("KELAS", "Kelas"), ("LAB", "Laboratorium")], default="KELAS", max_length=20)),
                ("hari", models.CharField(choices=[("SENIN", "Senin"), ("SELASA", "Selasa"), ("RABU", "Rabu"), ("KAMIS", "Kamis"), ("JUMAT", "Jumat")], max_length=10)),
                ("jam_mulai", models.TimeField()),
                ("jam_selesai", models.TimeField()),
                ("ruang_kode", models.CharField(max_length=50)),
                ("ruang_nama", models.CharField(blank=True, max_length=150, null=True)),
                ("catatan", models.CharField(blank=True, max_length=255, null=True)),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("batch", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="jadwal_items", to="penjadwalan.batchjadwal")),
            ],
            options={
                "ordering": ["batch", "hari", "jam_mulai", "ruang_kode"],
            },
        ),
        migrations.CreateModel(
            name="JadwalGagal",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("source_index", models.PositiveIntegerField(blank=True, null=True)),
                ("matkul_id", models.CharField(blank=True, max_length=50, null=True)),
                ("kode_matkul", models.CharField(blank=True, max_length=30, null=True)),
                ("nama_matkul", models.CharField(max_length=150)),
                ("dosen_id", models.CharField(blank=True, max_length=50, null=True)),
                ("dosen_nama", models.CharField(max_length=150)),
                ("kelas", models.CharField(max_length=50)),
                ("kelas_list", models.JSONField(blank=True, default=list)),
                ("sks", models.PositiveSmallIntegerField(default=0)),
                ("kapasitas", models.PositiveIntegerField(default=0)),
                ("alasan", models.TextField()),
                ("created_at", models.DateTimeField(default=django.utils.timezone.now)),
                ("batch", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="jadwal_gagal_items", to="penjadwalan.batchjadwal")),
            ],
            options={
                "ordering": ["batch", "nama_matkul", "kelas"],
            },
        ),
        migrations.AddConstraint(
            model_name="batchjadwal",
            constraint=models.UniqueConstraint(fields=("tahun_akademik", "semester", "versi"), name="uniq_batch_jadwal_per_periode"),
        ),
        migrations.AddConstraint(
            model_name="jadwalkuliah",
            constraint=models.UniqueConstraint(fields=("batch", "hari", "jam_mulai", "ruang_kode"), name="uniq_batch_ruang_slot"),
        ),
    ]
