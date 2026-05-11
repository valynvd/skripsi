from django.contrib import admin

from .models import BatchJadwal, JadwalGagal, JadwalKuliah, Ruangan


@admin.register(Ruangan)
class RuanganAdmin(admin.ModelAdmin):
    list_display = (
        "kode",
        "nama",
        "tipe",
        "kapasitas",
        "board_type",
        "prodi",
        "aktif",
    )
    list_filter = ("tipe", "board_type", "aktif")
    search_fields = ("kode", "nama", "prodi", "catatan")
    ordering = ("tipe", "nama")


@admin.register(BatchJadwal)
class BatchJadwalAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "nama",
        "tahun_akademik",
        "semester",
        "versi",
        "status",
        "total_jadwal",
        "total_gagal",
        "generated_at",
    )
    list_filter = ("semester", "status", "tahun_akademik")
    search_fields = ("nama", "tahun_akademik", "catatan")
    ordering = ("-created_at",)


@admin.register(JadwalKuliah)
class JadwalKuliahAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "batch",
        "kode_matkul",
        "nama_matkul",
        "dosen_nama",
        "kelas",
        "hari",
        "jam_mulai",
        "jam_selesai",
        "ruang_kode",
    )
    list_filter = ("batch", "hari", "tipe_ruang")
    search_fields = ("kode_matkul", "nama_matkul", "dosen_nama", "kelas", "ruang_kode")
    autocomplete_fields = ("batch",)
    ordering = ("batch", "hari", "jam_mulai", "ruang_kode")


@admin.register(JadwalGagal)
class JadwalGagalAdmin(admin.ModelAdmin):
    list_display = ("id", "batch", "kode_matkul", "nama_matkul", "dosen_nama", "kelas", "alasan")
    list_filter = ("batch",)
    search_fields = ("kode_matkul", "nama_matkul", "dosen_nama", "kelas", "alasan")
    autocomplete_fields = ("batch",)
