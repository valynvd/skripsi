import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostKonsolChatbotSeputarSAP,
  usePatchKonsolChatbotSeputarSAP,
  useKonsolChatbotSeputarSAPById
} from '../../hooks/useKonsolChatbotSeputarSAP';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const KonsolChatbotSeputarSAPForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [seputarSAPData, setSeputarSAPData] = useState(state);
  const [editable, setEditable] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      pertanyaan: null,
      jawaban: null,
    },
  });

  const { data: updatedSeputarSAPData } = useKonsolChatbotSeputarSAPById(id, {
    enabled: !!id && !seputarSAPData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedSeputarSAPData) {
        setSeputarSAPData(updatedSeputarSAPData.data);
        reset(updatedSeputarSAPData.data);
      }
      setEditable(false);
    }
  }, [updatedSeputarSAPData, state, reset, id]);

  const { mutate: postSeputarSAP, isLoading: postSeputarSAPLoading } =
    usePostKonsolChatbotSeputarSAP();
  const { mutate: patchSeputarSAP, isLoading: patchSeputarSAPLoading } =
    usePatchKonsolChatbotSeputarSAP();

  const onSubmit = (data) => {
    const seputarSAPFormData = new FormData();
    for (const id in data) {
      seputarSAPFormData.append(id, data[id])
    }

    if (id) {
      patchSeputarSAP(
        { data: seputarSAPFormData, id: id },
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
      postSeputarSAP(seputarSAPFormData, {
        onSuccess: () => {
          navigate('/stem-chatbot/konsol-chatbot/seputarsap');
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
            { name: 'Daftar Seputar SAP', link: '/stem-chatbot/konsol-chatbot/seputarsap' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Pertanyaan Seputar SAP
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUInput
          register={register}
          name="Pertanyaan"
          required
          errors={errors}
          registeredName="pertanyaan"
          isDisabled={!editable}
        />
        <CRUInput
          register={register}
          name="Jawaban"
          required
          errors={errors}
          registeredName="jawaban"
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
                isLoading={patchSeputarSAPLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postSeputarSAPLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default KonsolChatbotSeputarSAPForm;
