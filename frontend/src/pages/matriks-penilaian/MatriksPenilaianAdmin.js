/* eslint-disable no-unused-vars */
import React from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import MatriksPenilaianAdminTable from './components/MatriksPenilaianAdminTable';
import { useCheckRole } from '../../hooks/useCheckRole';
import { useProgramStudiData } from '../../hooks/useProdi';

const MatriksPenilaianAdmin = () => {
  const { data: programStudiData, isLoading: isLoadingProgramStudiData } =
    useProgramStudiData({
      select: (response) => {
        return response?.data;
      },
    });

  const userRole = useCheckRole();

  return (
    <section id="matriksPenilaianAdmin" className="section-container">
      {/* <ModalDelete
        title="Mata Kuliah"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteMatriksPenilaianAdmin(selectedItem, {
            onSuccess: () => {
              matriksPenilaianAdminDataRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      /> */}
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Matriks Penilaian</p>
        {/* {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/data-master/mata-kuliah/form"
          >
            Buat Mata Kuliah
          </PrimaryButton>
        )} */}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <MatriksPenilaianAdminTable
          loading={isLoadingProgramStudiData}
          data={programStudiData ?? []}
        />
      </div>
    </section>
  );
};

export default MatriksPenilaianAdmin;
