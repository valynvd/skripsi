import io
import json
from datetime import datetime

import pandas as pd

from .models import Ruangan

REQUIRED_COLUMNS = ["MKKODE", "NAMAMK", "KELAS", "Dosen", "STATUS FM", "SKS"]

DEFAULT_WAKTU = [
    "SENIN_08:00", "SENIN_08:30", "SENIN_09:00", "SENIN_09:30", "SENIN_10:00", "SENIN_10:30", "SENIN_11:00", "SENIN_11:30",
    "SENIN_13:00", "SENIN_13:30", "SENIN_14:00", "SENIN_14:30", "SENIN_15:00", "SENIN_15:30", "SENIN_16:00", "SENIN_16:30",
    "SELASA_08:00", "SELASA_08:30", "SELASA_09:00", "SELASA_09:30", "SELASA_10:00", "SELASA_10:30", "SELASA_11:00", "SELASA_11:30",
    "SELASA_13:00", "SELASA_13:30", "SELASA_14:00", "SELASA_14:30", "SELASA_15:00", "SELASA_15:30", "SELASA_16:00", "SELASA_16:30",
    "RABU_08:00", "RABU_08:30", "RABU_09:00", "RABU_09:30", "RABU_10:00", "RABU_10:30", "RABU_11:00", "RABU_11:30",
    "RABU_13:00", "RABU_13:30", "RABU_14:00", "RABU_14:30", "RABU_15:00", "RABU_15:30", "RABU_16:00", "RABU_16:30",
    "KAMIS_08:00", "KAMIS_08:30", "KAMIS_09:00", "KAMIS_09:30", "KAMIS_10:00", "KAMIS_10:30", "KAMIS_11:00", "KAMIS_11:30",
    "KAMIS_13:00", "KAMIS_13:30", "KAMIS_14:00", "KAMIS_14:30", "KAMIS_15:00", "KAMIS_15:30", "KAMIS_16:00", "KAMIS_16:30",
    "JUMAT_08:00", "JUMAT_08:30", "JUMAT_09:00", "JUMAT_09:30", "JUMAT_10:00", "JUMAT_10:30", "JUMAT_11:00", "JUMAT_11:30",
    "JUMAT_13:00", "JUMAT_13:30", "JUMAT_14:00", "JUMAT_14:30", "JUMAT_15:00", "JUMAT_15:30", "JUMAT_16:00", "JUMAT_16:30",
]

def _serialize_ruangan_instance(ruang):
    return {
        "id": ruang.kode,
        "nama": ruang.nama,
        "capacity": ruang.kapasitas,
        "tipe": str(ruang.tipe or "").lower(),
        "board_type": str(ruang.board_type or "").lower() or None,
        "prodi": ruang.prodi,
        "aktif": ruang.aktif,
    }


def get_default_ruangan_payload():
    rooms = list(Ruangan.objects.filter(aktif=True, tipe="KELAS").order_by("tipe", "nama"))
    return [_serialize_ruangan_instance(room) for room in rooms]


def normalize_lab_value(value):
    if pd.isna(value):
        return 0
    if isinstance(value, (int, float)):
        return 1 if float(value) == 1.0 else 0
    normalized = str(value).strip().lower()
    if normalized in {"1", "1.0", "ya", "yes", "y", "lab", "true"}:
        return 1
    return 0


def normalize_status_fm(status):
    value = str(status).strip().lower()
    if value == "tidak tetap":
        return "parttime"
    return "fulltime"


def _safe_int(value):
    if pd.isna(value):
        return 0
    try:
        return int(float(value))
    except (TypeError, ValueError):
        return 0


def _read_optional_text(row_or_group, columns):
    for column in columns:
        if column not in row_or_group:
            continue
        value = row_or_group[column]
        if hasattr(value, "dropna"):
            values = [str(item).strip() for item in value.dropna().tolist() if str(item).strip()]
            if values:
                return values[0]
        elif pd.notna(value):
            cleaned = str(value).strip()
            if cleaned:
                return cleaned
    return ""


