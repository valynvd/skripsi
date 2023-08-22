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
import { Outlet } from 'react-router-dom';
import MataKuliah from './mata-kuliah/MataKuliah';
import MatriksPenilaian from './matriks-penilaian/MatriksPenilaian';
import RPS from './RPS';
import MataKuliahForm from './mata-kuliah/MataKuliahForm';
import Kurikulum from './kurikulum/Kurikulum';
import KurikulumForm from './kurikulum/KurikulumForm';
import Cycle from './cycle/Cycle';
import CycleForm from './cycle/CycleForm';
import BroadCastPesanForm from './broadcast-pesan/BroadCastPesanForm';
import KonsolChatbotLogin from './konsol-chatbot/KonsolChatBotLogin';
import KonsolChatbotTimelineAkademik from './konsol-chatbot/KonsolChatbotTimelineAkademik';
import KonsolChatbotPeriodePembayaran from './konsol-chatbot/KonsolChatbotPeriodePembayaran';
import KonsolChatbotSeputarSAP from './konsol-chatbot/KonsolChatbotSeputarSAP';
import KonsolChatbotSeputarLMS from './konsol-chatbot/KonsolChatbotSeputarLMS';
import KonsolChatbotTimelineAkademikForm from './konsol-chatbot/KonsolChatbotTimelineAkademikForm';
import KonsolChatbotPeriodePembayaranForm from './konsol-chatbot/KonsolChatbotPeriodePembayaranForm';
import KonsolChatbotSeputarLMSForm from './konsol-chatbot/KonsolChatbotSeputarLMSForm';
import KonsolChatbotSeputarSAPForm from './konsol-chatbot/KonsolChatbotSeputarSAPForm';
import GrupMahasiswa from './grup-mahasiswa/GrupMahasiswa';
import MahasiswaMember from './grup-mahasiswa/MahasiswaMember';
import DataMahasiswa from './mahasiswa/DataMahasiswa';
import DataMahasiswaForm from './mahasiswa/DataMahasiswaForm';
import MonitoringMahasiswa from './monitoring-mahasiswa/MonitoringMahasiswa';
import ValidasiMahasiswa from './validasi-kelulusan/ValidasiMahasiswa';
import ValidasiMahasiswaByNIM from './validasi-kelulusan/ValidasiMahasiswaByNIM';
import DegreeAuditKelulusan from './degreeaudit-kelulusan/DegreeAuditKelulusan';
import DegreeAuditKelulusanForm from './degreeaudit-kelulusan/DegreeAuditKelulusanForm';
import PenugasanPenelitian from './penelitian/PenugasanPenelitian';
import PenugasanPenelitianForm from './penelitian/PenugasanPenelitianForm';
import MonitoringMahasiswaImportExcel from './monitoring-mahasiswa/MonitoringMahasiswaImportExcel';
import PenugasanPengabdian from './pengabdian/PenugasanPengabdian';
import PenugasanPengabdianForm from './pengabdian/PenugasanPengabdianForm';
import GrupMahasiswaImportExcel from './grup-mahasiswa/GrupMahasiswaImportExcel';
import PublikasiKarya from './publikasi-karya/PublikasiKarya';
import PublikasiKaryaForm from './publikasi-karya/PublikasiKaryaForm';
import PatenHKI from './paten-hki/PatenHKI';
import PatenHKIForm from './paten-hki/PatenHKIForm';
import Kriteria from './kriteria/Kriteria';
import KriteriaForm from './kriteria/KriteriaForm';
import PoinPenilaian from './poin-penilaian/PoinPenilaian';
import PoinPenilaianForm from './poin-penilaian/PoinPenilaianForm';
import MatriksPenilaianAdmin from './matriks-penilaian/MatriksPenilaianAdmin';

