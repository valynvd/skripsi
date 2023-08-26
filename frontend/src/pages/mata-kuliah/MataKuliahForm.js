/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { useKurikulumData } from '../../hooks/useKurikulum';
import {
  useMataKuliahById,
  usePatchMataKuliah,
  usePostMataKuliah,
} from '../../hooks/useMataKuliah';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { primary400 } from '../../utils/colors';

const MataKuliahForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [mataKuliahData, setMataKuliahData] = useState(state);
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
      kurikulum: null,
      name: null,
      kode: null,
      sks_total: null,
      sks_praktikum: null,
      is_elective: null,
      semester: null,
    },
  });

  const { data: updatedMataKuliahData } = useMataKuliahById(id, {
    enabled: !!id && !mataKuliahData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset({
          ...state,
          kurikulum: state.kurikulum_detail.map((item) => {
            return { value: item.id, label: item.name };
          }),
        });
      } else if (updatedMataKuliahData) {
        setMataKuliahData(updatedMataKuliahData.data);
        reset({
          ...updatedMataKuliahData.data,
          kurikulum: updatedMataKuliahData.data.kurikulum_detail.map((item) => {
            return { value: item.id, label: item.name };
          }),
        });
      }
      setEditable(false);
    }
  }, [updatedMataKuliahData, state, reset, id]);

  const { mutate: postMataKuliah, isLoading: postMataKuliahLoading } =
    usePostMataKuliah();
  const { mutate: patchMataKuliah, isLoading: patchMataKuliahLoading } =
    usePatchMataKuliah();

  const { data: kurikulumData, isSuccess: kurikulumDataSuccess } =
    useKurikulumData({
      select: (response) => {
        const formatKurikulum = response.data.map(({ id, name }) => {
          return { value: id, label: name };
        });
        return formatKurikulum;
      },
    });

  const onSubmit = (data) => {
    const mataKuliahFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (key === 'kurikulum') {
        data[key].forEach((item) => {
          mataKuliahFormData.append(key, item.value);
        });
      } else {
        if (dirtyFields[key]) {
          mataKuliahFormData.append(key, data[key]);
        }
      }
    });

    if (id) {
      patchMataKuliah(
        { data: mataKuliahFormData, id: id },
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
      postMataKuliah(mataKuliahFormData, {
        onSuccess: () => {
          navigate('/data-master/mata-kuliah');
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
    <section id="dosen-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Daftar Mata Kuliah', link: '/data-master/mata-kuliah' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Mata Kuliah
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <Controller
          // rules={{ required: required ? `${name} harus diisi` : false }}
          control={control}
          name="kurikulum"
          render={({ field, fieldState: { error } }) => (
            <>
              <div>
                <p className="mb-1">Kurikulum</p>
                <Select
                  // isClearable={isClearable}
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
                  isMulti
                  options={kurikulumDataSuccess ? kurikulumData : []}
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
        {/* <CRUDropdownInput
          control={control}
          name="Kurikulum"
          registeredName="kurikulum"
          required
          isDisabled={!editable}
          options={kurikulumDataSuccess ? kurikulumData : []}
        /> */}
        <CRUInput
          register={register}
          name="Nama"
          required
          errors={errors}
          registeredName="name"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Kode"
          required
          errors={errors}
          registeredName="kode"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="SKS Total"
          required
          type="number"
          errors={errors}
          registeredName="sks_total"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="SKS Praktikum"
          required
          type="number"
          errors={errors}
          registeredName="sks_praktikum"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Elektif"
          type="checkbox"
          errors={errors}
          registeredName="is_elective"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Semester"
          registeredName="semester"
          required
          options={[
            { value: '1', label: '1 (Semester Reguler)' },
            { value: 'SP1', label: 'SP1 (Semester Pendek Tingkat 1)' },
            { value: '2', label: '2 (Semester Reguler)' },
            { value: 'SP2', label: 'SP2 (Semester Pendek Tingkat 2)' },
            { value: '3', label: '3 (Semester Reguler)' },
            { value: 'SP3', label: 'SP3 (Semester Pendek Tingkat 3)' },
            { value: '4', label: '4 (Semester Reguler)' },
            { value: 'SP4', label: 'SP4 (Semester Pendek Tingkat 4)' },
            { value: '5', label: '5 (Semester Reguler)' },
            { value: 'SP5', label: 'SP5 (Semester Pendek Tingkat 5)' },
            { value: '6', label: '6 (Semester Reguler)' },
            { value: 'SP6', label: 'SP6 (Semester Pendek Tingkat 6)' },
            { value: '7', label: '7 (Semester Reguler)' },
            { value: 'SP7', label: 'SP7 (Semester Pendek Tingkat 7)' },
            { value: '8', label: '8 (Semester Reguler)' },
            { value: 'SP8', label: 'SP8 (Semester Pendek Tingkat 8)' },
          ]}
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
                isLoading={patchMataKuliahLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postMataKuliahLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default MataKuliahForm;
