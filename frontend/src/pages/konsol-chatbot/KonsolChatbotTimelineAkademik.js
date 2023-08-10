/* eslint-disable react/jsx-key */
import React, { useState } from 'react';
// import React from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import {
  useKonsolChatbotDataTimeLineAkademik,
  useDeleteKonsolChatbotTimeLineAkademik,
} from '../../hooks/useKonsolChatbotTimelineAkademik';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import { useQueryClient } from 'react-query';
import ModalDelete from '../../components/ModalDelete';
import KonsolChatbotTableTimelineAkademik from './components/KonsolChatbotTableTimelineAkademik';
import BreadCrumbs from '../../components/BreadCrumbs';


const KonsolChatbotTimelineAkademik = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteKonsolChatbotTimeLineAkademik } = useDeleteKonsolChatbotTimeLineAkademik();
  const { 
    data: responseData, 
    isLoading,
    refetch: konsolChatbotTimelienAkademikRefetch,
  } =
    useKonsolChatbotDataTimeLineAkademik({
      enabled: !!userRole.admin,
    });

  return (
    <section id="konsol-chatbot-timelineakademik" className="section-container">
      <ModalDelete
        title="Timeline Akademik"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteKonsolChatbotTimeLineAkademik(selectedItem, {
            onSuccess: () => {
              konsolChatbotTimelienAkademikRefetch();
              if (userRole.admin) {
                queryClient.invalidateQueries('konsol-chatbot-timelineakademik');
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
                  name: 'Timeline Akademik'
              },
          ]}
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="text-lg font-semibold">
            Timeline Akademik
        </p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/konsol-chatbot/timelineakademik/form"
        >
          Tambah Pertanyaan
        </PrimaryButton>
      </div>
      
      
      <div className="mt-8 w-full rounded-t-lg">
        <KonsolChatbotTableTimelineAkademik
          loading={isLoading}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
        />
      </div>
    </section>
  );
};

export default KonsolChatbotTimelineAkademik;