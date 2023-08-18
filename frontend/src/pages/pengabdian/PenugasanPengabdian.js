/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import PenugasanPengabdianTable from './components/PenugasanPenelitianTable';
import {
  useDeletePenugasanPengabdian,
  usePenugasanPengabdianByDosen,
} from '../../hooks/usePenugasanPengabdian';
import useAuth from '../../hooks/useAuth';

const PenugasanPengabdian = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const {
    auth: { userData },
  } = useAuth();
  const {
    data: penugasanPengabdianData,
    isLoading: penugasanPengabdianDataIsLoading,
  } = usePenugasanPengabdianByDosen(userData.id, {
    select: (response) => {
      return response.data;
    },
  });

  const { mutate: deletePenugasanPengabdian } = useDeletePenugasanPengabdian();

  return (
    <section id="pengabdian" className="section-container">
      <ModalDelete
        title="Penugasan Pengabdian"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deletePenugasanPengabdian(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('penugasan-pengabdian-by-dosen');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Pengabdian</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/pelaksanaan-pengabdian/penugasan-pengabdian/form"
        >
          Buat Pengabdian
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PenugasanPengabdianTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={penugasanPengabdianDataIsLoading}
          data={penugasanPengabdianData || []}
        />
      </div>
    </section>
  );
};

export default PenugasanPengabdian;
