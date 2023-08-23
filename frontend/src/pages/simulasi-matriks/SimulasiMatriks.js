/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import SimulasiMatriksTable from './components/SimulasiMatriksTable';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useDeleteSimulasiMatriks,
  useSimulasiMatriksData,
} from '../../hooks/useSimulasiMatriks';
import ModalDelete from '../../components/ModalDelete';

const SimulasiMatriks = () => {
  const {
    data: simulasiMatriksData,
    isLoading: isLoadingSimulasiMatriksData,
    refetch: simulasiMatriksDataRefetch,
  } = useSimulasiMatriksData({
    select: (response) => response?.data,
  });

  const { mutate: deleteSimulasiMatriks } = useDeleteSimulasiMatriks();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState();

  return (
    <section id="simulasi-matriks" className="section-container">
      <ModalDelete
        title="Simulasi Matriks"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteSimulasiMatriks(selectedItem, {
            onSuccess: () => {
              simulasiMatriksDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Simulasi Matriks</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/akreditasi/simulasi-matriks/form"
        >
          Buat Simulasi Matriks
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <SimulasiMatriksTable
          loading={isLoadingSimulasiMatriksData}
          data={simulasiMatriksData ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default SimulasiMatriks;
