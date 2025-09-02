/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import {
  useSuratPenugasanSekreData,
  useDeleteSuratPenugasanSekre,
} from '../../hooks/useSuratPenugasanSekre';
import { useQueryClient } from 'react-query';
import SuratPenugasanSekreTable from './components/SuratPenugasanSekreTable';

const SuratPenugasanSekre = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteSuratPenugasanSekre } = useDeleteSuratPenugasanSekre();
  const {
    data: responseData,
    isLoading,
    refetch: suratPenugasanSekreRefetch,
  } = useSuratPenugasanSekreData({
    enabled: !!userRole.admin,
  });

  return (
    <section id="surat-penugasan-sekre" className="section-container">
      <ModalDelete
        title="Surat Penugasan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteSuratPenugasanSekre(selectedItem, {
            onSuccess: () => {
              suratPenugasanSekreRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('surat-penugasan');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Data Surat Penugasan
          {!userRole.admin}
        </p>

        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/penugasan/form"
        >
          Buat Penugasan Baru
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <SuratPenugasanSekreTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default SuratPenugasanSekre;
