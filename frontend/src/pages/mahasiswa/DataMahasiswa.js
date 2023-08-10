/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import {
  useDataMahasiswaData,
  useDeleteDataMahasiswa,
} from '../../hooks/useDataMahasiswa';
import DataMahasiswaTable from './components/DataMahasiswaTable';
import { useQueryClient } from 'react-query';

const DataMahasiswa = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteDataMahasiswa } = useDeleteDataMahasiswa();
  const { data: responseData, isLoading, refetch: dataMahasiswaRefetch} =
    useDataMahasiswaData({
      enabled: !!userRole.admin,
    });

  return (
    <section id="mahasiswa-member" className="section-container">
      <ModalDelete
        title="Mahasiswa Member"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteDataMahasiswa(selectedItem, {
            onSuccess: () => {
              dataMahasiswaRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('mahasiswa-member');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Data Mahasiswa
          {!userRole.admin}
        </p>
        
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/data-mahasiswa/form"
        >
          Input Data Baru
        </PrimaryButton>
        
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DataMahasiswaTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default DataMahasiswa;