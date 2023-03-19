import React, { useState, useEffect } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import DosenTable from './components/DosenTable';
import { useDeleteDosen, useDosenData } from '../../hooks/useDosen';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import { useCheckRole } from '../../hooks/useCheckRole';

const Dosen = () => {
  const { data: response, isLoading } = useDosenData();
  const { mutate: deleteDosen } = useDeleteDosen();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userRole = useCheckRole();
  const queryClient = useQueryClient();

  useEffect(() => {
    console.log(response?.data);
  }, [response]);

  return (
    <section id="dosen" className="section-container">
      <ModalDelete
        title="Dosen"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteDosen(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('dosen');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Dosen</p>
        {userRole.admin && (
          <PrimaryButton icon={<BiPlusCircle size={22} />} link="/dosen/form">
            Buat Dosen
          </PrimaryButton>
        )}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DosenTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default Dosen;
