import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CRUFileInput from '../../../components/CRUFileInput';
import { usePatchRiwayatDokumenPembelajaran } from '../../../hooks/useDokumenPembelajaran';
import { useCheckRole } from '../../../hooks/useCheckRole';
import CRUTextAreaInput from '../../../components/CRUTextAreaInput';
import CRUInput from '../../../components/CRUInput';
import CancelButton from '../../../components/CancelButton';

const RiwayatDokumenPembelajaranEvaluasiModalForm = ({
  riwayatDokumenPembelajaranRefetch,
  riwayatDokumenPembelajaranData,
  openModalEvaluasi,
  setOpenModalEvaluasi,
  updatedDokumenPembelajaranDataRefetch,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { state } = useLocation();
  const [editable, setEditable] = useState(true);
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
      revised_document: null,
      status: null,
      notes: null,
    },
  });

  useEffect(() => {
    if (riwayatDokumenPembelajaranData) {
      reset({
        ...riwayatDokumenPembelajaranData,
        status:
          riwayatDokumenPembelajaranData.status === 'accepted' ? true : false,
      });
      setEditable(false);
    } else {
      reset({
        revised_document: null,
        status: null,
        notes: null,
      });
    }
  }, [state, riwayatDokumenPembelajaranData, reset]);

  const {
    mutate: patchRiwayatDokumenPembelajaran,
    isLoading: patchRiwayatDokumenPembelajaranLoading,
  } = usePatchRiwayatDokumenPembelajaran();

  const onSubmit = (data) => {
    const riwayatDokumenPembelajaranFormData = new FormData();

    if (dirtyFields.revised_document) {
      riwayatDokumenPembelajaranFormData.append('status', 'revision');

      riwayatDokumenPembelajaranFormData.append(
        'revised_document',
        data.revised_document
      );
    }
    if (dirtyFields.status) {
      if (data.status === true) {
        riwayatDokumenPembelajaranFormData.append('status', 'accepted');
      } else if (data.status === false) {
        riwayatDokumenPembelajaranFormData.append('status', 'revision');
      }
    }
    if (dirtyFields.notes) {
      riwayatDokumenPembelajaranFormData.append('notes', data.notes);
    }

    if (riwayatDokumenPembelajaranData) {
      patchRiwayatDokumenPembelajaran(
        { data: riwayatDokumenPembelajaranFormData, id: data.id },
        {
          onSuccess: () => {
            if (dirtyFields.status) {
              if (data.status === true) {
                updatedDokumenPembelajaranDataRefetch();
              }
            }
            riwayatDokumenPembelajaranRefetch();
            setOpenModalEvaluasi(false);
          },
          onError: (err) => {
            setErrorMessage(err.message);
            setTimeout(() => {
              setErrorMessage();
            }, 5000);
          },
        }
      );
    }
  };

  return (
    <ModalCreateForm
      isOpen={!!openModalEvaluasi}
      setIsOpen={setOpenModalEvaluasi}
      link="/login"
    >
      <section
        id="penugasan-pengajaran-form"
        className="section-container h-full"
      >
        <p className="text-lg font-semibold">Detail Evaluasi</p>
        {userRole?.dosen &&
        !riwayatDokumenPembelajaranData?.revised_document ? (
          <p className="mt-8 text-primary-400">
            Silahkan menunggu evaluasi dari Kaprodi
          </p>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            {riwayatDokumenPembelajaranData ? (
              <CRUFileInput
                fileLink={riwayatDokumenPembelajaranData?.revised_document}
                control={control}
                register={register}
                registeredName="revised_document"
                name="Evaluasi"
                hidden={userRole.dosen}
                isDisabled={!editable}
              />
            ) : null}
            {riwayatDokumenPembelajaranData &&
            (userRole.admin || userRole.kaprodi) ? (
              <>
                <CRUInput
                  register={register}
                  name="Diterima"
                  type="checkbox"
                  errors={errors}
                  registeredName="status"
                  isDisabled={!editable}
                />
              </>
            ) : null}
            {riwayatDokumenPembelajaranData ? (
              <CRUTextAreaInput
                register={register}
                name="catatan"
                registeredName="notes"
                errors={errors}
                disabled={userRole.dosen}
                isDisabled={!editable}
              />
            ) : null}
            {errorMessage ? (
              <AlertError className="inline-block">{errorMessage}</AlertError>
            ) : null}
            {!userRole.dosen && (
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
                {editable && (
                  <CancelButton onClick={() => setEditable(false)} />
                )}
              </div>
              /* <EditButton
                className={`!mt-8 !text-base`}
                type="submit"
                isLoading={patchRiwayatDokumenPembelajaranLoading}
              /> */
            )}
          </form>
        )}
      </section>
    </ModalCreateForm>
  );
};

export default RiwayatDokumenPembelajaranEvaluasiModalForm;
