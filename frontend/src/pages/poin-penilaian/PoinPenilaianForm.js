/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostPoinPenilaian,
  usePatchPoinPenilaian,
  usePoinPenilaianById,
} from '../../hooks/usePoinPenilaian';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CancelButton from '../../components/CancelButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useKriteriaData } from '../../hooks/useKriteria';
import { useProgramStudiData } from '../../hooks/useProdi';
import CRUTextAreaInput from '../../components/CRUTextAreaInput';

const PoinPenilaianForm = () => {
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
  const [poinPenilaianData, setPoinPenilaianData] = useState(state);

  const { data: updatedPoinPenilaianData } = usePoinPenilaianById(id, {
    enabled: !!id && !poinPenilaianData,
  });

  const { data: kriteriaData, isSuccess: kriteriaDataSuccess } =
    useKriteriaData({
      select: (response) => {
        const formatKriteriaData = response.data.map(
          ({ id, nama, deskripsi }) => {
            return { value: id, label: nama + ' ' + deskripsi };
          }
        );

        return formatKriteriaData;
      },
    });

  const { data: programStudiData, isSuccess: programStudiDataSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatProgramStudiData = response.data.map(({ id, name }) => {
          return { value: id, label: name };
        });

        return formatProgramStudiData;
      },
    });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedPoinPenilaianData) {
        setPoinPenilaianData(updatedPoinPenilaianData?.data);
        reset(updatedPoinPenilaianData?.data);
      }
      setEditable(false);
    }
  }, [state, id, reset, updatedPoinPenilaianData]);

  const { mutate: postPoinPenilaian, isLoading: postPoinPenilaianLoading } =
    usePostPoinPenilaian();
  const { mutate: patchPoinPenilaian, isLoading: patchPoinPenilaianLoading } =
    usePatchPoinPenilaian();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    const poinPenilaianFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        poinPenilaianFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchPoinPenilaian(
        { data: poinPenilaianFormData, id: id },
        {
          onSuccess: () => {
            navigate('/data-master/poin-penilaian');
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
      postPoinPenilaian(poinPenilaianFormData, {
        onSuccess: () => {
          navigate('/data-master/poin-penilaian');
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
              name: 'Daftar Poin Penilaian',
              link: '/data-master/poin-penilaian',
            },
            {
              name: `${id ? 'Detail' : 'Buat'}`,
            },
          ]}
        />
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Poin Penilaian
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUDropdownInput
            control={control}
            name="Kriteria"
            registeredName="kriteriaId"
            // defaultValue={
            //   state?.dosen_pengampu_detail
            //     ? {
            //         value: state.dosen_pengampu_detail.id,
            //         label: state.dosen_pengampu_detail.name,
            //       }
            //     : null
            // }
            options={kriteriaDataSuccess ? kriteriaData : []}
            isDisabled={!editable}
          />
          <CRUDropdownInput
            control={control}
            name="Program Studi"
            registeredName="prodiId"
            // defaultValue={
            //   state?.dosen_pengampu_detail
            //     ? {
            //         value: state.dosen_pengampu_detail.id,
            //         label: state.dosen_pengampu_detail.name,
            //       }
            //     : null
            // }
            options={programStudiDataSuccess ? programStudiData : []}
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="Dokumen referensi"
            errors={errors}
            registeredName="document_reference"
            isDisabled={!editable}
            note="Contoh: LAMINFOKOM FEBRUARI 2022"
          />
          <CRUInput
            register={register}
            name="jenis"
            errors={errors}
            registeredName="type"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="no. urut"
            type="number"
            errors={errors}
            registeredName="order_number"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="no. butir"
            errors={errors}
            registeredName="item_number"
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="bobot dari 400"
            type="number"
            errors={errors}
            registeredName="max_score"
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Elemen Penilaian LAM"
            registeredName="element"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskriptor"
            registeredName="description"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 1"
            registeredName="description_grade_1"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 2"
            registeredName="description_grade_2"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 3"
            registeredName="description_grade_3"
            errors={errors}
            isDisabled={!editable}
          />
          <CRUTextAreaInput
            register={register}
            name="Deskripsi nilai 4"
            registeredName="description_grade_4"
            errors={errors}
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
                  isLoading={patchPoinPenilaianLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={patchPoinPenilaianLoading || postPoinPenilaianLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
    </>
  );
};

export default PoinPenilaianForm;
