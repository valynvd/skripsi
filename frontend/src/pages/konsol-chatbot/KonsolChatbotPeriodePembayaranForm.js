import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import {
  usePostKonsolChatbotPeriodePembayaran,
  usePatchKonsolChatbotPeriodePembayaran,
  useKonsolChatbotPeriodePembayaranById
} from '../../hooks/useKonsolChatbotPeriodePembayaran';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import CRUTextAreaInput from '../../components/CRUTextAreaInput';

const KonsolChatbotPeriodePembayaranForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [periodePembayaranData, setPeriodePembayaranData] = useState(state);
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

  const { data: updatedPeriodePembayaranData } = useKonsolChatbotPeriodePembayaranById(id, {
    enabled: !!id && !periodePembayaranData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedPeriodePembayaranData) {
        setPeriodePembayaranData(updatedPeriodePembayaranData.data);
        reset(updatedPeriodePembayaranData.data);
      }
      setEditable(false);
    }
  }, [updatedPeriodePembayaranData, state, reset, id]);

  const { mutate: postPeriodePembayaran, isLoading: postPeriodePembayaranLoading } =
    usePostKonsolChatbotPeriodePembayaran();
  const { mutate: patchPeriodePembayaran, isLoading: patchPeriodePembayaranLoading } =
    usePatchKonsolChatbotPeriodePembayaran();

  const onSubmit = (data) => {
    const periodePembayaranFormData = new FormData();
    for (const id in data) {
      periodePembayaranFormData.append(id, data[id])
    }

    if (id) {
      patchPeriodePembayaran(
        { data: periodePembayaranFormData, id: id },
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
      postPeriodePembayaran(periodePembayaranFormData, {
        onSuccess: () => {
          navigate('/stem-chatbot/konsol-chatbot/periodepembayaran');
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
            { name: 'Daftar Periode Pembayaran', link: '/stem-chatbot/konsol-chatbot/periodepembayaran' },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        {id ? 'Detail' : 'Buat'} Pertanyaan Periode Pembayaran
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
        <CRUTextAreaInput
          register={register}
          name="Pertanyaan"
          required
          errors={errors}
          registeredName="pertanyaan"
          isDisabled={!editable}
        />
        <CRUTextAreaInput
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
                isLoading={patchPeriodePembayaranLoading}
                name="Update"
              />
            )}
            {editable && <CancelButton onClick={() => setEditable(false)} />}
          </div>
        ) : (
          <PrimaryButton className={`!mt-8`} isLoading={postPeriodePembayaranLoading}>
            Buat
          </PrimaryButton>
        )}
      </form>
    </section>
  );
};

export default KonsolChatbotPeriodePembayaranForm;
