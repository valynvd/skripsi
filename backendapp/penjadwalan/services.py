import math
from datetime import datetime, timedelta

from django.utils import timezone

from .models import (
    BatchJadwal,
    END_MAKAN,
    JAM_MULAI,
    JAM_SELESAI,
    JadwalGagal,
    JadwalKuliah,
    MENIT_PER_SKS,
    START_MAKAN,
)
from .importers import get_default_ruangan_payload

HARI_LIST = ["SENIN", "SELASA", "RABU", "KAMIS", "JUMAT"]
SLOT_INTERVAL_MINUTES = 30


def parse_hhmm(value):
    return datetime.strptime(value, "%H:%M").time()


def to_time_string(value):
    return value.strftime("%H:%M")


def combine_time(value):
    return datetime.combine(datetime.today(), value)


def overlap(start1, end1, start2, end2):
    return start1 < end2 and start2 < end1


def lunch_conflict(start_time, end_time):
    return overlap(start_time, end_time, parse_hhmm(START_MAKAN), parse_hhmm(END_MAKAN))


def build_default_waktu():
    slots = []
    current = combine_time(parse_hhmm(JAM_MULAI))
    end_limit = combine_time(parse_hhmm(JAM_SELESAI))

    while current < end_limit:
        slots.append(current.time())
        current += timedelta(minutes=SLOT_INTERVAL_MINUTES)

    return slots


def build_default_slot_labels():
    waktu = []
    for hari in HARI_LIST:
        for jam in build_default_waktu():
            waktu.append(f"{hari}_{to_time_string(jam)}")
    return waktu


def _group_slots_by_day(waktu):
    day_slots = {hari: [] for hari in HARI_LIST}
    for slot in waktu:
        hari, jam = slot.split("_", 1)
        day_slots[hari].append(parse_hhmm(jam))
    return day_slots


def _get_dosen_type(dosen_id, dosen_list):
    for dosen in dosen_list:
        if dosen.get("id") == dosen_id:
            return "fulltime" if dosen.get("tipe") == "fulltime" else "parttime"
    return "fulltime"


def _priority(item, dosen_list):
    tipe_dosen = _get_dosen_type(item.get("dosen"), dosen_list)
    sks = item.get("sks") or 0

    if tipe_dosen == "parttime":
        return (0, -sks, item.get("kode", ""), item.get("nama", ""))
    return (1, -sks, item.get("kode", ""), item.get("nama", ""))


def _required_slots(sks):
    durasi_menit = sks * MENIT_PER_SKS
    return durasi_menit, math.ceil(durasi_menit / SLOT_INTERVAL_MINUTES)


def _candidate_rooms(ruangan, matkul):
    tipe_target = "lab" if str(matkul.get("tipe_ruang", "")).upper() == "LAB" or matkul.get("butuh_lab", 0) == 1 else "kelas"
    kapasitas = matkul.get("kapasitas", 0)
    board_target = str(matkul.get("board_type") or "").strip().lower()
    prodi_target = str(matkul.get("prodi") or matkul.get("prodi_lab") or "").strip().lower()
    is_lab = tipe_target == "lab"
    return [
        ruang for ruang in ruangan
        if str(ruang.get("tipe", "kelas")).strip().lower() == tipe_target
        and ruang.get("capacity", 0) >= kapasitas
        and (
            not board_target
            or not str(ruang.get("board_type") or "").strip()
            or str(ruang.get("board_type") or "").strip().lower() == board_target
        )
        and (
            not is_lab
            or not prodi_target
            or not str(ruang.get("prodi") or "").strip()
            or str(ruang.get("prodi") or "").strip().lower() == prodi_target
        )
    ]


def _kelas_list(item):
    kelas_list = item.get("kelas_list")
    if kelas_list:
        return list(kelas_list)
    if item.get("kelas"):
        return [item["kelas"]]
    return []


def _result_signature(item):
    kelas_values = sorted(str(value).strip() for value in _kelas_list(item) if str(value).strip())
    kelas_fallback = str(item.get("kelas") or "").strip()
    return (
        str(item.get("matkul_id") or item.get("id") or "").strip(),
        str(item.get("kode_matkul") or item.get("kode") or "").strip(),
        str(item.get("nama_matkul") or item.get("nama") or "").strip(),
        str(item.get("dosen_id") or item.get("dosen") or "").strip(),
        tuple(kelas_values),
        kelas_fallback,
    )


def _remove_resolved_failures(jadwal, gagal):
    scheduled_signatures = {_result_signature(item) for item in jadwal}
    return [item for item in gagal if _result_signature(item) not in scheduled_signatures]


def _slot_key(hari, jam):
    return f"{hari}_{to_time_string(jam)}"


def _kelas_blocked(matkul, slot_key, kelas_khusus):
    for kelas_id in _kelas_list(matkul):
        if slot_key in kelas_khusus.get(kelas_id, []):
            return True
    return False


def _kelas_conflict(existing_slots, slot_key, matkul):
    kelas_target = set(_kelas_list(matkul))
    for item in existing_slots:
        if item["slot_key"] != slot_key:
            continue
        if kelas_target.intersection(item["kelas_set"]):
            return True
    return False


