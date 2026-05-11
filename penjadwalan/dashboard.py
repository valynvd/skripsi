import streamlit as st
import pandas as pd
import io
from html import escape
from datetime import datetime, timedelta

from penjadwalan import generate_jadwal

st.set_page_config(layout="wide")

st.title("Automatic Course Scheduling System")

st.write("Upload Excel file untuk membuat jadwal otomatis")

REQUIRED_COLUMNS = ["MKKODE", "NAMAMK", "KELAS", "Dosen", "STATUS FM", "SKS"]


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


def format_hari(day_code):
    hari_map = {
        "Mon": "Senin",
        "Tue": "Selasa",
        "Wed": "Rabu",
        "Thu": "Kamis",
        "Fri": "Jumat",
    }
    return hari_map.get(day_code, day_code)


def day_label_to_code(day_label):
    reverse_map = {
        "Senin": "Mon",
        "Selasa": "Tue",
        "Rabu": "Wed",
        "Kamis": "Thu",
        "Jumat": "Fri",
    }
    return reverse_map.get(day_label, day_label)


def calculate_end_time(start_time, sks):
    start_dt = datetime.strptime(start_time, "%H:%M")
    end_dt = start_dt + timedelta(minutes=int(sks) * 50)
    return end_dt.strftime("%H:%M")


def build_visual_schedule_from_result(df_result):
    schedule_rows = df_result[
        (df_result["Hari"] != "") &
        (df_result["Mulai"] != "") &
        (df_result["Selesai"] != "") &
        (df_result["Ruangan"] != "")
    ].copy()

    if schedule_rows.empty:
        return pd.DataFrame()

    schedule_rows["hari"] = schedule_rows["Hari"].apply(day_label_to_code)
    schedule_rows["start"] = schedule_rows["Mulai"]
    schedule_rows["end"] = schedule_rows["Selesai"]
    schedule_rows["ruang"] = schedule_rows["Ruangan"]
    schedule_rows["matkul_id"] = schedule_rows["MKKODE"]
    schedule_rows["matkul"] = schedule_rows["NAMAMK"]
    schedule_rows["kelas"] = schedule_rows["Kelas Gabungan"].where(
        schedule_rows["Kelas Gabungan"] != "",
        schedule_rows["KELAS"]
    )
    schedule_rows["dosen"] = schedule_rows["Dosen"]

    return schedule_rows


def time_overlap(start_a, end_a, start_b, end_b):
    start_a_dt = datetime.strptime(start_a, "%H:%M")
    end_a_dt = datetime.strptime(end_a, "%H:%M")
    start_b_dt = datetime.strptime(start_b, "%H:%M")
    end_b_dt = datetime.strptime(end_b, "%H:%M")
    return start_a_dt < end_b_dt and start_b_dt < end_a_dt


def validate_manual_override(df_result, row_index, hari, mulai, selesai, ruangan, ignored_indices=None):
    issues = []
    selected_row = df_result.loc[row_index]
    ignored_index_set = set(ignored_indices or [])

    if datetime.strptime(mulai, "%H:%M") < datetime.strptime("13:00", "%H:%M") and datetime.strptime(selesai, "%H:%M") > datetime.strptime("12:00", "%H:%M"):
        issues.append("Jadwal melewati jam istirahat 12:00 - 13:00.")

    if normalize_lab_value(selected_row.get("LAB", "")) == 1 and ruangan != "Lab":
        issues.append("Mata kuliah ini ditandai LAB, jadi seharusnya ditempatkan di ruang Lab.")

    if normalize_lab_value(selected_row.get("LAB", "")) == 0 and ruangan == "Lab":
        issues.append("Mata kuliah non-lab tidak disarankan ditempatkan di ruang Lab.")

    for idx, row in df_result.iterrows():
        if idx == row_index or idx in ignored_index_set or row["Hari"] != hari or row["Mulai"] == "" or row["Selesai"] == "":
            continue

        if not time_overlap(mulai, selesai, row["Mulai"], row["Selesai"]):
            continue

        if row["Ruangan"] == ruangan:
            issues.append(f"Ruangan bentrok dengan {row['MKKODE']} - {row['NAMAMK']}.")

        if row["Dosen"] == selected_row["Dosen"]:
            issues.append(f"Dosen bentrok dengan {row['MKKODE']} - {row['NAMAMK']}.")

        kelas_aktif = selected_row["Kelas Gabungan"] if selected_row["Kelas Gabungan"] else selected_row["KELAS"]
        kelas_lain = row["Kelas Gabungan"] if row["Kelas Gabungan"] else row["KELAS"]
        kelas_aktif_set = {item.strip() for item in str(kelas_aktif).split("/")}
        kelas_lain_set = {item.strip() for item in str(kelas_lain).split("/")}

        if kelas_aktif_set.intersection(kelas_lain_set):
            issues.append(f"Kelas bentrok dengan {row['MKKODE']} - {row['NAMAMK']}.")

    deduped_issues = []
    for issue in issues:
        if issue not in deduped_issues:
            deduped_issues.append(issue)

    return deduped_issues


