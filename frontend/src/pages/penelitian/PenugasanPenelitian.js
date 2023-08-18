/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import PenugasanPenelitianTable from './components/PenugasanPenelitianTable';
import {
  useDeletePenugasanPenelitian,
  usePenugasanPenelitianByDosen,
} from '../../hooks/usePenugasanPenelitian';
import useAuth from '../../hooks/useAuth';

const PenugasanPenelitian = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const {
    auth: { userData },
  } = useAuth();
  const {
    data: penugasanPenelitianData,
    isLoading: penugasanPenelitianDataIsLoading,
  } = usePenugasanPenelitianByDosen(userData.id, {
    select: (response) => {
      return response.data;
    },
  });

  const { mutate: deletePenugasanPenelitian } = useDeletePenugasanPenelitian();

  useEffect(() => {
    console.log(penugasanPenelitianData);
  }, [penugasanPenelitianData]);

  return (
    <section id="penelitian" className="section-container">
      <ModalDelete
        title="Penugasan Penelitian"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deletePenugasanPenelitian(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('penugasan-penelitian-by-dosen');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Penelitian</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/pelaksanaan-penelitian/penugasan-penelitian/form"
        >
          Buat Penelitian
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PenugasanPenelitianTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={penugasanPenelitianDataIsLoading}
          data={penugasanPenelitianData || []}
        />
      </div>
    </section>
  );
};

export default PenugasanPenelitian;
