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
import DokumenAkreditasi from './dokumen-akreditasi/DokumenAkreditasi';
import DokumenAkreditasiForm from './dokumen-akreditasi/DokumenAkreditasiForm';
// import MatriksPenilaianAdmin from './matriks-penilaian/MatriksPenilaianAdmin';
import PenugasanPengajaranImportExcel from './penugasan-pengajaran/PenugasanPengajaranImportExcel';
import SimulasiMatriks from './simulasi-matriks/SimulasiMatriks';
import SimulasiMatriksForm from './simulasi-matriks/SimulasiMatriksForm';
import ProgramStudi from './program-studi/ProgramStudi';
import ProgramStudiForm from './program-studi/ProgramStudiForm';
import MonitoringMahasiswa1 from './monitoring-mahasiswa/MonitoringMahasiswa1';
import MonitoringMahasiswaByNIM from './monitoring-mahasiswa/MonitoringMahasiswaByNIM';
import MonitoringMahasiswaByKodeMatkul from './monitoring-mahasiswa/MonitoringMahasiswaByKodeMatkul';
import ValidasiMataKuliah from './validasi-matakuliah/ValidasiMataKuliah';
import ValidasiMataKuliahDetails from './validasi-matakuliah/ValidasiMataKuliahDetails';
// import DashboardKurikulumOBE from './kurikulum-obe/DashboardKurikulumOBE';
import DataCapaianPembelajaran from './capaian-pembelajaran/DataCapaianPembelajaran';
import DataProfilLulusan from './profil-lulusan/DataProfilLulusan';
import DataProfilLulusanForm from './profil-lulusan/DataProfilLulusanForm';
import DataCapaianPembelajaranForm from './capaian-pembelajaran/DataCapaianPembelajaranForm';
import PemetaanCplCpmkMk from './pemetaan/PemetaanCplCpmkMk';
import PemetaanMkCpmkCpl from './pemetaan/PemetaanMkCpmkCpl';
import CpMataKuliah from './cp-mata-kuliah/CpMataKuliah';
import CpMataKuliahForm from './cp-mata-kuliah/CpMataKuliahForm';
import PemetaanPenliaian from './pemetaan/PemetaanPenilaian';
import NilaiMahasiswa1 from './nilai-mahasiswa/NilaiMahasiswa1';
import NilaiMahasiswaImportExcel from './nilai-mahasiswa/NilaiMahasiswaImportExcel';
import NilaiMahasiswaByNIM from './nilai-mahasiswa/NilaiMahasiswaByNIM';
import NilaiMahasiswaByKodeMatkul from './nilai-mahasiswa/NilaiMahasiswaByKodeMatkul';
import SKPIPage from './validasi-kelulusan/SKPIPage';
import CPLDetail from './skpi/CPLDetail';
import PemetaanKurikulumMK from './pemetaan/PemetaanKurikulumMK';
import SettingsSurat from './settings-surat/SettingsSurat';
import SettingsSuratForm from './settings-surat/SettingsSuratForms';
import BahanKajian from './bahan-kajian/BahanKajian';
import BahanKajianForm from './bahan-kajian/BahanKajianForm';
import SuratPenugasanSekre from './surat-penugasan-sekre/SuratPenugasanSekre';
import SuratPenugasanSekreForm from './surat-penugasan-sekre/SuratPenugasanSekreForm';
import ExportSuratPenugasanSekre from './surat-penugasan-sekre/ExportSuratPenugasanSekre';
import SkpiRecap from './skpi-recap/SkpiRecap';

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

          {/* <Route path="pelaksanaan-pengabdian">
            <Route path="penugasan-pengabdian">
            <Route index element={<PenugasanPengabdian />} />
            <Route path="form" element={<PenugasanPengabdianForm />} />
            <Route path=":id" element={<PenugasanPengabdianForm />} />
            </Route>
          </Route> */}

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
                <RequireAuthWithRoles
                  allowedRoles={['Admin', 'Superadmin', 'Faculty Member']}
                />
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
                <Route
                  path="import"
                  element={<PenugasanPengajaranImportExcel />}
                />
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
              <Route path="program-studi">
                <Route index element={<ProgramStudi />} />
                <Route path="form" element={<ProgramStudiForm />} />
                <Route path=":id" element={<ProgramStudiForm />} />
              </Route>
              <Route path="settings-surat">
                <Route index element={<SettingsSurat />} />
                <Route path="form" element={<SettingsSuratForm />} />
                <Route path=":id" element={<SettingsSuratForm />} />
              </Route>
              <Route path="penugasan">
                <Route index element={<SuratPenugasanSekre />} />
                <Route path="form" element={<SuratPenugasanSekreForm />} />
                <Route path=":id" element={<SuratPenugasanSekreForm />} />
                <Route
                  path="export/:id"
                  element={<ExportSuratPenugasanSekre />}
                />
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
            <Route path="dokumen-akreditasi">
              <Route index element={<DokumenAkreditasi />} />
              <Route path="form" element={<DokumenAkreditasiForm />} />
              <Route path=":id" element={<DokumenAkreditasiForm />} />
            </Route>
            <Route path="simulasi-matriks">
              <Route index element={<SimulasiMatriks />} />
              <Route path="form" element={<SimulasiMatriksForm />} />
              <Route path=":id" element={<SimulasiMatriksForm />} />
            </Route>
            {/* <Route path="matriks-penilaian">
              <Route index element={<MatriksPenilaian />} />
            </Route> */}
            {/* <Route
              element={
                <RequireAuthWithRoles allowedRoles={['Admin', 'Superadmin']} />
              }
            >
              <Route path="daftar-matriks-penilaian">
                <Route index element={<MatriksPenilaianAdmin />} />

                <Route
                  path="matriks-penilaian/:id"
                  element={<MatriksPenilaian />}
                />
                <Route path="form" element={<UserForm />} />
                <Route path=":id" element={<UserForm />} />
              </Route>
            </Route> */}
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
            {/* <Route path="monitoring-akademik">
              <Route index element={<MonitoringMahasiswa1 />} />
              <Route path=":nim" element={<MonitoringMahasiswaByNIM />} />
              <Route
                path="matkul/:kodematkul"
                element={<MonitoringMahasiswaByKodeMatkul />}
              />
              <Route
                path="import"
                element={<MonitoringMahasiswaImportExcel />}
              />
            </Route> */}
            <Route path="degreeaudit-kelulusan">
              <Route index element={<DegreeAuditKelulusan />} />
              <Route path=":id" element={<DegreeAuditKelulusanForm />} />
            </Route>
            <Route path="validasi-kelulusan">
              <Route index element={<ValidasiMahasiswa />} />
              <Route path=":nim" element={<ValidasiMahasiswaByNIM />} />
            </Route>
            <Route path="validasi-mata-kuliah">
              <Route index element={<ValidasiMataKuliah />} />
              <Route
                path="matkul/:kodematkul"
                element={<ValidasiMataKuliahDetails />}
              />
            </Route>
            <Route path="skpi/:nim" element={<SKPIPage />} />
            <Route
              path="skpi/:nim/cpl-detail/:cplCode"
              element={<CPLDetail />}
            />
            <Route path="skpirecap" element={<SkpiRecap />} />
          </Route>

          {/* Route path untuk Kurikulum OBE */}
          <Route path="kurikulum-obe" element={<Outlet />}>
            {/* <Route path="dashboard">
              <Route index element={<DashboardKurikulumOBE />} />
            </Route> */}
            <Route path="profil-lulusan">
              <Route index element={<DataProfilLulusan />} />
              <Route path="form" element={<DataProfilLulusanForm />} />
              <Route path=":id" element={<DataProfilLulusanForm />} />
            </Route>
            <Route path="bahan-kajian">
              <Route index element={<BahanKajian />} />
              <Route path="form" element={<BahanKajianForm />} />
              <Route path=":id" element={<BahanKajianForm />} />
            </Route>
            <Route path="capaian-pembelajaran">
              <Route index element={<DataCapaianPembelajaran />} />
              <Route path="form" element={<DataCapaianPembelajaranForm />} />
              <Route path=":id" element={<DataCapaianPembelajaranForm />} />
            </Route>
            <Route path="cpmk">
              <Route index element={<CpMataKuliah />} />
              <Route path="form" element={<CpMataKuliahForm />} />
              <Route path=":id" element={<CpMataKuliahForm />} />
            </Route>
            <Route path="pemetaan-kurikulum-mk">
              <Route index element={<PemetaanKurikulumMK />} />
            </Route>
            <Route path="pemetaan-cpl-cpmk-mk">
              <Route index element={<PemetaanCplCpmkMk />} />
            </Route>
            <Route path="pemetaan-mk-cpl-cpmk">
              <Route index element={<PemetaanMkCpmkCpl />} />
            </Route>
            <Route path="pemetaan-penilaian">
              <Route index element={<PemetaanPenliaian />} />
            </Route>
            <Route path="nilai-detail">
              <Route index element={<NilaiMahasiswa1 />} />
              <Route path=":nim" element={<NilaiMahasiswaByNIM />} />
              <Route
                path="matkul/:kodematkul"
                element={<NilaiMahasiswaByKodeMatkul />}
              />
              <Route path="import" element={<NilaiMahasiswaImportExcel />} />
            </Route>
            <Route path="monitoring-akademik">
              <Route index element={<MonitoringMahasiswa1 />} />
              <Route path=":nim" element={<MonitoringMahasiswaByNIM />} />
              <Route
                path="matkul/:kodematkul"
                element={<MonitoringMahasiswaByKodeMatkul />}
              />
              <Route
                path="import"
                element={<MonitoringMahasiswaImportExcel />}
              />
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