def get_related_row_indices(df_result, row_index, apply_to_group):
    if not apply_to_group:
        return [row_index]

    selected_row = df_result.loc[row_index]
    kelas_gabungan = str(selected_row.get("Kelas Gabungan", "")).strip()

    if not kelas_gabungan:
        return [row_index]

    mask = (
        (df_result["MKKODE"] == selected_row["MKKODE"]) &
        (df_result["Dosen"] == selected_row["Dosen"]) &
        (df_result["Kelas Gabungan"] == selected_row["Kelas Gabungan"])
    )
    return df_result[mask].index.tolist()


def build_day_summary(df_jadwal):
    day_order = ["Mon", "Tue", "Wed", "Thu", "Fri"]
    summary_rows = []

    for day_code in day_order:
        total = 0
        if not df_jadwal.empty:
            total = int((df_jadwal["hari"] == day_code).sum())
        summary_rows.append({
            "Hari": format_hari(day_code),
            "Jumlah Jadwal": total
        })

    return pd.DataFrame(summary_rows)


def build_weekly_schedule_view(df_jadwal):
    if df_jadwal.empty:
        return pd.DataFrame()

    weekly_rows = df_jadwal.copy()
    weekly_rows["Hari"] = weekly_rows["hari"].apply(format_hari)
    weekly_rows["Jam"] = weekly_rows["start"] + " - " + weekly_rows["end"]
    weekly_rows["Card"] = weekly_rows.apply(
        lambda row: {
            "kode": str(row["matkul_id"]).strip(),
            "matkul": str(row["matkul"]).strip(),
            "kelas": str(row["kelas"]).strip(),
            "dosen": str(row["dosen"]).strip(),
            "ruang": str(row["ruang"]).strip(),
        },
        axis=1
    )

    pivot = weekly_rows.pivot_table(
        index="Jam",
        columns="Hari",
        values="Card",
        aggfunc=lambda values: list(values),
        fill_value=""
    )

    day_columns = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
    pivot = pivot.reindex(columns=day_columns, fill_value="")

    return pivot.sort_index()


def render_weekly_schedule_matrix(weekly_schedule_view):
    if weekly_schedule_view.empty:
        st.write("Belum ada jadwal untuk divisualisasikan.")
        return

    styles = """
    <style>
    .schedule-matrix {
        width: 100%;
        border-collapse: separate;
        border-spacing: 8px;
    }
    .schedule-matrix th {
        background: #1f2937;
        color: #f9fafb;
        padding: 12px;
        border-radius: 10px;
        font-size: 0.95rem;
        text-align: center;
    }
    .schedule-matrix td {
        vertical-align: top;
        background: #111827;
        border: 1px solid #374151;
        border-radius: 12px;
        padding: 10px;
        min-width: 180px;
    }
    .schedule-matrix .time-cell {
        background: #0f172a;
        color: #e5e7eb;
        font-weight: 600;
        white-space: nowrap;
    }
    .course-card {
        background: #1e3a5f;
        border-left: 4px solid #60a5fa;
        border-radius: 10px;
        padding: 8px 10px;
        margin-bottom: 8px;
        color: #eff6ff;
        line-height: 1.35;
    }
    .course-card:last-child {
        margin-bottom: 0;
    }
    .course-code {
        font-weight: 700;
        font-size: 0.92rem;
    }
    .course-meta {
        color: #dbeafe;
        font-size: 0.84rem;
    }
    .empty-cell {
        color: #94a3b8;
        text-align: center;
        padding-top: 12px;
        font-size: 0.85rem;
    }
    </style>
    """

    html = [styles, "<table class='schedule-matrix'>"]
    html.append("<thead><tr><th>Jam</th>")
    for day in weekly_schedule_view.columns:
        html.append(f"<th>{escape(str(day))}</th>")
    html.append("</tr></thead><tbody>")

    for time_label, row in weekly_schedule_view.iterrows():
        html.append("<tr>")
        html.append(f"<td class='time-cell'>{escape(str(time_label))}</td>")

        for day in weekly_schedule_view.columns:
            cell_value = row[day]
            html.append("<td>")

            if isinstance(cell_value, list) and cell_value:
                for item in cell_value:
                    html.append(
                        "<div class='course-card'>"
                        f"<div class='course-code'>{escape(item['kode'])}</div>"
                        f"<div>{escape(item['matkul'])}</div>"
                        f"<div class='course-meta'>{escape(item['kelas'])}</div>"
                        f"<div class='course-meta'>Dosen: {escape(item['dosen'])}</div>"
                        f"<div class='course-meta'>Ruang: {escape(item['ruang'])}</div>"
                        "</div>"
                    )
            else:
                html.append("<div class='empty-cell'>-</div>")

            html.append("</td>")

        html.append("</tr>")

    html.append("</tbody></table>")
    st.markdown("".join(html), unsafe_allow_html=True)


