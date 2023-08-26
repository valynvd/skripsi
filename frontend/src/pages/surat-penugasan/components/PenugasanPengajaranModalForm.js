import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../../components/CRUInput';
import { PrimaryButton } from '../../../components/PrimaryButton';
import { useLocation } from 'react-router-dom';
import {
  usePostPenugasanPengajaran,
  usePatchPenugasanPengajaran,
} from '../../../hooks/usePenugasanPengajaran';
import { AlertError } from '../../../components/Alert';
import EditButton from '../../../components/EditButton';
import CRUDropdownInput from '../../../components/CRUDropdownInput';
import { useDosenData } from '../../../hooks/useDosen';
import { useMataKuliahData } from '../../../hooks/useMataKuliah';
import ModalCreateForm from '../../../components/ModalCreateForm';
import CancelButton from '../../../components/CancelButton';

const PenugasanPengajaranModalForm = ({
  penugasanPengajaranRefetch,
  penugasanPengajaranData,
  openModal,
  setOpenModal,
  suratPenugasanId,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const { state } = useLocation();
  const [editable, setEditable] = useState(true);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      sks_realisasi: null,
      surat_penugasan: null,
      dosen_pengampu: null,
      mata_kuliah: null,
      class_code: null,
      students_amount: null,
    },
  });

  useEffect(() => {
    if (penugasanPengajaranData) {
      reset(penugasanPengajaranData);
      setEditable(false);
    } else {
      reset({
        sks_realisasi: null,
        surat_penugasan: null,
        dosen_pengampu: null,
        mata_kuliah: null,
        class_code: null,
        students_amount: null,
      });
      setEditable(true);
    }
  }, [state, penugasanPengajaranData, reset]);

  const {
    mutate: postPenugasanPengajaran,
    isLoading: postPenugasanPengajaranLoading,
  } = usePostPenugasanPengajaran();
  const {
    mutate: patchPenugasanPengajaran,
    isLoading: patchPenugasanPengajaranLoading,
  } = usePatchPenugasanPengajaran();
  const { data: dataDosen, isSuccess: dosenDataSuccess } = useDosenData({
    select: (response) => {
      const formatDosenData = response.data.map(({ id, name }) => {
        return { value: id, label: name };
      });

      return formatDosenData;
    },
  });
  const { data: dataMataKuliah, isSuccess: mataKuliahDataSuccess } =
    useMataKuliahData({
      select: (response) => {
        const formatMataKuliahData = response.data.map(
          ({ id, name, semester }) => {
            return { value: id, label: name + ' - Semester ' + semester };
          }
        );

        return formatMataKuliahData;
      },
    });

  const onSubmit = (data) => {
    const penugasanPengajaranFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        penugasanPengajaranFormData.append(key, data[key]);
      }
    });

    penugasanPengajaranFormData.append('surat_penugasan', suratPenugasanId);

    if (penugasanPengajaranData) {
      patchPenugasanPengajaran(
        { data: penugasanPengajaranFormData, id: data.id },
        {
          onSuccess: () => {
            penugasanPengajaranRefetch();
            setOpenModal(false);
            reset({
              sks_realisasi: null,
              tahun: null,
              periode: null,
              surat_penugasan: null,
              dosen_pengampu: null,
              mata_kuliah: null,
              class_code: null,
              students_amount: null,
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
      postPenugasanPengajaran(penugasanPengajaranFormData, {
        onSuccess: () => {
          penugasanPengajaranRefetch();
          setOpenModal(false);
          reset({
            sks_realisasi: null,
            surat_penugasan: null,
            dosen_pengampu: null,
            mata_kuliah: null,
            class_code: null,
            students_amount: null,
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
        id="penugasan-pengajaran-form"
        className="section-container h-full"
      >
        <p className="text-lg font-semibold">
          {penugasanPengajaranData ? 'Detail' : 'Buat'} Penugasan Pengajaran
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUInput
            register={register}
            name="sks realisasi"
            registeredName="sks_realisasi"
            type="number"
            required
            errors={errors}
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="jumlah mahasiswa"
            registeredName="students_amount"
            type="number"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="kode kelas"
            registeredName="class_code"
            errors={errors}
            isDisabled={!editable}
          />
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
          <CRUDropdownInput
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
          />
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {penugasanPengajaranData ? (
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
                  isLoading={patchPenugasanPengajaranLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postPenugasanPengajaranLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default PenugasanPengajaranModalForm;
