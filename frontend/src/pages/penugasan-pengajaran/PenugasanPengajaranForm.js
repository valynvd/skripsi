import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostPenugasanPengajaran,
  usePatchPenugasanPengajaran,
} from '../../hooks/usePenugasanPengajaran';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { useSuratPenugasanData } from '../../hooks/useSuratPenugasan';
import { useDosenData } from '../../hooks/useDosen';
import { useMataKuliahData } from '../../hooks/useMataKuliah';

const PenugasanPengajaranForm = () => {
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
    defaultValues: {
      sks_realisasi: null,
      tahun: null,
      periode: null,
      surat_penugasan: null,
      dosen_pengampu: null,
      mata_kuliah: null,
    },
  });

  useEffect(() => {
    if (id) {
      reset(state);
    }
  }, [state, id, reset]);

  const {
    mutate: postPenugasanPengajaran,
    isLoading: postPenugasanPengajaranLoading,
  } = usePostPenugasanPengajaran();
  const {
    mutate: patchPenugasanPengajaran,
    isLoading: patchPenugasanPengajaranLoading,
  } = usePatchPenugasanPengajaran();
  const navigate = useNavigate();
  const { data: dataSuratPenugasan, isSuccess: suratPenugasanDataSuccess } =
    useSuratPenugasanData({
      select: (response) => {
        const formatSuratPenugasanData = response.data.map(({ id, judul }) => {
          return { value: id, label: judul };
        });

        return formatSuratPenugasanData;
      },
    });
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
        const formatMataKuliahData = response.data.map(({ id, name }) => {
          return { value: id, label: name };
        });

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

    if (id) {
      patchPenugasanPengajaran(
        { data: penugasanPengajaranFormData, id: id },
        {
          onSuccess: () => {
            navigate('/penugasan-pengajaran');
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
          navigate('/penugasan-pengajaran');
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
    <section id="penugasan-pengajaran-form" className="section-container">
      <p className="text-lg font-semibold">
        {id ? 'Edit' : 'Buat'} Penugasan Pengajaran
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="sks realisasi"
          registeredName="sks_realisasi"
          type="number"
          required
          errors={errors}
        />
        <CRUInput
          register={register}
          name="tahun"
          registeredName="tahun"
          type="number"
          required
          errors={errors}
        />
        <CRUDropdownInput
          control={control}
          name="Periode"
          registeredName="periode"
          defaultValue={
            state ? { value: state.periode, label: state.periode } : null
          }
          options={[
            { value: 'ganjil', label: 'ganjil' },
            { value: 'genap', label: 'genap' },
          ]}
        />
        <CRUDropdownInput
          control={control}
          name="Surat Penugasan"
          registeredName="surat_penugasan"
          defaultValue={
            state?.surat_penugasan_detail
              ? {
                  value: state.surat_penugasan_detail.id,
                  label: state.surat_penugasan_detail.judul,
                }
              : null
          }
          options={suratPenugasanDataSuccess ? dataSuratPenugasan : []}
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
        />
        {errorMessage ? (
          <AlertError className="inline-block">{errorMessage}</AlertError>
        ) : null}
        {id ? (
          <EditButton
            className={`!mt-8 !text-base`}
            type="submit"
            isLoading={patchPenugasanPengajaranLoading}
          />
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
  );
};

export default PenugasanPengajaranForm;