def build_peak_time_summary(df_jadwal):
    if df_jadwal.empty:
        return pd.DataFrame()

    peak = df_jadwal.copy()
    peak["Jam"] = peak["start"] + " - " + peak["end"]
    summary = peak.groupby("Jam").size().reset_index(name="Jumlah Jadwal")
    return summary.sort_values(by=["Jumlah Jadwal", "Jam"], ascending=[False, True]).reset_index(drop=True)


def build_empty_slot_summary(df_jadwal, waktu, ruangan):
    empty_rows = []

    for slot in waktu:
        day_code, start_time = slot.split("_")
        slot_start = datetime.strptime(start_time, "%H:%M")
        slot_end = slot_start + timedelta(minutes=30)
        slot_end_str = slot_end.strftime("%H:%M")

        for ruang in ruangan:
            occupied = False

            if not df_jadwal.empty:
                same_room_rows = df_jadwal[
                    (df_jadwal["hari"] == day_code) &
                    (df_jadwal["ruang"].astype(str) == str(ruang["id"]))
                ]

                for _, row in same_room_rows.iterrows():
                    if time_overlap(
                        start_time,
                        slot_end_str,
                        str(row["start"]),
                        str(row["end"])
                    ):
                        occupied = True
                        break

            if not occupied:
                empty_rows.append({
                    "Hari": format_hari(day_code),
                    "Jam": f"{start_time} - {slot_end_str}",
                    "Ruangan": ruang["id"],
                    "Tipe Ruangan": ruang.get("tipe", "kelas").upper(),
                })

    if not empty_rows:
        return pd.DataFrame(), pd.DataFrame()

    detail_df = pd.DataFrame(empty_rows)
    summary_df = (
        detail_df.groupby("Hari")
        .size()
        .reset_index(name="Jumlah Slot Kosong")
    )

    day_order = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"]
    summary_df["Hari"] = pd.Categorical(summary_df["Hari"], categories=day_order, ordered=True)
    summary_df = summary_df.sort_values("Hari").reset_index(drop=True)

    return summary_df, detail_df


