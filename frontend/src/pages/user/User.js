import React, { useState, useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import UserTable from './components/UserTable';
import { useDeleteUser, useUserData } from '../../hooks/useUser';
import ModalDelete from '../../components/ModalDelete';
import { useQueryClient } from 'react-query';
import { useCheckRole } from '../../hooks/useCheckRole';

const User = () => {
  const { data: response, isLoading } = useUserData();
  const { mutate: deleteUser } = useDeleteUser();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const userRole = useCheckRole();
  const queryClient = useQueryClient();

  useEffect(() => {
  }, [response]);

  return (
    <section id="user" className="section-container">
      <ModalDelete
        title="User"
        isOpen={openModalDelete}
        setIsOpen={setOpenModalDelete}
        deleteFunc={() =>
          deleteUser(selectedItem, {
            onSuccess: () => {
              queryClient.invalidateQueries('user');
              setOpenModalDelete(false);
            },
          })
        }
      />
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar User</p>
        {userRole.admin && (
          <PrimaryButton
            icon={<BiPlusCircle size={22} />}
            link="/data-master/user/form"
          >
            Buat User
          </PrimaryButton>
        )}
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <UserTable
          setSelectedItem={setSelectedItem}
          setOpenModalDelete={setOpenModalDelete}
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default User;
