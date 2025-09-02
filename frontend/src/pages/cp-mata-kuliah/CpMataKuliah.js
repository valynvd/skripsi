/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import CpMataKuliahTable from './components/CpMataKuliahhTable';
import { useCpmkData, useDeleteCpmk } from '../../hooks/useCpMataKuliah';

const CpMataKuliah = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteCapaianPembelajar } = useDeleteCpmk();
  const {
    data: responseData,
    isLoading,
    refetch: dataCPMKRefetch,
  } = useCpmkData({
    enabled: !!userRole.admin,
  });

  console.log('Respon Data CPMK :', responseData);

  return (
    <section id="cp-mata-kuliah" className="section-container">
      <ModalDelete
        title="Capaian Pembelajar"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteCapaianPembelajar(selectedItem, {
            onSuccess: () => {
              dataCPMKRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('cp-mata-kuliah');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Data CP Mata Kuliah
          {!userRole.admin}
        </p>

        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/cpmk/form"
        >
          Buat CPMK
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <CpMataKuliahTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default CpMataKuliah;