def build_scheduler_courses(df_input, gabungkan_kelas):
    matakuliah = []

    if gabungkan_kelas:
        grouped = df_input.groupby(
            ["MKKODE", "NAMAMK", "Dosen", "STATUS FM", "SKS"],
            dropna=False,
            sort=False
        )

        for _, group in grouped:
            source_indices = group.index.tolist()
            kelas_list = [str(value) for value in group["KELAS"].tolist()]
            sks_value = int(group["SKS"].iloc[0])

            if sks_value <= 0:
                for row_index in source_indices:
                    df_input.loc[row_index, "Status Jadwal"] = "SKS harus lebih dari 0"
                continue

            matakuliah.append({
                "source_index": source_indices[0],
                "source_indices": source_indices,
                "id": group["MKKODE"].iloc[0],
                "nama": group["NAMAMK"].iloc[0],
                "dosen": group["Dosen"].iloc[0],
                "kelas": " / ".join(kelas_list),
                "kelas_list": kelas_list,
                "sks": sks_value,
                "kapasitas": int(group["JMLMHSW"].fillna(0).sum()) if "JMLMHSW" in group.columns else 0,
                "butuh_lab": 1 if "LAB" in group.columns and group["LAB"].apply(normalize_lab_value).max() == 1 else 0
            })

        return matakuliah

    for i, row in df_input.iterrows():
        sks_value = int(row["SKS"])

        if sks_value <= 0:
            df_input.loc[i, "Status Jadwal"] = "SKS harus lebih dari 0"
            continue

        matakuliah.append({
            "source_index": i,
            "source_indices": [i],
            "id": row["MKKODE"],
            "nama": row["NAMAMK"],
            "dosen": row["Dosen"],
            "kelas": row["KELAS"],
            "kelas_list": [row["KELAS"]],
            "sks": sks_value,
            "kapasitas": int(row["JMLMHSW"]) if "JMLMHSW" in df_input.columns and pd.notna(row["JMLMHSW"]) else 0,
            "butuh_lab": normalize_lab_value(row["LAB"]) if "LAB" in df_input.columns else 0
        })

    return matakuliah

# ======================================
# SLOT WAKTU SISTEM
# ======================================

waktu = [
"Mon_08:00","Mon_08:30","Mon_09:00","Mon_09:30","Mon_10:00","Mon_10:30","Mon_11:00","Mon_11:30",
"Mon_13:00","Mon_13:30","Mon_14:00","Mon_14:30","Mon_15:00","Mon_15:30","Mon_16:00","Mon_16:30",

"Tue_08:00","Tue_08:30","Tue_09:00","Tue_09:30","Tue_10:00","Tue_10:30","Tue_11:00","Tue_11:30",
"Tue_13:00","Tue_13:30","Tue_14:00","Tue_14:30","Tue_15:00","Tue_15:30","Tue_16:00","Tue_16:30",

"Wed_08:00","Wed_08:30","Wed_09:00","Wed_09:30","Wed_10:00","Wed_10:30","Wed_11:00","Wed_11:30",
"Wed_13:00","Wed_13:30","Wed_14:00","Wed_14:30","Wed_15:00","Wed_15:30","Wed_16:00","Wed_16:30",

"Thu_08:00","Thu_08:30","Thu_09:00","Thu_09:30","Thu_10:00","Thu_10:30","Thu_11:00","Thu_11:30",
"Thu_13:00","Thu_13:30","Thu_14:00","Thu_14:30","Thu_15:00","Thu_15:30","Thu_16:00","Thu_16:30",

"Fri_08:00","Fri_08:30","Fri_09:00","Fri_09:30","Fri_10:00","Fri_10:30","Fri_11:00","Fri_11:30",
"Fri_13:00","Fri_13:30","Fri_14:00","Fri_14:30","Fri_15:00","Fri_15:30","Fri_16:00","Fri_16:30",
]

# ======================================
# DATA DEFAULT (NANTI BISA DARI DATABASE)
# ======================================

ruangan = [
{"id":"3011","capacity":40,"tipe":"kelas"},
{"id":"3012","capacity":40,"tipe":"kelas"},
{"id":"3013","capacity":40,"tipe":"kelas"},
{"id":"3014","capacity":40,"tipe":"kelas"},
{"id":"3015","capacity":40,"tipe":"kelas"},
{"id":"3016","capacity":50,"tipe":"kelas"},
{"id":"3021","capacity":40,"tipe":"kelas"},
{"id":"3022","capacity":40,"tipe":"kelas"},
{"id":"3023","capacity":40,"tipe":"kelas"},
{"id":"3024","capacity":40,"tipe":"kelas"},
{"id":"3025","capacity":40,"tipe":"kelas"},
{"id":"3026","capacity":40,"tipe":"kelas"},
{"id":"3027","capacity":40,"tipe":"kelas"},
{"id":"Lab","capacity":30,"tipe":"lab"}
]

# contoh dosen
dosen = []

kelas_khusus = {}

# ======================================
# UPLOAD EXCEL
# ======================================

uploaded_file = st.file_uploader("Upload Excel Jadwal", type=["xlsx"])

