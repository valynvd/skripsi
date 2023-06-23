import React, { useState } from 'react';
// import { PrimaryButton } from '../../components/PrimaryButton';
// import { BiPlusCircle } from 'react-icons/bi';
import DokumenPembelajaranTable from './components/DokumenPembelajaranTable';
import {
  useDeleteDokumenPembelajaran,
  useDokumenPembelajaranByDosen,
  useDokumenPembelajaranByProdi,
  useDokumenPembelajaranData,
} from '../../hooks/useDokumenPembelajaran';
import DokumenPembelajaranTableDosen from './components/DokumenPembelajaranTableDosen';
import { useCheckRole } from '../../hooks/useCheckRole';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import DokumenPembelajaranTableKaprodi from './components/DokumenPembelajaranTableKaprodi';
import useAuth from '../../hooks/useAuth';

const DokumenPembelajaran = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteDokumenPembelajaran } = useDeleteDokumenPembelajaran();
  const userData = useAuth();
  const { data: responseData, isLoading: isLoadingData } =
    useDokumenPembelajaranData({
      enabled: !!userRole.admin,
    });
  const { data: responseDosen, isLoading: isLoadingDosen } =
    useDokumenPembelajaranByDosen({
      enabled: !!userRole.facultyMember,
    });
  const { data: responseDataByProdi, isLoading: isLoadingDataByProdi } =
    useDokumenPembelajaranByProdi({
      enabled: !!userRole.facultyMember && !!userRole.kaprodi,
    });

  // useEffect(() => {
  //   console.log(responseDosen?.data);
  // }, [responseDosen]);

  return (
    <section id="dokumen-pembelajaran" className="section-container">
      <ModalDelete
        title="Dokumen Pembelajaran"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteDokumenPembelajaran(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                queryClient.invalidateQueries('dokumen-pembelajaran');
              }
              if (userRole.facultyMember) {
                queryClient.invalidateQueries('dokumen-pembelajaran-dosen');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Daftar Dokumen Pembelajaran
          {!userRole.admin &&
            ` "${userData.auth.userData?.dosen_detail?.prodi_detail?.name}"`}
        </p>
        {/* {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/pelaksanaan-pendidikan/dokumen-pembelajaran/form"
          >
            Buat Dokumen Pembelajaran
          </PrimaryButton>
        )} */}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        {userRole.admin && (
          <DokumenPembelajaranTable
            loading={isLoadingData}
            data={responseData?.data ?? []}
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
          />
        )}
        {userRole.facultyMember && !userRole.kaprodi && (
          <DokumenPembelajaranTableDosen
            loading={isLoadingDosen}
            data={responseDosen?.data ?? []}
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
          />
        )}
        {userRole.kaprodi && (
          <DokumenPembelajaranTableKaprodi
            loading={isLoadingDataByProdi}
            data={responseDataByProdi?.data ?? []}
            setSelectedItem={setSelectedItem}
            setOpenModalDelete={setOpenModalDelete}
          />
        )}
      </div>
    </section>
  );
};

export default DokumenPembelajaran;
