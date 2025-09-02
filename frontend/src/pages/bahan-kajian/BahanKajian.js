/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import {
  useBahanKajianData,
  useDeleteBahanKajian,
} from '../../hooks/useBahanKajian';
import BahanKajianTable from './components/BahanKajianTable';

const BahanKajian = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteBahanKajian } = useDeleteBahanKajian();
  const {
    data: responseData,
    isLoading,
    refetch: dataBahanKajianRefetch,
  } = useBahanKajianData({
    enabled: !!userRole.admin,
  });

  console.log('Respon Data CPL : ', responseData);

  return (
    <section id="bahan-kajian" className="section-container">
      <ModalDelete
        title="Bahan Kajian"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteBahanKajian(selectedItem, {
            onSuccess: () => {
              dataBahanKajianRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('bahan-kajian');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Data Bahan Kajian
          {!userRole.admin}
        </p>

        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/bahan-kajian/form"
        >
          Buat Bahan Kajian
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <BahanKajianTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default BahanKajian;
