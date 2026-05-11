import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import BreadCrumbs from '../../components/BreadCrumbs';
import CancelButton from '../../components/CancelButton';
import CRUInput from '../../components/CRUInput';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { AlertError } from '../../components/Alert';
import { PrimaryButton } from '../../components/PrimaryButton';
import EditButton from '../../components/EditButton';
import {
  usePatchRuangan,
  usePostRuangan,
  useRuanganById,
} from '../../hooks/useRuangan';
import { useProgramStudiData } from '../../hooks/useProgramStudi';

const tipeOptions = [
  { value: 'KELAS', label: 'Kelas' },
  { value: 'LAB', label: 'Laboratorium' },
];

const boardOptions = [
  { value: 'PAPAN_TULIS', label: 'Papan Tulis' },
  { value: 'SMARTBOARD', label: 'Smartboard' },
];

const initialValues = {
  kode: '',
  nama: '',
  tipe: 'KELAS',
  kapasitas: 0,
  board_type: '',
  prodi: '',
  aktif: true,
  catatan: '',
};

const RuanganForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [ruanganData, setRuanganData] = useState(state);
  const [editable, setEditable] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: initialValues,
  });

  const { data: fetchedRuangan } = useRuanganById(id, {
    enabled: !!id && !ruanganData,
  });
  const { data: programStudiOptions } = useProgramStudiData({
    select: (response) => {
      const raw = Array.isArray(response?.data) ? response.data : [];
      return raw.map((item) => ({
        value: item.name,
        label: item.name,
      }));
    },
  });

  const { mutate: postRuangan, isLoading: postRuanganLoading } =
    usePostRuangan();
  const { mutate: patchRuangan, isLoading: patchRuanganLoading } =
    usePatchRuangan();

  useEffect(() => {
    if (!id) {
      reset(initialValues);
      setEditable(true);
      return;
    }

    if (state) {
      reset({
        ...initialValues,
        ...state,
        board_type: state.board_type || '',
      });
      setEditable(false);
      return;
    }

    if (fetchedRuangan?.data?.ruangan) {
      const room = fetchedRuangan.data.ruangan;
      setRuanganData(room);
      reset({
        ...initialValues,
        ...room,
        board_type: room.board_type || '',
      });
      setEditable(false);
    }
  }, [fetchedRuangan, state, reset, id]);

  const selectedTipe = watch('tipe');

  useEffect(() => {
    if (selectedTipe === 'LAB') {
      return;
    }
    setValue('prodi', '');
    setValue('board_type', '');
  }, [selectedTipe, setValue]);

  const onSubmit = (data) => {
    const payload = {
      kode: data.kode?.trim(),
      nama: data.nama?.trim(),
      tipe: data.tipe,
      kapasitas: Number(data.kapasitas || 0),
      board_type: data.board_type || null,
      prodi: data.prodi?.trim() || null,
      aktif: Boolean(data.aktif),
      catatan: data.catatan?.trim() || null,
    };

    if (id) {
      patchRuangan(
        { id, data: payload },
        {
          onSuccess: (response) => {
            reset({
              ...initialValues,
              ...response.data.ruangan,
              board_type: response.data.ruangan.board_type || '',
              prodi: response.data.ruangan.prodi || '',
              catatan: response.data.ruangan.catatan || '',
            });
            setEditable(false);
            navigate('/data-master/ruangan');
          },
          onError: (err) => {
            setErrorMessage(
              err?.response?.data?.detail || err.message || 'Gagal menyimpan ruangan.'
            );
          },
        }
      );
    } else {
      postRuangan(payload, {
        onSuccess: () => {
          navigate('/data-master/ruangan');
        },
        onError: (err) => {
          setErrorMessage(
            err?.response?.data?.detail || err.message || 'Gagal menyimpan ruangan.'
          );
        },
      });
    }
  };

  return (
    <section id="ruangan-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Daftar Ruangan', link: '/data-master/ruangan' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Ruangan
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
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
          name="Nama"
          required
          errors={errors}
          registeredName="nama"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Tipe Ruangan"
          registeredName="tipe"
          required
          options={tipeOptions}
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Kapasitas"
          required
          type="number"
          errors={errors}
          registeredName="kapasitas"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Tipe Board"
          registeredName="board_type"
          options={boardOptions}
          isDisabled={!editable || selectedTipe === 'LAB'}
          isClearable
          clearFunc={() => setValue('board_type', '')}
        />
        <CRUDropdownInput
          control={control}
          name="Program Studi"
          registeredName="prodi"
          options={programStudiOptions || []}
          isDisabled={!editable || selectedTipe !== 'LAB'}
          isClearable
          clearFunc={() => setValue('prodi', '')}
        />
        {selectedTipe !== 'LAB' && (
          <p className="text-sm text-amber-500">
            Program Studi hanya dipakai untuk ruangan tipe lab.
          </p>
        )}
        <CRUInput
          register={register}
          name="Aktif"
          type="checkbox"
          errors={errors}
          registeredName="aktif"
          isDisabled={!editable}
          defaultChecked
        />
        <CRUInput
          register={register}
          name="Catatan"
          type="textarea"
          errors={errors}
          registeredName="catatan"
          isDisabled={!editable}
        />

        {errorMessage ? (
          <AlertError className="inline-block">{errorMessage}</AlertError>
        ) : null}

        {id ? (
          <div className="flex flex-row !mt-8 space-x-3">
            {!editable && (
              <EditButton
                className="!text-base"
                type="button"
                onClick={() => setEditable(true)}
              />
            )}
            {editable && (
              <EditButton
                className="!text-base"
                type="submit"
                isLoading={patchRuanganLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className="!mt-8" isLoading={postRuanganLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default RuanganForm;
