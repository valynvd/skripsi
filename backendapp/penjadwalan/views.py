import json
from datetime import datetime, timedelta

from django.http import Http404, HttpResponse, JsonResponse
from django.shortcuts import redirect
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_http_methods

from .exporters import export_batch_to_xls
from .importers import get_default_ruangan_payload, parse_excel_upload, parse_lab_excel_upload
from .models import (
    BatchJadwal,
    END_MAKAN,
    JAM_SELESAI,
    JadwalKuliah,
    MENIT_PER_SKS,
    Ruangan,
    START_MAKAN,
)
from .services import build_default_slot_labels, create_batch_with_results, generate_and_save_batch

HARI_ORDER = {
    "SENIN": 0,
    "SELASA": 1,
    "RABU": 2,
    "KAMIS": 3,
    "JUMAT": 4,
}


def _serialize_batch(batch):
    return {
        "id": batch.id,
        "nama": batch.nama,
        "tahun_akademik": batch.tahun_akademik,
        "semester": batch.semester,
        "versi": batch.versi,
        "status": batch.status,
        "total_jadwal": batch.total_jadwal,
        "total_gagal": batch.total_gagal,
        "generated_at": batch.generated_at.isoformat() if batch.generated_at else None,
        "created_at": batch.created_at.isoformat(),
    }


def _serialize_ruangan(room):
    return {
        "id": room.id,
        "kode": room.kode,
        "nama": room.nama,
        "tipe": room.tipe,
        "kapasitas": room.kapasitas,
        "board_type": room.board_type,
        "prodi": room.prodi,
        "aktif": room.aktif,
        "catatan": room.catatan,
    }


def _bad_request(message, status=400):
    return JsonResponse({"detail": message}, status=status)


def _parse_json_body(request):
    try:
        return json.loads(request.body.decode("utf-8") or "{}")
    except (json.JSONDecodeError, UnicodeDecodeError):
        return None


def _parse_optional_json(value, fallback):
    if value in (None, ""):
        return fallback
    try:
        return json.loads(value)
    except json.JSONDecodeError:
        raise ValueError("Format JSON tambahan tidak valid.")


def _parse_bool(value, default=False):
    if value in (None, ""):
        return default
    return str(value).strip().lower() in {"1", "true", "ya", "yes", "y", "on"}


def _clean_optional_text(value):
    if value in (None, ""):
        return None
    cleaned = str(value).strip()
    return cleaned or None


def _validate_payload(payload):
    if not isinstance(payload, dict):
        return "Payload harus berupa object JSON."

    required_keys = ["matakuliah", "dosen"]
    for key in required_keys:
        if key not in payload:
            return f"Field '{key}' wajib diisi."
        if not isinstance(payload[key], list):
            return f"Field '{key}' harus berupa list."

    if "ruangan" in payload and not isinstance(payload["ruangan"], list):
        return "Field 'ruangan' harus berupa list."

    return None


def _validate_excel_file(uploaded_file):
    if not uploaded_file:
        return "File Excel wajib diunggah."
    if not uploaded_file.name.lower().endswith(".xlsx"):
        return "File yang didukung saat ini hanya .xlsx."
    return None


def _validate_optional_excel_file(uploaded_file, field_label):
    if not uploaded_file:
        return None
    if not uploaded_file.name.lower().endswith(".xlsx"):
        return f"{field_label} harus berformat .xlsx."
    return None


def _parse_time(value):
    return datetime.strptime(value, "%H:%M").time()


def _overlap(start1, end1, start2, end2):
    return start1 < end2 and start2 < end1


def _serialize_jadwal_item(item):
    return {
        "id": item.id,
        "kode_matkul": item.kode_matkul,
        "nama_matkul": item.nama_matkul,
        "dosen_nama": item.dosen_nama,
        "kelas": item.kelas,
        "sks": item.sks,
        "hari": item.hari,
        "jam_mulai": item.jam_mulai.strftime("%H:%M"),
        "jam_selesai": item.jam_selesai.strftime("%H:%M"),
        "ruang_kode": item.ruang_kode,
        "tipe_ruang": item.tipe_ruang,
        "catatan": item.catatan,
    }


