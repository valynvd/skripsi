import React from 'react';
import ValidasiMataKuliahTable from './components/ValidasiMataKuliahTable';
import {
  useMonitoringMahasiswaDataByNoGraded,
} from '../../hooks/useMonitoringMahasiswa';

const ValidasiMataKuliah = () => {
  const {
    data: responseData,
    isLoading,
  } = useMonitoringMahasiswaDataByNoGraded();
  // const { mutate: deleteMataKuliah } = useDeleteMataKuliah();

  return (
    <section id="mataKuliah" className="section-container">
      {/* <ModalDelete
        title="Mata Kuliah"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteMataKuliah(selectedItem, {
            onSuccess: () => {
              mataKuliahDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      /> */}
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Mata Kuliah Belum Di Nilai</p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <ValidasiMataKuliahTable
          loading={isLoading}
          data={responseData?.data ?? []}
        />
      </div>
    </section>
  );
};

export default ValidasiMataKuliah;
