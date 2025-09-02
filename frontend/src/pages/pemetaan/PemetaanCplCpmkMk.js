import React, { useState } from 'react';
import {
  useDeleteMataKuliah,
  useMataKuliahData,
} from '../../hooks/useMataKuliah';
import ModalDelete from '../../components/ModalDelete';
import PemetaanCplCpmkMkTable from './components/PemetaanCplCpmkMkTable';

const PemetaanCplCpmkMk = () => {
  const {
    data: responseData,
    isLoading,
    refetch: mataKuliahDataRefetch,
  } = useMataKuliahData();

  const { mutate: deleteMataKuliah } = useDeleteMataKuliah();

  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <section id="pemetaan-cpl-cpmk-mk" className="section-container">
      <ModalDelete
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
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Pemetaan CPL-CPMK-MK</p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PemetaanCplCpmkMkTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={responseData?.data ?? []}
        />
      </div>
    </section>
  );
};

export default PemetaanCplCpmkMk;
