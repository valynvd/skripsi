/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Controller, useForm, useFieldArray } from 'react-hook-form';
import Select, { components } from 'react-select';
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
import { useCpmkData } from '../../hooks/useCpMataKuliah';
import { FaMinus } from 'react-icons/fa';
import { useProgramStudiData } from '../../hooks/useProdi';

const PENILAIAN_CHOICES = [
  { value: 'UAS', label: 'UAS' },
  { value: 'UTS', label: 'UTS' },
  { value: 'Teaching Assessment', label: 'Teaching Assessment' },
  { value: 'Project', label: 'Project' },
  { value: 'Quiz', label: 'Quiz' },
];

const defaultKomponenPenilaian = [
  { nama_komponen: PENILAIAN_CHOICES[0], cpmk: [] },
  { nama_komponen: PENILAIAN_CHOICES[1], cpmk: [] },
  { nama_komponen: PENILAIAN_CHOICES[2], cpmk: [] },
];

const SingleValue = ({ children, ...props }) => {
  const code = props.data.label.split(' - ')[0];
  return <components.SingleValue {...props}>{code}</components.SingleValue>;
};

const MultiValue = ({ children, ...props }) => {
  const code = props.data.label.split(' - ')[0];
  return <components.MultiValue {...props}>{code}</components.MultiValue>;
};

const MataKuliahForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
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
      prodi: null,
      name: null,
      kode: null,
      sks_total: null,
      sks_praktikum: null,
      is_elective: null,
      semester: null,
      komponen_nilai: defaultKomponenPenilaian,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'komponen_nilai',
  });

  const { data: updatedMataKuliahData } = useMataKuliahById(id, {
    enabled: !!id,
  });

  const { data: cpmkData, isSuccess: cpmkDataSuccess } = useCpmkData({
    select: (response) => {
      const formatCpmk = response.data.map(({ id, kode, deskripsi }) => {
        return { value: id, label: `${kode} - ${deskripsi}` };
      });
      return formatCpmk;
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

  const { data: kurikulumData, isSuccess: kurikulumDataSuccess } =
    useKurikulumData({
      select: (response) => {
        console.log('Raw kurikulum API response:', response);

        const raw = Array.isArray(response.data)
          ? response.data
          : response.data.data;

        const formatKurikulum = raw.map(({ id, name }) => ({
          value: id,
          label: name,
        }));
        console.log('Formatted kurikulum:', formatKurikulum);
        return formatKurikulum;
      },
    });

  const { mutate: postMataKuliah, isLoading: postMataKuliahLoading } =
    usePostMataKuliah();

  const { mutate: patchMataKuliah, isLoading: patchMataKuliahLoading } =
    usePatchMataKuliah();

  useEffect(() => {
    if (updatedMataKuliahData) {
      console.log('Fetched Mata Kuliah Data:', updatedMataKuliahData);

      const kurikulum = updatedMataKuliahData.data.kurikulum_detail || [];
      const prodi = updatedMataKuliahData.data.prodi_detail || {};
      const mataKuliah = updatedMataKuliahData.data || {};
      const komponenPenilaian = updatedMataKuliahData.data.penilaian_set || [];
      const cpmkDetails = updatedMataKuliahData.data.cpmk_detail || [];

      console.log('Kurikulum:', kurikulum);
      console.log('Prodi:', prodi);
      console.log('mataKuliah:', mataKuliah);
      console.log('komponenPenilaian:', komponenPenilaian);
      console.log('CPMK Details:', cpmkDetails);

      reset({
        kurikulum: kurikulum.map((k) => ({
          value: k.id,
          label: k.name,
        })),
        prodi: {
          value: prodi.id,
          label: prodi.name,
        },
        name: mataKuliah.name,
        kode: mataKuliah.kode,
        sks_total: mataKuliah.sks_total,
        sks_praktikum: mataKuliah.sks_praktikum,
        is_elective: mataKuliah.is_elective,
        semester: updatedMataKuliahData.data.semester,
        komponen_nilai: komponenPenilaian.map((kn) => ({
          nama_komponen: {
            value: kn.nama_penilaian,
            label: kn.nama_penilaian,
          },
          cpmk: kn.cpmks
            .map((cpmkId) => {
              const cpmk = cpmkDetails.find((c) => c.id === cpmkId);
              return cpmk
                ? {
                    value: cpmk.id,
                    label: `${cpmk.kode} - ${cpmk.deskripsi}`,
                  }
                : null;
            })
            .filter(Boolean),
        })),
      });

      setEditable(false);
    }
  }, [updatedMataKuliahData, reset]);

  const onSubmit = (data) => {
    const formattedData = {
      kurikulum: data.kurikulum ? data.kurikulum.map((k) => k.value) : [],
      prodi: data.prodi ? data.prodi.value : null,
      name: data.name,
      kode: data.kode,
      sks_total: data.sks_total,
      sks_praktikum: data.sks_praktikum,
      is_elective:
        data.is_elective !== undefined ? Boolean(data.is_elective) : false,
      semester: data.semester,
      penilaian_set: data.komponen_nilai
        ? data.komponen_nilai.map((kn) => ({
            nama_penilaian: kn.nama_komponen ? kn.nama_komponen.value : '',
            cpmks: kn.cpmk ? kn.cpmk.map((c) => c.value) : [],
          }))
        : [],
    };

    console.log('Formatted Data JSON:', JSON.stringify(formattedData, null, 2)); // Debugging
    console.log('Formatted Data:', formattedData); // Debugging

    if (id) {
      patchMataKuliah(
        { id, data: formattedData },
        {
          onSuccess: () => {
            navigate('/data-master/mata-kuliah');
          },
          onError: (error) => {
            console.log('Error updating Mata Kuliah:', error.response.data);
            setErrorMessage(error.response.data);
          },
        }
      );
    } else {
      postMataKuliah(formattedData, {
        onSuccess: (response) => {
          console.log('Create Success:', response);
          navigate('/data-master/mata-kuliah');
        },
        onError: (error) => {
          console.log('Error creating Mata Kuliah:', error.response.data);
          setErrorMessage(error.response.data);
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
        <CRUInput
          register={register}
          name="Nama Mata Kuliah"
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
          defaultChecked={false}
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

        <div className="flex items-center justify-between mt-8">
          <h3 className="mt-8 text-lg font-bold">Komponen Penilaian</h3>
          <PrimaryButton
            type="button"
            onClick={() => {
              if (editable) {
                append({ nama_komponen: '', cpmk: [] });
              }
            }}
            className={`mt-4 ${
              editable ? '' : 'bg-gray-400 cursor-not-allowed'
            }`}
            disabled={!editable}
          >
            Tambah Komponen Nilai
          </PrimaryButton>
        </div>
        <table className="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th className="py-2">Nama Komponen</th>
              <th className="py-2">CPMK</th>
              <th className="py-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {fields.length > 0 ? (
              fields.map((field, index) => (
                <tr key={field.id} className="border-b gap-4">
                  <td className="py-2">
                    <Controller
                      control={control}
                      name={`komponen_nilai.${index}.nama_komponen`}
                      render={({ field }) => (
                        <Select
                          {...field}
                          options={PENILAIAN_CHOICES}
                          isDisabled={!editable}
                          defaultValue={field.value}
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
                        />
                      )}
                    />
                  </td>
                  <td className="py-2">
                    <Controller
                      control={control}
                      name={`komponen_nilai[${index}].cpmk`}
                      render={({ field }) => (
                        <div>
                          <Select
                            components={{ SingleValue, MultiValue }}
                            isDisabled={!editable}
                            isMulti
                            placeholder="pilih cpmk..."
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
                            classNames={{
                              control: (state) =>
                                `!px-0.5 !text-red-400 !py-0.5 ${
                                  errors?.komponen_nilai?.[index]?.cpmk
                                    ? '!border-primary-400'
                                    : ''
                                } ${
                                  state.isFocused
                                    ? '!border-primary-400'
                                    : '!border-gray-200'
                                } ${!editable && '!bg-grayDisabled-400'}`,
                            }}
                            inputRef={field.ref}
                            options={cpmkDataSuccess ? cpmkData : []}
                            value={field.value}
                            onChange={field.onChange}
                          />
                          {errors?.komponen_nilai?.[index]?.cpmk && (
                            <p className="mt-1 text-sm text-primary-400">
                              {errors.komponen_nilai[index].cpmk.message}
                            </p>
                          )}
                        </div>
                      )}
                    />
                  </td>

                  <td className="py-2">
                    <PrimaryButton
                      type="button"
                      onClick={() => {
                        if (editable) {
                          remove(index);
                        }
                      }}
                      className={`ml-2`}
                    >
                      <FaMinus />
                    </PrimaryButton>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="text-center py-4">
                  Tidak ada komponen penilaian.
                </td>
              </tr>
            )}
          </tbody>
        </table>

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
                isLoading={postMataKuliahLoading || patchMataKuliahLoading}
                name="Simpan"
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
