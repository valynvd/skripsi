import React, { useState } from 'react';
// import React from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useKonsolChatbotDataSeputarSAP,
  useDeleteKonsolChatbotSeputarSAP,
} from '../../hooks/useKonsolChatbotSeputarSAP';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import ModalDelete from '../../components/ModalDelete';
import KonsolChatbotTableSeputarSAP from './components/KonsolChatbotTableSeputarSAP';
import BreadCrumbs from '../../components/BreadCrumbs';


const KonsolChatbotSeputarSAP = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteKonsolChatbotSeputarSAP} = useDeleteKonsolChatbotSeputarSAP();
  const { data: responseData, isLoading, refetch: konsolChatbotSeputarSAPRefetch} =
    useKonsolChatbotDataSeputarSAP({
      enabled: !!userRole.admin,
    });

  return (
    <section id="konsol-chatbot-seputarsap" className="section-container">
      <ModalDelete
        title="SeputarSAP"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKonsolChatbotSeputarSAP(selectedItem, {
            onSuccess: () => {
              konsolChatbotSeputarSAPRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('konsol-chatbot-seputarsap');
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
                  name: 'Seputar SAP'
              },
          ]}
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="text-lg font-semibold">
            Seputar SAP
        </p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/konsol-chatbot/seputarsap/form"
        >
          Tambah Pertanyaan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <KonsolChatbotTableSeputarSAP
          loading={isLoading}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default KonsolChatbotSeputarSAP;