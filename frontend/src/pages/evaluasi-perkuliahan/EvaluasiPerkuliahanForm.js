/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostEvaluasiPerkuliahan,
  usePatchEvaluasiPerkuliahan,
} from '../../hooks/useEvaluasiPerkuliahan';
import Alert from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { usePenugasanPengajaranData } from '../../hooks/usePenugasanPengajaran';
import CRUFileInput from '../../components/CRUFileInput';
import CRUTextAreaInput from '../../components/CRUTextAreaInput';

const EvaluasiPerkuliahanForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      rps: null,
      evaluation_report: null,
      rubrik: null,
      notes: null,
      penugasan: null,
    },
  });

  useEffect(() => {
    if (id) {
      reset(state);
    }
  }, [state, id, reset]);

  const {
    mutate: postEvaluasiPerkuliahan,
    isLoading: postEvaluasiPerkuliahanLoading,
  } = usePostEvaluasiPerkuliahan();
  const {
    mutate: patchEvaluasiPerkuliahan,
    isLoading: patchEvaluasiPerkuliahanLoading,
  } = usePatchEvaluasiPerkuliahan();
  const navigate = useNavigate();
  const {
    data: dataPenugasanPengajaran,
    isSuccess: penugasanPengajaranDataSuccess,
  } = usePenugasanPengajaranData({
    select: (response) => {
      const formatPenugasanPengajaranData = response.data.map((data) => {
        return {
          value: data.id,
          label: `[${data.periode} ${data.tahun}]-${data.dosen_pengampu_detail?.inisial}-${data.mata_kuliah_detail.name}`,
        };
      });

      return formatPenugasanPengajaranData;
    },
  });

  const onSubmit = (data) => {
    const evaluasiPerkuliahanFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        evaluasiPerkuliahanFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchEvaluasiPerkuliahan(
        { data: evaluasiPerkuliahanFormData, id: id },
        {
          onSuccess: () => {
            navigate('/evaluasi-perkuliahan');
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
      postEvaluasiPerkuliahan(evaluasiPerkuliahanFormData, {
        onSuccess: () => {
          navigate('/evaluasi-perkuliahan');
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
    <section id="evaluasi-perkuliahan-form" className="section-container">
      <p className="text-lg font-semibold">
        {id ? 'Edit' : 'Buat'} Evaluasi Perkuliahan
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUFileInput
          fileLink={state?.rps}
          control={control}
          register={register}
          registeredName="rps"
          name="RPS"
        />
        <CRUFileInput
          fileLink={state?.evaluation_report}
          control={control}
          register={register}
          registeredName="evaluation_report"
          name="Evaluation Report"
        />
        <CRUFileInput
          fileLink={state?.rubrik}
          control={control}
          register={register}
          registeredName="rubrik"
          name="Rubrik"
        />
        <CRUTextAreaInput
          register={register}
          name="Notes"
          registeredName="notes"
          errors={errors}
        />
        <CRUDropdownInput
          required
          control={control}
          name="Penugasan Pengajaran"
          registeredName="penugasan"
          defaultValue={
            state?.penugasan_detail
              ? {
                  value: state.penugasan_detail.id,
                  label: `[${state.periode} ${state.tahun}]-${state.dosen_pengampu_detail?.inisial}-${state.mata_kuliah_detail?.name}`,
                }
              : null
          }
          options={
            penugasanPengajaranDataSuccess ? dataPenugasanPengajaran : []
          }
        />
        {errorMessage ? (
          <Alert className="inline-block">{errorMessage}</Alert>
        ) : null}
        {id ? (
          <EditButton
            className={`!mt-8 !text-base`}
            type="submit"
            isLoading={patchEvaluasiPerkuliahanLoading}
          />
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postEvaluasiPerkuliahanLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default EvaluasiPerkuliahanForm;
