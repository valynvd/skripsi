import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useLocation } from 'react-router-dom';
import {
  usePostPenugasanPenelitian,
  usePatchPenugasanPenelitian,
} from '../../../hooks/usePenugasanPenelitian';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import CRUDropdownInput from '../../../components/CRUDropdownInput';
import { useDosenData } from '../../../hooks/useDosen';
// import { useMataKuliahData } from '../../../hooks/useMataKuliah';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CancelButton from '../../../components/CancelButton';

const PenugasanPenelitianModalForm = ({
  penugasanPenelitianRefetch,
  penugasanPenelitianData,
  openModal,
  setOpenModal,
  suratPenugasanId,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { state } = useLocation();
  const [editable, setEditable] = useState(true);
  const {
    handleSubmit,
    reset,
    control,
    formState: { dirtyFields },
  } = useForm({
    defaultValues: {
      sks_realisasi: null,
    },
  });

  useEffect(() => {
    if (penugasanPenelitianData) {
      reset(penugasanPenelitianData);
      setEditable(false);
    } else {
      reset({
        sks_realisasi: null,
      });
      setEditable(true);
    }
  }, [state, penugasanPenelitianData, reset]);

  const {
    mutate: postPenugasanPenelitian,
    isLoading: postPenugasanPenelitianLoading,
  } = usePostPenugasanPenelitian();
  const {
    mutate: patchPenugasanPenelitian,
    isLoading: patchPenugasanPenelitianLoading,
  } = usePatchPenugasanPenelitian();
  const { data: dataDosen, isSuccess: dosenDataSuccess } = useDosenData({
    select: (response) => {
      const formatDosenData = response.data.map(({ id, name }) => {
        return { value: id, label: name };
      });

      return formatDosenData;
    },
  });

  const onSubmit = (data) => {
    const penugasanPenelitianFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        penugasanPenelitianFormData.append(key, data[key]);
      }
    });

    penugasanPenelitianFormData.append('surat_penugasan', suratPenugasanId);

    if (penugasanPenelitianData) {
      patchPenugasanPenelitian(
        { data: penugasanPenelitianFormData, id: data.id },
        {
          onSuccess: () => {
            penugasanPenelitianRefetch();
            setOpenModal(false);
            reset({
              dosen_pengampu: null,
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
      postPenugasanPenelitian(penugasanPenelitianFormData, {
        onSuccess: () => {
          penugasanPenelitianRefetch();
          setOpenModal(false);
          reset({
            dosen_pengampu: null,
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
    <ModalCreateForm isOpen={openModal} setIsOpen={setOpenModal} link="/login">
      <section
        id="penugasan-penelitian-form"
        className="section-container h-full"
      >
        <p className="text-lg font-semibold">
          {penugasanPenelitianData ? 'Detail' : 'Buat'} Penugasan Penelitian
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUDropdownInput
            control={control}
            name="Dosen"
            registeredName="dosen_pengampu"
            defaultValue={
              state?.dosen_pengampu_detail
                ? {
                    value: state.dosen_pengampu_detail.id,
                    label: state.dosen_pengampu_detail.name,
                  }
                : null
            }
            options={dosenDataSuccess ? dataDosen : []}
            isDisabled={!editable}
          />
          {/* <CRUDropdownInput
            control={control}
            name="Mata Kuliah"
            registeredName="mata_kuliah"
            defaultValue={
              state?.mata_kuliah_detail
                ? {
                    value: state.mata_kuliah_detail.id,
                    label: state.mata_kuliah_detail.name,
                  }
                : null
            }
            options={mataKuliahDataSuccess ? dataMataKuliah : []}
            isDisabled={!editable}
          /> */}
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {penugasanPenelitianData ? (
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
              isLoading={postPenugasanPenelitianLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default PenugasanPenelitianModalForm;
