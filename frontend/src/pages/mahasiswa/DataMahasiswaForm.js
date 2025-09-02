/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostDataMahasiswa,
  usePatchDataMahasiswa,
  useDataMahasiswaById,
} from '../../hooks/useDataMahasiswa';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useProgramStudiData } from '../../hooks/useProdi';
import CRUDropdownInput from '../../components/CRUDropdownInput';

const DataMahasiswaForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [dataMahasiswaData, setDataMahasiswaData] = useState(state);
  const [editable, setEditable] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      nama: null,
      nim: null,
      mahasiswa_id: null,
      angkatan: null,
      prodi: null,
      telephone: null,
      email: null,
      email_universitas: null,
    },
  });

  const { data: updatedDataMahasiswaData } = useDataMahasiswaById(id, {
    enabled: !!id && !dataMahasiswaData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedDataMahasiswaData) {
        setDataMahasiswaData(updatedDataMahasiswaData.data);
        reset(updatedDataMahasiswaData.data);
      }
      setEditable(false);
    }
  }, [updatedDataMahasiswaData, state, reset, id]);

  const { mutate: postDataMahasiswa, isLoading: postDataMahasiswaLoading } =
    usePostDataMahasiswa();
  const { mutate: patchDataMahasiswa, isLoading: patchDataMahasiswaLoading } =
    usePatchDataMahasiswa();

  const { data: dataProgramStudi, isSuccess: dataProgramStudiSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatUserData = response.data.map(({ id, name }) => {
          return {
            value: id,
            label: name,
          };
        });

        return formatUserData;
      },
    });

  const onSubmit = (data) => {
    const dataMahasiswaFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dataMahasiswaFormData.append(key, data[key]);
      }
    });
    if (id) {
      patchDataMahasiswa(
        { data: dataMahasiswaFormData, id: id },
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
      postDataMahasiswa(dataMahasiswaFormData, {
        onSuccess: () => {
          navigate('/data-master/data-mahasiswa');
          setEditable(false);
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
    <section id="datamahasiswa-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Daftar Mahasiswa', link: '/data-master/data-mahasiswa' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Data Mahasiswa
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama"
          required
          errors={errors}
          registeredName="nama"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="NIM"
          required
          errors={errors}
          registeredName="nim"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Student Id"
          required
          errors={errors}
          registeredName="mahasiswa_id"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Angkatan"
          required
          errors={errors}
          registeredName="angkatan"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Prodi"
          registeredName="prodi"
          defaultValue={
            dataMahasiswaData?.prodi
              ? {
                  value: dataMahasiswaData.prodi.id,
                  label: dataMahasiswaData.prodi.name,
                }
              : null
          }
          options={dataProgramStudiSuccess ? dataProgramStudi : []}
          required
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Nomor Telepon"
          required
          errors={errors}
          registeredName="telephone"
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
        <CRUInput
          register={register}
          name="Email Universitas"
          required
          errors={errors}
          registeredName="email_universitas"
          isDisabled={!editable}
        />

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
                isLoading={patchDataMahasiswaLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postDataMahasiswaLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default DataMahasiswaForm;
