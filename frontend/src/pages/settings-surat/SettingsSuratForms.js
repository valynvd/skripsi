/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import Select from 'react-select';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useProgramStudiData } from '../../hooks/useProdi';
import {
  usePatchSuratSettings,
  usePostSuratSettings,
  useSuratSettingsById,
} from '../../hooks/useSuratSettings';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { primary400 } from '../../utils/colors';

const SettingsSuratForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [settingsSuratData, setSettingsSuratData] = useState(state);
  const [editable, setEditable] = useState(true);
  const [selectedParameter, setSelectedParameter] = useState('');
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
    watch,
  } = useForm({
    defaultValues: {
      prodi: null,
      no_surat_keputusan: null,
      no_surat_pendirian: null,
      no_surat_akreditasi_perguruan_tinggi: null,
    },
  });

  const watchedParameter = watch('parameter'); // Memperhatikan parameter untuk perubahan

  useEffect(() => {
    setSelectedParameter(watchedParameter);
  }, [watchedParameter]);

  const { data: updatedSettingsSuratData } = useSuratSettingsById(id, {
    enabled: !!id,
    // enabled: !!id && !settingsSuratData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedSettingsSuratData) {
        setSettingsSuratData(updatedSettingsSuratData.data);
        reset(updatedSettingsSuratData.data);
      }
      setEditable(false);
    }
  }, [updatedSettingsSuratData, state, reset, id]);

  const { mutate: postSettingsSurat, isLoading: postSettingsSuratLoading } =
    usePostSuratSettings();
  const { mutate: patchSettingsSurat, isLoading: patchSettingsSuratLoading } =
    usePatchSuratSettings();

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

  useEffect(() => {
    if (updatedSettingsSuratData) {
      console.log(
        'Fetched Mata Settings Surat Data:',
        updatedSettingsSuratData
      );

      const prodi = updatedSettingsSuratData.data.prodi_detail || {};
      const settingsData = updatedSettingsSuratData.data || {};

      console.log('Prodi:', prodi);

      reset({
        prodi: prodi.map((p) => ({
          value: p.id,
          label: p.name,
        })),
        parameter: settingsData.parameter,
        nilai_parameter_char: settingsData.nilai_parameter_char,
        nilai_parameter_date: settingsData.nilai_parameter_date,
      });
      setEditable(false);
    }
  }, [updatedSettingsSuratData, reset]);

  const onSubmit = (data) => {
    const formattedData = {
      parameter: data.parameter,
      nilai_parameter_char: data.nilai_parameter_char,
      nilai_parameter_date: data.nilai_parameter_date,
      prodi: data.prodi ? data.prodi.map((p) => p.value) : [],
    };

    console.log('Formatted Data:', JSON.stringify(formattedData, null, 2)); // Debugging

    if (id) {
      patchSettingsSurat(
        { id, data: formattedData },
        {
          onSuccess: () => {
            navigate('/data-master/settings-surat');
          },
          onError: (error) => {
            setErrorMessage(error.response.data.detail);
          },
        }
      );
    } else {
      postSettingsSurat(formattedData, {
        onSuccess: (response) => {
          console.log('Create Success:', response);
          navigate('/data-master/settings-surat');
        },
        onError: (error) => {
          setErrorMessage(error.response.data.detail);
        },
      });
    }
  };

  return (
    <section id="settings-surat-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            {
              name: 'Buat Settings Surat',
              link: '/data-master/settings-surat',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input Settings Surat
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUDropdownInput
          control={control}
          name="Parameter"
          registeredName="parameter"
          defaultValue={settingsSuratData?.parameter || ''}
          options={[
            {
              value: 'No. Surat Keputusan Pendirian Perguruan Tinggi',
              label: 'No. Surat Keputusan Pendirian Perguruan Tinggi',
            },
            {
              value: 'No. Surat Keputusan Akreditasi Perguruan Tinggi',
              label: 'No. Surat Keputusan Akreditasi Perguruan Tinggi',
            },
            {
              value: 'No. Surat Keputusan Akreditasi Program Studi',
              label: 'No. Surat Keputusan Akreditasi Program Studi',
            },
            {
              value: 'Tanggal Pengesahan Kelulusan',
              label: 'Tanggal Pengesahan Kelulusan',
            },
          ]}
          required
          isDisabled={!editable}
        />

        {selectedParameter === 'Tanggal Pengesahan Kelulusan' ? (
          <CRUInput
            register={register}
            name="Nilai Parameter (Date)"
            type="date"
            required
            errors={errors}
            registeredName="nilai_parameter_date"
            isDisabled={!editable}
          />
        ) : (
          <CRUInput
            register={register}
            name="Nilai Parameter (Char)"
            required
            errors={errors}
            registeredName="nilai_parameter_char"
            isDisabled={!editable}
          />
        )}

        <Controller
          control={control}
          name="prodi"
          render={({ field, fieldState: { error } }) => (
            <>
              <div>
                <p className="mb-1">Prodi</p>
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
                  isMulti={
                    selectedParameter !==
                    'No. Surat Keputusan Akreditasi Program Studi'
                  }
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
                isLoading={patchSettingsSuratLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postSettingsSuratLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default SettingsSuratForm;
