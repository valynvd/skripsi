import React from 'react';
import { Link } from 'react-router-dom';

const LmsDashboard = () => {
  return (
    <section className="section-container space-y-6" id="lms-dashboard">
      <div>
        <p className="text-lg font-semibold text-gray-900">LMS Dashboard</p>
        <p className="text-sm text-gray-500 mt-1">
          Pilih menu attendance atau materi untuk melihat data hasil scraping
          LMS per prodi.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Link
          to="/lms/attendance"
          className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-primary-400 transition"
        >
          <p className="font-semibold text-gray-900">Attendance</p>
          <p className="mt-2 text-sm text-gray-500">
            Ringkasan presensi per matakuliah, per pertemuan, dan detail
            mahasiswa.
          </p>
        </Link>

        <Link
          to="/lms/materi"
          className="rounded-2xl border border-gray-200 bg-white p-5 hover:border-primary-400 transition"
        >
          <p className="font-semibold text-gray-900">Materi</p>
          <p className="mt-2 text-sm text-gray-500">
            Daftar materi per matakuliah, dikelompokkan per section/week.
          </p>
        </Link>
      </div>
    </section>
  );
};

export default LmsDashboard;
