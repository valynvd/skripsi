import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  useKriteriaById,
  usePatchKriteria,
  usePostKriteria,
} from '../../hooks/useKriteria';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const KriteriaForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [kriteriaData, setKriteriaData] = useState(state);
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

  const { data: updatedKriteriaData } = useKriteriaById(id, {
    enabled: !!id && !kriteriaData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedKriteriaData) {
        setKriteriaData(updatedKriteriaData.data);
        reset(updatedKriteriaData.data);
      }
      setEditable(false);
    }
  }, [updatedKriteriaData, state, reset, id]);

  const { mutate: postKriteria, isLoading: postKriteriaLoading } =
    usePostKriteria();
  const { mutate: patchKriteria, isLoading: patchKriteriaLoading } =
    usePatchKriteria();

  const onSubmit = (data) => {
    const kriteriaFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        kriteriaFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchKriteria(
        { data: kriteriaFormData, id: id },
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
      postKriteria(kriteriaFormData, {
        onSuccess: () => {
          navigate('/data-master/kriteria');
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
            { name: 'Daftar Kriteria', link: '/data-master/kriteria' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Kriteria
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="nama"
          required
          errors={errors}
          registeredName="nama"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="deskripsi"
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
                isLoading={patchKriteriaLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postKriteriaLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default KriteriaForm;
