import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import ModalDelete from '../../components/ModalDelete';
// import { useQueryClient } from 'react-query';
import SuratSettingsTable from './components/SettingsSuratTable';
import {
  useDeleteSuratSettings,
  useSuratSettingsData,
} from '../../hooks/useSuratSettings';

const SettingsSurat = () => {
  const {
    data: response,
    isLoading,
    refetch: settingsSuratRefetch,
  } = useSuratSettingsData();
  const { mutate: deleteSuratSettings } = useDeleteSuratSettings();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  // const queryClient = useQueryClient();

  useEffect(() => {}, [response]);

  return (
    <section id="settings-surat" className="section-container">
      <ModalDelete
        title="Settings Surat"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteSuratSettings(selectedItem, {
            onSuccess: () => {
              // queryClient.invalidateQueries('settings-surat');
              settingsSuratRefetch();
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Settings Surat</p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/data-master/settings-surat/form"
        >
          Buat Parameter Surat
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <SuratSettingsTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default SettingsSurat;
