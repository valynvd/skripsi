/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import PenugasanPengabdianTable from './components/PenugasanPengabdianTable';
import {
  useDeletePenugasanPengabdian,
  usePenugasanPengabdianByDosen,
  usePenugasanPengabdianByProdi,
  usePenugasanPengabdianData,
} from '../../hooks/usePenugasanPengabdian';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';
import PenugasanPengabdianTableDosen from './components/PenugasanPengabdianTableDosen';
import PenugasanPengabdianTableKaprodi from './components/PenugasanPengabdianTableKaprodi';

const PenugasanPengabdian = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const userRole = useCheckRole();
  const {
    auth: { userData },
  } = useAuth();

  const {
    data: penugasanPengabdianData,
    isLoading: penugasanPengabdianDataIsLoading,
    refetch: penugasanPengabdianDataRefetch,
  } = usePenugasanPengabdianData({
    enabled: !!userRole.admin,
    select: (response) => {
      return response.data;
    },
  });

  const {
    data: penugasanPengabdianDataByDosen,
    isLoading: penugasanPengabdianDataByDosenIsLoading,
    refetch: penugasanPengabdianDataByDosenRefetch,
  } = usePenugasanPengabdianByDosen(userData.id, {
    enabled: !!userRole.facultyMember,
    select: (response) => {
      return response.data;
    },
  });

  const {
    data: penugasanPengabdianDataByProdi,
    isLoading: penugasanPengabdianDataByProdiIsLoading,
    refetch: penugasanPengabdianDataByProdiRefetch,
  } = usePenugasanPengabdianByProdi({
    enabled: !!userRole.kaprodi,
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
              if (userRole.admin) {
                penugasanPengabdianDataRefetch();
              } else if (userRole.dosen) {
                penugasanPengabdianDataByDosenRefetch();
              } else if (userRole.kaprodi) {
                penugasanPengabdianDataByProdiRefetch();
              }

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
        {userRole.admin && (
          <PenugasanPengabdianTable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={penugasanPengabdianDataIsLoading}
            data={penugasanPengabdianData || []}
          />
        )}
        {userRole.kaprodi && (
          <PenugasanPengabdianTableKaprodi
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={penugasanPengabdianDataByProdiIsLoading}
            data={penugasanPengabdianDataByProdi || []}
          />
        )}
        {userRole.dosen && (
          <PenugasanPengabdianTableDosen
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={penugasanPengabdianDataByDosenIsLoading}
            data={penugasanPengabdianDataByDosen || []}
          />
        )}
      </div>
    </section>
  );
};

export default PenugasanPengabdian;
