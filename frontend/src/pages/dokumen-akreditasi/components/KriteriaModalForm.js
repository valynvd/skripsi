/* eslint-disable no-constant-condition */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../../components/CRUInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useLocation } from 'react-router-dom';
import { usePostKriteria, usePatchKriteria } from '../../../hooks/useKriteria';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CancelButton from '../../../components/CancelButton';
import CRUTextAreaInput from '../../../components/CRUTextAreaInput';

const KriteriaModalForm = ({
  refetchMatriksPenilaianData,
  matriksPenilaianData,
  kriteriaRefetch,
  openKriteriaModalForm,
  setOpenKriteriaModalForm,
  dokumenAkreditasiId,
  selectedKriteria,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { state } = useLocation();
  const [editable, setEditable] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {},
  });

  useEffect(() => {
    if (selectedKriteria) {
      reset(selectedKriteria);
      setEditable(false);
    } else {
      reset({
        nama: null,
        deskripsi: null,
      });
      setEditable(true);
    }
  }, [state, selectedKriteria, reset]);

  const { mutate: postKriteria, isLoading: postKriteriaLoading } =
    usePostKriteria();
  const { mutate: patchKriteria, isLoading: patchKriteriaLoading } =
    usePatchKriteria();

  const onSubmit = (data) => {
    const kriteriaFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        kriteriaFormData.append(key, data[key]);
      }
    });

    kriteriaFormData.append('dokumenAkreditasiId', dokumenAkreditasiId);

    if (selectedKriteria) {
      patchKriteria(
        { data: kriteriaFormData, id: data.id },
        {
          onSuccess: () => {
            refetchMatriksPenilaianData();
            setOpenKriteriaModalForm(false);
            reset({
              nama: null,
              deskripsi: null,
            });
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
      postKriteria(kriteriaFormData, {
        onSuccess: () => {
          refetchMatriksPenilaianData();
          setOpenKriteriaModalForm(false);
          reset({
            nama: null,
            deskripsi: null,
          });
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
      isOpen={openKriteriaModalForm}
      setIsOpen={setOpenKriteriaModalForm}
      link="/login"
    >
      <section
        id="poin-penilaian-form"
        className="section-container !min-w-[44rem] h-full"
      >
        <p className="text-lg font-semibold">
          {selectedKriteria ? 'Detail' : 'Buat'} Kriteria
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <input type="text" className="overflow-hidden h-0 absolute top-0" />
          <CRUInput
            register={register}
            name="nama"
            errors={errors}
            registeredName="nama"
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi"
            registeredName="deskripsi"
            errors={errors}
            isDisabled={!editable}
          />
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {selectedKriteria ? (
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
                  isLoading={patchKriteriaLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={patchKriteriaLoading || postKriteriaLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default KriteriaModalForm;
