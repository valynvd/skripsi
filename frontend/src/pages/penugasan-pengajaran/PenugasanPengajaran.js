import React, { useState, useEffect } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import PenugasanPengajaranTable from './components/PenugasanPengajaranTable';
import {
  useDeletePenugasanPengajaran,
  usePenugasanPengajaranData,
} from '../../hooks/usePenugasanPengajaran';
import Modal from '../../components/Modal';
import { useQueryClient } from 'react-query';

const PenugasanPengajaran = () => {
  const { data: response, isLoading } = usePenugasanPengajaranData();
  const { mutate: deletePenugasanPengajaran } = useDeletePenugasanPengajaran();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(response?.data);
  }, [response]);

  return (
    <section id="penugasan-pengajaran" className="section-container">
      <Modal
        isOpen={openModal}
        setIsOpen={setOpenModal}
        deleteFunc={() =>
          deletePenugasanPengajaran(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('penugasan-pengajaran');
              setOpenModal(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Penugasan Pengajaran</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/penugasan-pengajaran/form"
        >
          Buat Penugasan Pengajaran
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PenugasanPengajaranTable
          setSelectedItem={setSelectedItem}
          setOpenModal={setOpenModal}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default PenugasanPengajaran;
