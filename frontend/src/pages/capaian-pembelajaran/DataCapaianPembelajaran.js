/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import DataCapaianPembelajaranTable from './component/DataCapaianPembelajaranTable';
import {
  useCapaianPembelajaranData,
  useDeleteCapaianPembelajaran,
} from '../../hooks/useCapaianPembelajaran';

const DataCapaianPembelajaran = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteCapaianPembelajaran } = useDeleteCapaianPembelajaran();
  const {
    data: responseData,
    isLoading,
    refetch: dataCapaianPembelajaranRefetch,
  } = useCapaianPembelajaranData({
    enabled: !!userRole.admin,
  });

  console.log('Respon Data CPL : ', responseData);

  return (
    <section id="capaian-pembelajaran" className="section-container">
      <ModalDelete
        title="Capaian Pembelajaran"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteCapaianPembelajaran(selectedItem, {
            onSuccess: () => {
              dataCapaianPembelajaranRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('capaian-pembelajaran');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Data Capaian Pembelajaran
          {!userRole.admin}
        </p>

        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/capaian-pembelajaran/form"
        >
          Buat Capaian Pembelajaran
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DataCapaianPembelajaranTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default DataCapaianPembelajaran;
