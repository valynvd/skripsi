/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  useKurikulumById,
  usePatchKurikulum,
  usePostKurikulum,
} from '../../hooks/useKurikulum';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import CRUFileInput from '../../components/CRUFileInput';
import { useProgramStudiData } from '../../hooks/useProdi';
import Select, { components } from 'react-select';
import { primary400 } from '../../utils/colors';

const KurikulumForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [kurikulumData, setKurikulumData] = useState(state);
  const [editable, setEditable] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      kurikulum: null,
      name: null,
      prodi: null,
      kode: null,
      sks_total: null,
      sks_praktikum: null,
      is_elective: null,
      semester: null,
    },
  });

  const { data: dataProgramStudi, isSuccess: dataProgramStudiSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatUserData = response.data.map(({ id, name }) => {
          return {
            value: id,
            label: name,
          };
        });

        return formatUserData;
      },
    });

  const { data: updatedKurikulumData } = useKurikulumById(id, {
    enabled: !!id && !kurikulumData,
  });

  useEffect(
    () => {
      if (id) {
        if (state) {
          reset({
            ...state,
            semester: parseInt(state.semester),
            prodi: dataProgramStudiSuccess
              ? dataProgramStudi.find((prodi) => prodi.value === state.prodi)
              : null,
          });
        } else if (updatedKurikulumData) {
          setKurikulumData(updatedKurikulumData.data);
          reset({
            ...updatedKurikulumData.data,
            semester: parseInt(updatedKurikulumData.data.semester),
            prodi: dataProgramStudiSuccess
              ? dataProgramStudi.find(
                  (prodi) => prodi.value === updatedKurikulumData.data.prodi
                )
              : null,
          });
        }
        setEditable(false);
      }
    },
    [updatedKurikulumData, state, reset, id],
    dataProgramStudi
  );

  const { mutate: postKurikulum, isLoading: postKurikulumLoading } =
    usePostKurikulum();
  const { mutate: patchKurikulum, isLoading: patchKurikulumLoading } =
    usePatchKurikulum();

  const navigate = useNavigate();

  const onSubmit = (data) => {
    const kurikulumFormData = new FormData();

    // Object.keys(dirtyFields).forEach((key) => {
    //   if (dirtyFields[key]) {
    //     kurikulumFormData.append(key, data[key]);
    //   }
    // });
    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        if (key === 'prodi' && data[key]) {
          kurikulumFormData.append(key, data[key].value); // send the primary key
        } else {
          kurikulumFormData.append(key, data[key]);
        }
      }
    });

    if (id) {
      patchKurikulum(
        { data: kurikulumFormData, id: id },
        {
          onSuccess: () => {
            navigate('/data-master/kurikulum');
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
      postKurikulum(kurikulumFormData, {
        onSuccess: () => {
          navigate('/data-master/kurikulum');
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
    <section id="dosen-form" className="section-container">
      <BreadCrumbs
        links={[
          { name: 'Daftar Kurikulum', link: '/data-master/kurikulum' },
          { name: id ? 'Detail' : 'Buat' },
        ]}
      />
      <p className="text-lg font-semibold">
        {id ? 'Detail' : 'Buat'} Kurikulum
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Nama"
          required
          errors={errors}
          registeredName="name"
          isDisabled={!editable}
        />
        <Controller
          control={control}
          name="prodi"
          render={({ field, fieldState: { error } }) => (
            <>
              <div>
                <p className="mb-1">Program Studi</p>
                <Select
                  isDisabled={!editable}
                  placeholder="pilih..."
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
                    }),
                  }}
                  classNames={{
                    control: (state) =>
                      `!px-0.5 !text-red-400 !py-0.5 ${
                        error ? '!border-primary-400' : ''
                      } ${
                        state.isFocused
                          ? '!border-primary-400'
                          : '!border-gray-200'
                      } ${!editable && '!bg-grayDisabled-400'}`,
                  }}
                  inputRef={field.ref}
                  options={dataProgramStudiSuccess ? dataProgramStudi : []}
                  value={field.value}
                  onChange={field.onChange}
                />
                {error && (
                  <p className="mt-1 text-sm text-primary-400">
                    {error.message}
                  </p>
                )}
              </div>
            </>
          )}
        />
        <CRUFileInput
          control={control}
          fileLink={kurikulumData?.file_panduan_kurikulum}
          register={register}
          registeredName="file_panduan_kurikulum"
          name="File Panduan Kurikulum"
          type="file"
          isDisabled={!editable}
        />
        <CRUFileInput
          control={control}
          fileLink={kurikulumData?.file_panduan_kurikulum}
          register={register}
          registeredName="file_pendukung"
          name="File Pendukung"
          type="file"
          isDisabled={!editable}
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
                isLoading={patchKurikulumLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postKurikulumLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default KurikulumForm;
