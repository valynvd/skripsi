/* eslint-disable no-constant-condition */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../../components/CRUInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useLocation } from 'react-router-dom';
import {
  usePostPoinPenilaian,
  usePatchPoinPenilaian,
} from '../../../hooks/usePoinPenilaian';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CancelButton from '../../../components/CancelButton';
import CRUTextAreaInput from '../../../components/CRUTextAreaInput';

const PoinPenilaianModalForm = ({
  refetchMatriksPenilaianData,
  matriksPenilaianData,
  poinPenilaianRefetch,
  selectedPoinPenilaian,
  openPoinPenilaianModalForm,
  setOpenPoinPenilaianModalForm,
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
    if (selectedPoinPenilaian) {
      reset(selectedPoinPenilaian);
      setEditable(false);
    } else {
      reset({
        type: null,
        order_number: null,
        item_number: null,
        max_score: null,
        element: null,
        description: null,
        description_grade_1: null,
        description_grade_2: null,
        description_grade_3: null,
        description_grade_4: null,
      });
      setEditable(true);
    }
  }, [state, selectedPoinPenilaian, reset]);

  const { mutate: postPoinPenilaian, isLoading: postPoinPenilaianLoading } =
    usePostPoinPenilaian();
  const { mutate: patchPoinPenilaian, isLoading: patchPoinPenilaianLoading } =
    usePatchPoinPenilaian();

  const onSubmit = (data) => {
    const poinPenilaianFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        poinPenilaianFormData.append(key, data[key]);
      }
    });

    poinPenilaianFormData.append('kriteriaId', selectedKriteria);

    if (selectedPoinPenilaian) {
      patchPoinPenilaian(
        { data: poinPenilaianFormData, id: data.id },
        {
          onSuccess: () => {
            refetchMatriksPenilaianData();
            setOpenPoinPenilaianModalForm(false);
            reset({
              type: null,
              order_number: null,
              item_number: null,
              max_score: null,
              element: null,
              description: null,
              description_grade_1: null,
              description_grade_2: null,
              description_grade_3: null,
              description_grade_4: null,
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
      postPoinPenilaian(poinPenilaianFormData, {
        onSuccess: () => {
          refetchMatriksPenilaianData();
          setOpenPoinPenilaianModalForm(false);
          reset({
            type: null,
            order_number: null,
            item_number: null,
            max_score: null,
            element: null,
            description: null,
            description_grade_1: null,
            description_grade_2: null,
            description_grade_3: null,
            description_grade_4: null,
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
      isOpen={openPoinPenilaianModalForm}
      setIsOpen={setOpenPoinPenilaianModalForm}
      link="/login"
    >
      <section
        id="poin-penilaian-form"
        className="section-container !min-w-[44rem] h-full"
      >
        <p className="text-lg font-semibold">
          {selectedPoinPenilaian ? 'Detail' : 'Buat'} Poin Penilaian
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <input type="text" className="overflow-hidden h-0 absolute top-0" />
          <CRUInput
            register={register}
            name="jenis"
            errors={errors}
            registeredName="type"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="no. urut"
            type="number"
            errors={errors}
            registeredName="order_number"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="no. butir"
            errors={errors}
            registeredName="item_number"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="bobot dari 400"
            type="number"
            errors={errors}
            registeredName="max_score"
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Elemen Penilaian LAM"
            registeredName="element"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskriptor"
            registeredName="description"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 1"
            registeredName="description_grade_1"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 2"
            registeredName="description_grade_2"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 3"
            registeredName="description_grade_3"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 4"
            registeredName="description_grade_4"
            errors={errors}
            isDisabled={!editable}
          />
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {selectedPoinPenilaian ? (
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
                  isLoading={patchPoinPenilaianLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={patchPoinPenilaianLoading || postPoinPenilaianLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default PoinPenilaianModalForm;
