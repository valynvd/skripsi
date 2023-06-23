import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import PenugasanPengajaranTable from './components/PenugasanPengajaranTable';
import {
  useDeletePenugasanPengajaran,
  usePenugasanPengajaranData,
} from '../../hooks/usePenugasanPengajaran';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';

const PenugasanPengajaran = () => {
  const { data: response, isLoading } = usePenugasanPengajaranData();
  const { mutate: deletePenugasanPengajaran } = useDeletePenugasanPengajaran();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(response?.data);
  }, [response]);

  return (
    <section id="penugasan-pengajaran" className="section-container">
      <ModalDelete
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deletePenugasanPengajaran(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('penugasan-pengajaran');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Penugasan Pengajaran</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/penugasan-pengajaran/form"
        >
          Buat Penugasan Pengajaran
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PenugasanPengajaranTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default PenugasanPengajaran;