def _build_matkul_prodi_lookup(batch):
    snapshot = batch.input_snapshot or {}
    lookup = {}

    for matkul in snapshot.get("matakuliah", []):
        prodi = _clean_optional_text(matkul.get("prodi") or matkul.get("prodi_lab"))
        if not prodi:
            continue

        for key in (
            matkul.get("id"),
            matkul.get("kode"),
            matkul.get("matkul_id"),
            matkul.get("kode_matkul"),
        ):
            cleaned_key = _clean_optional_text(key)
            if cleaned_key:
                lookup[cleaned_key.lower()] = prodi

    return lookup


def _enrich_jadwal_with_prodi(item, lookup):
    prodi = lookup.get(str(item.kode_matkul or "").strip().lower())
    if not prodi:
        prodi = lookup.get(str(item.matkul_id or "").strip().lower())

    payload = _serialize_jadwal_item(item)
    payload["prodi"] = prodi
    return payload


def _serialize_slot_kosong(batch):
    snapshot = batch.input_snapshot or {}
    ruangan = snapshot.get("ruangan") or []
    waktu = snapshot.get("waktu") or build_default_slot_labels()

    ruang_map = {}
    for ruang in ruangan:
        kode = str(ruang.get("id") or "").strip()
        if not kode:
            continue
        ruang_map[kode] = {
            "kode": kode,
            "nama": ruang.get("nama") or kode,
        }

    slot_map = {}
    for slot in waktu:
        try:
            hari, jam = slot.split("_", 1)
        except ValueError:
            continue
        slot_map.setdefault(hari, []).append(_parse_time(jam))

    occupied = set()
    jadwal_items = list(batch.jadwal_items.all())
    for item in jadwal_items:
        waktu_hari = sorted(slot_map.get(item.hari, []))
        for slot_time in waktu_hari:
            if item.jam_mulai <= slot_time < item.jam_selesai:
                occupied.add((item.hari, item.ruang_kode, slot_time.strftime("%H:%M")))

    hasil = []
    interval_menit = 30
    minimum_menit = MENIT_PER_SKS * 2

    def append_kosong(hari, start, prev, ruang):
        total_menit = int(
            (
                datetime.combine(datetime.today(), prev)
                - datetime.combine(datetime.today(), start)
            ).total_seconds()
            / 60
        ) + interval_menit
        sks_kosong = total_menit // MENIT_PER_SKS

        if total_menit < minimum_menit or sks_kosong < 2:
            return

        hasil.append(
            {
                "hari": hari,
                "jam_mulai": start.strftime("%H:%M"),
                "jam_selesai": (
                    datetime.combine(datetime.today(), prev)
                    + timedelta(minutes=interval_menit)
                ).time().strftime("%H:%M"),
                "ruang_kode": ruang["kode"],
                "ruang_nama": ruang["nama"],
                "total_slot": int(total_menit / interval_menit),
                "sks_kosong": sks_kosong,
            }
        )

    for hari, daftar_waktu in slot_map.items():
        daftar_waktu = sorted(daftar_waktu)
        for ruang in ruang_map.values():
            kosong = []
            for slot_time in daftar_waktu:
                key = (hari, ruang["kode"], slot_time.strftime("%H:%M"))
                if key not in occupied:
                    kosong.append(slot_time)

            if not kosong:
                continue

            start = kosong[0]
            prev = kosong[0]
            for current in kosong[1:]:
                expected = (
                    datetime.combine(datetime.today(), prev)
                    + timedelta(minutes=interval_menit)
                ).time()
                if current == expected:
                    prev = current
                    continue

                append_kosong(hari, start, prev, ruang)
                start = current
                prev = current

            append_kosong(hari, start, prev, ruang)

    return sorted(
        hasil,
        key=lambda item: (
            HARI_ORDER.get(item["hari"], 99),
            item["jam_mulai"],
            item["ruang_kode"],
        ),
    )


