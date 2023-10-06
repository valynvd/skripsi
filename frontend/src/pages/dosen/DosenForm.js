/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostDosen,
  usePatchDosen,
  useDosenById,
} from '../../hooks/useDosen';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { usePatchUser, usePostUser } from '../../hooks/useUser';
import { useProgramStudiData } from '../../hooks/useProdi';
import useAuth from '../../hooks/useAuth';
import { useCheckRole } from '../../hooks/useCheckRole';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const DosenForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const userRole = useCheckRole();
  const { auth } = useAuth();
  const [editable, setEditable] = useState(true);
  const [dosenData, setDosenData] = useState(state);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      name: null,
      phone: null,
      email: null,
      inisial: null,
      nik: null,
      nidn: null,
      role: null,
      password: null,
      jabatan: null,
      jabatan_fungsional: null,
      user: null,
      prodi: null,
      is_fulltime: null,
    },
  });

  const { mutate: postDosen, isLoading: postDosenLoading } = usePostDosen();
  const { mutate: postUser, isLoading: postUserLoading } = usePostUser();
  const { mutateAsync: patchDosen, isLoading: patchDosenLoading } =
    usePatchDosen();
  const { mutateAsync: patchUser, isLoading: patchUserLoading } =
    usePatchUser();
  const navigate = useNavigate();

  const { data: updatedDosenData } = useDosenById(id, {
    enabled: !!id && !dosenData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset({
          ...state,
          role: state.user_detail?.role,
          jabatan: state.user_detail?.jabatan,
          phone: state.user_detail?.phone,
          email: state.user_detail?.email,
          jabatan_fungsional: state.user_detail?.jabatan_fungsional,
          prodi: state.prodi ? state.prodi : 'Tidak ada',
        });
      } else if (updatedDosenData) {
        console.log(updatedDosenData);
        setDosenData(updatedDosenData.data);
        reset({
          ...updatedDosenData.data,
          role: updatedDosenData.data.user_detail?.role,
          jabatan: updatedDosenData.data.user_detail?.jabatan,
          phone: updatedDosenData.data.user_detail?.phone,
          email: updatedDosenData.data.user_detail?.email,
          jabatan_fungsional:
            updatedDosenData.data.user_detail?.jabatan_fungsional,
          prodi: updatedDosenData.data.prodi
            ? updatedDosenData.data.prodi_detail
            : 'Tidak ada',
        });
      }
      setEditable(false);
    }
  }, [updatedDosenData, state, reset, id]);

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
    const userFormData = new FormData();

    if (dirtyFields.name) {
      userFormData.append('fullname', data.name);
      dosenFormData.append('name', data.name);
    }
    if (dirtyFields.phone) {
      userFormData.append('phone', data.phone);
    }
    if (dirtyFields.email) {
      userFormData.append('email', data.email);
    }
    if (dirtyFields.role) {
      userFormData.append('role', data.role);
    }
    if (dirtyFields.jabatan) {
      userFormData.append('jabatan', data.jabatan);
    }
    if (dirtyFields.password) {
      userFormData.append('password', data.password);
    }
    if (dirtyFields.jabatan_fungsional) {
      userFormData.append('jabatan_fungsional', data.jabatan_fungsional);
    }
    if (dirtyFields.is_fulltime) {
      dosenFormData.append('is_fulltime', data.is_fulltime);
    }
    if (dirtyFields.nidn) {
      dosenFormData.append('nidn', data.nidn);
    }
    if (dirtyFields.nik) {
      dosenFormData.append('nik', data.nik);
    }
    if (dirtyFields.inisial) {
      dosenFormData.append('inisial', data.inisial);
    }
    if (dirtyFields.prodi) {
      if (data.prodi === 'Tidak ada') {
        dosenFormData.append('prodi', '');
      } else {
        dosenFormData.append('prodi', data.prodi);
      }
    }

    if (id) {
      const patchUserOrPatchDosen = async () => {
        if (
          dirtyFields.name ||
          dirtyFields.is_fulltime ||
          dirtyFields.inisial ||
          dirtyFields.prodi
        ) {
          await patchDosen(
            { data: dosenFormData, id: id },
            {
              onSuccess: () => {},
              onError: (err) => {
                setErrorMessage(err.message);
                setTimeout(() => {
                  setErrorMessage();
                }, 5000);
              },
            }
          );
        }

        if (
          dirtyFields.name ||
          dirtyFields.phone ||
          dirtyFields.email ||
          dirtyFields.role ||
          dirtyFields.jabatan ||
          dirtyFields.jabatan_fungsional
        ) {
          await patchUser(
            { data: userFormData, id: dosenData.user },
            {
              onSuccess: () => {},
              onError: (err) => {
                setErrorMessage(err.message);
                setTimeout(() => {
                  setErrorMessage();
                }, 5000);
              },
            }
          );
        }

        setEditable(false);
      };

      patchUserOrPatchDosen();
    } else {
      postUser(userFormData, {
        onSuccess: (data) => {
          dosenFormData.append('user', data.data.id);
          postDosen(dosenFormData, {
            onSuccess: () => {
              navigate('/data-master/dosen');
            },
            onError: (err) => {
              setErrorMessage(err.message);
              setTimeout(() => {
                setErrorMessage();
              }, 5000);
            },
          });
        },
        onError: (err) => {
          console.log(err.response.data.password);
          const passwordError = {
            'The password is too similar to the email.':
              'Password terlalu mirip dengan email.',
            'This password is too short. It must contain at least 8 characters.':
              'Password terlalu pendek. Password harus melebihi 8 karatker.',
            'This password is too common.': 'Password terlalu umum',
          };

          if (err.response?.data?.password) {
            setErrorMessage(
              err.response.data.password.map((item, index) => {
                return <p key={index}>- {passwordError[item]}</p>;
              })
            );
          } else {
            setErrorMessage(err.message);
          }
          setTimeout(() => {
            setErrorMessage();
          }, 5000);
        },
      });
    }
  };

  return (
    <section id="dosen-form" className="section-container">
      <BreadCrumbs
        links={[
          { name: 'Daftar Dosen', link: '/data-master/dosen' },
          { name: id ? 'Detail' : 'Buat' },
        ]}
      />
      <p className="text-lg font-semibold">{id ? 'Detail' : 'Buat'} Dosen</p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama Lengkap"
          required
          errors={errors}
          registeredName="name"
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
          type="email"
          errors={errors}
          registeredName="email"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Inisial"
          required
          errors={errors}
          registeredName="inisial"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="NIDN"
          errors={errors}
          registeredName="nidn"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="NIK"
          errors={errors}
          registeredName="nik"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Fulltime"
          type="checkbox"
          errors={errors}
          registeredName="is_fulltime"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          required
          name="Role"
          registeredName="role"
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
          name="Jabatan Kampus"
          required
          registeredName="jabatan"
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
        <CRUDropdownInput
          control={control}
          name="Jabatan Fungsional"
          required
          registeredName="jabatan_fungsional"
          options={[
            { value: 'Belum ada', label: 'Belum ada' },
            { value: 'Asisten Ahli 150', label: 'Asisten Ahli (150)' },
            { value: 'Lektor 200', label: 'Lektor (200)' },
            { value: 'Lektor 300', label: 'Lektor (300)' },
            { value: 'Lektor Kepala 400', label: 'Lektor Kepala (400)' },
            { value: 'Lektor Kepala 550', label: 'Lektor Kepala (550)' },
            { value: 'Lektor Kepala 700', label: 'Lektor Kepala (700)' },
            { value: 'Profesor 850', label: 'Profesor (850)' },
            { value: 'Profesor 1050', label: 'Profesor (1050)' },
          ]}
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Program Studi"
          registeredName="prodi"
          required
          options={
            programStudiDataSuccess
              ? [
                  { value: 'Tidak ada', label: 'Tidak ada' },
                  ...dataProgramStudi,
                ]
              : [{ value: 'Tidak ada', label: 'Tidak ada' }]
          }
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
                isLoading={patchDosenLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postDosenLoading || postUserLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default DosenForm;
