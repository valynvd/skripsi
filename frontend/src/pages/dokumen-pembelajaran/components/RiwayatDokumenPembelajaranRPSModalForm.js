import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../../../components/PrimaryButton';
import { useLocation } from 'react-router-dom';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CRUFileInput from '../../../components/CRUFileInput';
import {
  usePatchRiwayatDokumenPembelajaran,
  usePostRiwayatDokumenPembelajaran,
} from '../../../hooks/useDokumenPembelajaran';
import { useCheckRole } from '../../../hooks/useCheckRole';
import CRUDropdownInput from '../../../components/CRUDropdownInput';
import CRUTextAreaInput from '../../../components/CRUTextAreaInput';

const RiwayatDokumenPembelajaranRPSModalForm = ({
  riwayatDokumenPembelajaranRefetch,
  riwayatDokumenPembelajaranData,
  openModal,
  openModalType,
  setOpenModal,
  dokumenPembelajaranId,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { state } = useLocation();
  const userRole = useCheckRole();
  const {
    register,
    handleSubmit,
    reset,
    control,
    errors,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      rps: null,
      evaluation_report: null,
      status: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (riwayatDokumenPembelajaranData) {
      reset(riwayatDokumenPembelajaranData);
    } else {
      reset({
        rps: null,
        evaluation_report: null,
        status: null,
        notes: null,
      });
    }
  }, [state, riwayatDokumenPembelajaranData, reset]);

  const {
    mutate: postRiwayatDokumenPembelajaran,
    isLoading: postRiwayatDokumenPembelajaranLoading,
  } = usePostRiwayatDokumenPembelajaran();
  const {
    mutate: patchRiwayatDokumenPembelajaran,
    isLoading: patchRiwayatDokumenPembelajaranLoading,
  } = usePatchRiwayatDokumenPembelajaran();

  const onSubmit = (data) => {
    const riwayatDokumenPembelajaranFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        riwayatDokumenPembelajaranFormData.append(key, data[key]);
      }
    });

    if (openModalType === 'RPS') {
      riwayatDokumenPembelajaranFormData.append('type', 'rps');
    } else if (openModalType === 'Rubrik') {
      riwayatDokumenPembelajaranFormData.append('type', 'rubrik');
    }

    if (riwayatDokumenPembelajaranData) {
      patchRiwayatDokumenPembelajaran(
        { data: riwayatDokumenPembelajaranFormData, id: data.id },
        {
          onSuccess: () => {
            riwayatDokumenPembelajaranRefetch();
            setOpenModal(false);
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
      riwayatDokumenPembelajaranFormData.append(
        'dokumenPembelajaranId',
        dokumenPembelajaranId
      );

      postRiwayatDokumenPembelajaran(riwayatDokumenPembelajaranFormData, {
        onSuccess: () => {
          riwayatDokumenPembelajaranRefetch();
          setOpenModal(false);
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
      isOpen={!!openModal}
      setIsOpen={setOpenModal}
      link="/login"
    >
      <section
        id="penugasan-pengajaran-form"
        className="section-container h-full"
      >
        <p className="text-lg font-semibold">
          {riwayatDokumenPembelajaranData ? 'Edit' : 'Buat'} {openModalType}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUFileInput
            fileLink={riwayatDokumenPembelajaranData?.initial_document}
            control={control}
            register={register}
            registeredName="initial_document"
            name={openModalType}
          />

          {riwayatDokumenPembelajaranData &&
          (userRole.admin || userRole.kaprodi) ? (
            <CRUFileInput
              fileLink={riwayatDokumenPembelajaranData?.evaluation_report}
              control={control}
              register={register}
              registeredName="revised_document"
              name="Evaluasi"
            />
          ) : null}
          {riwayatDokumenPembelajaranData ? (
            <CRUDropdownInput
              required
              control={control}
              name="Status"
              registeredName="status"
              defaultValue={riwayatDokumenPembelajaranData.status}
              options={[
                { value: 'revision', label: 'Revisi' },
                { value: 'accepted', label: 'Diterima' },
              ]}
            />
          ) : null}
          {riwayatDokumenPembelajaranData ? (
            <CRUTextAreaInput
              register={register}
              name="catatan"
              registeredName="notes"
              errors={errors}
            />
          ) : null}
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {riwayatDokumenPembelajaranData ? (
            <EditButton
              className={`!mt-8 !text-base`}
              type="submit"
              isLoading={patchRiwayatDokumenPembelajaranLoading}
            />
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

export default RiwayatDokumenPembelajaranRPSModalForm;
