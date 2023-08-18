/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostSuratPenugasan,
  usePatchSuratPenugasan,
} from '../../hooks/useSuratPenugasan';
import { AlertError } from '../../components/Alert';
import CRUFileInput from '../../components/CRUFileInput';
import EditButton from '../../components/EditButton';
import { usePenugasanPengajaranBySuratPenugasan } from '../../hooks/usePenugasanPengajaran';

const SuratPenugasanForm = () => {
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
      judul: null,
      files: null,
    },
  });

  useEffect(() => {
    if (id) {
      reset(state);
    }
  }, [state, id, reset]);

  const { mutate: postSuratPenugasan, isLoading: postSuratPenugasanLoading } =
    usePostSuratPenugasan();
  const { mutate: patchSuratPenugasan, isLoading: patchSuratPenugasanLoading } =
    usePatchSuratPenugasan();
  const { data: dataPenugasanPengajaran } =
    usePenugasanPengajaranBySuratPenugasan(id, { enabled: !!id });
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const suratPenugasanFormData = new FormData();

    if (dirtyFields.judul) {
      suratPenugasanFormData.append('judul', data.judul);
    }
    if (dirtyFields.files) {
      suratPenugasanFormData.append('files', data.files[0]);
    }

    if (id) {
      patchSuratPenugasan(
        { data: suratPenugasanFormData, id: id },
        {
          onSuccess: () => {
            navigate('/pelaksanaan-pendidikan/surat-penugasan');
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
      postSuratPenugasan(suratPenugasanFormData, {
        onSuccess: () => {
          navigate('/pelaksanaan-pendidikan/surat-penugasan');
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

  const TableTh = ({ children }) => {
    return (
      <th className="border border-black p-3 font-semibold">{children}</th>
    );
  };

  const TableTd = ({ children }) => {
    return <td className="border border-black p-3">{children}</td>;
  };

  console.log(dataPenugasanPengajaran);

  return (
    <>
      <section id="surat-penugasan-form" className="section-container">
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Surat Penugasan
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUInput
            register={register}
            name="judul"
            required
            errors={errors}
            registeredName="judul"
          />
          <CRUFileInput
            control={control}
            fileLink={state?.files}
            register={register}
            registeredName="files"
            name="File"
            type="file"
          />
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {id ? (
            <EditButton
              className={`!mt-8 !text-base`}
              isLoading={patchSuratPenugasanLoading}
              type="submit"
            />
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postSuratPenugasanLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
      {id ? (
        <section
          id="penugasan-pengajaran-table"
          className="section-container mt-4"
        >
          <p className="text-lg font-semibold">Tabel Penugasan Pengajaran</p>
          <table
            id="customers"
            className="border-solid border-black border-collapse w-full mt-4"
          >
            <thead>
              <tr>
                <TableTh>Nama Faculty Member</TableTh>
                <TableTh>Mata Kuliah</TableTh>
                <TableTh>Kode Mata Kuliah</TableTh>
                <TableTh>Program Studi</TableTh>
                <TableTh>Kode Kelas</TableTh>
                <TableTh>SKS Mata Kuliah</TableTh>
                <TableTh>SKS Realisasi</TableTh>
                <TableTh>Jumlah Mahasiswa</TableTh>
              </tr>
            </thead>
            <tbody>
              {dataPenugasanPengajaran
                ? dataPenugasanPengajaran.data.map((item) => (
                    <tr key={item.id}>
                      <TableTd>{item.dosen_pengampu_detail?.name}</TableTd>
                      <TableTd>{item.mata_kuliah_detail?.name}</TableTd>
                      <TableTd>{item.mata_kuliah_detail?.kode}</TableTd>
                      <TableTd></TableTd>
                      <TableTd></TableTd>
                      <TableTd>{item.mata_kuliah_detail?.sks_total}</TableTd>
                      <TableTd>{item.sks_realisasi}</TableTd>
                      <TableTd></TableTd>
                    </tr>
                  ))
                : null}
            </tbody>
          </table>
        </section>
      ) : null}
    </>
  );
};

export default SuratPenugasanForm;
