import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ProgramStudiTable from './components/ProgramStudiTable';
import {
  useDeleteProgramStudi,
  useProgramStudiData,
} from '../../hooks/useProgramStudi';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';

const ProgramStudi = () => {
  const { data: response, isLoading } = useProgramStudiData();
  const { mutate: deleteProgramStudi } = useDeleteProgramStudi();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {}, [response]);

  return (
    <section id="program-studi" className="section-container">
      <ModalDelete
        title="Program Studi"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteProgramStudi(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('program-studi');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Program Studi</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/program-studi/form"
        >
          Buat Program Studi
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <ProgramStudiTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default ProgramStudi;
