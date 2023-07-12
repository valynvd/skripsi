import React from 'react';
import { Routes, Route } from 'react-router-dom';
import RequireAuth from '../components/RequireAuth';
import Base from './Base';
import Home from './Home';
import Login from './login/Login';
import DokumenPembelajaran from './dokumen-pembelajaran/DokumenPembelajaran';
import SuratPenugasan from './surat-penugasan/SuratPenugasan';
import BroadCastPesan from './broadcast-pesan/BroadCastPesan';
import KonsolChatbot from './konsol-chatbot/KonsolChatbot';
import SuratPenugasanForm from './surat-penugasan/SuratPenugasanForm';
import PenugasanPengajaran from './penugasan-pengajaran/PenugasanPengajaran';
import PenugasanPengajaranForm from './penugasan-pengajaran/PenugasanPengajaranForm';
import RequireAuthWithRoles from '../components/RequireAuthWithRoles';
import Unauthorized from './Unauthorized';
import DokumenPembelajaranForm from './dokumen-pembelajaran/DokumenPembelajaranForm';
import RequireAuthWithPosition from '../components/RequireAuthWithPosition';
import Dosen from './dosen/Dosen';
import DosenForm from './dosen/DosenForm';
import User from './user/User';
import UserForm from './user/UserForm';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';
import Penelitian from './penelitian/Penelitian';
import Pengabdian from './pengabdian/Pengabdian';
import { Outlet } from 'react-router-dom';
import MataKuliah from './mata-kuliah/MataKuliah';
import MatriksPenilaian from './matriks-penilaian/MatriksPenilaian';
import RPS from './RPS';
import MataKuliahForm from './mata-kuliah/MataKuliahForm';
import Kurikulum from './kurikulum/Kurikulum';
import KurikulumForm from './kurikulum/KurikulumForm';
import Cycle from './cycle/Cycle';
import CycleForm from './cycle/CycleForm';

const Router = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Base />}>
          <Route index element={<Home />} />

          <Route
            element={
              <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
            }
          >
            <Route path="pelaksanaan-penelitian/penelitian">
              <Route index element={<Penelitian />} />
            </Route>
            <Route path="pelaksanaan-pengabdian/pengabdian">
              <Route index element={<Pengabdian />} />
            </Route>
          </Route>
          <Route path="pelaksanaan-pendidikan" element={<Outlet />}>
            <Route
              element={
                <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
              }
            >
              <Route path="surat-penugasan">
                <Route index element={<SuratPenugasan />} />
                <Route path="form" element={<SuratPenugasanForm />} />
                <Route path=":id" element={<SuratPenugasanForm />} />
              </Route>
            </Route>
            <Route path="dokumen-pembelajaran">
              <Route index element={<DokumenPembelajaran />} />
              <Route path="form" element={<DokumenPembelajaranForm />} />
              <Route path=":id">
                <Route index element={<DokumenPembelajaranForm />} />
                {/* <Route
                  path="portofolio-perkuliahan"
                  element={<PortofolioPerkuliahanForm />}
                /> */}
              </Route>
            </Route>
            <Route path="rps">
              <Route index element={<RPS />} />
            </Route>
          </Route>

          <Route path="data-master" element={<Outlet />}>
            <Route
              element={
                <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
              }
            >
              <Route path="cycle">
                <Route index element={<Cycle />} />
                <Route path="form" element={<CycleForm />} />
                <Route path=":id" element={<CycleForm />} />
              </Route>
              <Route path="mata-kuliah">
                <Route index element={<MataKuliah />} />
                <Route path="form" element={<MataKuliahForm />} />
                <Route path=":id" element={<MataKuliahForm />} />
              </Route>
              <Route path="kurikulum">
                <Route index element={<Kurikulum />} />
                <Route path="form" element={<KurikulumForm />} />
                <Route path=":id" element={<KurikulumForm />} />
              </Route>
              <Route path="penugasan-pengajaran">
                <Route index element={<PenugasanPengajaran />} />
                <Route path="form" element={<PenugasanPengajaranForm />} />
                <Route path=":id" element={<PenugasanPengajaranForm />} />
              </Route>
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
                <Route path="dosen">
                  <Route index element={<Dosen />} />
                  <Route path="form" element={<DosenForm />} />
                  <Route path=":id" element={<DosenForm />} />
                </Route>
              </Route>
              <Route
                element={
                  <RequireAuthWithRoles
                    allowedRoles={['Admin', 'Superadmin']}
                  />
                }
              >
                <Route path="user">
                  <Route index element={<User />} />
                  <Route path="form" element={<UserForm />} />
                  <Route path=":id" element={<UserForm />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="akreditasi" element={<Outlet />}>
            <Route
              element={
                <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
              }
            >
              <Route path="matriks-penilaian">
                <Route index element={<MatriksPenilaian />} />
              </Route>
            </Route>
          </Route>

          <Route path="stem-chatbot" element={<Outlet />}>
            <Route
              element={
                <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
              }
            >
              <Route path="broadcast-pesan">
                <Route index element={<BroadCastPesan />} />
              </Route>
              <Route path="pengaturan-grup">
                <Route index element={<KonsolChatbot />} />
              </Route>
              <Route path="konsol-chatbot">
                <Route index element={<KonsolChatbot />} />
              </Route>
            </Route>
          </Route>
          
        </Route>
      </Route>
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />
    </Routes>
  );
};

export default Router;
