import React, { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from 'react-query';
import { BiExport, BiRefresh, BiUpload } from 'react-icons/bi';

import BreadCrumbs from '../../components/BreadCrumbs';
import { AlertError, AlertSuccess } from '../../components/Alert';
import { PrimaryButton } from '../../components/PrimaryButton';
import {
  usePenjadwalanBatchDetail,
  usePenjadwalanBatches,
  useRegeneratePenjadwalanBatch,
  useUploadPenjadwalanExcel,
} from '../../hooks/usePenjadwalan';

const initialForm = {
  nama: 'Jadwal Genap 2025/2026',
  tahun_akademik: '2025/2026',
  semester: 'GENAP',
  versi: 1,
};

const BatchList = ({ batches, selectedBatchId, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="font-semibold text-gray-900">Riwayat Batch</p>
        <p className="text-sm text-gray-500 mt-1">
          Pilih batch untuk melihat hasil generate yang sudah tersimpan.
        </p>
      </div>
      <div className="max-h-[30rem] overflow-auto">
        {batches.length === 0 ? (
          <div className="px-5 py-6 text-sm text-gray-500">
            Belum ada batch penjadwalan.
          </div>
        ) : (
          batches.map((batch) => {
            const active = selectedBatchId === batch.id;
            return (
              <button
                key={batch.id}
                type="button"
                className={`w-full text-left px-5 py-4 border-b border-gray-100 transition ${
                  active ? 'bg-primary-400/10' : 'hover:bg-gray-50'
                }`}
                onClick={() => onSelect(batch.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-900">{batch.nama}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {batch.tahun_akademik} • {batch.semester} • v{batch.versi}
                    </p>
                  </div>
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {batch.status}
                  </span>
                </div>
                <div className="mt-3 flex gap-4 text-xs text-gray-500">
                  <span>Jadwal: {batch.total_jadwal}</span>
                  <span>Gagal: {batch.total_gagal}</span>
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
                      {row[column.key] ?? '-'}
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

const Penjadwalan = () => {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(initialForm);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const { data: batchResponse, isLoading: batchesLoading } =
    usePenjadwalanBatches();

  const batches = batchResponse?.data?.results ?? [];

  useEffect(() => {
    if (!selectedBatchId && batches.length > 0) {
      setSelectedBatchId(batches[0].id);
    }
  }, [batches, selectedBatchId]);

  const { data: detailResponse, isLoading: detailLoading } =
    usePenjadwalanBatchDetail(selectedBatchId);

  const selectedBatch = detailResponse?.data;

  const { mutateAsync: uploadExcel, isLoading: uploadLoading } =
    useUploadPenjadwalanExcel();
  const { mutateAsync: regenerateBatch, isLoading: regenerateLoading } =
    useRegeneratePenjadwalanBatch();

  const scheduleColumns = useMemo(
    () => [
      { key: 'kode_matkul', label: 'Kode MK' },
      { key: 'nama_matkul', label: 'Mata Kuliah' },
      { key: 'dosen_nama', label: 'Dosen' },
      { key: 'kelas', label: 'Kelas' },
      { key: 'sks', label: 'SKS' },
      { key: 'hari', label: 'Hari' },
      { key: 'jam_mulai', label: 'Mulai' },
      { key: 'jam_selesai', label: 'Selesai' },
      { key: 'ruang_kode', label: 'Ruang' },
      { key: 'tipe_ruang', label: 'Tipe' },
    ],
    []
  );

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

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setFeedback(null);

    if (!selectedFile) {
      setFeedback({ type: 'error', message: 'Pilih file Excel terlebih dahulu.' });
      return;
    }

    const payload = new FormData();
    payload.append('file', selectedFile);
    payload.append('nama', form.nama);
    payload.append('tahun_akademik', form.tahun_akademik);
    payload.append('semester', form.semester);
    payload.append('versi', form.versi);
    payload.append('gabungkan_kelas', 'true');

    try {
      const response = await uploadExcel(payload);
      const batch = response.data.batch;
      setFeedback({
        type: 'success',
        message: `Upload berhasil. Batch ${batch.nama} siap digunakan.`,
      });
      setSelectedBatchId(batch.id);
      setSelectedFile(null);
      queryClient.invalidateQueries('penjadwalan-batches');
      queryClient.invalidateQueries(['penjadwalan-batch-detail', batch.id]);
    } catch (error) {
      setFeedback({
        type: 'error',
        message: error?.response?.data?.detail || 'Upload Excel gagal diproses.',
      });
    }
  };

  const handleRegenerate = async () => {
    if (!selectedBatchId) return;
    setFeedback(null);

    try {
      await regenerateBatch(selectedBatchId);
      setFeedback({
        type: 'success',
        message: 'Batch berhasil digenerate ulang.',
      });
      queryClient.invalidateQueries('penjadwalan-batches');
      queryClient.invalidateQueries(['penjadwalan-batch-detail', selectedBatchId]);
    } catch (error) {
      setFeedback({
        type: 'error',
        message:
          error?.response?.data?.detail || 'Generate ulang batch gagal.',
      });
    }
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
        <p className="text-sm text-gray-500">
          Upload file Excel, generate batch jadwal, lalu cek hasil berhasil dan
          gagal dalam satu halaman.
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
                Upload Batch Baru
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
                  Nama Batch
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
                File Excel
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
              <a
                href={`${window.location.origin}/penjadwalan/`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center rounded-full border border-gray-300 px-5 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Buka Backend Form
              </a>
            </div>
          </form>
        </div>

        <BatchList
          batches={batches}
          selectedBatchId={selectedBatchId}
          onSelect={setSelectedBatchId}
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-gray-900">Detail Batch</p>
            <p className="text-sm text-gray-500 mt-1">
              {selectedBatch
                ? `${selectedBatch.nama} • ${selectedBatch.tahun_akademik} • ${selectedBatch.semester} • v${selectedBatch.versi}`
                : 'Pilih batch untuk melihat hasil jadwal.'}
            </p>
          </div>
          {selectedBatch && (
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
                href={`/penjadwalan/batches/${selectedBatch.id}/export-xls/`}
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
              {selectedBatch?.status || '-'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Jadwal</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {selectedBatch?.total_jadwal ?? '-'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Total Gagal</p>
            <p className="text-lg font-semibold text-gray-900 mt-2">
              {selectedBatch?.total_gagal ?? '-'}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
            <p className="text-sm text-gray-500">Generated At</p>
            <p className="text-lg font-semibold text-gray-900 mt-2 break-words">
              {selectedBatch?.generated_at || '-'}
            </p>
          </div>
        </div>

        {(batchesLoading || detailLoading) && (
          <p className="mt-6 text-sm text-gray-500">Memuat data penjadwalan...</p>
        )}
      </div>

      <ResultTable
        title="Jadwal Berhasil"
        columns={scheduleColumns}
        rows={selectedBatch?.jadwal ?? []}
        emptyMessage="Belum ada jadwal yang berhasil ditampilkan."
      />

      <ResultTable
        title="Mata Kuliah Gagal Dijadwalkan"
        columns={failedColumns}
        rows={selectedBatch?.gagal ?? []}
        emptyMessage="Belum ada data gagal dijadwalkan."
      />
    </section>
  );
};

export default Penjadwalan;
