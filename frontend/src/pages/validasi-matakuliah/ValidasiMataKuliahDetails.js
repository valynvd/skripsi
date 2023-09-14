import React from 'react';
import ValidasiMataKuliahDetailsTable from './components/ValidasiMataKuliahDetailsTable';
import {
  useMonitoringMahasiswaDataByNoGradedKodeMataKuliah,
} from '../../hooks/useMonitoringMahasiswa';
import { useParams } from 'react-router-dom';

const ValidasiMataKuliahDetails = () => {
  const { kodematkul } = useParams();
  const {
    data: responseData,
    isLoading,
  } = useMonitoringMahasiswaDataByNoGradedKodeMataKuliah(kodematkul);
  // const { mutate: deleteMataKuliah } = useDeleteMataKuliah();

  return (
    <section id="mataKuliah" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Mata Kuliah Belum Di Nilai</p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <ValidasiMataKuliahDetailsTable
          loading={isLoading}
          data={responseData?.data ?? []}
        />
      </div>
    </section>
  );
};

export default ValidasiMataKuliahDetails;
