/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import {
  useCpmkById,
  useCpmkData,
  usePatchCpmk,
  usePostCpmk,
} from '../../hooks/useCpMataKuliah';
import {
  useCapaianPembelajaranData,
  useCapaianPembelajaranDataViews,
} from '../../hooks/useCapaianPembelajaran';

const CpMataKuliahForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [cpmkData, setCpmkData] = useState(state);
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
      cpl: null,
      kode: null,
      deskripsi: null,
    },
  });

  const { data: updatedCpmkData } = useCpmkById(id, {
    enabled: !!id && !cpmkData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedCpmkData) {
        setCpmkData(updatedCpmkData.data);
        reset(updatedCpmkData.data);
      }
      setEditable(false);
    }
  }, [updatedCpmkData, state, reset, id]);

  const { mutate: postCpmk, isLoading: postCpmkLoading } = usePostCpmk();
  const { mutate: patchCpmk, isLoading: patchCpmkLoading } = usePatchCpmk();

  const {
    data: dataCapaianPembelajar,
    isSuccess: dataCapaianPembelajarSuccess,
  } = useCapaianPembelajaranDataViews();

  const onSubmit = (data) => {
    const dataCpmkFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dataCpmkFormData.append(key, data[key]);
      }
    });
    if (id) {
      patchCpmk(
        { data: dataCpmkFormData, id: id },
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
      postCpmk(dataCpmkFormData, {
        onSuccess: () => {
          navigate('/kurikulum-obe/cpmk');
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
    <section id="cpmk-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            {
              name: 'Buat CPMK',
              link: '/kurikulum-obe/cpmk',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Input CPMK
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUDropdownInput
          control={control}
          name="CPL"
          registeredName="cpl"
          defaultValue={
            cpmkData?.cpl
              ? {
                  value: cpmkData.cpl,
                  label: cpmkData.cpl,
                }
              : null
          }
          options={dataCapaianPembelajarSuccess ? dataCapaianPembelajar : []}
          required
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Kode CPMK"
          required
          errors={errors}
          registeredName="kode"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Deskripsi"
          required
          errors={errors}
          registeredName="deskripsi"
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
                isLoading={patchCpmkLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postCpmkLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default CpMataKuliahForm;
