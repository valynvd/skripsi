/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
// import { PrimaryButton } from '../../components/PrimaryButton';
// import { BiPlusCircle } from 'react-icons/bi';
import {
  useDeleteValidasiMahasiswa,
  useValidasiMahasiswaData,
} from '../../hooks/useValidasiMahasiswa';
import { useQueryClient } from 'react-query';
import DegreeAuditKelulusanTable from './components/DegreeAuditKelulusanTable';

const DegreeAuditKelulusan = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteValidasiMahasiswa } = useDeleteValidasiMahasiswa();
  const { data: responseData, isLoading, refetch: validasiMahasiswaRefetch} =
    useValidasiMahasiswaData({
      enabled: !!userRole.admin,
    });
  
  console.log("Response Data ===", responseData)
  
  return (
    <section id="degreeaudit-kelulusan" className="section-container">
      <ModalDelete
        title="DegreeAudit Kelulusan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteValidasiMahasiswa(selectedItem, {
            onSuccess: () => {
              validasiMahasiswaRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('degreeaudit-kelulusan');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Degree Audit Kelulusan
          {!userRole.admin}
        </p>
        
        {/* <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/data-mahasiswa/form"
        >
          Input Data Baru
        </PrimaryButton> */}
        
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DegreeAuditKelulusanTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default DegreeAuditKelulusan;