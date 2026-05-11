from datetime import datetime

def get_day(slot):
    return slot.split("_")[0]


def get_kelas_ids(matkul_or_jadwal):
    kelas_list = matkul_or_jadwal.get("kelas_list")
    if kelas_list:
        return list(kelas_list)
    return [matkul_or_jadwal["kelas"]]


def get_tipe_dosen(dosen_id, dosen_list):
    for d in dosen_list:
        if d["id"] == dosen_id:
            return d["tipe"]
    return None


def to_time(t):
    return datetime.strptime(t, "%H:%M")

# cek kelas khusus
def kelas_blocked(matkul, slot, kelas_khusus):
    for kelas_id in get_kelas_ids(matkul):
        if kelas_id in kelas_khusus and slot in kelas_khusus[kelas_id]:
            return True
    return False


def ruang_conflict(jadwal, slot, ruang):
    for j in jadwal:
        if j["waktu"] == slot and j["ruang"] == ruang["id"]:
            return True
    return False


def dosen_conflict(jadwal, slot, matkul):
    for j in jadwal:
        if j["waktu"] == slot and j["dosen"] == matkul["dosen"]:
            return True
    return False


def kelas_conflict(jadwal, slot, matkul):
    kelas_matkul = set(get_kelas_ids(matkul))
    for j in jadwal:
        kelas_terjadwal = set(get_kelas_ids(j))
        if j["waktu"] == slot and kelas_matkul.intersection(kelas_terjadwal):
            return True
    return False

# cek lunch
def lunch_conflict(start_time, end_time):

    start_dt = to_time(start_time)
    end_dt = to_time(end_time)

    lunch_start = to_time("12:00")
    lunch_end = to_time("13:00")

    if start_dt < lunch_end and end_dt > lunch_start:
        return True

    return False


def is_conflict(jadwal, slot, ruang, matkul, kelas_khusus, start_time, end_time):

    if kelas_blocked(matkul, slot, kelas_khusus):
        return True

    if ruang_conflict(jadwal, slot, ruang):
        return True

    if dosen_conflict(jadwal, slot, matkul):
        return True

    if kelas_conflict(jadwal, slot, matkul):
        return True

    if lunch_conflict(start_time, end_time):
        return True

    return False
