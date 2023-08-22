/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import DokumenAkreditasiTable from './components/DokumenAkreditasiTable';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useDeleteDokumenAkreditasi,
  useDokumenAkreditasiData,
} from '../../hooks/useDokumenAkreditasi';
import ModalDelete from '../../components/ModalDelete';

const DokumenAkreditasi = () => {
  const {
    data: dokumenAkreditasiData,
    isLoading: isLoadingDokumenAkreditasiData,
    refetch: dokumenAkreditasiDataRefetch,
  } = useDokumenAkreditasiData({
    select: (response) => {
      return response?.data;
    },
  });

  const { mutate: deleteDokumenAkreditasi } = useDeleteDokumenAkreditasi();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState();

  return (
    <section id="dokumen-akreditasi" className="section-container">
      <ModalDelete
        title="Dokumen Akreditasi"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteDokumenAkreditasi(selectedItem, {
            onSuccess: () => {
              dokumenAkreditasiDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Dokumen Akreditasi</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/akreditasi/dokumen-akreditasi/form"
        >
          Buat Dokumen Akreditasi
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DokumenAkreditasiTable
          loading={isLoadingDokumenAkreditasiData}
          data={dokumenAkreditasiData ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default DokumenAkreditasi;
