# it.infra@prasetiyamulya.ac.id
import math
from datetime import datetime, timedelta
from ketentuan import is_conflict, get_day, get_tipe_dosen


def to_time(t):
    return datetime.strptime(t, "%H:%M")


def has_base_slot_option(waktu, slot_butuh, durasi_menit):
    for i in range(len(waktu) - slot_butuh + 1):
        slot_range = waktu[i:i + slot_butuh]
        hari_awal = get_day(slot_range[0])
        hari_akhir = get_day(slot_range[-1])

        if hari_awal != hari_akhir:
            continue

        start_time = slot_range[0].split("_")[1]
        start_dt = to_time(start_time)
        end_dt = start_dt + timedelta(minutes=durasi_menit)
        end_time = end_dt.strftime("%H:%M")

        if to_time(start_time) < to_time("13:00") and to_time(end_time) > to_time("12:00"):
            continue

        return True

    return False


def generate_jadwal(matakuliah, ruangan, waktu, dosen, kelas_khusus):

    jadwal = []
    jadwal_slot = []
    gagal = []
    day_slots = {}
    day_order = []

    for slot in waktu:
        day = get_day(slot)
        if day not in day_slots:
            day_slots[day] = []
            day_order.append(day)
        day_slots[day].append(slot)

    # prioritas penjadwalan
    def priority(m):
        tipe = get_tipe_dosen(m["dosen"], dosen)

        if tipe == "parttime":
            return (0, -m["sks"])
        else:
            return (1, -m["sks"])

    matakuliah_sorted = sorted(matakuliah, key=priority)

    # penjadwalan
    for matkul in matakuliah_sorted:

        tipe_dosen = get_tipe_dosen(matkul["dosen"], dosen)

        placed = False

        sks = matkul["sks"]
        if sks <= 0:
            gagal.append({
                "source_index": matkul.get("source_index"),
                "source_indices": matkul.get("source_indices", [matkul.get("source_index")]),
                "matkul_id": matkul["id"],
                "matkul": matkul["nama"],
                "dosen": matkul["dosen"],
                "kelas": matkul["kelas"],
                "kelas_list": matkul.get("kelas_list", [matkul["kelas"]]),
                "kapasitas": matkul.get("kapasitas", 0),
                "alasan": "SKS harus lebih dari 0."
            })
            continue

        durasi_menit = sks * 50

        slot_butuh = math.ceil(durasi_menit / 30)
        kebutuhan_kapasitas = matkul.get("kapasitas", 0)
        butuh_lab = matkul.get("butuh_lab", 0) == 1
        kandidat_tipe_ruang = [
            ruang for ruang in ruangan
            if ruang.get("tipe", "kelas") == ("lab" if butuh_lab else "kelas")
        ]
        kapasitas_maks_ruangan = max((ruang.get("capacity", 0) for ruang in kandidat_tipe_ruang), default=0)

        if not has_base_slot_option(waktu, slot_butuh, durasi_menit):
            gagal.append({
                "source_index": matkul.get("source_index"),
                "source_indices": matkul.get("source_indices", [matkul.get("source_index")]),
                "matkul_id": matkul["id"],
                "matkul": matkul["nama"],
                "dosen": matkul["dosen"],
                "kelas": matkul["kelas"],
                "kelas_list": matkul.get("kelas_list", [matkul["kelas"]]),
                "kapasitas": kebutuhan_kapasitas,
                "alasan": f"Durasi kuliah {durasi_menit} menit ({sks} SKS) tidak muat dalam slot harian yang tersedia."
            })
            continue

        if kebutuhan_kapasitas > kapasitas_maks_ruangan:
            gagal.append({
                "source_index": matkul.get("source_index"),
                "source_indices": matkul.get("source_indices", [matkul.get("source_index")]),
                "matkul_id": matkul["id"],
                "matkul": matkul["nama"],
                "dosen": matkul["dosen"],
                "kelas": matkul["kelas"],
                "kelas_list": matkul.get("kelas_list", [matkul["kelas"]]),
                "kapasitas": kebutuhan_kapasitas,
                "alasan": f"Kapasitas mahasiswa ({kebutuhan_kapasitas}) melebihi kapasitas ruangan terbesar ({kapasitas_maks_ruangan})."
            })
            continue

        if tipe_dosen == "parttime":
            existing_days = []
            for day in day_order:
                total_slot_hari = sum(
                    1 for item in jadwal_slot
                    if item["dosen"] == matkul["dosen"] and get_day(item["waktu"]) == day
                )
                if total_slot_hari > 0:
                    existing_days.append((day, total_slot_hari))

            prioritized_days = [day for day, _ in sorted(existing_days, key=lambda item: (-item[1], day_order.index(item[0])))]
            candidate_days = prioritized_days + [day for day in day_order if day not in prioritized_days]

            for current_day in candidate_days:
                slots_hari = day_slots[current_day]

                for i in range(len(slots_hari) - slot_butuh + 1):
                    slot_range = slots_hari[i:i + slot_butuh]
                    start_time = slot_range[0].split("_")[1]

                    start_dt = to_time(start_time)
                    end_dt = start_dt + timedelta(minutes=durasi_menit)
                    end_time = end_dt.strftime("%H:%M")

                    kandidat_ruangan = [
                        ruang for ruang in kandidat_tipe_ruang
                        if ruang.get("capacity", 0) >= kebutuhan_kapasitas
                    ]

                    for ruang in kandidat_ruangan:
                        conflict = False

                        for s in slot_range:
                            if is_conflict(
                                jadwal_slot,
                                s,
                                ruang,
                                matkul,
                                kelas_khusus,
                                start_time,
                                end_time
                            ):
                                conflict = True
                                break

                        if not conflict:
                            jadwal.append({
                                "source_index": matkul.get("source_index"),
                                "source_indices": matkul.get("source_indices", [matkul.get("source_index")]),
                                "matkul_id": matkul["id"],
                                "matkul": matkul["nama"],
                                "dosen": matkul["dosen"],
                                "kelas": matkul["kelas"],
                                "kelas_list": matkul.get("kelas_list", [matkul["kelas"]]),
                                "hari": current_day,
                                "start": start_time,
                                "end": end_time,
                                "ruang": ruang["id"]
                            })

                            for s in slot_range:
                                jadwal_slot.append({
                                    "waktu": s,
                                    "ruang": ruang["id"],
                                    "dosen": matkul["dosen"],
                                    "kelas": matkul["kelas"],
                                    "kelas_list": matkul.get("kelas_list", [matkul["kelas"]])
                                })

                            placed = True
                            break

                    if placed:
                        break

                if placed:
                    break
        else:
            for i in range(len(waktu) - slot_butuh + 1):

                slot_range = waktu[i:i + slot_butuh]

                hari_awal = get_day(slot_range[0])
                hari_akhir = get_day(slot_range[-1])

                if hari_awal != hari_akhir:
                    continue

                start_time = slot_range[0].split("_")[1]

                start_dt = to_time(start_time)
                end_dt = start_dt + timedelta(minutes=durasi_menit)

                end_time = end_dt.strftime("%H:%M")

                kandidat_ruangan = [
                    ruang for ruang in kandidat_tipe_ruang
                    if ruang.get("capacity", 0) >= kebutuhan_kapasitas
                ]

                for ruang in kandidat_ruangan:

                    conflict = False

                    for s in slot_range:

                        if is_conflict(
                            jadwal_slot,
                            s,
                            ruang,
                            matkul,
                            kelas_khusus,
                            start_time,
                            end_time
                        ):
                            conflict = True
                            break

                    if not conflict:

                        jadwal.append({
                            "source_index": matkul.get("source_index"),
                            "source_indices": matkul.get("source_indices", [matkul.get("source_index")]),
                            "matkul_id": matkul["id"],
                            "matkul": matkul["nama"],
                            "dosen": matkul["dosen"],
                            "kelas": matkul["kelas"],
                            "kelas_list": matkul.get("kelas_list", [matkul["kelas"]]),
                            "hari": hari_awal,
                            "start": start_time,
                            "end": end_time,
                            "ruang": ruang["id"]
                        })

                        for s in slot_range:
                            jadwal_slot.append({
                                "waktu": s,
                                "ruang": ruang["id"],
                                "dosen": matkul["dosen"],
                                "kelas": matkul["kelas"],
                                "kelas_list": matkul.get("kelas_list", [matkul["kelas"]])
                            })

                        placed = True
                        break

                if placed:
                    break

        if not placed:
            gagal.append({
                "source_index": matkul.get("source_index"),
                "source_indices": matkul.get("source_indices", [matkul.get("source_index")]),
                "matkul_id": matkul["id"],
                "matkul": matkul["nama"],
                "dosen": matkul["dosen"],
                "kelas": matkul["kelas"],
                "kelas_list": matkul.get("kelas_list", [matkul["kelas"]]),
                "kapasitas": matkul.get("kapasitas", 0),
                "alasan": "Tidak ditemukan slot waktu dan ruangan yang memenuhi semua aturan."
            })

    return jadwal, gagal
