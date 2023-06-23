/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import SuratPenugasanTable from './components/SuratPenugasanTable';
import {
  useDeleteSuratPenugasan,
  useSuratPenugasanData,
} from '../../hooks/useSuratPenugasan';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';

const Pengabdian = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  return (
    <section id="pengabdian" className="section-container">
      {/* <ModalDelete
        title="Surat Penugasan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteSuratPenugasan(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('surat-penugasan');
              setOpenModalDelete(false);
            },
          })
        }
      /> */}
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Pengabdian</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/pelaksanaan-pendidikan/surat-penugasan/form"
        >
          Buat Pengabdian
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <SuratPenugasanTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={false}
          data={[
            {
              judul: 'Program Community Development II - Tahun 2022',
              bidang_keilmuan: '',
              tahun_pelaksanaan: '	2022/2023',
              lama_kegiatan: '1 Tahun',
              rubrik_bkd: 'Kategori Kegiatan sesuai dengan PO BKD 2021',
            },
          ]}
        />
      </div>
    </section>
  );
};

export default Pengabdian;
