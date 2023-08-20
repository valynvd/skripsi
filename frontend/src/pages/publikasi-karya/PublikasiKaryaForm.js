/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostPublikasiKarya,
  usePatchPublikasiKarya,
  usePublikasiKaryaById,
} from '../../hooks/usePublikasiKarya';
import { AlertError } from '../../components/Alert';
import CRUFileInput from '../../components/CRUFileInput';
import EditButton from '../../components/EditButton';
import { usePenugasanPengajaranByPublikasiKarya } from '../../hooks/usePenugasanPengajaran';
import useAuth from '../../hooks/useAuth';
import CancelButton from '../../components/CancelButton';
import { useCheckRole } from '../../hooks/useCheckRole';
import { useSuratPenugasanData } from '../../hooks/useSuratPenugasan';
import { useDosenData } from '../../hooks/useDosen';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import BreadCrumbs from '../../components/BreadCrumbs';

const PublikasiKaryaForm = () => {
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
    defaultValues: {},
  });
  const [editable, setEditable] = useState(true);
  const [publikasiKaryaData, setPublikasiKaryaData] = useState(state);
  const userRole = useCheckRole();

  const { data: updatedPublikasiKaryaData } = usePublikasiKaryaById(id, {
    enabled: !!id && !publikasiKaryaData,
  });
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

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedPublikasiKaryaData) {
        setPublikasiKaryaData(updatedPublikasiKaryaData?.data);
        reset(updatedPublikasiKaryaData?.data);
      }
      setEditable(false);
    }
  }, [state, id, reset, updatedPublikasiKaryaData]);

  const { mutate: postPublikasiKarya, isLoading: postPublikasiKaryaLoading } =
    usePostPublikasiKarya();
  const { mutate: patchPublikasiKarya, isLoading: patchPublikasiKaryaLoading } =
    usePatchPublikasiKarya();
  const navigate = useNavigate();
  const {
    auth: { userData },
  } = useAuth();

  const onSubmit = (data) => {
    const publikasiKaryaFormData = new FormData();

    if (userRole.admin || userRole.kaprodi) {
      if (dirtyFields.dosen_pengampu) {
        publikasiKaryaFormData.append('dosen_pengampu', data.dosen_pengampu);
      }
    } else if (userRole.dosen) {
      publikasiKaryaFormData.append('dosen_pengampu', userData.dosen_detail.id);
    }

    if (dirtyFields.title) {
      publikasiKaryaFormData.append('title', data.title);
    }
    if (dirtyFields.description) {
      publikasiKaryaFormData.append('description', data.description);
    }
    if (dirtyFields.file) {
      publikasiKaryaFormData.append('file', data.file);
    }

    if (id) {
      patchPublikasiKarya(
        { data: publikasiKaryaFormData, id: id },
        {
          onSuccess: () => {
            navigate('/pelaksanaan-penelitian/publikasi-karya');
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
      postPublikasiKarya(publikasiKaryaFormData, {
        onSuccess: () => {
          navigate('/pelaksanaan-penelitian/publikasi-karya');
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
    <>
      <section id="surat-penugasan-form" className="section-container">
        <BreadCrumbs
          links={[
            {
              name: 'Daftar Publikasi Karya',
              link: '/pelaksanaan-penelitian/publikasi-karya',
            },
            {
              name: `${id ? 'Detail' : 'Buat'}`,
            },
          ]}
        />
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Publikasi Karya
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          {(userRole.admin || userRole.kaprodi) && (
            <>
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
            </>
          )}
          <CRUInput
            register={register}
            name="judul"
            errors={errors}
            registeredName="title"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="deskripsi"
            errors={errors}
            registeredName="description"
            isDisabled={!editable}
          />
          <CRUFileInput
            control={control}
            fileLink={state?.files}
            register={register}
            registeredName="file"
            name="File"
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
                  isLoading={patchPublikasiKaryaLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={
                patchPublikasiKaryaLoading || postPublikasiKaryaLoading
              }
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </>
  );
};

export default PublikasiKaryaForm;
