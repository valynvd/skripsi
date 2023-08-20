import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import {
  useGrupMahasiswaData,
  useDeleteGrupMahasiswa,
} from '../../hooks/useGrupMahasiswa';
import GrupMahasiswaTable from './components/GrupMahasiswaTable';
import { useQueryClient } from 'react-query';

const GrupMahasiswa = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteGrupMahasiswa } = useDeleteGrupMahasiswa();
  const { data: responseData, isLoading} =
    useGrupMahasiswaData({
      enabled: !!userRole.admin,
    });

  return (
    <section id="broadcast-pesan" className="section-container">
      <ModalDelete
        title="Broadcast Pesan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteGrupMahasiswa(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                queryClient.invalidateQueries('broadcast-pesan');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Grup Mahasiswa
          {!userRole.admin}
        </p>
        
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/pengaturan-grup/import"
        >
          Import Data Dari Excel
        </PrimaryButton>
        
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <GrupMahasiswaTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default GrupMahasiswa;