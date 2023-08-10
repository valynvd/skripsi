import React, { useState, useEffect} from 'react';
import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import {
  useBroadcastPesanData,
  useDeleteBroadcastPesan,
} from '../../hooks/useBroadcastPesan';
import BroadcastPesanTable from './components/BroadcastPesanTable';
import { useQueryClient } from 'react-query';
import { socket } from '../../socket';

const BroadCastPesan = () => {
  const userRole = useCheckRole();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const queryClient = useQueryClient();
  const { mutate: deleteBroadcastPesan } = useDeleteBroadcastPesan();
  const { data: responseData, isLoading} =
    useBroadcastPesanData({
      enabled: !!userRole.admin,
    });
  const [nomorlogin, setNomorLogin] = useState('');

    useEffect(() => {
      socket.on('nomorlogin', (nomorlogin) => {
        setNomorLogin((nomorlogin.nomorlogin))
      });
    }, [])

  return (
    <section id="broadcast-pesan" className="section-container">
      <ModalDelete
        title="Broadcast Pesan"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteBroadcastPesan(selectedItem, {
            onSuccess: () => {
              if (userRole.admin) {
                queryClient.invalidateQueries('broadcast-pesan');
              }
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          BroadCast Pesan
          {!userRole.admin}
        </p>
        {nomorlogin ? (
          <PrimaryButton link="/stem-chatbot/konsol-chatbot/login">
              Chatbot : {nomorlogin}
          </PrimaryButton>
        ) : (
          <PrimaryButton
              link="/stem-chatbot/konsol-chatbot/login"
            >
              Login Whatsapp
          </PrimaryButton>
        )
      }
        
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/stem-chatbot/broadcast-pesan/form"
        >
          Buat Pesan Broadcast
        </PrimaryButton>
        
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <BroadcastPesanTable
          loading={isLoading}
          setOpenModalDelete={setOpenModalDelete}
          data={responseData?.data ?? []}
          setSelectedItem={setSelectedItem}
        />
      </div>
    </section>
  );
};

export default BroadCastPesan;