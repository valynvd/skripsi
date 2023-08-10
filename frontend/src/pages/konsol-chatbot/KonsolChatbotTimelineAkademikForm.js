/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostKonsolChatbotTimeLineAkademik,
  usePatchKonsolChatbotTimeLineAkademik,
  useKonsolChatbotTimeLineAkademikById
} from '../../hooks/useKonsolChatbotTimelineAkademik';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';

const KonsolChatbotTimelineAkademikForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [timelineAkademikData, setTimelineAkademikData] = useState(state);
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

  const { data: updatedTimelineAkademikData } = useKonsolChatbotTimeLineAkademikById(id, {
    enabled: !!id && !timelineAkademikData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedTimelineAkademikData) {
        setTimelineAkademikData(updatedTimelineAkademikData.data);
        reset(updatedTimelineAkademikData.data);
      }
      setEditable(false);
    }
  }, [updatedTimelineAkademikData, state, reset, id]);

  const { mutate: postTimelineAkademik, isLoading: postTimelineAkademikLoading } =
    usePostKonsolChatbotTimeLineAkademik();
  const { mutate: patchTimelineAkademik, isLoading: patchTimelineAkademikLoading } =
    usePatchKonsolChatbotTimeLineAkademik();

  const onSubmit = (data) => {
    const timelineAkademikFormData = new FormData();
    for (const id in data) {
      timelineAkademikFormData.append(id, data[id])
    }

    if (id) {
      patchTimelineAkademik(
        { data: timelineAkademikFormData, id: id },
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
      postTimelineAkademik(timelineAkademikFormData, {
        onSuccess: () => {
          navigate('/stem-chatbot/konsol-chatbot/timelineakademik');
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
    <section id="timelineakademik-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Daftar Timeline Akademik', link: '/stem-chatbot/konsol-chatbot/timelineakademik' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Pertanyaan Timeline Akademik
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
                isLoading={patchTimelineAkademikLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postTimelineAkademikLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default KonsolChatbotTimelineAkademikForm;
