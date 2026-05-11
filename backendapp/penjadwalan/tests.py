import json
from datetime import time
from io import BytesIO

from django.test import Client, TestCase
from django.core.files.uploadedfile import SimpleUploadedFile

import pandas as pd

from penjadwalan.models import BatchJadwal, JadwalGagal, JadwalKuliah, Ruangan
from penjadwalan.importers import parse_excel_upload
from penjadwalan.services import generate_and_save_batch, generate_schedule, save_schedule_result


class GenerateScheduleTests(TestCase):
    def setUp(self):
        self.client = Client()
        self.dosen = [
            {"id": "D1", "nama": "Dosen 1", "tipe": "parttime"},
            {"id": "D2", "nama": "Dosen 2", "tipe": "fulltime"},
        ]
        self.ruangan = [
            {"id": "R1", "nama": "Ruang 1", "capacity": 40, "tipe": "kelas"},
            {"id": "LAB1", "nama": "Lab 1", "capacity": 25, "tipe": "lab"},
        ]

    def _create_master_ruangan(self, kode="R101", nama="Ruang 101", tipe="KELAS", kapasitas=40, board_type="SMARTBOARD", prodi=None):
        return Ruangan.objects.create(
            kode=kode,
            nama=nama,
            tipe=tipe,
            kapasitas=kapasitas,
            board_type=board_type,
            prodi=prodi,
            aktif=True,
        )

    def _build_excel_file(self, rows, filename="jadwal.xlsx"):
        buffer = BytesIO()
        dataframe = pd.DataFrame(rows)
        with pd.ExcelWriter(buffer, engine="openpyxl") as writer:
            dataframe.to_excel(writer, index=False)
        return SimpleUploadedFile(
            filename,
            buffer.getvalue(),
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        )

    def test_parttime_dosen_dijadwalkan_di_hari_yang_sama_bila_memungkinkan(self):
        matakuliah = [
            {"id": "MK1", "kode": "MK1", "nama": "Mobile App", "dosen": "D1", "dosen_nama": "Dosen 1", "kelas": "DBT-22", "sks": 3},
            {"id": "MK2", "kode": "MK2", "nama": "Research Method", "dosen": "D1", "dosen_nama": "Dosen 1", "kelas": "DBT-23", "sks": 3},
        ]

        hasil, gagal = generate_schedule(matakuliah, self.ruangan, self.dosen)

        self.assertEqual(len(gagal), 0)
        self.assertEqual(len(hasil), 2)
        self.assertEqual(hasil[0]["hari"], "SENIN")
        self.assertEqual(hasil[1]["hari"], "SENIN")

    def test_upload_form_bisa_diakses_dari_browser(self):
        response = self.client.get("/penjadwalan/")
        self.assertEqual(response.status_code, 200)
        self.assertContains(response, "Upload Excel Penjadwalan")

    def test_scheduler_menghindari_jam_makan_siang(self):
        matakuliah = [
            {"id": "MK1", "kode": "MK1", "nama": "Kuliah A", "dosen": "D1", "dosen_nama": "Dosen 1", "kelas": "DBT-22", "sks": 4},
            {"id": "MK2", "kode": "MK2", "nama": "Kuliah B", "dosen": "D2", "dosen_nama": "Dosen 2", "kelas": "DBT-23", "sks": 3},
        ]

        hasil, gagal = generate_schedule(matakuliah, self.ruangan, self.dosen)

        self.assertEqual(len(gagal), 0)
        self.assertEqual(len(hasil), 2)

        target = next(item for item in hasil if item["matkul_id"] == "MK2")
        self.assertGreaterEqual(target["jam_mulai"].strftime("%H:%M"), "13:00")

    def test_generate_and_save_batch_menyimpan_hasil_dan_gagal(self):
        payload = {
            "matakuliah": [
                {"id": "MK1", "kode": "MK1", "nama": "Kuliah A", "dosen": "D1", "dosen_nama": "Dosen 1", "kelas": "DBT-22", "sks": 3},
                {"id": "MK2", "kode": "MK2", "nama": "Kuliah B", "dosen": "D2", "dosen_nama": "Dosen 2", "kelas": "DBT-22", "sks": 0},
            ],
            "ruangan": self.ruangan,
            "dosen": self.dosen,
        }
        batch = BatchJadwal.objects.create(
            nama="Genap 2026",
            tahun_akademik="2025/2026",
            semester="GENAP",
            versi=1,
            input_snapshot=payload,
        )

        hasil, gagal = generate_and_save_batch(batch)

        self.assertEqual(len(hasil), 1)
        self.assertEqual(len(gagal), 1)
        self.assertEqual(JadwalKuliah.objects.filter(batch=batch).count(), 1)
        self.assertEqual(JadwalGagal.objects.filter(batch=batch).count(), 1)

        batch.refresh_from_db()
        self.assertEqual(batch.status, "GENERATED")
        self.assertEqual(batch.total_jadwal, 1)
        self.assertEqual(batch.total_gagal, 1)

    def test_save_schedule_result_menghapus_gagal_yang_sudah_berhasil_dijadwalkan(self):
        batch = BatchJadwal.objects.create(
            nama="Filter Gagal",
            tahun_akademik="2025/2026",
            semester="GENAP",
            versi=2,
            input_snapshot={},
        )

        jadwal = [
            {
                "matkul_id": "MK1",
                "kode_matkul": "MK1",
                "nama_matkul": "Kuliah A",
                "dosen_id": "D1",
                "dosen_nama": "Dosen 1",
                "kelas": "DBT-22",
                "kelas_list": ["DBT-22"],
                "sks": 3,
                "kapasitas": 20,
                "tipe_ruang": "KELAS",
                "hari": "SENIN",
                "jam_mulai": time(8, 0),
                "jam_selesai": time(10, 30),
                "ruang_kode": "R1",
                "ruang_nama": "Ruang 1",
            }
        ]
        gagal = [
            {
                "matkul_id": "MK1",
                "kode_matkul": "MK1",
                "nama_matkul": "Kuliah A",
                "dosen_id": "D1",
                "dosen_nama": "Dosen 1",
                "kelas": "DBT-22",
                "kelas_list": ["DBT-22"],
                "sks": 3,
                "kapasitas": 20,
                "alasan": "Tidak ditemukan slot.",
            }
        ]

        save_schedule_result(batch, jadwal, gagal, snapshot={})

        batch.refresh_from_db()
        self.assertEqual(batch.total_jadwal, 1)
        self.assertEqual(batch.total_gagal, 0)
        self.assertEqual(JadwalGagal.objects.filter(batch=batch).count(), 0)

    def test_batch_create_endpoint_membuat_dan_generate_batch(self):
        payload = {
            "nama": "Batch API",
            "tahun_akademik": "2025/2026",
            "semester": "GENAP",
            "versi": 1,
            "payload": {
                "matakuliah": [
                    {"id": "MK1", "kode": "MK1", "nama": "Kuliah API", "dosen": "D1", "dosen_nama": "Dosen 1", "kelas": "DBT-22", "sks": 3},
                ],
                "ruangan": self.ruangan,
                "dosen": self.dosen,
            },
        }

        response = self.client.post(
            "/penjadwalan/batches/create/",
            data=json.dumps(payload),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["batch"]["nama"], "Batch API")
        self.assertEqual(body["jadwal_count"], 1)
        self.assertEqual(BatchJadwal.objects.count(), 1)

    def test_batch_regenerate_endpoint_generate_ulang_batch(self):
        payload = {
            "matakuliah": [
                {"id": "MK1", "kode": "MK1", "nama": "Kuliah A", "dosen": "D1", "dosen_nama": "Dosen 1", "kelas": "DBT-22", "sks": 3},
            ],
            "ruangan": self.ruangan,
            "dosen": self.dosen,
        }
        batch = BatchJadwal.objects.create(
            nama="Regenerate",
            tahun_akademik="2025/2026",
            semester="GENAP",
            versi=1,
            input_snapshot=payload,
        )

        response = self.client.post(f"/penjadwalan/batches/{batch.id}/regenerate/")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertEqual(body["batch"]["status"], "GENERATED")
        self.assertEqual(JadwalKuliah.objects.filter(batch=batch).count(), 1)

    def test_batch_detail_mengembalikan_slot_kosong(self):
        payload = {
            "matakuliah": [
                {
                    "id": "MK1",
                    "kode": "MK1",
                    "nama": "Kuliah A",
                    "dosen": "D1",
                    "dosen_nama": "Dosen 1",
                    "kelas": "DBT-22",
                    "sks": 3,
                },
            ],
            "ruangan": self.ruangan,
            "dosen": self.dosen,
        }
        batch = BatchJadwal.objects.create(
            nama="Detail Slot Kosong",
            tahun_akademik="2025/2026",
            semester="GENAP",
            versi=3,
            input_snapshot=payload,
        )
        generate_and_save_batch(batch)

        response = self.client.get(f"/penjadwalan/batches/{batch.id}/")

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("slot_kosong", body)
        self.assertGreater(len(body["slot_kosong"]), 0)

    def test_parse_excel_upload_menghasilkan_payload_scheduler(self):
        uploaded = self._build_excel_file(
            [
                {"MKKODE": "MK1", "NAMAMK": "Mobile App", "KELAS": "DBT-22", "Dosen": "D1", "STATUS FM": "Tidak Tetap", "SKS": 3, "JMLMHSW": 20},
                {"MKKODE": "MK1", "NAMAMK": "Mobile App", "KELAS": "DBT-23", "Dosen": "D1", "STATUS FM": "Tidak Tetap", "SKS": 3, "JMLMHSW": 18},
            ]
        )

        payload, preview = parse_excel_upload(uploaded.read(), gabungkan_kelas=True)

        self.assertEqual(len(payload["matakuliah"]), 1)
        self.assertEqual(payload["matakuliah"][0]["kapasitas"], 38)
        self.assertEqual(payload["dosen"][0]["tipe"], "parttime")
        self.assertEqual(len(preview), 2)

    def test_parse_excel_upload_memakai_master_ruangan_jika_ada(self):
        self._create_master_ruangan(kode="R201", nama="Ruang 201", tipe="KELAS", kapasitas=60, board_type="PAPAN_TULIS")
        self._create_master_ruangan(kode="LAB-SI", nama="Lab SI", tipe="LAB", kapasitas=30, board_type=None, prodi="Sistem Informasi")

        uploaded = self._build_excel_file(
            [
                {"MKKODE": "MK1", "NAMAMK": "Mobile App", "KELAS": "DBT-22", "Dosen": "D1", "STATUS FM": "Tidak Tetap", "SKS": 3, "JMLMHSW": 20, "PRODI": "Sistem Informasi"},
            ]
        )

        payload, _ = parse_excel_upload(uploaded.read(), gabungkan_kelas=True)

        self.assertEqual(len(payload["ruangan"]), 2)
        self.assertEqual([room["id"] for room in payload["ruangan"]], ["R201", "LAB-SI"])
        self.assertEqual(payload["matakuliah"][0]["prodi"], "Sistem Informasi")

    def test_scheduler_lab_memilih_ruangan_dengan_prodi_yang_sama(self):
        ruangan = [
            {"id": "LAB-SI-1", "nama": "Lab SI 1", "capacity": 20, "tipe": "lab", "prodi": "Sistem Informasi"},
            {"id": "LAB-TI-1", "nama": "Lab TI 1", "capacity": 20, "tipe": "lab", "prodi": "Teknik Informatika"},
        ]
        matakuliah = [
            {
                "id": "MK1",
                "kode": "MK1",
                "nama": "Praktikum A",
                "dosen": "D1",
                "dosen_nama": "Dosen 1",
                "kelas": "DBT-22",
                "sks": 3,
                "kapasitas": 18,
                "butuh_lab": 1,
                "prodi": "Sistem Informasi",
            }
        ]

        hasil, gagal = generate_schedule(matakuliah, ruangan, self.dosen)

        self.assertEqual(len(gagal), 0)
        self.assertEqual(len(hasil), 1)
        self.assertEqual(hasil[0]["ruang_kode"], "LAB-SI-1")

    def test_ruangan_master_crud_endpoint(self):
        response = self.client.post(
            "/penjadwalan/ruangan/",
            data=json.dumps(
                {
                    "kode": "R301",
                    "nama": "Ruang 301",
                    "tipe": "KELAS",
                    "kapasitas": 50,
                    "board_type": "SMARTBOARD",
                    "aktif": True,
                }
            ),
            content_type="application/json",
        )
        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["ruangan"]["kode"], "R301")

        list_response = self.client.get("/penjadwalan/ruangan/")
        self.assertEqual(list_response.status_code, 200)
        self.assertEqual(len(list_response.json()["results"]), 1)

        room_id = body["ruangan"]["id"]
        patch_response = self.client.patch(
            f"/penjadwalan/ruangan/{room_id}/",
            data=json.dumps({"kapasitas": 55, "prodi": "Informatika"}),
            content_type="application/json",
        )
        self.assertEqual(patch_response.status_code, 200)
        self.assertEqual(patch_response.json()["ruangan"]["kapasitas"], 55)
        self.assertEqual(patch_response.json()["ruangan"]["prodi"], "Informatika")

        delete_response = self.client.delete(f"/penjadwalan/ruangan/{room_id}/")
        self.assertEqual(delete_response.status_code, 200)
        self.assertEqual(Ruangan.objects.count(), 0)

    def test_batch_upload_excel_endpoint_membuat_batch(self):
        uploaded = self._build_excel_file(
            [
                {"MKKODE": "MK1", "NAMAMK": "Mobile App", "KELAS": "DBT-22", "Dosen": "D1", "STATUS FM": "Tidak Tetap", "SKS": 3, "JMLMHSW": 20},
                {"MKKODE": "MK2", "NAMAMK": "Research Method", "KELAS": "DBT-23", "Dosen": "D2", "STATUS FM": "Tetap", "SKS": 3, "JMLMHSW": 22},
            ]
        )

        response = self.client.post(
            "/penjadwalan/batches/upload-excel/",
            data={
                "file": uploaded,
                "nama": "Batch Upload Excel",
                "tahun_akademik": "2025/2026",
                "semester": "GENAP",
                "versi": "1",
                "gabungkan_kelas": "true",
            },
        )

        self.assertEqual(response.status_code, 201)
        body = response.json()
        self.assertEqual(body["batch"]["nama"], "Batch Upload Excel")
        self.assertEqual(body["preview_count"], 2)
        self.assertEqual(BatchJadwal.objects.count(), 1)
