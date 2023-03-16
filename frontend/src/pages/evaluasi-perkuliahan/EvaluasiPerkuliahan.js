import React, { useEffect, useState } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import EvaluasiPerkuliahanTable from './components/EvaluasiPerkuliahanTable';
import {
  useDeleteEvaluasiPerkuliahan,
  useEvaluasiPerkuliahanByDosen,
  useEvaluasiPerkuliahanData,
} from '../../hooks/useEvaluasiPerkuliahan';
import EvaluasiPerkuliahanTableDosen from './components/EvaluasiPerkuliahanTableDosen';
import { useCheckRole } from '../../hooks/useCheckRole';
import Modal from '../../components/Modal';
import { useQueryClient } from 'react-query';

const EvaluasiPerkuliahan = () => {
  const userRole = useCheckRole();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();

  const { mutate: deleteEvaluasiPerkuliahan } = useDeleteEvaluasiPerkuliahan();
  const { data: responseData, isLoading: isLoadingData } =
    useEvaluasiPerkuliahanData({
      enabled: !!userRole?.admin,
    });
  const { data: responseDosen, isLoading: isLoadingDosen } =
    useEvaluasiPerkuliahanByDosen({
      enabled: !!userRole?.facultyMember,
    });

  useEffect(() => {
    console.log(responseDosen?.data);
  }, [responseDosen]);

  return (
    <section id="evaluasi-perkuliahan" className="section-container">
      <Modal
        title="Evaluasi Perkuliahan"
        isOpen={openModal}
        setIsOpen={setOpenModal}
        deleteFunc={() =>
          deleteEvaluasiPerkuliahan(selectedItem, {
            onSuccess: () => {
              if (userRole?.admin) {
                queryClient.invalidateQueries('evaluasi-perkuliahan');
              }
              if (userRole?.facultyMember) {
                queryClient.invalidateQueries('evaluasi-perkuliahan-dosen');
              }
              setOpenModal(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Evaluasi Perkuliahan</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/evaluasi-perkuliahan/form"
        >
          Buat Evaluasi Perkuliahan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        {userRole?.admin && (
          <EvaluasiPerkuliahanTable
            loading={isLoadingData}
            data={responseData?.data ?? []}
            setSelectedItem={setSelectedItem}
            setOpenModal={setOpenModal}
          />
        )}
        {userRole?.facultyMember && (
          <EvaluasiPerkuliahanTableDosen
            loading={isLoadingDosen}
            data={responseDosen?.data ?? []}
            setSelectedItem={setSelectedItem}
            setOpenModal={setOpenModal}
          />
        )}
      </div>
    </section>
  );
};

export default EvaluasiPerkuliahan;