def _validate_manual_jadwal_update(item, hari, jam_mulai, ruang_kode):
    if hari not in {choice[0] for choice in JadwalKuliah.HARI}:
        return "Hari tidak valid."

    mulai = _parse_time(jam_mulai)
    selesai = (
        datetime.combine(datetime.today(), mulai)
        + timedelta(minutes=(item.sks or 0) * MENIT_PER_SKS)
    ).time()

    if selesai > _parse_time(JAM_SELESAI):
        return "Jadwal melewati jam operasional."

    if _overlap(mulai, selesai, _parse_time(START_MAKAN), _parse_time(END_MAKAN)):
        return "Jadwal melewati jam istirahat 12:00 - 13:00."

    kelas_item = set(item.kelas_list or ([item.kelas] if item.kelas else []))

    konflik_qs = JadwalKuliah.objects.filter(batch=item.batch, hari=hari).exclude(id=item.id)
    for other in konflik_qs:
        if not _overlap(mulai, selesai, other.jam_mulai, other.jam_selesai):
            continue

        if other.ruang_kode == ruang_kode:
            return f"Ruang bentrok dengan {other.kode_matkul} - {other.nama_matkul}."

        if other.dosen_id and item.dosen_id and other.dosen_id == item.dosen_id:
            return f"Dosen bentrok dengan {other.kode_matkul} - {other.nama_matkul}."

        kelas_other = set(other.kelas_list or ([other.kelas] if other.kelas else []))
        if kelas_item.intersection(kelas_other):
            return f"Kelas bentrok dengan {other.kode_matkul} - {other.nama_matkul}."

    return None


@require_GET
def batch_list(request):
    batches = BatchJadwal.objects.all().order_by("-created_at")
    return JsonResponse({"results": [_serialize_batch(batch) for batch in batches]})


