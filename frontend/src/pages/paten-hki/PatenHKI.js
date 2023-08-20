/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import PatenHKITable from './components/PatenHKITable';
import {
  useDeletePatenHKI,
  usePatenHKIByDosen,
  usePatenHKIByProdi,
  usePatenHKIData,
} from '../../hooks/usePatenHKI';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';
import PatenHKITableDosen from './components/PatenHKITableDosen';
import PatenHKITableKaprodi from './components/PatenHKITableKaprodi';

const PatenHKI = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const userRole = useCheckRole();
  const {
    auth: { userData },
  } = useAuth();

  const {
    data: patenHKIData,
    isLoading: patenHKIDataIsLoading,
    refetch: patenHKIDataRefetch,
  } = usePatenHKIData({
    enabled: !!userRole.admin,
    select: (response) => {
      return response.data;
    },
  });

  const {
    data: patenHKIDataByDosen,
    isLoading: patenHKIDataByDosenIsLoading,
    refetch: patenHKIDataByDosenRefetch,
  } = usePatenHKIByDosen(userData.id, {
    enabled: !!userRole.facultyMember,
    select: (response) => {
      return response.data;
    },
  });

  const {
    data: patenHKIDataByProdi,
    isLoading: patenHKIDataByProdiIsLoading,
    refetch: patenHKIDataByProdiRefetch,
  } = usePatenHKIByProdi({
    enabled: !!userRole.kaprodi,
    select: (response) => {
      return response.data;
    },
  });

  const { mutate: deletePatenHKI } = useDeletePatenHKI();

  return (
    <section id="paten-hki" className="section-container">
      <ModalDelete
        title="Paten/HKI"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deletePatenHKI(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                patenHKIDataRefetch();
              } else if (userRole.dosen) {
                patenHKIDataByDosenRefetch();
              } else if (userRole.kaprodi) {
                patenHKIDataByProdiRefetch();
              }

              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Paten/HKI</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/pelaksanaan-penelitian/paten-hki/form"
        >
          Buat Paten/HKI
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        {userRole.admin && (
          <PatenHKITable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={patenHKIDataIsLoading}
            data={patenHKIData || []}
          />
        )}
        {userRole.kaprodi && (
          <PatenHKITableKaprodi
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={patenHKIDataByProdiIsLoading}
            data={patenHKIDataByProdi || []}
          />
        )}
        {userRole.dosen && (
          <PatenHKITableDosen
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={patenHKIDataByDosenIsLoading}
            data={patenHKIDataByDosen || []}
          />
        )}
      </div>
    </section>
  );
};

export default PatenHKI;
