/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePostDosen, usePatchDosen } from '../../hooks/useDosen';
import Alert from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { useUserData } from '../../hooks/useUser';
import { useProgramStudiData } from '../../hooks/useProdi';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';

const DosenForm = () => {
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

  const { mutate: postDosen, isLoading: postDosenLoading } = usePostDosen();
  const { mutate: patchDosen, isLoading: patchDosenLoading } = usePatchDosen();
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
          const prodi_detail = auth?.userData?.dosen_detail?.prodi_detail;

          return [{ value: prodi_detail?.id, label: prodi_detail?.name }];
        }
        const formatUserData = response.data.map(({ id, name }) => {
          return { value: id, label: name };
        });

        return formatUserData;
      },
    });

  const onSubmit = (data) => {
    const dosenFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dosenFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchDosen(
        { data: dosenFormData, id: id },
        {
          onSuccess: () => {
            navigate('/dosen');
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
      postDosen(dosenFormData, {
        onSuccess: () => {
          navigate('/dosen');
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
    <section id="dosen-form" className="section-container">
      <p className="text-lg font-semibold">{id ? 'Edit' : 'Buat'} Dosen</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama Lengkap"
          required
          errors={errors}
          registeredName="name"
        />
        <CRUInput
          register={register}
          name="Inisial"
          required
          errors={errors}
          registeredName="inisial"
        />
        <CRUInput
          register={register}
          name="Fulltime"
          type="checkbox"
          errors={errors}
          registeredName="is_fulltime"
        />
        <CRUDropdownInput
          control={control}
          name="User"
          registeredName="user"
          defaultValue={
            state?.user_detail
              ? {
                  value: state.user_detail?.id,
                  label: state.user_detail?.fullname,
                }
              : null
          }
          options={userDataSuccess ? dataUser : []}
        />
        <CRUDropdownInput
          control={control}
          name="Program Studi"
          registeredName="prodi"
          defaultValue={
            state?.prodi_detail
              ? {
                  value: state.prodi_detail?.id,
                  label: state.prodi_detail?.name,
                }
              : null
          }
          options={programStudiDataSuccess ? dataProgramStudi : []}
        />
        {errorMessage ? (
          <Alert className="inline-block">{errorMessage}</Alert>
        ) : null}
        {id ? (
          <EditButton
            className={`!mt-8 !text-base`}
            isLoading={patchDosenLoading}
            type="submit"
          />
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postDosenLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default DosenForm;
