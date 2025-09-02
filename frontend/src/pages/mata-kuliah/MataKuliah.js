import React, { useState } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import MataKuliahTable from './components/MataKuliahTable';
import {
  useMataKuliahData,
  useDeleteMataKuliah,
} from '../../hooks/useMataKuliah';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import ClipLoader from 'react-spinners/ClipLoader';

const MataKuliah = () => {
  const {
    data: responseData,
    isLoading,
    refetch: mataKuliahRefetch,
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
              mataKuliahRefetch();
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
      {/* <div className="mt-8 w-full rounded-t-lg">
        <MataKuliahTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={responseData?.data ?? []}
        />
      </div> */}
      <div className="mt-8 w-full rounded-t-lg">
        {isLoading ? (
          <div className="flex flex-col items-center">
            <ClipLoader color={'hsla(357, 85%, 52%, 1)'} size={50} />
            <p className="mt-4">Loading data...</p>
          </div>
        ) : responseData?.data?.length > 0 ? (
          <MataKuliahTable
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
            loading={isLoading}
            data={responseData.data}
          />
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Tidak ada data.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default MataKuliah;
