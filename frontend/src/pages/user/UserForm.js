/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePostUser, usePatchUser } from '../../hooks/useUser';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { useUserData } from '../../hooks/useUser';
import { useProgramStudiData } from '../../hooks/useProdi';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';

const UserForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const userRole = useCheckRole();
  const { auth } = useAuth();

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

  const { data: dataUser, isSuccess: userDataSuccess } = useUserData({
    select: (response) => {
      const formatUserData = response.data.map(({ id, fullname }) => {
        return { value: id, label: fullname };
      });

      return formatUserData;
    },
  });
  const { data: dataProgramStudi, isSuccess: programStudiDataSuccess } =
    useProgramStudiData({
      select: (response) => {
        if (userRole.kaprodi) {
          const prodi_detail = auth?.userData?.user_detail?.prodi_detail;

          return [{ value: prodi_detail?.id, label: prodi_detail?.name }];
        }
        const formatUserData = response.data.map(({ id, name }) => {
          return { value: id, label: name };
        });

        return formatUserData;
      },
    });

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
            navigate('/user');
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
          navigate('/user');
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
      <p className="text-lg font-semibold">{id ? 'Edit' : 'Buat'} User</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama Lengkap"
          required
          errors={errors}
          registeredName="fullname"
        />
        <CRUInput
          register={register}
          name="Nomor Telepon"
          required
          errors={errors}
          registeredName="phone"
        />
        <CRUInput
          register={register}
          name="Email"
          required
          errors={errors}
          registeredName="email"
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
            { value: 'Kaprodi', label: 'Kaprodi' },
            { value: 'Direktur/Kepala Unit', label: 'Direktur/Kepala Unit' },
            { value: 'Dekan', label: 'Dekan' },
          ]}
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
          <EditButton
            className={`!mt-8 !text-base`}
            isLoading={patchUserLoading}
            type="submit"
          />
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
