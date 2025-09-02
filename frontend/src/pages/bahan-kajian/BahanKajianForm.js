/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useProgramStudiData } from '../../hooks/useProdi';
import CRUDropdownInput from '../../components/CRUDropdownInput';

import {
  useBahanKajianById,
  usePatchBahanKajian,
  usePostBahanKajian,
} from '../../hooks/useBahanKajian';

const BahanKajianForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [bahanKajianData, setBahanKajian] = useState(state);
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
      prodi: null,
      kode: null,
      kategori: null,
      deskripsi: null,
      referensi: null,
    },
  });

  const { data: updatedBahanKajianData } = useBahanKajianById(id, {
    enabled: !!id && !bahanKajianData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedBahanKajianData) {
        setBahanKajian(updatedBahanKajianData.data);
        reset(updatedBahanKajianData.data);
      }
      setEditable(false);
    }
  }, [updatedBahanKajianData, state, reset, id]);

  const { mutate: postBahanKajian, isLoading: postBahanKajianLoading } =
    usePostBahanKajian();
  const { mutate: patchBahanKajian, isLoading: patchBahanKajianLoading } =
    usePatchBahanKajian();

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

  const kategoriOptions = [
    { value: 'Wajib', label: 'Wajib' },
    { value: 'Optional', label: 'Pengetahuan' },
  ];

  const onSubmit = (data) => {
    const dataBahanKajianFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dataBahanKajianFormData.append(key, data[key]);
      }
    });
    if (id) {
      patchBahanKajian(
        { data: dataBahanKajianFormData, id: id },
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
      postBahanKajian(dataBahanKajianFormData, {
        onSuccess: () => {
          navigate('/kurikulum-obe/bahan-kajian');
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
    <section id="bahankajian-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            {
              name: 'Buat Bahan Kajian',
              link: '/kurikulum-obe/bahan-kajian',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Bahan Kajian
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUDropdownInput
          control={control}
          name="Prodi"
          registeredName="prodi"
          defaultValue={
            bahanKajianData?.prodi
              ? {
                  value: bahanKajianData.prodi.id,
                  label: bahanKajianData.prodi.name,
                }
              : null
          }
          options={dataProgramStudiSuccess ? dataProgramStudi : []}
          required
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Kode Bahan Kajian"
          required
          errors={errors}
          registeredName="kode"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Kategori"
          registeredName="kategori"
          defaultValue={
            bahanKajianData?.kategori
              ? {
                  value: bahanKajianData.kategori,
                  label: bahanKajianData.kategori,
                }
              : null
          }
          options={kategoriOptions}
          required
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Deskripsi"
          required
          errors={errors}
          registeredName="deskripsi"
          isDisabled={!editable}
          type="textarea"
        />
        <CRUInput
          register={register}
          name="Referensi"
          required
          errors={errors}
          registeredName="referensi"
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
                isLoading={patchBahanKajianLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postBahanKajianLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default BahanKajianForm;
