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
  usePatchProfilLulusan,
  usePostProfilLulusan,
  useProfilLulusanById,
} from '../../hooks/useProfilLulusan';

const DataProfilLulusanForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [profilLulusanData, setProfilLulusanData] = useState(state);
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
      profil: null,
      deskripsi: null,
    },
  });

  const { data: updatedProfilLulusanData } = useProfilLulusanById(id, {
    enabled: !!id && !profilLulusanData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedProfilLulusanData) {
        setProfilLulusanData(updatedProfilLulusanData.data);
        reset(updatedProfilLulusanData.data);
      }
      setEditable(false);
    }
  }, [updatedProfilLulusanData, state, reset, id]);

  const { mutate: postProfilLulusan, isLoading: postProfilLulusanLoading } =
    usePostProfilLulusan();
  const { mutate: patchProfilLulusan, isLoading: patchProfilLulusanLoading } =
    usePatchProfilLulusan();

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
    const dataProfilLulusanFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dataProfilLulusanFormData.append(key, data[key]);
      }
    });
    if (id) {
      patchProfilLulusan(
        { data: dataProfilLulusanFormData, id: id },
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
      postProfilLulusan(dataProfilLulusanFormData, {
        onSuccess: () => {
          navigate('/kurikulum-obe/profil-lulusan');
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
    <section id="profillulusan-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Buat Profil Lulusan', link: '/kurikulum-obe/profil-lulusan' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Profil Lulusan
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUDropdownInput
          control={control}
          name="Prodi"
          registeredName="prodi"
          defaultValue={
            profilLulusanData?.prodi
              ? {
                  value: profilLulusanData.prodi.id,
                  label: profilLulusanData.prodi.name,
                }
              : null
          }
          options={dataProgramStudiSuccess ? dataProgramStudi : []}
          required
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Kode Profil Lulusan"
          required
          errors={errors}
          registeredName="kode"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Profil Lulusan"
          required
          errors={errors}
          registeredName="profil"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Deskripsi"
          required
          errors={errors}
          registeredName="deskripsi"
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
                isLoading={patchProfilLulusanLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postProfilLulusanLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default DataProfilLulusanForm;
