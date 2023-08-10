import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostKonsolChatbotSeputarLMS,
  usePatchKonsolChatbotSeputarLMS,
  useKonsolChatbotSeputarLMSById
} from '../../hooks/useKonsolChatbotSeputarLMS';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const KonsolChatbotSeputarLMSForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [seputarLMSData, setSeputarLMSData] = useState(state);
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

  const { data: updatedSeputarLMSData } = useKonsolChatbotSeputarLMSById(id, {
    enabled: !!id && !seputarLMSData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedSeputarLMSData) {
        setSeputarLMSData(updatedSeputarLMSData.data);
        reset(updatedSeputarLMSData.data);
      }
      setEditable(false);
    }
  }, [updatedSeputarLMSData, state, reset, id]);

  const { mutate: postSeputarLMS, isLoading: postSeputarLMSLoading } =
    usePostKonsolChatbotSeputarLMS();
  const { mutate: patchSeputarLMS, isLoading: patchSeputarLMSLoading } =
    usePatchKonsolChatbotSeputarLMS();

  const onSubmit = (data) => {
    const seputarLMSFormData = new FormData();
    for (const id in data) {
      seputarLMSFormData.append(id, data[id])
    }

    if (id) {
      patchSeputarLMS(
        { data: seputarLMSFormData, id: id },
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
      postSeputarLMS(seputarLMSFormData, {
        onSuccess: () => {
          navigate('/stem-chatbot/konsol-chatbot/seputarlms');
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
            { name: 'Daftar Seputar LMS', link: '/stem-chatbot/konsol-chatbot/seputarlms' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Pertanyaan Seputar LMS
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
                isLoading={patchSeputarLMSLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postSeputarLMSLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default KonsolChatbotSeputarLMSForm;
