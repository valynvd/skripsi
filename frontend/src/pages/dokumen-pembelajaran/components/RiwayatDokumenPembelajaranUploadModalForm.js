import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { AlertError } from '../../../components/Alert';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CRUFileInput from '../../../components/CRUFileInput';
import {
  usePatchRiwayatDokumenPembelajaran,
  usePostRiwayatDokumenPembelajaran,
} from '../../../hooks/useDokumenPembelajaran';
import { useEffect } from 'react';
import EditButton from '../../../components/EditButton';
import CancelButton from '../../../components/CancelButton';

const RiwayatDokumenPembelajaranUploadModalForm = ({
  riwayatDokumenPembelajaranRefetch,
  openModalUpload,
  openModalUploadType,
  setOpenModalUpload,
  dokumenPembelajaranId,
  riwayatDokumenPembelajaranData,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const [editable, setEditable] = useState(true);
  const {
    register,
    handleSubmit,
    control,
    formState: { dirtyFields },
    reset,
  } = useForm({
    defaultValues: {
      initial_document: null,
    },
  });

  const {
    mutate: postRiwayatDokumenPembelajaran,
    isLoading: postRiwayatDokumenPembelajaranLoading,
  } = usePostRiwayatDokumenPembelajaran();
  const {
    mutate: patchRiwayatDokumenPembelajaran,
    isLoading: patchRiwayatDokumenPembelajaranLoading,
  } = usePatchRiwayatDokumenPembelajaran();

  useEffect(() => {
    if (riwayatDokumenPembelajaranData) {
      reset(riwayatDokumenPembelajaranData);
      setEditable(false);
    } else {
      reset({
        initial_document: null,
      });
      setEditable(true);
    }
  }, [riwayatDokumenPembelajaranData, reset]);

  const onSubmit = (data) => {
    const riwayatDokumenPembelajaranFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        riwayatDokumenPembelajaranFormData.append(key, data[key]);
      }
    });

    if (riwayatDokumenPembelajaranData) {
      patchRiwayatDokumenPembelajaran(
        { data: riwayatDokumenPembelajaranFormData, id: data.id },
        {
          onSuccess: () => {
            riwayatDokumenPembelajaranRefetch();
            setOpenModalUpload(false);
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
      if (openModalUploadType === 'RPS') {
        riwayatDokumenPembelajaranFormData.append('type', 'rps');
      } else if (openModalUploadType === 'Rubrik') {
        riwayatDokumenPembelajaranFormData.append('type', 'rubrik');
      }

      riwayatDokumenPembelajaranFormData.append(
        'dokumenPembelajaranId',
        dokumenPembelajaranId
      );

      postRiwayatDokumenPembelajaran(riwayatDokumenPembelajaranFormData, {
        onSuccess: () => {
          riwayatDokumenPembelajaranRefetch();
          setOpenModalUpload(false);
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
    <ModalCreateForm
      isOpen={!!openModalUpload}
      setIsOpen={setOpenModalUpload}
      link="/login"
    >
      <section
        id="penugasan-pengajaran-form"
        className="section-container h-full"
      >
        <p className="text-lg font-semibold">
          {riwayatDokumenPembelajaranData ? 'Detail' : 'Upload'}{' '}
          {openModalUploadType}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUFileInput
            fileLink={riwayatDokumenPembelajaranData?.initial_document}
            control={control}
            register={register}
            registeredName="initial_document"
            name={openModalUploadType}
            isDisabled={!editable}
          />
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {riwayatDokumenPembelajaranData ? (
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
                  isLoading={patchRiwayatDokumenPembelajaranLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postRiwayatDokumenPembelajaranLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default RiwayatDokumenPembelajaranUploadModalForm;
