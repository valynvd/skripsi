import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  useProgramStudiById,
  usePatchProgramStudi,
  usePostProgramStudi,
} from '../../hooks/useProgramStudi';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const ProgramStudiForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [programstudiData, setProgramStudiData] = useState(state);
  const [editable, setEditable] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      start_year: null,
      end_year: null,
      semester: null,
    },
  });

  const { data: updatedProgramStudiData } = useProgramStudiById(id, {
    enabled: !!id && !programstudiData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedProgramStudiData) {
        setProgramStudiData(updatedProgramStudiData.data);
        reset(updatedProgramStudiData.data);
      }
      setEditable(false);
    }
  }, [updatedProgramStudiData, state, reset, id]);

  const { mutate: postProgramStudi, isLoading: postProgramStudiLoading } =
    usePostProgramStudi();
  const { mutate: patchProgramStudi, isLoading: patchProgramStudiLoading } =
    usePatchProgramStudi();

  const onSubmit = (data) => {
    const programstudiFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        programstudiFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchProgramStudi(
        { data: programstudiFormData, id: id },
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
      postProgramStudi(programstudiFormData, {
        onSuccess: () => {
          navigate('/data-master/program-studi');
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
    <section id="program-studi-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            {
              name: 'Daftar Program Studi',
              link: '/data-master/program-studi',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Program Studi
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="nama"
          required
          errors={errors}
          registeredName="name"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="kode"
          errors={errors}
          registeredName="kode"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="kode SAP"
          errors={errors}
          registeredName="kode_sap"
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
                isLoading={patchProgramStudiLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton
            className={`!mt-8`}
            isLoading={postProgramStudiLoading}
          >
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default ProgramStudiForm;
