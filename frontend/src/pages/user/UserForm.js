/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePostUser, usePatchUser, useUserById } from '../../hooks/useUser';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { useUserData } from '../../hooks/useUser';
import { useProgramStudiData } from '../../hooks/useProdi';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';
import BreadCrumbs from '../../components/BreadCrumbs';
import CancelButton from '../../components/CancelButton';

const UserForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const userRole = useCheckRole();
  const { auth } = useAuth();
  const [userData, setUserData] = useState(state);
  const [editable, setEditable] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      judul: null,
      files: null,
    },
  });

  useEffect(() => {
    if (id) {
      reset(state);
    }
  }, [state, id, reset]);

  const { mutate: postUser, isLoading: postUserLoading } = usePostUser();
  const { mutate: patchUser, isLoading: patchUserLoading } = usePatchUser();
  const navigate = useNavigate();

  const { data: updatedUserData } = useUserById(id, {
    enabled: !!id && !userData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedUserData) {
        setUserData(updatedUserData.data);
        reset(updatedUserData.data);
      }
      setEditable(false);
    }
  }, [updatedUserData, state, reset, id]);

  // const { data: dataUser, isSuccess: userDataSuccess } = useUserData({
  //   select: (response) => {
  //     const formatUserData = response.data.map(({ id, fullname }) => {
  //       return { value: id, label: fullname };
  //     });

  //     return formatUserData;
  //   },
  // });
  // const { data: dataProgramStudi, isSuccess: programStudiDataSuccess } =
  //   useProgramStudiData({
  //     select: (response) => {
  //       if (userRole.kaprodi) {
  //         const prodi_detail = auth?.userData?.user_detail?.prodi_detail;

  //         return [{ value: prodi_detail?.id, label: prodi_detail?.name }];
  //       }
  //       const formatUserData = response.data.map(({ id, name }) => {
  //         return { value: id, label: name };
  //       });

  //       return formatUserData;
  //     },
  //   });

  const onSubmit = (data) => {
    const userFormData = new FormData();

    userFormData.append('is_active', true);

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        userFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchUser(
        { data: userFormData, id: id },
        {
          onSuccess: () => {
            setEditable(false);
          },
          onError: (err) => {
            setErrorMessage(err.message);
            setTimeout(() => {
              setErrorMessage();
            }, 5000);
          },
        }
      );
    } else {
      postUser(userFormData, {
        onSuccess: () => {
          navigate('/data-master/user');
        },
        onError: (err) => {
          setErrorMessage(err.message);
          setTimeout(() => {
            setErrorMessage();
          }, 5000);
        },
      });
    }
  };

  return (
    <section id="user-form" className="section-container">
      <BreadCrumbs
        links={[
          { name: 'Daftar User', link: '/data-master/user' },
          { name: id ? 'Detail' : 'Buat' },
        ]}
      />
      <p className="text-lg font-semibold">{id ? 'Edit' : 'Buat'} User</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama Lengkap"
          required
          errors={errors}
          registeredName="fullname"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Nomor Telepon"
          required
          errors={errors}
          registeredName="phone"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Email"
          required
          errors={errors}
          registeredName="email"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          required
          name="Role"
          registeredName="role"
          defaultValue={
            state?.user_detail
              ? {
                  value: state.user_detail?.id,
                  label: state.user_detail?.fullname,
                }
              : null
          }
          options={[
            { value: 'Superadmin', label: 'Superadmin' },
            { value: 'Admin', label: 'Admin' },
            { value: 'Faculty Member', label: 'Faculty Member' },
            { value: 'Student', label: 'Student' },
          ]}
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Jabatan"
          required
          registeredName="jabatan"
          defaultValue={
            state?.user_detail
              ? {
                  value: state.user_detail?.id,
                  label: state.user_detail?.fullname,
                }
              : null
          }
          options={[
            { value: 'Tidak ada', label: 'Tidak ada' },
            { value: 'Dosen Pengajar', label: 'Dosen Pengajar' },
            { value: 'Kaprodi', label: 'Kaprodi' },
            { value: 'Direktur/Kepala Unit', label: 'Direktur/Kepala Unit' },
            { value: 'Dekan', label: 'Dekan' },
            { value: 'Rektor', label: 'Rektor' },
            { value: 'Kajur', label: 'Kajur' },
            { value: 'Kadep', label: 'Kadep' },
            { value: 'Guru Besar', label: 'Guru Besar' },
            { value: 'Kahim', label: 'Kahim' },
            { value: 'Kabem', label: 'Kabem' },
          ]}
          isDisabled={!editable}
        />
        {!id ? (
          <CRUInput
            register={register}
            name="Password"
            required
            errors={errors}
            registeredName="password"
          />
        ) : null}
        {errorMessage ? (
          <AlertError className="inline-block">{errorMessage}</AlertError>
        ) : null}
        {id ? (
          <div className="flex flex-row !mt-8 space-x-3">
            {!editable && (
              <EditButton
                className={`!text-base`}
                type="button"
                onClick={() => setEditable(true)}
              />
            )}
            {editable && (
              <EditButton
                className={`!text-base`}
                type="submit"
                isLoading={patchUserLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postUserLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default UserForm;
