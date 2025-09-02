/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import Select, { components } from 'react-select';
import { Controller, useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostSuratPenugasanSekre,
  usePatchSuratPenugasanSekre,
  useSuratPenugasanSekreById,
} from '../../hooks/useSuratPenugasanSekre';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useDosenData } from '../../hooks/useDosen';
import { primary400 } from '../../utils/colors';

const SingleValue = ({ data, ...props }) => {
  const { inisial } = data;
  return <components.SingleValue {...props}>{inisial}</components.SingleValue>;
};

const MultiValue = ({ data, ...props }) => {
  const { inisial } = data;
  return <components.MultiValue {...props}>{inisial}</components.MultiValue>;
};

const SuratPenugasanSekreForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [suratPenugasanSekreData, setSuratPenugasanSekreData] = useState(state);
  const [editable, setEditable] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      nomor_surat: null,
      pelaksana: null,
      agenda: null,
      tanggal_kegiatan: null,
      waktu_mulai_kegiatan: null,
      waktu_selesai_kegiatan: null,
      tempat_kegiatan: null,
      tanggal_surat: null,
      ditugaskan: null,
    },
  });

  const { data: updatedSuratPenugasanSekreData } = useSuratPenugasanSekreById(
    id,
    {
      enabled: !!id && !suratPenugasanSekreData,
    }
  );

  const { data: dosenData, isSuccess: dosenDataSuccess } = useDosenData({
    select: (response) => {
      const formatDosen = response.data.map(({ id, name, inisial }) => {
        return { value: id, label: name, inisial: inisial };
      });
      return formatDosen;
    },
  });

  const {
    mutate: postSuratPenugasanSekre,
    isLoading: postSuratPenugasanSekreLoading,
  } = usePostSuratPenugasanSekre();
  const {
    mutate: patchSuratPenugasanSekre,
    isLoading: patchSuratPenugasanSekreLoading,
  } = usePatchSuratPenugasanSekre();

  useEffect(() => {
    if (id) {
      if (state) {
        // reset(state);
        reset({
          ...state,
          ditugaskan: state.ditugaskan.map((dosenId) => ({
            value: dosenId,
            label: dosenData.find((d) => d.value === dosenId)?.label,
            inisial: dosenData.find((d) => d.value === dosenId)?.inisial,
          })),
        });
      } else if (updatedSuratPenugasanSekreData) {
        setSuratPenugasanSekreData(updatedSuratPenugasanSekreData.data);
        // reset(updatedSuratPenugasanSekreData.data);
        reset({
          ...updatedSuratPenugasanSekreData.data,
          ditugaskan: updatedSuratPenugasanSekreData.data.ditugaskan.map(
            (dosenId) => ({
              value: dosenId,
              label: dosenData.find((d) => d.value === dosenId)?.label,
              inisial: dosenData.find((d) => d.value === dosenId)?.inisial,
            })
          ),
        });
      }
      setEditable(false);
    }
  }, [updatedSuratPenugasanSekreData, state, reset, id, dosenData]);

  const onSubmit = (data) => {
    const suratPenugasanSekreFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        // suratPenugasanSekreFormData.append(key, data[key]);
        if (key === 'ditugaskan') {
          const selectedIds = data[key].map((dosen) => dosen.value);
          selectedIds.forEach((id) => {
            suratPenugasanSekreFormData.append(key, id);
          });
        } else {
          suratPenugasanSekreFormData.append(key, data[key]);
        }
      }
    });
    if (id) {
      patchSuratPenugasanSekre(
        { data: suratPenugasanSekreFormData, id: id },
        {
          onSuccess: () => {
            setEditable(false);
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
      postSuratPenugasanSekre(suratPenugasanSekreFormData, {
        onSuccess: () => {
          navigate('/data-master/penugasan');
          setEditable(false);
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
    <section id="suratpenugasansekre-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Daftar Penugasan', link: '/data-master/penugasan' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Surat Penugasan
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nomor Surat"
          required
          errors={errors}
          registeredName="nomor_surat"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Pelaksana"
          required
          errors={errors}
          registeredName="pelaksana"
          isDisabled={!editable}
          type="textarea"
        />
        <CRUInput
          register={register}
          name="Agenda"
          required
          errors={errors}
          registeredName="agenda"
          isDisabled={!editable}
          type="textarea"
        />
        <CRUInput
          register={register}
          name="Tanggal Kegiatan"
          required
          errors={errors}
          registeredName="tanggal_kegiatan"
          isDisabled={!editable}
          type="date"
        />
        <div className="flex flex-row gap-4">
          <CRUInput
            register={register}
            name="Waktu Mulai Kegiatan"
            required
            errors={errors}
            registeredName="waktu_mulai_kegiatan"
            isDisabled={!editable}
            type="time"
          />
          <CRUInput
            register={register}
            name="Waktu Selesai Kegiatan"
            required
            errors={errors}
            registeredName="waktu_selesai_kegiatan"
            isDisabled={!editable}
            type="time"
          />
        </div>
        <CRUInput
          register={register}
          name="Tempat Kegiatan"
          required
          errors={errors}
          registeredName="tempat_kegiatan"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Tanggal Surat"
          required
          errors={errors}
          registeredName="tanggal_surat"
          isDisabled={!editable}
          type="date"
        />
        <Controller
          control={control}
          name="ditugaskan"
          render={({ field }) => (
            <div>
              <p className="mb-1">Yang ditugaskan</p>
              <Select
                components={{ SingleValue, MultiValue }}
                isDisabled={!editable}
                isMulti
                placeholder="Pilih yang ditugaskan..."
                theme={(theme) => ({
                  ...theme,
                  colors: {
                    ...theme.colors,
                    primary: primary400,
                    primary25: '#fde3e4',
                    primary50: '#fbd0d2',
                  },
                })}
                classNamePrefix="react-select"
                styles={{
                  control: (base) => ({
                    ...base,
                    boxShadow: 'none',
                    maxHeight: 100,
                    overflowY: 'scroll',
                  }),
                }}
                options={dosenDataSuccess ? dosenData : []}
                value={field.value}
                onChange={field.onChange}
              />
              {errors?.ditugaskan && (
                <p className="mt-1 text-sm text-primary-400">
                  {errors.ditugaskan.message}
                </p>
              )}
            </div>
          )}
        />

        {errorMessage ? (
          <AlertError className="inline-block">{errorMessage}</AlertError>
        ) : null}
        {id ? (
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
                isLoading={patchSuratPenugasanSekreLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postSuratPenugasanSekreLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default SuratPenugasanSekreForm;
