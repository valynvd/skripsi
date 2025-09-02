/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import DataProfilLulusanTable from './component/DataProfilLulusanTable';
import {
  useDeleteProfilLulusan,
  useProfilLulusanData,
} from '../../hooks/useProfilLulusan';

const DataProfilLulusan = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteProfilLulusan } = useDeleteProfilLulusan();
  const {
    data: responseData,
    isLoading,
    refetch: dataProfilLulusanRefetch,
  } = useProfilLulusanData({
    enabled: !!userRole.admin,
  });

  console.log('Profil Data : ', responseData);

  return (
    <section id="profil-lulusan" className="section-container">
      <ModalDelete
        title="Profil Lulusan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteProfilLulusan(selectedItem, {
            onSuccess: () => {
              dataProfilLulusanRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('profil-lulusan');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Data Profil Lulusan
          {!userRole.admin}
        </p>

        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/profil-lulusan/form"
        >
          Buat Profil Lulusan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DataProfilLulusanTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default DataProfilLulusan;
