import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import KriteriaTable from './components/KriteriaTable';
import { useDeleteKriteria, useKriteriaData } from '../../hooks/useKriteria';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';

const Kriteria = () => {
  const { data: response, isLoading } = useKriteriaData();
  const { mutate: deleteKriteria } = useDeleteKriteria();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
  }, [response]);

  return (
    <section id="kriteria" className="section-container">
      <ModalDelete
        title="Kriteria"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKriteria(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('kriteria');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Kriteria</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/kriteria/form"
        >
          Buat Kriteria
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <KriteriaTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default Kriteria;