def build_scheduler_courses(df_input, gabungkan_kelas):
    matakuliah = []

    if gabungkan_kelas:
        grouped = df_input.groupby(
            ["MKKODE", "NAMAMK", "Dosen", "STATUS FM", "SKS"],
            dropna=False,
            sort=False,
        )

        for _, group in grouped:
            source_indices = group.index.tolist()
            kelas_list = [str(value).strip() for value in group["KELAS"].tolist()]
            sks_value = _safe_int(group["SKS"].iloc[0])
            prodi_value = _read_optional_text(group, ["PRODI", "PRODI MK", "PROGRAM STUDI", "PRODI_MK"])

            matakuliah.append(
                {
                    "source_index": source_indices[0],
                    "source_indices": source_indices,
                    "id": str(group["MKKODE"].iloc[0]).strip(),
                    "kode": str(group["MKKODE"].iloc[0]).strip(),
                    "nama": str(group["NAMAMK"].iloc[0]).strip(),
                    "dosen": str(group["Dosen"].iloc[0]).strip(),
                    "dosen_nama": str(group["Dosen"].iloc[0]).strip(),
                    "kelas": " / ".join(kelas_list),
                    "kelas_list": kelas_list,
                    "sks": sks_value,
                    "kapasitas": _safe_int(group["JMLMHSW"].fillna(0).sum()) if "JMLMHSW" in group.columns else 0,
                    "butuh_lab": 1 if "LAB" in group.columns and group["LAB"].apply(normalize_lab_value).max() == 1 else 0,
                    "prodi": prodi_value,
                }
            )

        return matakuliah

    for index, row in df_input.iterrows():
        prodi_value = _read_optional_text(row, ["PRODI", "PRODI MK", "PROGRAM STUDI", "PRODI_MK"])
        matakuliah.append(
            {
                "source_index": index,
                "source_indices": [index],
                "id": str(row["MKKODE"]).strip(),
                "kode": str(row["MKKODE"]).strip(),
                "nama": str(row["NAMAMK"]).strip(),
                "dosen": str(row["Dosen"]).strip(),
                "dosen_nama": str(row["Dosen"]).strip(),
                "kelas": str(row["KELAS"]).strip(),
                "kelas_list": [str(row["KELAS"]).strip()],
                "sks": _safe_int(row["SKS"]),
                "kapasitas": _safe_int(row["JMLMHSW"]) if "JMLMHSW" in df_input.columns else 0,
                "butuh_lab": normalize_lab_value(row["LAB"]) if "LAB" in df_input.columns else 0,
                "prodi": prodi_value,
            }
        )

    return matakuliah


def dataframe_to_preview(dataframe):
    return json.loads(dataframe.fillna("").to_json(orient="records"))


def split_lab_rows(dataframe):
    if "LAB" not in dataframe.columns:
        return dataframe.copy(), []

    lab_mask = dataframe["LAB"].apply(normalize_lab_value) == 1
    lab_rows = dataframe[lab_mask].copy()
    schedule_rows = dataframe[~lab_mask].copy()
    return schedule_rows, dataframe_to_preview(lab_rows)


def parse_lab_excel_upload(file_bytes):
    dataframe = pd.read_excel(io.BytesIO(file_bytes))
    return build_manual_lab_schedule(dataframe)


def _read_cell(row, columns, default=""):
    for column in columns:
        if column in row and pd.notna(row[column]):
            value = str(row[column]).strip()
            if value:
                return value
    return default


def _parse_excel_time(value):
    if pd.isna(value):
        return None
    if hasattr(value, "time"):
        return value.time()
    if isinstance(value, (int, float)):
        total_minutes = round(float(value) * 24 * 60)
        hour = total_minutes // 60
        minute = total_minutes % 60
        return datetime.strptime(f"{hour:02d}:{minute:02d}", "%H:%M").time()

    text = str(value).strip()
    for fmt in ("%H:%M", "%H.%M", "%H:%M:%S"):
        try:
            return datetime.strptime(text, fmt).time()
        except ValueError:
            continue
    return None


