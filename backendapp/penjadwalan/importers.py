import io
import json

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
    rooms = list(Ruangan.objects.filter(aktif=True).order_by("tipe", "nama"))
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


def parse_excel_upload(file_bytes, gabungkan_kelas=True, ruangan=None, waktu=None, kelas_khusus=None):
    dataframe = pd.read_excel(io.BytesIO(file_bytes))
    missing_columns = [column for column in REQUIRED_COLUMNS if column not in dataframe.columns]
    if missing_columns:
        raise ValueError(
            "Kolom Excel belum lengkap. Kolom wajib: " + ", ".join(REQUIRED_COLUMNS)
        )

    if "LAB" not in dataframe.columns:
        dataframe["LAB"] = ""

    payload = {
        "matakuliah": build_scheduler_courses(dataframe, gabungkan_kelas=gabungkan_kelas),
        "ruangan": ruangan or get_default_ruangan_payload(),
        "dosen": build_dosen_from_dataframe(dataframe),
        "waktu": waktu or DEFAULT_WAKTU,
        "kelas_khusus": kelas_khusus or {},
    }

    preview = json.loads(dataframe.fillna("").to_json(orient="records"))
    return payload, preview
