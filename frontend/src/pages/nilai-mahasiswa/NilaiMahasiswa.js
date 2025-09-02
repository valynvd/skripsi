/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import {
  useMonitoringMahasiswaData,
  useDeleteMonitoringMahasiswa,
} from '../../hooks/useMonitoringMahasiswa';
import { useQueryClient } from 'react-query';
import NilaiMahasiswaTable from './components/NilaiMahasiswaTable';

const NilaiMahasiswa = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteMonitoringMahasiswa } = useDeleteMonitoringMahasiswa();
  const {
    data: responseData,
    isLoading,
    refetch: dataMahasiswaRefetch,
  } = useMonitoringMahasiswaData({
    enabled: !!userRole.admin,
  });

  return (
    <section id="monitoring-mahasiswa" className="section-container">
      <ModalDelete
        title="Monitoring Mahasiswa"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteMonitoringMahasiswa(selectedItem, {
            onSuccess: () => {
              dataMahasiswaRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('monitoring-mahasiswa');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Nilai Mahasiswa Untuk CPMK
          {!userRole.admin}
        </p>

        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/monitoring-akademik/import"
          // link="/degreeaudit/monitoring-akademik/import"
        >
          Import Excel
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <NilaiMahasiswaTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default NilaiMahasiswa;
