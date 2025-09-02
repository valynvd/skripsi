import React, { useState } from 'react';
import {
  useDeleteMataKuliah,
  useMataKuliahData,
} from '../../hooks/useMataKuliah';
import ModalDelete from '../../components/ModalDelete';
import PemetaanKurikulumMKTable from './components/PemetaanKurikulumMKTable';

const PemetaanKurikulumMK = () => {
  const {
    data: responseData,
    isLoading,
    refetch: mataKuliahRefetch,
  } = useMataKuliahData();

  const { mutate: deleteMataKuliah } = useDeleteMataKuliah();

  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  return (
    <>
      <section id="pemetaan-kurikulum" className="section-container">
        <ModalDelete
          title="Kurikulum Mata Kuliah"
          isOpen={openModalDelete}
          setIsOpen={setOpenModalDelete}
          deleteFunc={() =>
            deleteMataKuliah(selectedItem, {
              onSuccess: () => {
                mataKuliahRefetch();
                setOpenModalDelete(false);
              },
            })
          }
        />
        <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
          <p className="font-semibold text-lg">
            Pemetaan Kurikulum & Mata Kuliah
          </p>
        </div>
        <div className="mt-8 w-full rounded-t-lg">
          <PemetaanKurikulumMKTable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={isLoading}
            data={responseData?.data ?? []}
          />
        </div>
      </section>
    </>
  );
};

export default PemetaanKurikulumMK;
