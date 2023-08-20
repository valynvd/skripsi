/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import PublikasiKaryaTable from './components/PublikasiKaryaTable';
import {
  useDeletePublikasiKarya,
  usePublikasiKaryaByDosen,
  usePublikasiKaryaByProdi,
  usePublikasiKaryaData,
} from '../../hooks/usePublikasiKarya';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';
import PublikasiKaryaTableDosen from './components/PublikasiKaryaTableDosen';
import PublikasiKaryaTableKaprodi from './components/PublikasiKaryaTableKaprodi';

const PublikasiKarya = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const userRole = useCheckRole();
  const {
    auth: { userData },
  } = useAuth();

  const {
    data: publikasiKaryaData,
    isLoading: publikasiKaryaDataIsLoading,
    refetch: publikasiKaryaDataRefetch,
  } = usePublikasiKaryaData({
    enabled: !!userRole.admin,
    select: (response) => {
      return response.data;
    },
  });

  const {
    data: publikasiKaryaDataByDosen,
    isLoading: publikasiKaryaDataByDosenIsLoading,
    refetch: publikasiKaryaDataByDosenRefetch,
  } = usePublikasiKaryaByDosen(userData.id, {
    enabled: !!userRole.facultyMember,
    select: (response) => {
      return response.data;
    },
  });

  const {
    data: publikasiKaryaDataByProdi,
    isLoading: publikasiKaryaDataByProdiIsLoading,
    refetch: publikasiKaryaDataByProdiRefetch,
  } = usePublikasiKaryaByProdi({
    enabled: !!userRole.kaprodi,
    select: (response) => {
      return response.data;
    },
  });

  const { mutate: deletePublikasiKarya } = useDeletePublikasiKarya();

  return (
    <section id="publikasi-karya" className="section-container">
      <ModalDelete
        title="Publikasi Karya"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deletePublikasiKarya(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                publikasiKaryaDataRefetch();
              } else if (userRole.dosen) {
                publikasiKaryaDataByDosenRefetch();
              } else if (userRole.kaprodi) {
                publikasiKaryaDataByProdiRefetch();
              }

              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Publikasi Karya</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/pelaksanaan-penelitian/publikasi-karya/form"
        >
          Buat Publikasi Karya
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        {userRole.admin && (
          <PublikasiKaryaTable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={publikasiKaryaDataIsLoading}
            data={publikasiKaryaData || []}
          />
        )}
        {userRole.kaprodi && (
          <PublikasiKaryaTableKaprodi
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={publikasiKaryaDataByProdiIsLoading}
            data={publikasiKaryaDataByProdi || []}
          />
        )}
        {userRole.dosen && (
          <PublikasiKaryaTableDosen
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={publikasiKaryaDataByDosenIsLoading}
            data={publikasiKaryaDataByDosen || []}
          />
        )}
      </div>
    </section>
  );
};

export default PublikasiKarya;
