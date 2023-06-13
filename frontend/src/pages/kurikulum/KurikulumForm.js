/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import PrimaryButton from '../../components/PrimaryButton';
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
      kode: null,
      sks_total: null,
      sks_praktikum: null,
      is_elective: null,
      semester: null,
    },
  });

  const { data: updatedKurikulumData } = useKurikulumById(id, {
    enabled: !!id && !kurikulumData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset({ ...state, semester: parseInt(state.semester) });
      } else if (updatedKurikulumData) {
        setKurikulumData(updatedKurikulumData.data);
        reset({
          ...updatedKurikulumData.data,
          semester: parseInt(updatedKurikulumData.data.semester),
        });
      }
      setEditable(false);
    }
  }, [updatedKurikulumData, state, reset, id]);

  const { mutate: postKurikulum, isLoading: postKurikulumLoading } =
    usePostKurikulum();
  const { mutate: patchKurikulum, isLoading: patchKurikulumLoading } =
    usePatchKurikulum();

  const navigate = useNavigate();

  const onSubmit = (data) => {
    const kurikulumFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        kurikulumFormData.append(key, data[key]);
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
