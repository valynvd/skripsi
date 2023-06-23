import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import {
  useCycleById,
  usePatchCycle,
  usePostCycle,
} from '../../hooks/useCycle';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const CycleForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [cycleData, setCycleData] = useState(state);
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
      start_year: null,
      end_year: null,
      semester: null,
    },
  });

  const { data: updatedCycleData } = useCycleById(id, {
    enabled: !!id && !cycleData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedCycleData) {
        setCycleData(updatedCycleData.data);
        reset(updatedCycleData.data);
      }
      setEditable(false);
    }
  }, [updatedCycleData, state, reset, id]);

  const { mutate: postCycle, isLoading: postCycleLoading } = usePostCycle();
  const { mutate: patchCycle, isLoading: patchCycleLoading } = usePatchCycle();

  const onSubmit = (data) => {
    const cycleFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        cycleFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchCycle(
        { data: cycleFormData, id: id },
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
      postCycle(cycleFormData, {
        onSuccess: () => {
          navigate('/data-master/cycle');
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
            { name: 'Daftar Siklus', link: '/data-master/cycle' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Siklus
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Mulai Tahun"
          required
          type="number"
          errors={errors}
          registeredName="start_year"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Akhir Tahun"
          required
          type="number"
          errors={errors}
          registeredName="end_year"
          isDisabled={!editable}
        />
        <CRUDropdownInput
          control={control}
          name="Semester"
          registeredName="semester"
          required
          options={[
            { value: 'Odd', label: 'Ganjil' },
            { value: 'Odd Short', label: 'Pendek Ganjil' },
            { value: 'Even', label: 'Genap' },
            { value: 'Even Short', label: 'Pendek Genap' },
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
                isLoading={patchCycleLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postCycleLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default CycleForm;
