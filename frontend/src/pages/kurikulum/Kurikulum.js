import React, { useState } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import KurikulumTable from './components/KurikulumTable';
import { useKurikulumData, useDeleteKurikulum } from '../../hooks/useKurikulum';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';

const Kurikulum = () => {
  const {
    data: response,
    isLoading,
    refetch: kurikulumDataRefetch,
  } = useKurikulumData();
  const { mutate: deleteKurikulum } = useDeleteKurikulum();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userRole = useCheckRole();

  return (
    <section id="kurikulum" className="section-container">
      <ModalDelete
        title="Kurikulum"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKurikulum(selectedItem, {
            onSuccess: () => {
              kurikulumDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Kurikulum</p>
        {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/data-master/kurikulum/form"
          >
            Buat Kurikulum
          </PrimaryButton>
        )}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <KurikulumTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default Kurikulum;
