/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostPenugasanPenelitian,
  usePatchPenugasanPenelitian,
  usePenugasanPenelitianById,
} from '../../hooks/usePenugasanPenelitian';
import { AlertError } from '../../components/Alert';
import CRUFileInput from '../../components/CRUFileInput';
import EditButton from '../../components/EditButton';
import { usePenugasanPengajaranByPenugasanPenelitian } from '../../hooks/usePenugasanPengajaran';
import useAuth from '../../hooks/useAuth';
import CancelButton from '../../components/CancelButton';

const PenugasanPenelitianForm = () => {
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
    defaultValues: {},
  });
  const [editable, setEditable] = useState(true);
  const [penugasanPenelitianData, setPenugasanPenelitianData] = useState(state);

  const { data: updatedPenugasanPenelitianData } = usePenugasanPenelitianById(
    id,
    {
      enabled: !!id && !penugasanPenelitianData,
    }
  );

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedPenugasanPenelitianData) {
        setPenugasanPenelitianData(updatedPenugasanPenelitianData?.data);
        reset(updatedPenugasanPenelitianData?.data);
      }
      setEditable(false);
    }
  }, [state, id, reset, updatedPenugasanPenelitianData]);

  const {
    mutate: postPenugasanPenelitian,
    isLoading: postPenugasanPenelitianLoading,
  } = usePostPenugasanPenelitian();
  const {
    mutate: patchPenugasanPenelitian,
    isLoading: patchPenugasanPenelitianLoading,
  } = usePatchPenugasanPenelitian();
  const navigate = useNavigate();
  const {
    auth: { userData },
  } = useAuth();

  const onSubmit = (data) => {
    const penugasanPenelitianFormData = new FormData();

    if (dirtyFields.title) {
      penugasanPenelitianFormData.append('title', data.title);
    }
    if (dirtyFields.start_year) {
      penugasanPenelitianFormData.append('start_year', data.start_year);
    }
    if (dirtyFields.total_year) {
      penugasanPenelitianFormData.append('total_year', data.total_year);
    }
    if (dirtyFields.location) {
      penugasanPenelitianFormData.append('location', data.location);
    }
    if (dirtyFields.dikti_total_fund) {
      penugasanPenelitianFormData.append(
        'dikti_total_fund',
        data.dikti_total_fund
      );
    }
    if (dirtyFields.college_total_fund) {
      penugasanPenelitianFormData.append(
        'college_total_fund',
        data.college_total_fund
      );
    }
    if (dirtyFields.other_institution_total_fund) {
      penugasanPenelitianFormData.append(
        'other_institution_total_fund',
        data.other_institution_total_fund
      );
    }
    if (dirtyFields.files) {
      penugasanPenelitianFormData.append('files', data.files[0]);
    }

    penugasanPenelitianFormData.append(
      'dosen_pengampu',
      userData.dosen_detail.id
    );

    if (id) {
      patchPenugasanPenelitian(
        { data: penugasanPenelitianFormData, id: id },
        {
          onSuccess: () => {
            navigate('/pelaksanaan-penelitian/penugasan-penelitian');
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
      postPenugasanPenelitian(penugasanPenelitianFormData, {
        onSuccess: () => {
          navigate('/pelaksanaan-penelitian/penugasan-penelitian');
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
      <section id="surat-penugasan-form" className="section-container">
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Penugasan Penelitian
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUInput
            register={register}
            name="judul"
            errors={errors}
            registeredName="title"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="tanggal pelaksanaan"
            errors={errors}
            registeredName="start_year"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="lama kegiatan (tahun)"
            errors={errors}
            registeredName="total_year"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="lokasi kegiatan"
            errors={errors}
            registeredName="location"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="dana dari dikti (rp.)"
            errors={errors}
            registeredName="dikti_total_fund"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="dana dari perguruan tinggi (rp.)"
            errors={errors}
            registeredName="college_total_fund"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="dana dari institusi lain (rp.)"
            errors={errors}
            registeredName="other_institution_total_fund"
            isDisabled={!editable}
          />
          <CRUFileInput
            control={control}
            fileLink={state?.files}
            register={register}
            registeredName="files"
            name="File"
            type="file"
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
                  isLoading={patchPenugasanPenelitianLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={
                patchPenugasanPenelitianLoading ||
                postPenugasanPenelitianLoading
              }
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </>
  );
};

export default PenugasanPenelitianForm;
