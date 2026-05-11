import React, { useState } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';

import BreadCrumbs from '../../components/BreadCrumbs';
import ModalDelete from '../../components/ModalDelete';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useCheckRole } from '../../hooks/useCheckRole';
import { useDeleteRuangan, useRuanganData } from '../../hooks/useRuangan';
import RuanganTable from './components/RuanganTable';
import ClipLoader from 'react-spinners/ClipLoader';

const Ruangan = () => {
  const { data: responseData, isLoading } = useRuanganData();
  const { mutate: deleteRuangan } = useDeleteRuangan();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const userRole = useCheckRole();

  return (
    <section id="ruangan" className="section-container">
      <ModalDelete
        title="Ruangan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteRuangan(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('ruangan');
              setOpenModalDelete(false);
            },
          })
        }
      />

      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold">
          <BreadCrumbs
            links={[{ name: 'Ruangan' }]}
          />
          Master Ruangan
        </p>
        <p className="text-sm text-gray-500">
          Kelola ruang kelas dan laboratorium yang dipakai scheduler.
        </p>
      </div>

      <div className="mt-6 flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Ruangan</p>
        {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/data-master/ruangan/form"
          >
            Buat Ruangan
          </PrimaryButton>
        )}
      </div>

      <div className="mt-8 w-full rounded-t-lg">
        {isLoading ? (
          <div className="flex flex-col items-center py-8">
            <ClipLoader color={'hsla(357, 85%, 52%, 1)'} size={50} />
            <p className="mt-4">Loading data...</p>
          </div>
        ) : responseData?.data?.results?.length > 0 ? (
          <RuanganTable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={isLoading}
            data={responseData.data.results}
          />
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Tidak ada data ruangan.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Ruangan;
