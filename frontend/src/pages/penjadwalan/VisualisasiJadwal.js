import React, { useEffect, useMemo, useState } from 'react';

import BreadCrumbs from '../../components/BreadCrumbs';
import {
  usePenjadwalanBatchDetail,
  usePenjadwalanBatches,
} from '../../hooks/usePenjadwalan';

const DAYS = ['SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT'];
const selectedScheduleStorageKey = 'penjadwalan:selectedScheduleId';

const formatDay = (value) => {
  const labels = {
    SENIN: 'Senin',
    SELASA: 'Selasa',
    RABU: 'Rabu',
    KAMIS: 'Kamis',
    JUMAT: 'Jumat',
  };
  return labels[value] || value;
};

const buildScheduleMatrix = (jadwal) => {
  const grouped = {};

  jadwal.forEach((item) => {
    const key = `${item.jam_mulai} - ${item.jam_selesai}`;
    if (!grouped[key]) {
      grouped[key] = {
        time: key,
        SENIN: [],
        SELASA: [],
        RABU: [],
        KAMIS: [],
        JUMAT: [],
      };
    }
    grouped[key][item.hari] = [...grouped[key][item.hari], item];
  });

  return Object.values(grouped).sort((a, b) => a.time.localeCompare(b.time));
};

const buildDaySummary = (jadwal) => {
  return DAYS.map((day) => ({
    hari: formatDay(day),
    total: jadwal.filter((item) => item.hari === day).length,
  }));
};

