import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from 'react-query';
import {
  BiChevronDown,
  BiChevronUp,
  BiEdit,
  BiExport,
  BiRefresh,
  BiSave,
  BiUpload,
  BiX,
} from 'react-icons/bi';

import BreadCrumbs from '../../components/BreadCrumbs';
import { AlertError, AlertSuccess } from '../../components/Alert';
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  usePenjadwalanBatchDetail,
  usePenjadwalanBatches,
  useRegeneratePenjadwalanBatch,
  useUpdatePenjadwalanJadwal,
  useUploadPenjadwalanExcel,
} from '../../hooks/usePenjadwalan';

const initialForm = {
  nama: 'Jadwal Genap 2025/2026',
  tahun_akademik: '2025/2026',
  semester: 'GENAP',
  versi: 1,
};

const initialEditForm = {
  id: null,
  kode_matkul: '',
  nama_matkul: '',
  hari: 'SENIN',
  jam_mulai: '07:00',
  ruang_kode: '',
  catatan: '',
};

const hariOptions = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
const selectedScheduleStorageKey = 'penjadwalan:selectedScheduleId';

const formatSksKosong = (sksKosong) => {
  const total = Number(sksKosong || 0);
  if (!total) {
    return '-';
  }
  return `${total} SKS`;
};

const JadwalList = ({ schedules, selectedScheduleId, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900">Daftar Jadwal</p>
        <p className="text-sm text-gray-500 mt-1">
          Pilih jadwal untuk melihat hasil generate yang sudah tersimpan.
        </p>
      </div>
      <div className="max-h-[30rem] overflow-auto">
        {schedules.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">
            Belum ada jadwal yang tersimpan.
          </div>
        ) : (
          schedules.map((schedule) => {
            const active = selectedScheduleId === schedule.id;
            return (
              <button
                key={schedule.id}
                type="button"
                className={`w-full text-left px-5 py-4 border-b border-gray-100 transition ${
                  active ? 'bg-primary-400/10' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelect(schedule.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{schedule.nama}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {schedule.tahun_akademik} - {schedule.semester} - v{schedule.versi}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {schedule.status}
                  </span>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>Terjadwal: {schedule.total_jadwal}</span>
                  <span>Belum masuk: {schedule.total_gagal}</span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

const ResultTable = ({ title, columns, rows, emptyMessage }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900">{title}</p>
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[52rem]">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-6 text-sm text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr key={`${title}-${index}`} className="border-t border-gray-100">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className="px-4 py-3 text-sm text-gray-700 align-top"
                    >
                      {column.render ? column.render(row) : row[column.key] ?? '-'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CollapsibleSection = ({
  title,
  description,
  count,
  isOpen,
  onToggle,
  children,
}) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <button
        type="button"
        className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-gray-50 transition"
        onClick={onToggle}
      >
        <div>
          <p className="font-semibold text-gray-900">{title}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {typeof count === 'number' && (
            <span className="text-xs px-3 py-1 rounded-full bg-gray-100 text-gray-700">
              {count}
            </span>
          )}
          {isOpen ? (
            <BiChevronUp size={22} className="text-gray-500" />
          ) : (
            <BiChevronDown size={22} className="text-gray-500" />
          )}
        </div>
      </button>
      {isOpen && <div className="border-t border-gray-100">{children}</div>}
    </div>
  );
};

const JadwalResultTable = ({ rows, searchValue, onSearchChange, onEdit }) => {
  return (
    <div className="overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <input
          className="w-full lg:w-80 rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:border-primary-400"
          placeholder="Cari kode MK, mata kuliah, dosen, kelas, ruang"
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>
      <div className="overflow-auto">
        <table className="w-full min-w-[68rem]">
          <thead className="bg-gray-50">
            <tr>
              {[
                'Kode MK',
                'Mata Kuliah',
                'Dosen',
                'Kelas',
                'SKS',
                'Hari',
                'Mulai',
                'Selesai',
                'Ruang',
                'Tipe',
                'Aksi',
              ].map((label) => (
                <th
                  key={label}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500"
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-6 text-sm text-gray-500">
                  Belum ada jadwal yang berhasil ditampilkan.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={row.id} className="border-t border-gray-100">
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.kode_matkul || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    <div className="font-medium text-gray-900">{row.nama_matkul || '-'}</div>
                    {row.catatan && (
                      <div className="mt-1 text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-2 py-1 inline-block">
                        Catatan: {row.catatan}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.dosen_nama || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.kelas || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">{row.sks ?? '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">{row.hari || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.jam_mulai || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.jam_selesai || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.ruang_kode || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    {row.tipe_ruang || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 align-top">
                    <button
                      type="button"
                      className="inline-flex items-center gap-2 rounded-full border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                      onClick={() => onEdit(row)}
                    >
                      <BiEdit size={16} />
                      Edit Manual
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const JadwalKuliah = () => {
  const queryClient = useQueryClient();
  const editFormRef = useRef(null);
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedLabFile, setSelectedLabFile] = useState(null);
  const [selectedScheduleId, setSelectedScheduleId] = useState(() => {
    const saved = window.localStorage.getItem(selectedScheduleStorageKey);
    return saved ? Number(saved) : null;
  });
  const [feedback, setFeedback] = useState(null);
  const [editForm, setEditForm] = useState(initialEditForm);
  const [jadwalSearch, setJadwalSearch] = useState('');
  const [editFeedback, setEditFeedback] = useState(null);
  const [sectionsOpen, setSectionsOpen] = useState({
    berhasil: true,
    kosong: false,
    gagal: false,
  });

  const { data: schedulesResponse, isLoading: schedulesLoading } =
    usePenjadwalanBatches();

  const schedules = schedulesResponse?.data?.results ?? [];

  useEffect(() => {
    if (!selectedScheduleId && schedules.length > 0) {
      setSelectedScheduleId(schedules[0].id);
    }
  }, [schedules, selectedScheduleId]);

  useEffect(() => {
    setEditForm(initialEditForm);
    setEditFeedback(null);
  }, [selectedScheduleId]);

  useEffect(() => {
    setSectionsOpen({
      berhasil: true,
      kosong: false,
      gagal: false,
    });
  }, [selectedScheduleId]);

  useEffect(() => {
    if (selectedScheduleId) {
      window.localStorage.setItem(
        selectedScheduleStorageKey,
        String(selectedScheduleId)
      );
    }
  }, [selectedScheduleId]);

  const { data: detailResponse, isLoading: detailLoading } =
    usePenjadwalanBatchDetail(selectedScheduleId);

  const selectedSchedule = detailResponse?.data;
  const filteredJadwal = useMemo(() => {
    const keyword = jadwalSearch.trim().toLowerCase();
    const rows = selectedSchedule?.jadwal ?? [];

    if (!keyword) {
      return rows;
    }

    return rows.filter((row) =>
      [
        row.kode_matkul,
        row.nama_matkul,
        row.dosen_nama,
        row.kelas,
        row.ruang_kode,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [jadwalSearch, selectedSchedule?.jadwal]);

  const { mutateAsync: uploadExcel, isLoading: uploadLoading } =
    useUploadPenjadwalanExcel();
  const { mutateAsync: regenerateSchedule, isLoading: regenerateLoading } =
    useRegeneratePenjadwalanBatch();
  const { mutateAsync: updateJadwal, isLoading: updateLoading } =
    useUpdatePenjadwalanJadwal();

  const failedColumns = useMemo(
    () => [
      { key: 'kode_matkul', label: 'Kode MK' },
      { key: 'nama_matkul', label: 'Mata Kuliah' },
      { key: 'dosen_nama', label: 'Dosen' },
      { key: 'kelas', label: 'Kelas' },
      { key: 'sks', label: 'SKS' },
      { key: 'kapasitas', label: 'Kapasitas' },
      { key: 'alasan', label: 'Alasan' },
    ],
    []
  );

  const emptySlotColumns = useMemo(
    () => [
      { key: 'hari', label: 'Hari' },
      { key: 'jam_mulai', label: 'Mulai' },
      { key: 'jam_selesai', label: 'Selesai' },
      {
        key: 'ruang',
        label: 'Ruangan',
        render: (row) => row.ruang_nama || row.ruang_kode || '-',
      },
      {
        key: 'sks_kosong',
        label: 'SKS Tersedia',
        render: (row) => formatSksKosong(row.sks_kosong),
      },
      {
        key: 'keterangan',
        label: 'Keterangan',
        render: (row) =>
          `Ruangan kosong dari ${row.jam_mulai} sampai ${row.jam_selesai}`,
      },
    ],
    []
  );

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleStartEdit = (row) => {
    setEditForm({
      id: row.id,
      kode_matkul: row.kode_matkul || '',
      nama_matkul: row.nama_matkul || '',
      hari: row.hari || 'SENIN',
      jam_mulai: row.jam_mulai || '07:00',
      ruang_kode: row.ruang_kode || '',
      catatan: row.catatan || '',
    });
    setFeedback(null);
    setEditFeedback(null);
    window.requestAnimationFrame(() => {
      editFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleCancelEdit = () => {
    setEditForm(initialEditForm);
    setEditFeedback(null);
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!selectedFile) {
      setFeedback({
        type: 'error',
        message: 'Pilih file Excel terlebih dahulu.',
      });
      return;
    }

    const payload = new FormData();
    if (selectedLabFile) {
      payload.append('lab_file', selectedLabFile);
    }
    payload.append('file', selectedFile);
    payload.append('nama', form.nama);
    payload.append('tahun_akademik', form.tahun_akademik);
    payload.append('semester', form.semester);
    payload.append('versi', form.versi);
    payload.append('gabungkan_kelas', 'true');

    try {
      const response = await uploadExcel(payload);
      const schedule = response.data.batch;
      setFeedback({
        type: 'success',
        message: `Upload berhasil. Jadwal ${schedule.nama} siap digunakan.`,
      });
      setSelectedScheduleId(schedule.id);
      setSelectedFile(null);
      setSelectedLabFile(null);
      queryClient.invalidateQueries('penjadwalan-batches');
      queryClient.invalidateQueries(['penjadwalan-batch-detail', schedule.id]);
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.detail || 'Upload Excel gagal diproses.',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!selectedScheduleId) return;
    setFeedback(null);

    try {
      await regenerateSchedule(selectedScheduleId);
      setFeedback({
        type: 'success',
        message: 'Jadwal berhasil digenerate ulang.',
      });
      queryClient.invalidateQueries('penjadwalan-batches');
      queryClient.invalidateQueries([
        'penjadwalan-batch-detail',
        selectedScheduleId,
      ]);
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.detail || 'Generate ulang jadwal gagal.',
      });
    }
  };

  const handleSaveEdit = async (event) => {
    event.preventDefault();

    if (!editForm.id) return;

    setFeedback(null);
    setEditFeedback(null);

    try {
      const response = await updateJadwal({
        id: editForm.id,
        data: {
          hari: editForm.hari,
          jam_mulai: editForm.jam_mulai,
          ruang_kode: editForm.ruang_kode,
          catatan: editForm.catatan,
        },
      });

      setFeedback({
        type: 'success',
        message: response?.data?.detail || 'Jadwal berhasil diperbarui.',
      });
      queryClient.setQueryData(
        ['penjadwalan-batch-detail', selectedScheduleId],
        (oldData) => {
          if (!oldData?.data?.jadwal) {
            return oldData;
          }

          const updated = response?.data?.jadwal;
          if (!updated) {
            return oldData;
          }

          return {
            ...oldData,
            data: {
              ...oldData.data,
              jadwal: oldData.data.jadwal.map((item) =>
                item.id === updated.id ? updated : item
              ),
            },
          };
        }
      );
      setEditForm(initialEditForm);
      setEditFeedback(null);
      queryClient.invalidateQueries('penjadwalan-batches');
      queryClient.invalidateQueries([
        'penjadwalan-batch-detail',
        selectedScheduleId,
      ]);
    } catch (error) {
      setEditFeedback({
        type: 'error',
        message:
          error?.response?.data?.detail || 'Perubahan jadwal manual gagal disimpan.',
      });
    }
  };

  const toggleSection = (key) => {
    setSectionsOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <section id="penjadwalan" className="section-container space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">
          <BreadCrumbs
            links={[
              { name: 'Penjadwalan', link: '/penjadwalan/jadwal-kuliah' },
              { name: 'Jadwal Kuliah' },
            ]}
          />
          Penjadwalan Kuliah
        </p>
      </div>

      {feedback?.type === 'success' && (
        <AlertSuccess>{feedback.message}</AlertSuccess>
      )}
      {feedback?.type === 'error' && (
        <AlertError>{feedback.message}</AlertError>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">
                Upload Jadwal Baru
              </p>
              <p className="text-sm text-gray-500 mt-1">
                File wajib berformat <code>.xlsx</code> sesuai template input
                penjadwalan.
              </p>
            </div>
            <div className="px-3 py-2 rounded-2xl bg-primary-400/10 text-primary-400 text-sm font-semibold">
              Operasional
            </div>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleUpload}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Jadwal
                </label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                  name="nama"
                  value={form.nama}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tahun Akademik
                </label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                  name="tahun_akademik"
                  value={form.tahun_akademik}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Semester
                </label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                  name="semester"
                  value={form.semester}
                  onChange={handleInputChange}
                >
                  <option value="GANJIL">GANJIL</option>
                  <option value="GENAP">GENAP</option>
                  <option value="PENDEK">PENDEK</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Versi
                </label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                  name="versi"
                  type="number"
                  min="1"
                  value={form.versi}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File LAB
              </label>
              <input
                className="w-full rounded-xl border border-dashed border-gray-300 px-4 py-3 bg-gray-50"
                type="file"
                accept=".xlsx"
                onChange={(event) =>
                  setSelectedLabFile(event.target.files?.[0] || null)
                }
              />
              {selectedLabFile && (
                <p className="mt-2 text-sm text-gray-500">
                  File LAB terpilih: {selectedLabFile.name}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                File Penjadwalan
              </label>
              <input
                className="w-full rounded-xl border border-dashed border-gray-300 px-4 py-3 bg-gray-50"
                type="file"
                accept=".xlsx"
                onChange={(event) =>
                  setSelectedFile(event.target.files?.[0] || null)
                }
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500">
                  File terpilih: {selectedFile.name}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <PrimaryButton
                type="submit"
                isLoading={uploadLoading}
                icon={<BiUpload size={20} />}
              >
                Upload dan Generate
              </PrimaryButton>
            </div>
          </form>
        </div>

        <JadwalList
          schedules={schedules}
          selectedScheduleId={selectedScheduleId}
          onSelect={setSelectedScheduleId}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">Detail Jadwal</p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedSchedule
                ? `${selectedSchedule.nama} - ${selectedSchedule.tahun_akademik} - ${selectedSchedule.semester} - v${selectedSchedule.versi}`
                : 'Pilih jadwal untuk melihat hasil generate.'}
            </p>
          </div>
          {selectedSchedule && (
            <div className="flex flex-wrap gap-3">
              <PrimaryButton
                type="button"
                onClick={handleRegenerate}
                isLoading={regenerateLoading}
                icon={<BiRefresh size={20} />}
              >
                Generate Ulang
              </PrimaryButton>
              <a
                href={`/penjadwalan/batches/${selectedSchedule.id}/export-xls/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-green-600 px-5 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                <BiExport size={20} />
                Export Excel
              </a>
            </div>
          )}
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Status</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {selectedSchedule?.status || '-'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Jadwal</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {selectedSchedule?.total_jadwal ?? '-'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Gagal</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {selectedSchedule?.total_gagal ?? '-'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Generated At</p>
            <p className="text-lg font-semibold text-gray-900 mt-2 break-words">
              {selectedSchedule?.generated_at || '-'}
            </p>
          </div>
        </div>

        {(schedulesLoading || detailLoading) && (
          <p className="mt-6 text-sm text-gray-500">Memuat data penjadwalan...</p>
        )}
      </div>

      {editForm.id && (
        <div
          ref={editFormRef}
          className="bg-white rounded-3xl shadow-sm border border-amber-200 p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900">Edit Jadwal Manual</p>
              <p className="text-sm text-gray-500 mt-1">
                Pindahkan slot untuk {editForm.kode_matkul} - {editForm.nama_matkul}.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-2 self-start rounded-full border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
              onClick={handleCancelEdit}
            >
              <BiX size={18} />
              Tutup
            </button>
          </div>

          {editFeedback?.type === 'error' && (
            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {editFeedback.message}
            </div>
          )}

          <form className="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-4" onSubmit={handleSaveEdit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hari
              </label>
              <select
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                name="hari"
                value={editForm.hari}
                onChange={handleEditChange}
              >
                {hariOptions.map((hari) => (
                  <option key={hari} value={hari}>
                    {hari}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Jam Mulai
              </label>
              <input
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                type="time"
                name="jam_mulai"
                value={editForm.jam_mulai}
                onChange={handleEditChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kode Ruang
              </label>
              <input
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                name="ruang_kode"
                value={editForm.ruang_kode}
                onChange={handleEditChange}
                placeholder="Contoh: B301"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <input
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:border-primary-400"
                name="catatan"
                value={editForm.catatan}
                onChange={handleEditChange}
                placeholder="Opsional"
              />
            </div>
            <div className="lg:col-span-4 flex flex-wrap gap-3 pt-2">
              <PrimaryButton
                type="submit"
                isLoading={updateLoading}
                icon={<BiSave size={18} />}
              >
                Simpan Perubahan
              </PrimaryButton>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                onClick={handleCancelEdit}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      )}

      <CollapsibleSection
        title="Jadwal Berhasil"
        description="Lihat hasil jadwal yang sudah masuk dan edit manual."
        count={selectedSchedule?.jadwal?.length ?? 0}
        isOpen={sectionsOpen.berhasil}
        onToggle={() => toggleSection('berhasil')}
      >
        <JadwalResultTable
          rows={filteredJadwal}
          searchValue={jadwalSearch}
          onSearchChange={setJadwalSearch}
          onEdit={handleStartEdit}
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Jam Kosong yang Bisa Dipakai"
        description="Daftar ruang dan jam kosong yang masih tersedia."
        count={selectedSchedule?.slot_kosong?.length ?? 0}
        isOpen={sectionsOpen.kosong}
        onToggle={() => toggleSection('kosong')}
      >
        <ResultTable
          title="Jam Kosong yang Bisa Dipakai"
          columns={emptySlotColumns}
          rows={selectedSchedule?.slot_kosong ?? []}
          emptyMessage="Belum ada jam kosong yang bisa ditampilkan."
        />
      </CollapsibleSection>

      <CollapsibleSection
        title="Mata Kuliah Gagal Dijadwalkan"
        description="Mata kuliah yang belum mendapat ruang dan waktu yang valid."
        count={selectedSchedule?.gagal?.length ?? 0}
        isOpen={sectionsOpen.gagal}
        onToggle={() => toggleSection('gagal')}
      >
        <ResultTable
          title="Mata Kuliah Gagal Dijadwalkan"
          columns={failedColumns}
          rows={selectedSchedule?.gagal ?? []}
          emptyMessage="Belum ada data gagal dijadwalkan."
        />
      </CollapsibleSection>
    </section>
  );
};

export default JadwalKuliah;
