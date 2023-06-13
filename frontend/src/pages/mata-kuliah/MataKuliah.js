import React, { useState } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import MataKuliahTable from './components/MataKuliahTable';
import {
  useMataKuliahData,
  useDeleteMataKuliah,
} from '../../hooks/useMataKuliah';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';

const MataKuliah = () => {
  const {
    data: response,
    isLoading,
    refetch: mataKuliahDataRefetch,
  } = useMataKuliahData();
  const { mutate: deleteMataKuliah } = useDeleteMataKuliah();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userRole = useCheckRole();

  return (
    <section id="mataKuliah" className="section-container">
      <ModalDelete
        title="Mata Kuliah"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteMataKuliah(selectedItem, {
            onSuccess: () => {
              mataKuliahDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Mata Kuliah</p>
        {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/data-master/mata-kuliah/form"
          >
            Buat Mata Kuliah
          </PrimaryButton>
        )}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <MataKuliahTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default MataKuliah;