def build_manual_lab_schedule(dataframe):
    lab_items = []
    for index, row in dataframe.iterrows():
        hari = _read_cell(row, ["Hari", "HARI", "DAY"]).upper()
        jam_mulai = _parse_excel_time(
            row.get("Jam Mulai", row.get("JAM MULAI", row.get("MULAI", row.get("START"))))
        )
        jam_selesai = _parse_excel_time(
            row.get("Jam Selesai", row.get("JAM SELESAI", row.get("SELESAI", row.get("END"))))
        )
        ruang_kode = _read_cell(row, ["Ruang", "RUANG", "Kode Ruang", "KODE RUANG", "ROOM"])

        if not hari or not jam_mulai or not jam_selesai or not ruang_kode:
            continue

        kode_matkul = _read_cell(row, ["MKKODE", "Kode MK", "KODE MK", "KODE"])
        lab_items.append(
            {
                "source_index": index,
                "matkul_id": kode_matkul,
                "kode_matkul": kode_matkul,
                "nama_matkul": _read_cell(row, ["NAMAMK", "Nama Mata Kuliah", "Mata Kuliah", "NAMA MK"]),
                "dosen_id": _read_cell(row, ["Dosen", "DOSEN", "Dosen ID"]),
                "dosen_nama": _read_cell(row, ["Dosen", "DOSEN", "Nama Dosen"]),
                "kelas": _read_cell(row, ["KELAS", "Kelas"]),
                "kelas_list": [_read_cell(row, ["KELAS", "Kelas"])],
                "sks": _safe_int(row.get("SKS")),
                "kapasitas": _safe_int(row.get("JMLMHSW")) if "JMLMHSW" in dataframe.columns else 0,
                "tipe_ruang": "LAB",
                "hari": hari,
                "jam_mulai": jam_mulai.strftime("%H:%M"),
                "jam_selesai": jam_selesai.strftime("%H:%M"),
                "ruang_kode": ruang_kode,
                "ruang_nama": _read_cell(row, ["Nama Ruang", "NAMA RUANG", "Ruang", "RUANG"], ruang_kode),
                "catatan": "Manual LAB",
            }
        )

    return lab_items


def build_dosen_from_dataframe(df_input):
    dosen = []
    unique_dosen = df_input[["Dosen", "STATUS FM"]].drop_duplicates()
    for _, row in unique_dosen.iterrows():
        dosen.append(
            {
                "id": str(row["Dosen"]).strip(),
                "nama": str(row["Dosen"]).strip(),
                "tipe": normalize_status_fm(row["STATUS FM"]),
            }
        )
    return dosen


def parse_excel_upload(file_bytes, gabungkan_kelas=True, ruangan=None, waktu=None, kelas_khusus=None, lab_manual=None):
    dataframe = pd.read_excel(io.BytesIO(file_bytes))
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in dataframe.columns]
    if missing_columns:
        raise ValueError(
            "Kolom Excel belum lengkap. Kolom wajib: " + ", ".join(REQUIRED_COLUMNS)
        )

    if "LAB" not in dataframe.columns:
        dataframe["LAB"] = ""

    schedule_dataframe, lab_rows = split_lab_rows(dataframe)
    lab_manual = lab_manual or []

    payload = {
        "matakuliah": build_scheduler_courses(schedule_dataframe, gabungkan_kelas=gabungkan_kelas),
        "ruangan": ruangan or get_default_ruangan_payload(),
        "dosen": build_dosen_from_dataframe(dataframe),
        "waktu": waktu or DEFAULT_WAKTU,
        "kelas_khusus": kelas_khusus or {},
        "lab_manual": lab_manual,
        "lab_excluded": lab_rows,
    }

    preview = dataframe_to_preview(dataframe)
    return payload, preview
