/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostSimulasiMatriks,
  usePatchSimulasiMatriks,
  useSimulasiMatriksById,
} from '../../hooks/useSimulasiMatriks';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useDokumenAkreditasiData } from '../../hooks/useDokumenAkreditasi';
import TableForm from './components/TableForm';
import TableSimulate from './components/TableSimulate';

const SimulasiMatriksForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [simulasiMatriksData, setSimulasiMatriksData] = useState(state);
  const [editable, setEditable] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (id) {
      reset(state);
    }
  }, [state, id, reset]);

  const { mutate: postSimulasiMatriks, isLoading: postSimulasiMatriksLoading } =
    usePostSimulasiMatriks();
  const {
    mutate: patchSimulasiMatriks,
    isLoading: patchSimulasiMatriksLoading,
  } = usePatchSimulasiMatriks();
  const navigate = useNavigate();
  const [radarData, setRadarData] = useState();
  const [simulateData, setSimulateData] = useState();

  const {
    data: dokumenAkreditasiData,
    isSuccess: dokumenAkreditasiDataSuccess,
  } = useDokumenAkreditasiData({
    select: (response) => {
      const formatDokumenAkreditasiData = response.data.map(({ id, name }) => {
        return { value: id, label: name };
      });

      return formatDokumenAkreditasiData;
    },
  });

  const { data: updatedSimulasiMatriksData } = useSimulasiMatriksById(id, {
    enabled: !!id && !simulasiMatriksData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedSimulasiMatriksData) {
        setSimulasiMatriksData(updatedSimulasiMatriksData.data);
        reset(updatedSimulasiMatriksData.data);
      }
      setEditable(false);
    }
  }, [updatedSimulasiMatriksData, state, reset, id]);

  const onSubmit = (data) => {
    const simulasiMatriksFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        simulasiMatriksFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchSimulasiMatriks(
        { data: simulasiMatriksFormData, id: id },
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
      postSimulasiMatriks(simulasiMatriksFormData, {
        onSuccess: ({ data }) => {
          navigate(`/akreditasi/simulasi-matriks/${data.id}`);
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
    <>
      <section id="penugasan-pengajaran-form" className="section-container">
        <BreadCrumbs
          links={[
            {
              name: 'Daftar Simulasi Matriks',
              link: '/akreditasi/simulasi-matriks',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Simulasi Matriks
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUInput
            register={register}
            name="Judul"
            registeredName="title"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUDropdownInput
            control={control}
            name="Dokumen Akreditasi"
            registeredName="dokumenAkreditasiId"
            options={dokumenAkreditasiDataSuccess ? dokumenAkreditasiData : []}
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
                  isLoading={patchSimulasiMatriksLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postSimulasiMatriksLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>

      <TableForm simulasiMatriksData={simulasiMatriksData} />

      {radarData && simulateData && (
        <TableSimulate simulateData={simulateData} radarData={radarData} />
      )}
    </>
  );
};

export default SimulasiMatriksForm;