if uploaded_file:
    file_bytes = uploaded_file.getvalue()

    df_input = pd.read_excel(io.BytesIO(file_bytes))
    missing_columns = [col for col in REQUIRED_COLUMNS if col not in df_input.columns]

    if missing_columns:
        st.error(
            "Kolom Excel belum lengkap. Kolom wajib: "
            + ", ".join(REQUIRED_COLUMNS)
        )
        st.stop()

    df_input["Hari"] = ""
    df_input["Mulai"] = ""
    df_input["Selesai"] = ""
    df_input["Ruangan"] = ""
    df_input["Kelas Gabungan"] = ""
    df_input["Status Jadwal"] = "Belum diproses"
    if "LAB" not in df_input.columns:
        df_input["LAB"] = ""

    gabungkan_kelas = st.checkbox(
        "Gabungkan kelas paralel dengan mata kuliah, dosen, dan SKS yang sama",
        value=True,
        help="Contoh: English Scientific Communication II untuk 3 kelas bisa dibuat satu sesi jika kapasitas ruangan mencukupi."
    )

    st.subheader("Preview Data Input")
    st.dataframe(df_input)

    # ======================================
    # BUILD DATA DOSEN OTOMATIS
    # ======================================

    unique_dosen = df_input[["Dosen","STATUS FM"]].drop_duplicates()

    for _, row in unique_dosen.iterrows():
        dosen.append({
            "id": row["Dosen"],
            "nama": row["Dosen"],
            "tipe": normalize_status_fm(row["STATUS FM"])
        })

    # ======================================
    # CONVERT DATA UNTUK SCHEDULER
    # ======================================

    matakuliah = build_scheduler_courses(df_input, gabungkan_kelas)

    # ======================================
    # GENERATE JADWAL
    # ======================================

    jadwal, gagal = generate_jadwal(matakuliah, ruangan, waktu, dosen, kelas_khusus)

    df_jadwal = pd.DataFrame(jadwal)
    df_gagal = pd.DataFrame(gagal)

    # ======================================
    # ISI KOLOM EXCEL
    # ======================================

    if not df_jadwal.empty:
        for _, row in df_jadwal.iterrows():
            kelas_gabungan = "Ya" if len(row["kelas_list"]) > 1 else "Tidak"
            daftar_kelas = " / ".join(row["kelas_list"])
            for row_index in row["source_indices"]:
                df_input.loc[row_index, "Hari"] = format_hari(row["hari"])
                df_input.loc[row_index, "Mulai"] = row["start"]
                df_input.loc[row_index, "Selesai"] = row["end"]
                df_input.loc[row_index, "Ruangan"] = row["ruang"]
                df_input.loc[row_index, "Kelas Gabungan"] = daftar_kelas if kelas_gabungan == "Ya" else ""
                df_input.loc[row_index, "Status Jadwal"] = "Berhasil"

    if not df_gagal.empty:
        for _, row in df_gagal.iterrows():
            for row_index in row["source_indices"]:
                df_input.loc[row_index, "Kelas Gabungan"] = " / ".join(row["kelas_list"]) if len(row["kelas_list"]) > 1 else ""
                df_input.loc[row_index, "Status Jadwal"] = row["alasan"]

    schedule_token = f"{uploaded_file.name}-{len(file_bytes)}-{gabungkan_kelas}"
    if st.session_state.get("schedule_token") != schedule_token:
        st.session_state["schedule_token"] = schedule_token
        st.session_state["editable_schedule_df"] = df_input.copy()

    df_result = st.session_state["editable_schedule_df"]

    st.subheader("Hasil Jadwal Otomatis")

    st.dataframe(df_result)

    st.subheader("Edit Manual untuk Admin")
    editable_statuses = {"Berhasil", "Diubah manual", "Diubah manual (perlu cek bentrok)"}
    editable_rows = df_result[df_result["Status Jadwal"].isin(editable_statuses)]

    if editable_rows.empty:
        st.info("Belum ada jadwal yang bisa diedit.")
    else:
        selected_option = st.selectbox(
            "Pilih mata kuliah yang ingin diedit",
            options=editable_rows.index.tolist(),
            format_func=lambda idx: f"{df_result.loc[idx, 'MKKODE']} | {df_result.loc[idx, 'NAMAMK']} | {df_result.loc[idx, 'KELAS']}"
        )

        selected_row = df_result.loc[selected_option]
        room_options = [ruang["id"] for ruang in ruangan if ruang["tipe"] == ("lab" if normalize_lab_value(selected_row.get("LAB", "")) == 1 else "kelas")]

        with st.form("manual_edit_form"):
            col1, col2, col3 = st.columns(3)
            new_hari = col1.selectbox("Hari", ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"], index=["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].index(selected_row["Hari"]) if selected_row["Hari"] in ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"] else 0)
            start_options = sorted({slot.split("_")[1] for slot in waktu})
            new_mulai = col2.selectbox("Jam Mulai", start_options, index=start_options.index(selected_row["Mulai"]) if selected_row["Mulai"] in start_options else 0)
            new_ruangan = col3.selectbox("Ruangan", room_options, index=room_options.index(selected_row["Ruangan"]) if selected_row["Ruangan"] in room_options else 0)
            apply_to_group = st.checkbox(
                "Terapkan ke semua baris kelas gabungan",
                value=bool(str(selected_row.get("Kelas Gabungan", "")).strip()),
                help="Jika mata kuliah ini adalah kelas gabungan, perubahan akan diterapkan ke semua kelas anggotanya."
            )
            submitted = st.form_submit_button("Simpan Perubahan Manual")

        if submitted:
            new_selesai = calculate_end_time(new_mulai, selected_row["SKS"])
            related_indices = get_related_row_indices(df_result, selected_option, apply_to_group)
            issues = validate_manual_override(
                df_result,
                selected_option,
                new_hari,
                new_mulai,
                new_selesai,
                new_ruangan,
                ignored_indices=related_indices
            )

            for row_index in related_indices:
                df_result.loc[row_index, "Hari"] = new_hari
                df_result.loc[row_index, "Mulai"] = new_mulai
                df_result.loc[row_index, "Selesai"] = new_selesai
                df_result.loc[row_index, "Ruangan"] = new_ruangan
                df_result.loc[row_index, "Status Jadwal"] = "Diubah manual" if not issues else "Diubah manual (perlu cek bentrok)"
            st.session_state["editable_schedule_df"] = df_result

            if issues:
                st.warning("Perubahan disimpan, tapi masih ada hal yang perlu dicek: " + " ".join(issues))
            else:
                if len(related_indices) > 1:
                    st.success(f"Perubahan manual berhasil disimpan untuk {len(related_indices)} baris kelas gabungan.")
                else:
                    st.success("Perubahan manual berhasil disimpan.")

    st.subheader("Ringkasan Jadwal per Hari")
    df_visual = build_visual_schedule_from_result(df_result)
    summary_df = build_day_summary(df_visual)
    st.dataframe(summary_df, use_container_width=True)

    if not df_visual.empty:
        hari_terpakai = summary_df[summary_df["Jumlah Jadwal"] > 0]["Hari"].tolist()
        if len(hari_terpakai) == 1:
            st.info(
                f"Saat ini semua jadwal yang berhasil masuk ke {hari_terpakai[0]} karena slot dan ruangan di hari itu masih mencukupi. "
                "Jika ada mata kuliah yang belum terjadwal, penyebabnya tetap harus dilihat di tabel alasan di bawah."
            )

        st.subheader("Visualisasi Jadwal Mingguan")
        weekly_schedule_view = build_weekly_schedule_view(df_visual)
        render_weekly_schedule_matrix(weekly_schedule_view)

        st.subheader("Jam Terpadat")
        peak_time_summary = build_peak_time_summary(df_visual)
        st.dataframe(peak_time_summary, use_container_width=True)

    if not df_gagal.empty:
        st.warning(
            f"{len(df_gagal)} mata kuliah belum terjadwal. "
            "Coba tambah slot waktu, tambah ruangan, atau kurangi bentrok aturan."
        )
        st.dataframe(df_gagal[["matkul_id", "matkul", "kelas", "dosen", "kapasitas", "alasan"]])

    # ======================================
    # EXPORT EXCEL
    # ======================================

    buffer = io.BytesIO()

    with pd.ExcelWriter(buffer, engine="xlsxwriter") as writer:
        df_result.to_excel(writer, index=False)

    st.download_button(
        label="Download Jadwal Excel",
        data=buffer,
        file_name="jadwal_hasil.xlsx",
        mime="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    )
