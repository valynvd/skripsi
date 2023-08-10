import React, { useState } from 'react';
// import React from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useKonsolChatbotData,
  useDeleteKonsolChatbot,
} from '../../hooks/useKonsolChatbot';
import KonsolChatbotTable from './components/KonsolChatbotTable';
import { useQueryClient } from 'react-query';
import ModalDelete from '../../components/ModalDelete';


const KonsolChatbot = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteKonsolChatbot } = useDeleteKonsolChatbot();
  const { data: responseData, isLoading} =
    useKonsolChatbotData({
      enabled: !!userRole.admin,
    });

  return (
    <section id="konsol-chatbot" className="section-container">
      <ModalDelete
        title="Konsol Chatbot"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKonsolChatbot(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                queryClient.invalidateQueries('konsol-chatbot');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Konsol Chatbot
          {!userRole.admin}
        </p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <KonsolChatbotTable
          loading={isLoading}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default KonsolChatbot;