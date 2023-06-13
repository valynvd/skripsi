/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../../../components/PrimaryButton';
import { AlertError } from '../../../components/Alert';
import ModalCreateForm from '../../../components/ModalCreateForm';
import { useEffect } from 'react';
import EditButton from '../../../components/EditButton';
import {
  usePatchPortofolioPerkuliahan,
  usePostPortofolioPerkuliahan,
} from '../../../hooks/usePortofolioPerkuliahan';
import {
  EditorState,
  ContentState,
  convertFromHTML,
  convertToRaw,
} from 'draft-js';
import draftToHtml from 'draftjs-to-html';
import CancelButton from '../../../components/CancelButton';
import CRUDropdownInput from '../../../components/CRUDropdownInput';
import { useLocation } from 'react-router-dom';
import CRUTextEditor from '../../../components/CRUTextEditor';
import { useRef } from 'react';
import { useLayoutEffect } from 'react';

const PortofolioPerkuliahanModalForm = ({
  portofolioPerkuliahanRefetch,
  openModalPortofolio,
  setOpenModalPortofolio,
  portofolioPerkuliahanData,
  dokumenPembelajaranData,
}) => {
  const [errorMessage, setErrorMessage] = useState();
  const [editable, setEditable] = useState(!portofolioPerkuliahanData);
  const { state } = useLocation();
  const {
    register,
    handleSubmit,
    control,
    formState: { dirtyFields },
    reset,
  } = useForm({
    defaultValues: {
      initial_document: null,
    },
  });

  useEffect(() => {
    if (portofolioPerkuliahanData) {
      setEditable(false);
    } else {
      setEditable(true);
      reset({});
    }
  }, [portofolioPerkuliahanData, reset]);

  const {
    mutate: postPortofolioPerkuliahan,
    isLoading: postPortofolioPerkuliahanLoading,
  } = usePostPortofolioPerkuliahan();
  const {
    mutate: patchPortofolioPerkuliahan,
    isLoading: patchPortofolioPerkuliahanLoading,
  } = usePatchPortofolioPerkuliahan();

  useEffect(() => {
    const convertFromHTMLToEditor = (html) => {
      return EditorState.createWithContent(
        ContentState.createFromBlockArray(convertFromHTML(html))
      );
    };

    if (portofolioPerkuliahanData) {
      reset({
        ...portofolioPerkuliahanData,
        outcomes_mata_kuliah: convertFromHTMLToEditor(
          portofolioPerkuliahanData.outcomes_mata_kuliah
        ),
        metode_mata_kuliah: convertFromHTMLToEditor(
          portofolioPerkuliahanData.metode_mata_kuliah
        ),
        sistem_penilaian: convertFromHTMLToEditor(
          portofolioPerkuliahanData.sistem_penilaian
        ),
        statistik_kelas: convertFromHTMLToEditor(
          portofolioPerkuliahanData.statistik_kelas
        ),
        analisis_statistik_ketercapaian: convertFromHTMLToEditor(
          portofolioPerkuliahanData.analisis_statistik_ketercapaian
        ),
        komentar_questioner: convertFromHTMLToEditor(
          portofolioPerkuliahanData.komentar_questioner
        ),
        refleksi_pelaksanaan: convertFromHTMLToEditor(
          portofolioPerkuliahanData.refleksi_pelaksanaan
        ),
        rekomendasi_perbaikan_dosen: convertFromHTMLToEditor(
          portofolioPerkuliahanData.rekomendasi_perbaikan_dosen
        ),
        rekomendasi_perbaikan_univ: convertFromHTMLToEditor(
          portofolioPerkuliahanData.rekomendasi_perbaikan_univ
        ),
      });
    }
  }, [portofolioPerkuliahanData, reset]);

  const onSubmit = (data) => {
    const portofolioPerkuliahanFormData = new FormData();

    if (dirtyFields.type) {
      portofolioPerkuliahanFormData.append('type', data.type);
    }
    if (dirtyFields.outcomes_mata_kuliah) {
      portofolioPerkuliahanFormData.append(
        'outcomes_mata_kuliah',
        draftToHtml(convertToRaw(data.outcomes_mata_kuliah.getCurrentContent()))
      );
    }
    if (dirtyFields.metode_mata_kuliah) {
      portofolioPerkuliahanFormData.append(
        'metode_mata_kuliah',
        draftToHtml(convertToRaw(data.metode_mata_kuliah.getCurrentContent()))
      );
    }
    if (dirtyFields.sistem_penilaian) {
      portofolioPerkuliahanFormData.append(
        'sistem_penilaian',
        draftToHtml(convertToRaw(data.sistem_penilaian.getCurrentContent()))
      );
    }
    if (dirtyFields.statistik_kelas) {
      portofolioPerkuliahanFormData.append(
        'statistik_kelas',
        draftToHtml(convertToRaw(data.statistik_kelas.getCurrentContent()))
      );
    }
    if (dirtyFields.analisis_statistik_ketercapaian) {
      portofolioPerkuliahanFormData.append(
        'analisis_statistik_ketercapaian',
        draftToHtml(
          convertToRaw(data.analisis_statistik_ketercapaian.getCurrentContent())
        )
      );
    }
    if (dirtyFields.komentar_questioner) {
      portofolioPerkuliahanFormData.append(
        'komentar_questioner',
        draftToHtml(convertToRaw(data.komentar_questioner.getCurrentContent()))
      );
    }
    if (dirtyFields.refleksi_pelaksanaan) {
      portofolioPerkuliahanFormData.append(
        'refleksi_pelaksanaan',
        draftToHtml(convertToRaw(data.refleksi_pelaksanaan.getCurrentContent()))
      );
    }
    if (dirtyFields.rekomendasi_perbaikan_dosen) {
      portofolioPerkuliahanFormData.append(
        'rekomendasi_perbaikan_dosen',
        draftToHtml(
          convertToRaw(data.rekomendasi_perbaikan_dosen.getCurrentContent())
        )
      );
    }
    if (dirtyFields.rekomendasi_perbaikan_univ) {
      portofolioPerkuliahanFormData.append(
        'rekomendasi_perbaikan_univ',
        draftToHtml(
          convertToRaw(data.rekomendasi_perbaikan_univ.getCurrentContent())
        )
      );
    }

    if (portofolioPerkuliahanData) {
      patchPortofolioPerkuliahan(
        {
          data: portofolioPerkuliahanFormData,
          id: portofolioPerkuliahanData.id,
        },
        {
          onSuccess: () => {
            portofolioPerkuliahanRefetch();
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
      portofolioPerkuliahanFormData.append(
        'penugasan',
        dokumenPembelajaranData.penugasanPengajaranId
      );

      postPortofolioPerkuliahan(portofolioPerkuliahanFormData, {
        onSuccess: () => {
          portofolioPerkuliahanRefetch();
          setOpenModalPortofolio(false);
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
    <ModalCreateForm
      isOpen={!!openModalPortofolio}
      setIsOpen={setOpenModalPortofolio}
      link="/login"
    >
      <section
        id="penugasan-pengajaran-form"
        className="section-container h-full max-w-2xl relative"
      >
        <input type="text" className="overflow-hidden h-0 absolute top-0" />
        <p className="text-lg font-semibold">
          {portofolioPerkuliahanData ? 'Detail' : 'Upload'}
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUDropdownInput
            editable={editable}
            required
            control={control}
            name="Tipe"
            registeredName="type"
            defaultValue={
              state ? { value: state.type, label: state.type } : null
            }
            options={[
              { value: 'UTS', label: 'UTS' },
              { value: 'UAS', label: 'UAS' },
            ]}
          />
          <CRUTextEditor
            control={control}
            name="Outcomes mata kuliah"
            registeredName="outcomes_mata_kuliah"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Metode mata kuliah"
            registeredName="metode_mata_kuliah"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Sistem penilaian"
            registeredName="sistem_penilaian"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Statistik kelas"
            registeredName="statistik_kelas"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Analisis statistik ketercapaian"
            registeredName="analisis_statistik_ketercapaian"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Komentar questioner"
            registeredName="komentar_questioner"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Refleksi pelaksanaan"
            registeredName="refleksi_pelaksanaan"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Rekomendasi perbaikan dosen"
            registeredName="rekomendasi_perbaikan_dosen"
            editable={editable}
            required
          />
          <CRUTextEditor
            control={control}
            name="Rekomendasi perbaikan universitas"
            registeredName="rekomendasi_perbaikan_univ"
            editable={editable}
            required
          />
          {errorMessage ? (
            <AlertError className="inline-block">{errorMessage}</AlertError>
          ) : null}
          {portofolioPerkuliahanData ? (
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
                  name="Update"
                  className={`!text-base`}
                  type="submit"
                  isLoading={patchPortofolioPerkuliahanLoading}
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postPortofolioPerkuliahanLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </ModalCreateForm>
  );
};

export default PortofolioPerkuliahanModalForm;
