/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
import PoinPenilaianTable from './components/PoinPenilaianTable';
import {
  useDeletePoinPenilaian,
  usePoinPenilaianData,
} from '../../hooks/usePoinPenilaian';

const PoinPenilaian = () => {
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const {
    data: poinPenilaianData,
    isLoading: poinPenilaianDataIsLoading,
    refetch: poinPenilaianDataRefetch,
  } = usePoinPenilaianData({
    select: (response) => {
      return response.data;
    },
  });

  const { mutate: deletePoinPenilaian } = useDeletePoinPenilaian();

  useEffect(() => {
    console.log(poinPenilaianData);
  }, [poinPenilaianData]);

  return (
    <section id="poinpenilaian" className="section-container">
      <ModalDelete
        title="Penugasan PoinPenilaian"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deletePoinPenilaian(selectedItem, {
            onSuccess: () => {
              poinPenilaianDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Poin Penilaian</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/poin-penilaian/form"
        >
          Buat Poin Penilaian
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <PoinPenilaianTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={poinPenilaianDataIsLoading}
          data={poinPenilaianData || []}
        />
      </div>
    </section>
  );
};

export default PoinPenilaian;
