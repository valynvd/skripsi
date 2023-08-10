/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { useLocation } from 'react-router-dom';
// import { PrimaryButton } from '../../components/PrimaryButton';
// import { BiPlusCircle } from 'react-icons/bi';
import {
  useAssignMahasiswatoGrupByNamaGrup,
  useDeleteAssignMahasiswatoGrup,
} from '../../hooks/useAssignMahasiswatoGrup';
import MahasiswaMemberTable from './components/MahasiswaMemberTable';
import { useQueryClient } from 'react-query';
import BreadCrumbs from '../../components/BreadCrumbs';

const MahasiswaMember = () => {
  const userRole = useCheckRole();
  const { state } = useLocation();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteAssignMahasiswatoGrup } = useDeleteAssignMahasiswatoGrup();
  const { data: responseData, isLoading} =
    useAssignMahasiswatoGrupByNamaGrup(state);

  return (
    <section id="mahasiswa-member" className="section-container">
      <ModalDelete
        title="Mahasiswa Member"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteAssignMahasiswatoGrup(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                queryClient.invalidateQueries('mahasiswa-member');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <BreadCrumbs
          links={[
              {
                  name: 'List Grup Mahasiswa',
                  link: '/stem-chatbot/pengaturan-grup',
              },
              { 
                  name: 'Mahasiswa Member'
              },
          ]}
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="text-lg font-semibold">
            {state}
        </p>
        {/* <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/konsol-chatbot/timelineakademik/form"
        >
          Tambah Pertanyaan
        </PrimaryButton> */}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <MahasiswaMemberTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default MahasiswaMember;