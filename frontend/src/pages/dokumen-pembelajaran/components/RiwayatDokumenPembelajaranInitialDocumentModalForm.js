import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'react-router-dom';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CRUFileInput from '../../../components/CRUFileInput';
import { usePatchRiwayatDokumenPembelajaran } from '../../../hooks/useDokumenPembelajaran';
import { useCheckRole } from '../../../hooks/useCheckRole';

const RiwayatDokumenPembelajaranInitialDocumentModalForm = ({
  riwayatDokumenPembelajaranRefetch,
  riwayatDokumenPembelajaranData,
  openModalInitialDocument,
  setOpenModalInitialDocument,
  openModalUploadType,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { state } = useLocation();
  const userRole = useCheckRole();
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      initial_document: null,
    },
  });

  useEffect(() => {
    if (riwayatDokumenPembelajaranData) {
      reset(riwayatDokumenPembelajaranData);
    } else {
      reset({
        initial_document: null,
      });
    }
  }, [state, riwayatDokumenPembelajaranData, reset]);

  const {
    mutate: patchRiwayatDokumenPembelajaran,
    isLoading: patchRiwayatDokumenPembelajaranLoading,
  } = usePatchRiwayatDokumenPembelajaran();

  const onSubmit = (data) => {
    const riwayatDokumenPembelajaranFormData = new FormData();

    if (dirtyFields.initial_document) {
      riwayatDokumenPembelajaranFormData.append(
        'initial_document',
        data.initial_document
      );
    }

    if (riwayatDokumenPembelajaranData) {
      patchRiwayatDokumenPembelajaran(
        { data: riwayatDokumenPembelajaranFormData, id: data.id },
        {
          onSuccess: () => {
            riwayatDokumenPembelajaranRefetch();
            setOpenModalInitialDocument(false);
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
      isOpen={!!openModalInitialDocument}
      setIsOpen={setOpenModalInitialDocument}
      link="/login"
    >
      <section
        id="penugasan-pengajaran-form"
        className="section-container h-full"
      >
        <p className="text-lg font-semibold">Edit Evaluasi</p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {riwayatDokumenPembelajaranData &&
          (userRole.admin || userRole.kaprodi) ? (
            <>
              <CRUFileInput
                fileLink={riwayatDokumenPembelajaranData?.initial_document}
                control={control}
                register={register}
                registeredName="initial_document"
                name={openModalUploadType}
              />
            </>
          ) : null}
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          <EditButton
            className={`!mt-8 !text-base`}
            type="submit"
            isLoading={patchRiwayatDokumenPembelajaranLoading}
          />
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default RiwayatDokumenPembelajaranInitialDocumentModalForm;
