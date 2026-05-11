from django.db import models
from django.utils import timezone

# operasional default scheduler
JAM_MULAI = "08:00"
JAM_SELESAI = "18:00"
MENIT_PER_SKS = 50
START_MAKAN = "12:00"
END_MAKAN = "13:00"


class BatchJadwal(models.Model):
    STATUS = (
        ("DRAFT", "Draft"),
        ("GENERATED", "Generated"),
        ("PUBLISHED", "Published"),
    )
    TIPE_SEMESTER = (
        ("GANJIL", "Ganjil"),
        ("GENAP", "Genap"),
        ("PENDEK", "Pendek"),
    )

    nama = models.CharField(max_length=120)
    tahun_akademik = models.CharField(max_length=20)
    semester = models.CharField(max_length=10, choices=TIPE_SEMESTER)
    versi = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS, default="DRAFT")
    file_input = models.FileField(upload_to="penjadwalan/uploads/", blank=True, null=True)
    input_snapshot = models.JSONField(default=dict, blank=True)
    catatan = models.TextField(blank=True, null=True)
    total_jadwal = models.PositiveIntegerField(default=0)
    total_gagal = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    generated_at = models.DateTimeField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at", "-id"]
        constraints = [
            models.UniqueConstraint(
                fields=["tahun_akademik", "semester", "versi"],
                name="uniq_batch_jadwal_per_periode",
            )
        ]

    def __str__(self):
        return f"{self.nama} | {self.tahun_akademik} {self.semester} v{self.versi}"


class Ruangan(models.Model):
    TIPE_RUANG = (
        ("KELAS", "Kelas"),
        ("LAB", "Laboratorium"),
    )
    TIPE_BOARD = (
        ("PAPAN_TULIS", "Papan Tulis"),
        ("SMARTBOARD", "Smartboard"),
    )

    kode = models.CharField(max_length=50, unique=True)
    nama = models.CharField(max_length=150)
    tipe = models.CharField(max_length=20, choices=TIPE_RUANG, default="KELAS")
    kapasitas = models.PositiveIntegerField(default=0)
    board_type = models.CharField(max_length=20, choices=TIPE_BOARD, blank=True, null=True)
    prodi = models.CharField(max_length=150, blank=True, null=True)
    aktif = models.BooleanField(default=True)
    catatan = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["tipe", "nama"]

    def __str__(self):
        return f"{self.kode} | {self.nama}"


class JadwalKuliah(models.Model):
    HARI = (
        ("SENIN", "Senin"),
        ("SELASA", "Selasa"),
        ("RABU", "Rabu"),
        ("KAMIS", "Kamis"),
        ("JUMAT", "Jumat"),
    )
    TIPE_RUANG = (
        ("KELAS", "Kelas"),
        ("LAB", "Laboratorium"),
    )

    batch = models.ForeignKey(BatchJadwal, on_delete=models.CASCADE, related_name="jadwal_items")
    matkul_id = models.CharField(max_length=50, blank=True, null=True)
    kode_matkul = models.CharField(max_length=30)
    nama_matkul = models.CharField(max_length=150)
    dosen_id = models.CharField(max_length=50, blank=True, null=True)
    dosen_nama = models.CharField(max_length=150)
    kelas = models.CharField(max_length=50)
    kelas_list = models.JSONField(default=list, blank=True)
    sks = models.PositiveSmallIntegerField(default=0)
    kapasitas = models.PositiveIntegerField(default=0)
    tipe_ruang = models.CharField(max_length=20, choices=TIPE_RUANG, default="KELAS")
    hari = models.CharField(max_length=10, choices=HARI)
    jam_mulai = models.TimeField()
    jam_selesai = models.TimeField()
    ruang_kode = models.CharField(max_length=50)
    ruang_nama = models.CharField(max_length=150, blank=True, null=True)
    catatan = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["batch", "hari", "jam_mulai", "ruang_kode"]
        constraints = [
            models.UniqueConstraint(
                fields=["batch", "hari", "jam_mulai", "ruang_kode"],
                name="uniq_batch_ruang_slot",
            )
        ]

    def __str__(self):
        return f"{self.batch} | {self.kode_matkul} | {self.hari} {self.jam_mulai}-{self.jam_selesai}"


class JadwalGagal(models.Model):
    batch = models.ForeignKey(BatchJadwal, on_delete=models.CASCADE, related_name="jadwal_gagal_items")
    source_index = models.PositiveIntegerField(blank=True, null=True)
    matkul_id = models.CharField(max_length=50, blank=True, null=True)
    kode_matkul = models.CharField(max_length=30, blank=True, null=True)
    nama_matkul = models.CharField(max_length=150)
    dosen_id = models.CharField(max_length=50, blank=True, null=True)
    dosen_nama = models.CharField(max_length=150)
    kelas = models.CharField(max_length=50)
    kelas_list = models.JSONField(default=list, blank=True)
    sks = models.PositiveSmallIntegerField(default=0)
    kapasitas = models.PositiveIntegerField(default=0)
    alasan = models.TextField()
    created_at = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ["batch", "nama_matkul", "kelas"]

    def __str__(self):
        return f"{self.batch} | {self.nama_matkul} | {self.alasan}"
