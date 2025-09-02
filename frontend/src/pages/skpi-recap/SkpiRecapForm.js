/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostValidasiMahasiswa,
  usePatchValidasiMahasiswa,
  useValidasiMahasiswaById
} from '../../hooks/useValidasiMahasiswa';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useProgramStudiData } from '../../hooks/useProdi';
import CRUDropdownInput from '../../components/CRUDropdownInput';

const SkpiReecapForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [validasiMahasiswaData, setValidasiMahasiswaData] = useState(state);
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
      angkatan: null,
      prodi: null,
      jumlah_sks: null,
      nilaid: null,
      nilaie: null,
      ipk: null,
      status_kelulusan: null,
    },
  });

  const { data: updatedValidasiMahasiswaData } = useValidasiMahasiswaById(id, {
    enabled: !!id && !validasiMahasiswaData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedValidasiMahasiswaData) {
        setValidasiMahasiswaData(updatedValidasiMahasiswaData.data);
        reset(updatedValidasiMahasiswaData.data);
      }
      setEditable(false);
    }
  }, [updatedValidasiMahasiswaData, state, reset, id]);

  const { mutate: postValidasiMahasiswa, isLoading: postValidasiMahasiswaLoading} =
    usePostValidasiMahasiswa();
  const { mutate: patchValidasiMahasiswa, isLoading: patchValidasiMahasiswaLoading } =
    usePatchValidasiMahasiswa();

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
    const validasiMahasiswaFormData = new FormData();
    
    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        validasiMahasiswaFormData.append(key, data[key]);
      }
    });
    if (id) {
      patchValidasiMahasiswa(
        { data: validasiMahasiswaFormData, id: id },
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
      postValidasiMahasiswa(validasiMahasiswaFormData, {
        onSuccess: () => {
          navigate('/degreeaudit/degreeaudit-kelulusan');
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
            { name: 'Daftar Degree Audit Kelulusan', link: '/degreeaudit/degreeaudit-kelulusan' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Degree Audit Kelulusan
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama"
          required
          errors={errors}
          registeredName="mahasiswa_detail.nama"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="NIM"
          required
          errors={errors}
          registeredName="mahasiswa_detail.nim"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Angkatan"
          required
          errors={errors}
          registeredName="mahasiswa_detail.angkatan"
          isDisabled={!editable}
        />
        <CRUDropdownInput
            control={control}
            name="Prodi"
            registeredName="mahasiswa_detail.prodi"
            defaultValue={
              validasiMahasiswaData?.prodi
              ? {
                  value: validasiMahasiswaData.prodi.id,
                  label: validasiMahasiswaData.prodi.name,
              }
              : null
            }
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
            required
            isDisabled={!editable}
          />
        <CRUInput
          register={register}
          name="Jumlah SKS Lulus"
          required
          errors={errors}
          registeredName="jumlah_sks"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Nilai D"
          required
          errors={errors}
          registeredName="nilaid"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Nilai E"
          required
          errors={errors}
          registeredName="nilaie"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="IPK"
          required
          errors={errors}
          registeredName="nilai_ipk"
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
                isLoading={patchValidasiMahasiswaLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postValidasiMahasiswaLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default SkpiReecapForm;
