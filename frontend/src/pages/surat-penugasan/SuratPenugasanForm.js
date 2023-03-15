import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostSuratPenugasan,
  usePatchSuratPenugasan,
} from '../../hooks/useSuratPenugasan';
import Alert from '../../components/Alert';
import CRUFileInput from '../../components/CRUFileInput';
import EditButton from '../../components/EditButton';

const SuratPenugasanForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const {
    register,
    handleSubmit,
    reset,
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

  const { mutate: postSuratPenugasan, isLoading: postSuratPenugasanLoading } =
    usePostSuratPenugasan();
  const { mutate: patchSuratPenugasan, isLoading: patchSuratPenugasanLoading } =
    usePatchSuratPenugasan();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const suratPenugasanFormData = new FormData();

    if (dirtyFields.judul) {
      suratPenugasanFormData.append('judul', data.judul);
    }
    if (dirtyFields.files) {
      suratPenugasanFormData.append('files', data.files[0]);
    }

    if (id) {
      patchSuratPenugasan(
        { data: suratPenugasanFormData, id: id },
        {
          onSuccess: () => {
            navigate('/surat-penugasan');
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
      postSuratPenugasan(suratPenugasanFormData, {
        onSuccess: () => {
          navigate('/surat-penugasan');
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
    <section id="surat-penugasan-form" className="p-6 bg-white rounded-lg over">
      <p className="text-lg font-semibold">
        {id ? 'Edit' : 'Buat'} Surat Penugasan
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="judul"
          required
          errors={errors}
          registeredName="judul"
        />
        <CRUFileInput
          fileLink={state?.files}
          register={register}
          name="files"
          type="file"
        />
        {errorMessage ? (
          <Alert className="inline-block">{errorMessage}</Alert>
        ) : null}
        {id ? (
          <EditButton
            className={`!mt-8 !text-base`}
            isLoading={patchSuratPenugasanLoading}
            type="submit"
          />
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postSuratPenugasanLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default SuratPenugasanForm;