const SchedulePicker = ({ schedules, selectedId, onSelect }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
      <p className="font-semibold text-gray-900">Pilih Jadwal</p>
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {schedules.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada jadwal tersimpan.</p>
        ) : (
          schedules.map((schedule) => {
            const active = selectedId === schedule.id;
            return (
              <button
                key={schedule.id}
                type="button"
                onClick={() => onSelect(schedule.id)}
                className={`rounded-2xl border px-4 py-4 text-left transition ${
                  active
                    ? 'border-primary-400 bg-primary-400/10'
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <p className="font-semibold text-gray-900">{schedule.nama}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {schedule.tahun_akademik} - {schedule.semester} - v{schedule.versi}
                </p>
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

const ScheduleDetailModal = ({ item, onClose }) => {
  useEffect(() => {
    if (!item) return undefined;

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-200 overflow-hidden"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-gray-100">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-400">
              Detail Mata Kuliah
            </p>
            <p className="mt-1 text-lg font-semibold text-gray-900">
              {item.nama_matkul}
            </p>
            <p className="text-sm text-gray-500">
              Kode MK: {item.kode_matkul || '-'}
            </p>
          </div>
          <button
            type="button"
            className="rounded-full border border-gray-200 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50"
            onClick={onClose}
          >
            Tutup
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Kelas</p>
              <p className="mt-1 font-semibold text-gray-900">
                {item.kelas || '-'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Dosen</p>
              <p className="mt-1 font-semibold text-gray-900">
                {item.dosen_nama || '-'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Ruang</p>
              <p className="mt-1 font-semibold text-gray-900">
                {item.ruang_kode || '-'}
              </p>
            </div>
            <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
              <p className="text-xs uppercase tracking-wide text-gray-500">Kode MK</p>
              <p className="mt-1 font-semibold text-gray-900">
                {item.kode_matkul || '-'}
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 text-white p-4">
            <div className="flex flex-wrap gap-3 text-sm">
              <span>
                <span className="text-slate-300">Hari:</span> {formatDay(item.hari)}
              </span>
              <span>
                <span className="text-slate-300">Jam:</span>{' '}
                {item.jam_mulai} - {item.jam_selesai}
              </span>
              <span>
                <span className="text-slate-300">Tipe:</span>{' '}
                {item.tipe_ruang || '-'}
              </span>
            </div>
            {item.catatan && (
              <p className="mt-3 text-sm text-slate-300">
                Catatan: {item.catatan}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const VisualisasiJadwal = () => {
  const [selectedScheduleId, setSelectedScheduleId] = useState(() => {
    const saved = window.localStorage.getItem(selectedScheduleStorageKey);
    return saved ? Number(saved) : null;
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
    if (selectedScheduleId) {
      window.localStorage.setItem(
        selectedScheduleStorageKey,
        String(selectedScheduleId)
      );
    }
  }, [selectedScheduleId]);

  const { data: detailResponse, isLoading: detailLoading } =
    usePenjadwalanBatchDetail(selectedScheduleId);

  const [selectedItem, setSelectedItem] = useState(null);
  const selectedSchedule = detailResponse?.data;
  const jadwal = selectedSchedule?.jadwal ?? [];

  const scheduleMatrix = useMemo(() => buildScheduleMatrix(jadwal), [jadwal]);
  const daySummary = useMemo(() => buildDaySummary(jadwal), [jadwal]);

  useEffect(() => {
    setSelectedItem(null);
  }, [selectedScheduleId]);

  return (
    <section className="section-container space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">
          <BreadCrumbs
            links={[
              { name: 'Penjadwalan', link: '/penjadwalan/jadwal-kuliah' },
              { name: 'Visualisasi Jadwal' },
            ]}
          />
          Visualisasi Jadwal
        </p>
        <p className="text-sm text-gray-500">
          Tampilan mingguan untuk membaca jadwal kuliah secara cepat per hari dan
          jam.
        </p>
      </div>

      <SchedulePicker
        schedules={schedules}
        selectedId={selectedScheduleId}
        onSelect={setSelectedScheduleId}
      />

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {daySummary.map((item) => (
          <div
            key={item.hari}
            className="rounded-2xl bg-white border border-gray-200 shadow-sm p-4"
          >
            <p className="text-sm text-gray-500">{item.hari}</p>
            <p className="text-2xl font-semibold text-gray-900 mt-2">
              {item.total}
            </p>
            <p className="text-xs text-gray-500 mt-1">jadwal masuk</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <p className="font-semibold text-gray-900">
            {selectedSchedule
              ? `${selectedSchedule.nama} - ${selectedSchedule.tahun_akademik} - ${selectedSchedule.semester}`
              : 'Matriks Mingguan'}
          </p>
        </div>
        {(schedulesLoading || detailLoading) && (
          <div className="px-5 py-6 text-sm text-gray-500">
            Memuat visualisasi jadwal...
          </div>
        )}
        {!schedulesLoading && !detailLoading && scheduleMatrix.length === 0 && (
          <div className="px-5 py-6 text-sm text-gray-500">
            Belum ada jadwal yang bisa divisualisasikan.
          </div>
        )}
        {scheduleMatrix.length > 0 && (
          <div className="overflow-auto">
            <table className="w-full min-w-[72rem] border-separate border-spacing-0">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200">
                    Jam
                  </th>
                  {DAYS.map((day) => (
                    <th
                      key={day}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 border-b border-gray-200"
                    >
                      {formatDay(day)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {scheduleMatrix.map((row) => (
                  <tr key={row.time}>
                    <td className="px-4 py-4 align-top text-sm font-medium text-gray-700 border-b border-gray-100 bg-gray-50/70">
                      {row.time}
                    </td>
                    {DAYS.map((day) => (
                      <td
                        key={`${row.time}-${day}`}
                        className="px-3 py-3 align-top border-b border-gray-100 min-w-[220px]"
                      >
                        <div className="space-y-3">
                          {row[day].length === 0 ? (
                            <div className="rounded-xl border border-dashed border-gray-200 p-3 text-xs text-gray-400">
                              Kosong
                            </div>
                          ) : (
                            row[day].map((item, index) => (
                              <button
                                key={`${row.time}-${day}-${index}`}
                                type="button"
                                className="w-full rounded-2xl bg-slate-900 text-left text-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary-400"
                                onClick={() => setSelectedItem(item)}
                              >
                                <p className="text-sm font-semibold">
                                  {item.kelas || '-'}
                                </p>
                                <p className="text-sm text-slate-100 mt-1">
                                  {item.nama_matkul}
                                </p>
                              </button>
                            ))
                          )}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ScheduleDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </section>
  );
};

export default VisualisasiJadwal;