def _is_conflict(existing_slots, slot_key, ruang, matkul, kelas_khusus, start_time, end_time):
    if lunch_conflict(start_time, end_time):
        return True

    if _kelas_blocked(matkul, slot_key, kelas_khusus):
        return True

    if _kelas_conflict(existing_slots, slot_key, matkul):
        return True

    for item in existing_slots:
        if item["slot_key"] != slot_key:
            continue
        if item["ruang_id"] == ruang["id"]:
            return True
        if item["dosen_id"] == matkul.get("dosen"):
            return True
    return False


def _parttime_days(existing_slots, dosen_id):
    counts = []
    for hari in HARI_LIST:
        total = sum(
            1 for item in existing_slots
            if item["hari"] == hari and item["dosen_id"] == dosen_id
        )
        if total > 0:
            counts.append((hari, total))

    prioritized = [hari for hari, _ in sorted(counts, key=lambda item: (-item[1], HARI_LIST.index(item[0])))]
    return prioritized + [hari for hari in HARI_LIST if hari not in prioritized]


def generate_schedule(matakuliah, ruangan, dosen, waktu=None, kelas_khusus=None):
    waktu = waktu or build_default_slot_labels()
    kelas_khusus = kelas_khusus or {}

    day_slots = _group_slots_by_day(waktu)
    existing_slots = []
    hasil = []
    gagal = []
    sorted_matkul = sorted(matakuliah, key=lambda item: _priority(item, dosen))

    for item in sorted_matkul:
        sks = item.get("sks") or 0
        jumlah_kelas = item.get("jumlah_kelas", 1)

        if sks <= 0:
            for kelas_ke in range(1, jumlah_kelas + 1):
                gagal.append(
                    {
                        "source_index": item.get("source_index"),
                        "matkul_id": item.get("id"),
                        "kode_matkul": item.get("kode"),
                        "nama_matkul": item.get("nama", ""),
                        "dosen_id": item.get("dosen"),
                        "dosen_nama": item.get("dosen_nama", item.get("dosen", "")),
                        "kelas": item.get("kelas", ""),
                        "kelas_list": _kelas_list(item),
                        "sks": sks,
                        "kapasitas": item.get("kapasitas", 0),
                        "alasan": "SKS mata kuliah kosong atau 0.",
                    }
                )
            continue

        kandidat_ruangan = _candidate_rooms(ruangan, item)
        if not kandidat_ruangan:
            for kelas_ke in range(1, jumlah_kelas + 1):
                gagal.append(
                    {
                        "source_index": item.get("source_index"),
                        "matkul_id": item.get("id"),
                        "kode_matkul": item.get("kode"),
                        "nama_matkul": item.get("nama", ""),
                        "dosen_id": item.get("dosen"),
                        "dosen_nama": item.get("dosen_nama", item.get("dosen", "")),
                        "kelas": item.get("kelas", ""),
                        "kelas_list": _kelas_list(item),
                        "sks": sks,
                        "kapasitas": item.get("kapasitas", 0),
                        "alasan": "Tidak ada ruang yang cocok dengan kebutuhan kapasitas/tipe.",
                    }
                )
            continue

        durasi_menit, slot_butuh = _required_slots(sks)

        for kelas_ke in range(1, jumlah_kelas + 1):
            placed = False
            candidate_days = (
                _parttime_days(existing_slots, item.get("dosen"))
                if _get_dosen_type(item.get("dosen"), dosen) == "parttime"
                else HARI_LIST
            )
            kelas_ref = dict(item)
            kelas_ref["kelas"] = item.get("kelas", "")

            for hari in candidate_days:
                slots_hari = day_slots.get(hari, [])
                for index in range(len(slots_hari) - slot_butuh + 1):
                    slot_range = slots_hari[index:index + slot_butuh]
                    start_time = slot_range[0]
                    end_time = (combine_time(start_time) + timedelta(minutes=durasi_menit)).time()

                    if end_time > parse_hhmm(JAM_SELESAI):
                        continue
                    if lunch_conflict(start_time, end_time):
                        continue

                    expected_end = combine_time(start_time) + timedelta(minutes=(slot_butuh - 1) * SLOT_INTERVAL_MINUTES)
                    if slot_range[-1] != expected_end.time():
                        continue

                    for ruang in kandidat_ruangan:
                        conflict = False
                        for slot in slot_range:
                            slot_key = _slot_key(hari, slot)
                            if _is_conflict(existing_slots, slot_key, ruang, kelas_ref, kelas_khusus, start_time, end_time):
                                conflict = True
                                break

                        if conflict:
                            continue

                        hasil.append(
                            {
                                "source_index": item.get("source_index"),
                                "matkul_id": item.get("id"),
                                "kode_matkul": item.get("kode"),
                                "nama_matkul": item.get("nama", ""),
                                "dosen_id": item.get("dosen"),
                                "dosen_nama": item.get("dosen_nama", item.get("dosen", "")),
                                "kelas": item.get("kelas", ""),
                                "kelas_list": _kelas_list(item),
                                "kelas_ke": kelas_ke,
                                "sks": sks,
                                "kapasitas": item.get("kapasitas", 0),
                                "tipe_ruang": "LAB" if item.get("butuh_lab", 0) == 1 else "KELAS",
                                "hari": hari,
                                "jam_mulai": start_time,
                                "jam_selesai": end_time,
                                "ruang_kode": ruang["id"],
                                "ruang_nama": ruang.get("nama"),
                            }
                        )
                        for slot in slot_range:
                            existing_slots.append(
                                {
                                    "slot_key": _slot_key(hari, slot),
                                    "hari": hari,
                                    "ruang_id": ruang["id"],
                                    "dosen_id": item.get("dosen"),
                                    "kelas_set": set(_kelas_list(item)),
                                }
                            )
                        placed = True
                        break

                    if placed:
                        break
                if placed:
                    break

            if not placed:
                gagal.append(
                    {
                        "source_index": item.get("source_index"),
                        "matkul_id": item.get("id"),
                        "kode_matkul": item.get("kode"),
                        "nama_matkul": item.get("nama", ""),
                        "dosen_id": item.get("dosen"),
                        "dosen_nama": item.get("dosen_nama", item.get("dosen", "")),
                        "kelas": item.get("kelas", ""),
                        "kelas_list": _kelas_list(item),
                        "sks": sks,
                        "kapasitas": item.get("kapasitas", 0),
                        "alasan": "Tidak ditemukan slot waktu dan ruangan yang memenuhi aturan.",
                    }
                )

    return hasil, gagal


