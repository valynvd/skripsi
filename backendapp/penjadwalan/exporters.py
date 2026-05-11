from io import BytesIO

import xlwt


def export_batch_to_xls(batch):
    workbook = xlwt.Workbook()

    jadwal_sheet = workbook.add_sheet("Jadwal")
    gagal_sheet = workbook.add_sheet("Gagal")

    jadwal_headers = [
        "Kode MK",
        "Nama Mata Kuliah",
        "Dosen",
        "Kelas",
        "SKS",
        "Hari",
        "Jam Mulai",
        "Jam Selesai",
        "Ruang",
        "Tipe Ruang",
    ]
    gagal_headers = [
        "Kode MK",
        "Nama Mata Kuliah",
        "Dosen",
        "Kelas",
        "SKS",
        "Kapasitas",
        "Alasan",
    ]

    for column, value in enumerate(jadwal_headers):
        jadwal_sheet.write(0, column, value)
    for column, value in enumerate(gagal_headers):
        gagal_sheet.write(0, column, value)

    for row_index, item in enumerate(batch.jadwal_items.all(), start=1):
        jadwal_sheet.write(row_index, 0, item.kode_matkul)
        jadwal_sheet.write(row_index, 1, item.nama_matkul)
        jadwal_sheet.write(row_index, 2, item.dosen_nama)
        jadwal_sheet.write(row_index, 3, item.kelas)
        jadwal_sheet.write(row_index, 4, item.sks)
        jadwal_sheet.write(row_index, 5, item.hari)
        jadwal_sheet.write(row_index, 6, item.jam_mulai.strftime("%H:%M"))
        jadwal_sheet.write(row_index, 7, item.jam_selesai.strftime("%H:%M"))
        jadwal_sheet.write(row_index, 8, item.ruang_kode)
        jadwal_sheet.write(row_index, 9, item.tipe_ruang)

    for row_index, item in enumerate(batch.jadwal_gagal_items.all(), start=1):
        gagal_sheet.write(row_index, 0, item.kode_matkul or "")
        gagal_sheet.write(row_index, 1, item.nama_matkul)
        gagal_sheet.write(row_index, 2, item.dosen_nama)
        gagal_sheet.write(row_index, 3, item.kelas)
        gagal_sheet.write(row_index, 4, item.sks)
        gagal_sheet.write(row_index, 5, item.kapasitas)
        gagal_sheet.write(row_index, 6, item.alasan)

    output = BytesIO()
    workbook.save(output)
    return output.getvalue()
