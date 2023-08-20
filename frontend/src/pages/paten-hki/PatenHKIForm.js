/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostPatenHKI,
  usePatchPatenHKI,
  usePatenHKIById,
} from '../../hooks/usePatenHKI';
import { AlertError } from '../../components/Alert';
import CRUFileInput from '../../components/CRUFileInput';
import EditButton from '../../components/EditButton';
import { usePenugasanPengajaranByPatenHKI } from '../../hooks/usePenugasanPengajaran';
import useAuth from '../../hooks/useAuth';
import CancelButton from '../../components/CancelButton';
import { useCheckRole } from '../../hooks/useCheckRole';
import { useSuratPenugasanData } from '../../hooks/useSuratPenugasan';
import { useDosenData } from '../../hooks/useDosen';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import BreadCrumbs from '../../components/BreadCrumbs';

const PatenHKIForm = () => {
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
  const [patenHKIData, setPatenHKIData] = useState(state);
  const userRole = useCheckRole();

  const { data: updatedPatenHKIData } = usePatenHKIById(id, {
    enabled: !!id && !patenHKIData,
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
      } else if (updatedPatenHKIData) {
        setPatenHKIData(updatedPatenHKIData?.data);
        reset(updatedPatenHKIData?.data);
      }
      setEditable(false);
    }
  }, [state, id, reset, updatedPatenHKIData]);

  const { mutate: postPatenHKI, isLoading: postPatenHKILoading } =
    usePostPatenHKI();
  const { mutate: patchPatenHKI, isLoading: patchPatenHKILoading } =
    usePatchPatenHKI();
  const navigate = useNavigate();
  const {
    auth: { userData },
  } = useAuth();

  const onSubmit = (data) => {
    const patenHKIFormData = new FormData();

    if (userRole.admin || userRole.kaprodi) {
      if (dirtyFields.dosen_pengampu) {
        patenHKIFormData.append('dosen_pengampu', data.dosen_pengampu);
      }
    } else if (userRole.dosen) {
      patenHKIFormData.append('dosen_pengampu', userData.dosen_detail.id);
    }

    if (dirtyFields.title) {
      patenHKIFormData.append('title', data.title);
    }
    if (dirtyFields.description) {
      patenHKIFormData.append('description', data.description);
    }
    if (dirtyFields.file) {
      patenHKIFormData.append('file', data.file);
    }

    if (id) {
      patchPatenHKI(
        { data: patenHKIFormData, id: id },
        {
          onSuccess: () => {
            navigate('/pelaksanaan-penelitian/paten-hki');
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
      postPatenHKI(patenHKIFormData, {
        onSuccess: () => {
          navigate('/pelaksanaan-penelitian/paten-hki');
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
              name: 'Daftar Paten/HKI',
              link: '/pelaksanaan-penelitian/paten-hki',
            },
            {
              name: `${id ? 'Detail' : 'Buat'}`,
            },
          ]}
        />
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Paten/HKI
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
                  isLoading={patchPatenHKILoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={patchPatenHKILoading || postPatenHKILoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </>
  );
};

export default PatenHKIForm;