def save_schedule_result(batch, jadwal, gagal, snapshot=None):
    gagal = _remove_resolved_failures(jadwal, gagal)

    JadwalKuliah.objects.filter(batch=batch).delete()
    JadwalGagal.objects.filter(batch=batch).delete()

    jadwal_objects = [
        JadwalKuliah(
            batch=batch,
            matkul_id=item.get("matkul_id"),
            kode_matkul=item.get("kode_matkul") or "",
            nama_matkul=item.get("nama_matkul") or "",
            dosen_id=item.get("dosen_id"),
            dosen_nama=item.get("dosen_nama") or "",
            kelas=item.get("kelas") or "",
            kelas_list=item.get("kelas_list") or [],
            sks=item.get("sks") or 0,
            kapasitas=item.get("kapasitas") or 0,
            tipe_ruang=item.get("tipe_ruang") or "KELAS",
            hari=item.get("hari"),
            jam_mulai=item.get("jam_mulai"),
            jam_selesai=item.get("jam_selesai"),
            ruang_kode=item.get("ruang_kode") or "",
            ruang_nama=item.get("ruang_nama"),
        )
        for item in jadwal
    ]
    gagal_objects = [
        JadwalGagal(
            batch=batch,
            source_index=item.get("source_index"),
            matkul_id=item.get("matkul_id"),
            kode_matkul=item.get("kode_matkul"),
            nama_matkul=item.get("nama_matkul") or "",
            dosen_id=item.get("dosen_id"),
            dosen_nama=item.get("dosen_nama") or "",
            kelas=item.get("kelas") or "",
            kelas_list=item.get("kelas_list") or [],
            sks=item.get("sks") or 0,
            kapasitas=item.get("kapasitas") or 0,
            alasan=item.get("alasan") or "",
        )
        for item in gagal
    ]

    if jadwal_objects:
        JadwalKuliah.objects.bulk_create(jadwal_objects)
    if gagal_objects:
        JadwalGagal.objects.bulk_create(gagal_objects)

    batch.total_jadwal = len(jadwal_objects)
    batch.total_gagal = len(gagal_objects)
    batch.status = "GENERATED"
    batch.generated_at = timezone.now()
    if snapshot is not None:
        batch.input_snapshot = snapshot
    batch.save(update_fields=["total_jadwal", "total_gagal", "status", "generated_at", "input_snapshot", "updated_at"])
    return batch


def generate_and_save_batch(batch, snapshot=None):
    snapshot = snapshot or batch.input_snapshot or {}
    if not snapshot.get("ruangan"):
        snapshot = dict(snapshot)
        snapshot["ruangan"] = get_default_ruangan_payload()
    jadwal, gagal = generate_schedule(
        matakuliah=snapshot.get("matakuliah", []),
        ruangan=snapshot.get("ruangan", []),
        dosen=snapshot.get("dosen", []),
        waktu=snapshot.get("waktu"),
        kelas_khusus=snapshot.get("kelas_khusus"),
    )
    save_schedule_result(batch, jadwal, gagal, snapshot=snapshot)
    return jadwal, gagal


def create_batch_with_results(payload, file_input=None, nama=None, tahun_akademik="", semester="GENAP", versi=1, catatan=None):
    batch = BatchJadwal.objects.create(
        nama=nama or f"Batch {tahun_akademik} {semester} v{versi}",
        tahun_akademik=tahun_akademik,
        semester=semester,
        versi=versi,
        file_input=file_input,
        catatan=catatan,
        input_snapshot=payload,
    )
    jadwal, gagal = generate_and_save_batch(batch, snapshot=payload)
    return batch, jadwal, gagal