const Router = () => {
  return (
    <Routes>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<Base />}>
          <Route index element={<Home />} />

          <Route path="pelaksanaan-penelitian">
            <Route path="penugasan-penelitian">
              <Route index element={<PenugasanPenelitian />} />
              <Route path="form" element={<PenugasanPenelitianForm />} />
              <Route path=":id" element={<PenugasanPenelitianForm />} />
            </Route>
            <Route path="publikasi-karya">
              <Route index element={<PublikasiKarya />} />
              <Route path="form" element={<PublikasiKaryaForm />} />
              <Route path=":id" element={<PublikasiKaryaForm />} />
            </Route>
            <Route path="paten-hki">
              <Route index element={<PatenHKI />} />
              <Route path="form" element={<PatenHKIForm />} />
              <Route path=":id" element={<PatenHKIForm />} />
            </Route>
          </Route>

          <Route path="pelaksanaan-pengabdian/penugasan-pengabdian">
            <Route index element={<PenugasanPengabdian />} />
            <Route path="form" element={<PenugasanPengabdianForm />} />
            <Route path=":id" element={<PenugasanPengabdianForm />} />
          </Route>

          <Route
            element={
              <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
            }
          ></Route>
          <Route path="pelaksanaan-pendidikan" element={<Outlet />}>
            <Route
              element={
                <RequireAuthWithRoles
                  allowedRoles={['Admin', 'Superadmin', 'Kaprodi']}
                />
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
                <Route path="rps">
                  <Route index element={<RPS />} />
                </Route>
              </Route>
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
              <Route path="kriteria">
                <Route index element={<Kriteria />} />
                <Route path="form" element={<KriteriaForm />} />
                <Route path=":id" element={<KriteriaForm />} />
              </Route>
              <Route path="poin-penilaian">
                <Route index element={<PoinPenilaian />} />
                <Route path="form" element={<PoinPenilaianForm />} />
                <Route path=":id" element={<PoinPenilaianForm />} />
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
              <Route
                element={
                  <RequireAuthWithRoles
                    allowedRoles={['Admin', 'Superadmin']}
                  />
                }
              >
                <Route path="data-mahasiswa">
                  <Route index element={<DataMahasiswa />} />
                  <Route path="form" element={<DataMahasiswaForm />} />
                  <Route path=":id" element={<DataMahasiswaForm />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="akreditasi" element={<Outlet />}>
            <Route path="matriks-penilaian">
              <Route index element={<MatriksPenilaian />} />
            </Route>
            <Route
              element={
                <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
              }
            >
              <Route path="daftar-matriks-penilaian">
                <Route index element={<MatriksPenilaianAdmin />} />
                {/* <Route path="form" element={<UserForm />} />
                <Route path=":id" element={<UserForm />} /> */}
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
                <Route path="form" element={<BroadCastPesanForm />} />
              </Route>
              <Route path="pengaturan-grup">
                <Route index element={<GrupMahasiswa />} />
                <Route path="import" element={<GrupMahasiswaImportExcel />} />
                <Route path="mahasiswa-member" element={<MahasiswaMember />} />
              </Route>
              <Route path="konsol-chatbot">
                <Route index element={<KonsolChatbot />} />
                <Route path="login" element={<KonsolChatbotLogin />} />
                <Route
                  path="timelineakademik"
                  element={<KonsolChatbotTimelineAkademik />}
                />
                <Route
                  path="periodepembayaran"
                  element={<KonsolChatbotPeriodePembayaran />}
                />
                <Route
                  path="seputarsap"
                  element={<KonsolChatbotSeputarSAP />}
                />
                <Route
                  path="seputarlms"
                  element={<KonsolChatbotSeputarLMS />}
                />
                <Route
                  path="timelineakademik/form"
                  element={<KonsolChatbotTimelineAkademikForm />}
                />
                <Route
                  path="timelineakademik/:id"
                  element={<KonsolChatbotTimelineAkademikForm />}
                />
                <Route
                  path="periodepembayaran/form"
                  element={<KonsolChatbotPeriodePembayaranForm />}
                />
                <Route
                  path="periodepembayaran/:id"
                  element={<KonsolChatbotPeriodePembayaranForm />}
                />
                <Route
                  path="seputarlms/form"
                  element={<KonsolChatbotSeputarLMSForm />}
                />
                <Route
                  path="seputarlms/:id"
                  element={<KonsolChatbotSeputarLMSForm />}
                />
                <Route
                  path="seputarsap/form"
                  element={<KonsolChatbotSeputarSAPForm />}
                />
                <Route
                  path="seputarsap/:id"
                  element={<KonsolChatbotSeputarSAPForm />}
                />
              </Route>
            </Route>
          </Route>

          <Route path="degreeaudit" element={<Outlet />}>
            <Route path="monitoring-akademik">
              <Route index element={<MonitoringMahasiswa />} />
              <Route
                path="import"
                element={<MonitoringMahasiswaImportExcel />}
              />
            </Route>
            <Route path="degreeaudit-kelulusan">
              <Route index element={<DegreeAuditKelulusan />} />
              <Route path=":id" element={<DegreeAuditKelulusanForm />} />
            </Route>
            <Route path="validasi-kelulusan">
              <Route index element={<ValidasiMahasiswa />} />
              <Route path=":nim" element={<ValidasiMahasiswaByNIM />} />
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
