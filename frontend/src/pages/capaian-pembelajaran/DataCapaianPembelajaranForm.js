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
  useCapaianPembelajaranById,
  usePatchCapaianPembelajaran,
  usePostCapaianPembelajaran,
} from '../../hooks/useCapaianPembelajaran';

const DataCapaianPembelajaranForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [capaianPembelajaranData, setCapaianPembelajaran] = useState(state);
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
      aspect: null,
      deskripsi: null,
    },
  });

  const { data: updatedCapaianPembelajaranData } = useCapaianPembelajaranById(
    id,
    {
      enabled: !!id && !capaianPembelajaranData,
    }
  );

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedCapaianPembelajaranData) {
        setCapaianPembelajaran(updatedCapaianPembelajaranData.data);
        reset(updatedCapaianPembelajaranData.data);
      }
      setEditable(false);
    }
  }, [updatedCapaianPembelajaranData, state, reset, id]);

  const {
    mutate: postCapaianPembelajaran,
    isLoading: postCapaianPembelajaranLoading,
  } = usePostCapaianPembelajaran();
  const {
    mutate: patchCapaianPembelajaran,
    isLoading: patchCapaianPembelajaranLoading,
  } = usePatchCapaianPembelajaran();

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

  const aspekOptions = [
    { value: 'Sikap', label: 'Sikap' },
    { value: 'Pengetahuan', label: 'Pengetahuan' },
    { value: 'Keterampilan umum', label: 'Keterampilan umum' },
    { value: 'Keterampilan khusus', label: 'Keterampilan khusus' },
  ];

  const onSubmit = (data) => {
    const dataCapaianPembelajaranFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dataCapaianPembelajaranFormData.append(key, data[key]);
      }
    });
    if (id) {
      patchCapaianPembelajaran(
        { data: dataCapaianPembelajaranFormData, id: id },
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
      postCapaianPembelajaran(dataCapaianPembelajaranFormData, {
        onSuccess: () => {
          navigate('/kurikulum-obe/capaian-pembelajaran');
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
    <section id="capaianpembelajaran-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            {
              name: 'Buat Capaian Pembelajaran',
              link: '/kurikulum-obe/capaian-pembelajaran',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Capaian Pembelajaran
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUDropdownInput
          control={control}
          name="Prodi"
          registeredName="prodi"
          defaultValue={
            capaianPembelajaranData?.prodi
              ? {
                  value: capaianPembelajaranData.prodi.id,
                  label: capaianPembelajaranData.prodi.name,
                }
              : null
          }
          options={dataProgramStudiSuccess ? dataProgramStudi : []}
          required
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Kode Capaian Pembelajaran"
          required
          errors={errors}
          registeredName="kode"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Aspek Penilaian"
          registeredName="aspect"
          defaultValue={
            capaianPembelajaranData?.aspect
              ? {
                  value: capaianPembelajaranData.aspect,
                  label: capaianPembelajaranData.aspect,
                }
              : null
          }
          options={aspekOptions}
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
                isLoading={patchCapaianPembelajaranLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postCapaianPembelajaranLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default DataCapaianPembelajaranForm;