@require_GET
def upload_form(request):
    last_batch = BatchJadwal.objects.order_by("-created_at").first()
    result_link = f"/penjadwalan/batches/{last_batch.id}/" if last_batch else ""
    export_link = f"/penjadwalan/batches/{last_batch.id}/export-xls/" if last_batch else ""

    html_content = """
    <!DOCTYPE html>
    <html lang="id">
    <head>
        <meta charset="utf-8" />
        <title>Upload Jadwal</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                max-width: 760px;
                margin: 40px auto;
                padding: 0 16px;
                color: #1f2937;
            }}
            .card {{
                border: 1px solid #d1d5db;
                border-radius: 12px;
                padding: 24px;
                box-shadow: 0 8px 24px rgba(0,0,0,0.06);
            }}
            label {{
                display: block;
                margin-top: 14px;
                margin-bottom: 6px;
                font-weight: 600;
            }}
            input {{
                width: 100%;
                padding: 10px 12px;
                box-sizing: border-box;
            }}
            button {{
                margin-top: 20px;
                padding: 12px 18px;
                border: 0;
                border-radius: 10px;
                background: #2563eb;
                color: white;
                cursor: pointer;
            }}
            .links {{
                margin-top: 20px;
                display: flex;
                gap: 16px;
                flex-wrap: wrap;
            }}
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Upload Excel Penjadwalan</h1>
            <p>Format file penjadwalan: <code>.xlsx</code> dengan kolom wajib MKKODE, NAMAMK, KELAS, Dosen, STATUS FM, SKS.</p>
            <form action="/penjadwalan/batches/upload-excel/" method="post" enctype="multipart/form-data">
                <input name="redirect_after_upload" type="hidden" value="true" />
                <label for="lab_file">File Excel LAB</label>
                <input id="lab_file" name="lab_file" type="file" accept=".xlsx" />

                <label for="file">File Excel Penjadwalan</label>
                <input id="file" name="file" type="file" accept=".xlsx" required />

                <label for="nama">Nama Batch</label>
                <input id="nama" name="nama" type="text" value="Jadwal Genap 2025/2026" />

                <label for="tahun_akademik">Tahun Akademik</label>
                <input id="tahun_akademik" name="tahun_akademik" type="text" value="2025/2026" />

                <label for="semester">Semester</label>
                <input id="semester" name="semester" type="text" value="GENAP" />

                <label for="versi">Versi</label>
                <input id="versi" name="versi" type="number" value="1" min="1" />

                <button type="submit">Upload dan Generate</button>
            </form>
            <div class="links">
                <a href="/penjadwalan/batches/">Lihat daftar batch</a>
                """
    if result_link:
        html_content += f'<a href="{result_link}">Lihat batch terakhir</a>'
    if export_link:
        html_content += f'<a href="{export_link}">Download batch terakhir</a>'
    html_content += """
            </div>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html_content)


@require_GET
def batch_detail(request, batch_id):
    batch = (
        BatchJadwal.objects
        .prefetch_related("jadwal_items", "jadwal_gagal_items")
        .filter(id=batch_id)
        .first()
    )
    if not batch:
        raise Http404("Batch tidak ditemukan")

    prodi_lookup = _build_matkul_prodi_lookup(batch)

    return JsonResponse(
        {
            **_serialize_batch(batch),
            "jadwal": [
                _enrich_jadwal_with_prodi(item, prodi_lookup)
                for item in batch.jadwal_items.all().order_by("hari", "jam_mulai", "ruang_kode")
            ],
            "gagal": [
                {
                    "id": item.id,
                    "kode_matkul": item.kode_matkul,
                    "nama_matkul": item.nama_matkul,
                    "dosen_nama": item.dosen_nama,
                    "kelas": item.kelas,
                    "sks": item.sks,
                    "kapasitas": item.kapasitas,
                    "alasan": item.alasan,
                }
                for item in batch.jadwal_gagal_items.all()
            ],
            "slot_kosong": _serialize_slot_kosong(batch),
        }
    )


@csrf_exempt
@require_http_methods(["POST"])
def batch_upload_excel(request):
    uploaded_file = request.FILES.get("file")
    file_error = _validate_excel_file(uploaded_file)
    if file_error:
        return _bad_request(file_error)

    lab_file = request.FILES.get("lab_file")
    lab_file_error = _validate_optional_excel_file(lab_file, "File Excel LAB")
    if lab_file_error:
        return _bad_request(lab_file_error)

    try:
        ruangan = _parse_optional_json(request.POST.get("ruangan"), None)
        waktu = _parse_optional_json(request.POST.get("waktu"), None)
        kelas_khusus = _parse_optional_json(request.POST.get("kelas_khusus"), None)
        gabungkan_kelas = _parse_bool(request.POST.get("gabungkan_kelas"), default=True)
    except ValueError as exc:
        return _bad_request(str(exc))

    file_bytes = uploaded_file.read()
    uploaded_file.seek(0)
    lab_manual = []

    if lab_file:
        try:
            lab_manual = parse_lab_excel_upload(lab_file.read())
            lab_file.seek(0)
        except Exception:
            return _bad_request("File Excel LAB tidak dapat diproses.")

    try:
        payload, preview = parse_excel_upload(
            file_bytes,
            gabungkan_kelas=gabungkan_kelas,
            ruangan=ruangan,
            waktu=waktu,
            kelas_khusus=kelas_khusus,
            lab_manual=lab_manual,
        )
    except ValueError as exc:
        return _bad_request(str(exc))
    except Exception:
        return _bad_request("File Excel tidak dapat diproses.")

    batch, jadwal, gagal = create_batch_with_results(
        payload=payload,
        file_input=uploaded_file,
        nama=request.POST.get("nama"),
        tahun_akademik=request.POST.get("tahun_akademik", ""),
        semester=request.POST.get("semester", "GENAP"),
        versi=int(request.POST.get("versi", 1)),
        catatan=request.POST.get("catatan"),
    )

    if _parse_bool(request.POST.get("redirect_after_upload"), default=False):
        return redirect(f"/penjadwalan/batches/{batch.id}/")

    return JsonResponse(
        {
            "detail": "File Excel berhasil diunggah dan batch berhasil digenerate.",
            "batch": _serialize_batch(batch),
            "jadwal_count": len(jadwal),
            "gagal_count": len(gagal),
            "lab_manual_count": len(payload.get("lab_manual", [])),
            "lab_excluded_count": len(payload.get("lab_excluded", [])),
            "preview_count": len(preview),
            "preview_columns": list(preview[0].keys()) if preview else [],
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["POST"])
def batch_create(request):
    body = _parse_json_body(request)
    if body is None:
        return _bad_request("Body request harus JSON yang valid.")

    payload = body.get("payload")
    error = _validate_payload(payload)
    if error:
        return _bad_request(error)

    payload = dict(payload)
    payload["ruangan"] = payload.get("ruangan") or get_default_ruangan_payload()
    payload["waktu"] = payload.get("waktu")
    payload["kelas_khusus"] = payload.get("kelas_khusus") or {}

    batch, jadwal, gagal = create_batch_with_results(
        payload=payload,
        nama=body.get("nama"),
        tahun_akademik=body.get("tahun_akademik", ""),
        semester=body.get("semester", "GENAP"),
        versi=body.get("versi", 1),
        catatan=body.get("catatan"),
    )

    return JsonResponse(
        {
            "detail": "Batch berhasil dibuat dan digenerate.",
            "batch": _serialize_batch(batch),
            "jadwal_count": len(jadwal),
            "gagal_count": len(gagal),
        },
        status=201,
    )


@require_GET
def ruangan_list(request):
    ruangan = Ruangan.objects.all().order_by("tipe", "nama")
    return JsonResponse(
        {
            "results": [_serialize_ruangan(room) for room in ruangan],
        }
    )


@csrf_exempt
@require_http_methods(["GET", "POST"])
def ruangan_collection(request):
    if request.method == "GET":
        return ruangan_list(request)

    body = _parse_json_body(request)
    if body is None:
        return _bad_request("Body request harus JSON yang valid.")

    kode = str(body.get("kode") or "").strip()
    nama = str(body.get("nama") or "").strip()
    tipe = str(body.get("tipe") or "KELAS").strip().upper()
    kapasitas = body.get("kapasitas", 0)
    board_type = body.get("board_type")
    prodi = body.get("prodi")
    aktif = body.get("aktif", True)
    catatan = body.get("catatan")

    if not kode:
        return _bad_request("Kode ruangan wajib diisi.")
    if not nama:
        return _bad_request("Nama ruangan wajib diisi.")
    if tipe not in {choice[0] for choice in Ruangan.TIPE_RUANG}:
        return _bad_request("Tipe ruangan tidak valid.")

    try:
        kapasitas = int(kapasitas)
    except (TypeError, ValueError):
        return _bad_request("Kapasitas harus berupa angka.")

    room = Ruangan.objects.filter(kode=kode).first()
    if room:
        return _bad_request("Kode ruangan sudah digunakan.")

    if board_type not in (None, ""):
        board_type = str(board_type).strip().upper()
        if board_type not in {choice[0] for choice in Ruangan.TIPE_BOARD}:
            return _bad_request("board_type tidak valid.")
    else:
        board_type = None

    room = Ruangan.objects.create(
        kode=kode,
        nama=nama,
        tipe=tipe,
        kapasitas=kapasitas,
        board_type=board_type,
        prodi=_clean_optional_text(prodi),
        aktif=_parse_bool(aktif, default=True),
        catatan=catatan,
    )
    return JsonResponse(
        {
            "detail": "Ruangan berhasil ditambahkan.",
            "ruangan": _serialize_ruangan(room),
        },
        status=201,
    )


@csrf_exempt
@require_http_methods(["GET", "PATCH", "DELETE"])
def ruangan_detail(request, room_id):
    room = Ruangan.objects.filter(id=room_id).first()
    if not room:
        raise Http404("Ruangan tidak ditemukan")

    if request.method == "GET":
        return JsonResponse({"ruangan": _serialize_ruangan(room)})

    if request.method == "DELETE":
        room.delete()
        return JsonResponse({"detail": "Ruangan berhasil dihapus."})

    body = _parse_json_body(request)
    if body is None:
        return _bad_request("Body request harus JSON yang valid.")

    if "kode" in body:
        kode = str(body.get("kode") or "").strip()
        if not kode:
            return _bad_request("Kode ruangan tidak boleh kosong.")
        other = Ruangan.objects.filter(kode=kode).exclude(id=room.id).first()
        if other:
            return _bad_request("Kode ruangan sudah digunakan.")
        room.kode = kode

    if "nama" in body:
        nama = str(body.get("nama") or "").strip()
        if not nama:
            return _bad_request("Nama ruangan tidak boleh kosong.")
        room.nama = nama

    if "tipe" in body:
        tipe = str(body.get("tipe") or "").strip().upper()
        if tipe not in {choice[0] for choice in Ruangan.TIPE_RUANG}:
            return _bad_request("Tipe ruangan tidak valid.")
        room.tipe = tipe

    if "kapasitas" in body:
        try:
            room.kapasitas = int(body.get("kapasitas") or 0)
        except (TypeError, ValueError):
            return _bad_request("Kapasitas harus berupa angka.")

    if "board_type" in body:
        board_type = body.get("board_type")
        if board_type in (None, ""):
            room.board_type = None
        else:
            board_type = str(board_type).strip().upper()
            if board_type not in {choice[0] for choice in Ruangan.TIPE_BOARD}:
                return _bad_request("board_type tidak valid.")
            room.board_type = board_type

    if "prodi" in body:
        room.prodi = _clean_optional_text(body.get("prodi"))

    if "aktif" in body:
        room.aktif = _parse_bool(body.get("aktif"), default=room.aktif)

    if "catatan" in body:
        room.catatan = body.get("catatan")

    room.save()
    return JsonResponse(
        {
            "detail": "Ruangan berhasil diperbarui.",
            "ruangan": _serialize_ruangan(room),
        }
    )


@require_GET
def batch_export_xls(request, batch_id):
    batch = (
        BatchJadwal.objects
        .prefetch_related("jadwal_items", "jadwal_gagal_items")
        .filter(id=batch_id)
        .first()
    )
    if not batch:
        raise Http404("Batch tidak ditemukan")

    response = HttpResponse(
        export_batch_to_xls(batch),
        content_type="application/vnd.ms-excel",
    )
    response["Content-Disposition"] = f'attachment; filename="jadwal-batch-{batch.id}.xls"'
    return response


@csrf_exempt
@require_http_methods(["POST"])
def batch_regenerate(request, batch_id):
    batch = BatchJadwal.objects.filter(id=batch_id).first()
    if not batch:
        raise Http404("Batch tidak ditemukan")
    if not batch.input_snapshot:
        return _bad_request("Batch belum memiliki snapshot input.")

    jadwal, gagal = generate_and_save_batch(batch)
    batch.refresh_from_db()

    return JsonResponse(
        {
            "detail": "Batch berhasil digenerate ulang.",
            "batch": _serialize_batch(batch),
            "jadwal_count": len(jadwal),
            "gagal_count": len(gagal),
        }
    )


@csrf_exempt
@require_http_methods(["PATCH"])
def jadwal_update(request, jadwal_id):
    item = JadwalKuliah.objects.filter(id=jadwal_id).first()
    if not item:
        raise Http404("Jadwal tidak ditemukan")

    body = _parse_json_body(request)
    if body is None:
        return _bad_request("Body request harus JSON yang valid.")

    hari = body.get("hari", item.hari)
    jam_mulai = body.get("jam_mulai", item.jam_mulai.strftime("%H:%M"))
    ruang_kode = str(body.get("ruang_kode", item.ruang_kode)).strip()
    catatan = body.get("catatan", item.catatan)

    if not ruang_kode:
        return _bad_request("Ruang wajib diisi.")

    try:
        konflik = _validate_manual_jadwal_update(item, hari, jam_mulai, ruang_kode)
    except ValueError:
        return _bad_request("Format jam harus HH:MM.")

    if konflik:
        return _bad_request(konflik)

    item.hari = hari
    item.jam_mulai = _parse_time(jam_mulai)
    item.jam_selesai = (
        datetime.combine(datetime.today(), item.jam_mulai)
        + timedelta(minutes=(item.sks or 0) * MENIT_PER_SKS)
    ).time()
    item.ruang_kode = ruang_kode
    item.ruang_nama = body.get("ruang_nama", item.ruang_nama or ruang_kode)
    item.catatan = catatan
    item.save(update_fields=["hari", "jam_mulai", "jam_selesai", "ruang_kode", "ruang_nama", "catatan"])

    return JsonResponse(
        {
            "detail": "Jadwal berhasil diperbarui.",
            "jadwal": _serialize_jadwal_item(item),
        }
    )
