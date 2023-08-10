import React, { useState } from 'react';
// import React from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useKonsolChatbotDataSeputarLMS,
  useDeleteKonsolChatbotSeputarLMS,
} from '../../hooks/useKonsolChatbotSeputarLMS';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import ModalDelete from '../../components/ModalDelete';
import KonsolChatbotTableSeputarLMS from './components/KonsolChatbotTableSeputarLMS';
import BreadCrumbs from '../../components/BreadCrumbs';


const KonsolChatbotSeputarLMS = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteKonsolChatbotSeputarLMS} = useDeleteKonsolChatbotSeputarLMS();
  const { data: responseData, isLoading, refetch: konsolChatbotSeputarLMSRefetch} =
    useKonsolChatbotDataSeputarLMS({
      enabled: !!userRole.admin,
    });

  return (
    <section id="konsol-chatbot-seputarlms" className="section-container">
      <ModalDelete
        title="SeputarLMS"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKonsolChatbotSeputarLMS(selectedItem, {
            onSuccess: () => {
              konsolChatbotSeputarLMSRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('konsol-chatbot-seputarlms');
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
                  name: 'Seputar LMS'
              },
          ]}
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="text-lg font-semibold">
            Seputar LMS
        </p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/konsol-chatbot/seputarlms/form"
        >
          Tambah Pertanyaan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <KonsolChatbotTableSeputarLMS
          loading={isLoading}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default KonsolChatbotSeputarLMS;