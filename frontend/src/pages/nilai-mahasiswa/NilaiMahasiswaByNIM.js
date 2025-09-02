/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useMonitoringMahasiswaDataByNIM,
  useDeleteMonitoringMahasiswa,
} from '../../hooks/useMonitoringMahasiswa';
import { useQueryClient } from 'react-query';
import NilaiMahasiswaTable from './components/NilaiMahasiswaTable';

const NilaiMahasiswaByNIM = () => {
  const userRole = useCheckRole();
  const { nim } = useParams();
  const [nim1, setNim] = useState('');
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const {
    data: responseData,
    isLoading,
    refetch: dataMahasiswaRefetch,
  } = useMonitoringMahasiswaDataByNIM(nim);
  const { mutate: deleteMonitoringMahasiswa } = useDeleteMonitoringMahasiswa();

  const navigate = useNavigate();

  return (
    <section id="nilai-mahasiswa" className="section-container">
      <ModalDelete
        title="Nilai Mahasiswa"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteMonitoringMahasiswa(selectedItem, {
            onSuccess: () => {
              dataMahasiswaRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('nilai-mahasiswa');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Monitoring Mahasiswa
          {!userRole.admin}
        </p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/nilai-detail/import"
        >
          Import Excel
        </PrimaryButton>
      </div>

      <form className="flex gap-4 flex-wrap items-center mb-4 mt-10">
        <div className="relative w-[]20rem">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AiOutlineSearch size={20} color="gray" />
          </div>
          <input
            type="text"
            id="simple-search"
            className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
            placeholder="NIM"
            onChange={(e) => setNim(e.target.value)}
          />
        </div>
        <PrimaryButton
          onClick={() => {
            navigate(`/kurikulum-obe/nilai-detail/${nim1}`);
          }}
        >
          Cari
        </PrimaryButton>
      </form>

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

export default NilaiMahasiswaByNIM;
