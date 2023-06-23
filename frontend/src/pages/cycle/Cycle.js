/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import CycleTable from './components/CycleTable';
import { useCycleData, useDeleteCycle } from '../../hooks/useCycle';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';

const Cycle = () => {
  const {
    data: response,
    isLoading,
    refetch: cycleDataRefetch,
  } = useCycleData();
  const { mutate: deleteCycle } = useDeleteCycle();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userRole = useCheckRole();

  return (
    <section id="cycle" className="section-container">
      <ModalDelete
        title="Siklus"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteCycle(selectedItem, {
            onSuccess: () => {
              cycleDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Siklus</p>
        {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/data-master/cycle/form"
          >
            Buat Siklus
          </PrimaryButton>
        )}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <CycleTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default Cycle;
