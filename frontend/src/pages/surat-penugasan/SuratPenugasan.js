import React, { useState, useEffect } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import SuratPenugasanTable from './components/SuratPenugasanTable';
import {
  useDeleteSuratPenugasan,
  useSuratPenugasanData,
} from '../../hooks/useSuratPenugasan';
import Modal from '../../components/Modal';
import { useQueryClient } from 'react-query';

const SuratPenugasan = () => {
  const { data: response, isLoading } = useSuratPenugasanData();
  const { mutate: deleteSuratPenugasan } = useDeleteSuratPenugasan();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(response?.data);
  }, [response]);

  return (
    <section id="surat-penugasan" className="p-6 bg-white rounded-lg over">
      <Modal
        isOpen={openModal}
        setIsOpen={setOpenModal}
        deleteFunc={() =>
          deleteSuratPenugasan(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('surat-penugasan');
              setOpenModal(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Surat Penugasan</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/surat-penugasan/form"
        >
          Buat Surat Penugasan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <SuratPenugasanTable
          setSelectedItem={setSelectedItem}
          setOpenModal={setOpenModal}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default SuratPenugasan;
