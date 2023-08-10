/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
// import React from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useKonsolChatbotDataPeriodePembayaran,
  useDeleteKonsolChatbotPeriodePembayaran,
} from '../../hooks/useKonsolChatbotPeriodePembayaran';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import ModalDelete from '../../components/ModalDelete';
import KonsolChatbotTablePeriodePembayaran  from './components/KonsolChatbotTablePeriodePembayaran';
import BreadCrumbs from '../../components/BreadCrumbs';


const KonsolChatbotPeriodePembayaran  = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteKonsolChatbotPeriodePembayaran  } = useDeleteKonsolChatbotPeriodePembayaran();
  const { data: responseData, isLoading, refetch: konsolChatbotPeriodePembayaranRefetch} =
    useKonsolChatbotDataPeriodePembayaran({
      enabled: !!userRole.admin,
    });

  return (
    <section id="konsol-chatbot-periodepembayaran" className="section-container">
      <ModalDelete
        title="Periode Pembayaran"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKonsolChatbotPeriodePembayaran(selectedItem, {
            onSuccess: () => {
              konsolChatbotPeriodePembayaranRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('konsol-chatbot-periodepembayaran');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <BreadCrumbs
          links={[
              {
                  name: 'List Konsol Chatbot',
                  link: '/stem-chatbot/konsol-chatbot',
              },
              { 
                  name: 'Periode Pembayaran'
              },
          ]}
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="text-lg font-semibold">
            Periode Pembayaran
        </p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/konsol-chatbot/periodepembayaran/form"
        >
          Tambah Pertanyaan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <KonsolChatbotTablePeriodePembayaran
          loading={isLoading}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default KonsolChatbotPeriodePembayaran;