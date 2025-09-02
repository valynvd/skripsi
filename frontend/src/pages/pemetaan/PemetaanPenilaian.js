import React, { useState } from 'react';
import {
  useDeleteMataKuliah,
  useMataKuliahData,
} from '../../hooks/useMataKuliah';
import ModalDelete from '../../components/ModalDelete';
import PemetaanPenilaianTable from './components/PemetaanPenilaianTable';
// import { usePenilaianData } from '../../hooks/usePenilaian';

const PemetaanPenliaian = () => {
  const {
    data: responseData,
    isLoading,
    refetch: mataKuliahDataRefetch,
    // } = usePenilaianData();
  } = useMataKuliahData();
  const { mutate: deleteMataKuliahData } = useDeleteMataKuliah();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section id="pemetaan-penilaian" className="section-container">
      <ModalDelete
        title="Penilaian"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteMataKuliahData(selectedItem, {
            onSuccess: () => {
              mataKuliahDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Pemetaan Penilaian</p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PemetaanPenilaianTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={responseData?.data ?? []}
        />
      </div>
    </section>
  );
};

export default PemetaanPenliaian;
