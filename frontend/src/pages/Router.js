import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import Base from './Base';
import Home from './Home';
import Login from './login/Login';
import EvaluasiPerkuliahan from './evaluasi-perkuliahan/EvaluasiPerkuliahan';
import SuratPenugasan from './surat-penugasan/SuratPenugasan';
import SuratPenugasanForm from './surat-penugasan/SuratPenugasanForm';
import PenugasanPengajaran from './penugasan-pengajaran/PenugasanPengajaran';
import PenugasanPengajaranForm from './penugasan-pengajaran/PenugasanPengajaranForm';
import RequireAuthWithRoles from '../components/RequireAuthWithRoles';
import Unauthorized from './Unauthorized';
import EvaluasiPerkuliahanForm from './evaluasi-perkuliahan/EvaluasiPerkuliahanForm';
import RequireAuthWithPosition from '../components/RequireAuthWithPosition';
import Dosen from './dosen/Dosen';
import DosenForm from './dosen/DosenForm';

const Router = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Base />}>
          <Route index element={<Home />} />
          <Route path="/evaluasi-perkuliahan">
            <Route index element={<EvaluasiPerkuliahan />} />
            <Route path="form" element={<EvaluasiPerkuliahanForm />} />
            <Route path=":id" element={<EvaluasiPerkuliahanForm />} />
          </Route>
          <Route
            element={
              <RequireAuthWithRoles
                allowedRoles={['Admin', 'Superadmin', 'Faculty Member']}
              />
            }
          >
            <Route
              element={
                <RequireAuthWithPosition
                  checkRole={['Faculty Member']}
                  allowedPosition={['Kaprodi']}
                />
              }
            >
              <Route path="/dosen">
                <Route index element={<Dosen />} />
                <Route path="form" element={<DosenForm />} />
                <Route path=":id" element={<DosenForm />} />
              </Route>
            </Route>
          </Route>
          <Route
            element={
              <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
            }
          >
            <Route path="/surat-penugasan">
              <Route index element={<SuratPenugasan />} />
              <Route path="form" element={<SuratPenugasanForm />} />
              <Route path=":id" element={<SuratPenugasanForm />} />
            </Route>
            <Route path="/penugasan-pengajaran">
              <Route index element={<PenugasanPengajaran />} />
              <Route path="form" element={<PenugasanPengajaranForm />} />
              <Route path=":id" element={<PenugasanPengajaranForm />} />
            </Route>
          </Route>
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default Router;
