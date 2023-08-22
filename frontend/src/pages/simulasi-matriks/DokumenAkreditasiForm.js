/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import CRUInput from '../../components/CRUInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import {
  usePostDokumenAkreditasi,
  usePatchDokumenAkreditasi,
  useDokumenAkreditasiById,
} from '../../hooks/useDokumenAkreditasi';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import CancelButton from '../../components/CancelButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useProgramStudiData } from '../../hooks/useProdi';
import CRUFileInput from '../../components/CRUFileInput';
import MatriksPenilaianTable from './components/MatriksPenilaianTable';
import PoinPenilaianModalForm from './components/PoinPenilaianModalForm';
import {
  useDeleteKriteria,
  useKriteriaByDokumenAkreditasi,
  usePostKriteria,
} from '../../hooks/useKriteria';
import ModalDelete from '../../components/ModalDelete';
import { useDeletePoinPenilaian } from '../../hooks/usePoinPenilaian';
import KriteriaModalForm from './components/KriteriaModalForm';

const DokumenAkreditasiForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const { id } = useParams();
  const { state } = useLocation();
  const [dokumenAkreditasiData, setDokumenAkreditasiData] = useState(state);
  const [selectedKriteria, setSelectedKriteria] = useState();
  const [editable, setEditable] = useState(true);
  const [criteriaState, setCriteriaState] = useState({});
  const [selectedPoinPenilaian, setSelectedPoinPenilaian] = useState();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [openModalDeleteKriteria, setOpenModalDeleteKriteria] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {},
  });

  const {
    mutate: postDokumenAkreditasi,
    isLoading: postDokumenAkreditasiLoading,
  } = usePostDokumenAkreditasi();
  const {
    mutate: patchDokumenAkreditasi,
    isLoading: patchDokumenAkreditasiLoading,
  } = usePatchDokumenAkreditasi();

  const { mutate: postKriteria, isLoading: postKriteriaLoading } =
    usePostKriteria();

  const { mutate: deletePoinPenilaian } = useDeletePoinPenilaian();
  const { mutate: deleteKriteria } = useDeleteKriteria();

  const { data: matriksPenilaianData, refetch: refetchMatriksPenilaianData } =
    useKriteriaByDokumenAkreditasi(id, {
      select: (response) => response.data,
    });

  useEffect(() => {
    const criteriaLocalStorage = JSON.parse(
      localStorage.getItem('criteriaState2')
    );

    let formatCriteriaState = {};

    if (criteriaLocalStorage) {
      formatCriteriaState = { ...criteriaLocalStorage };
    } else {
      matriksPenilaianData?.forEach((item) => {
        formatCriteriaState[item.nama] = false;
      });

      formatCriteriaState['Kriteria 0'] = true;
    }

    setCriteriaState(formatCriteriaState);
  }, [matriksPenilaianData]);

  const navigate = useNavigate();

  const [openKriteriaModalForm, setOpenKriteriaModalForm] = useState(false);
  const [openPoinPenilaianModalForm, setOpenPoinPenilaianModalForm] =
    useState(false);

  const { data: programStudiData, isSuccess: programStudiDataSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatProgramStudiData = response.data.map(({ id, name }) => {
          return { value: id, label: name };
        });

        return formatProgramStudiData;
      },
    });

  const { data: updatedDokumenAkreditasiData } = useDokumenAkreditasiById(id, {
    enabled: !!id && !dokumenAkreditasiData,
  });

  useEffect(() => {
    if (id) {
      if (state) {
        reset(state);
      } else if (updatedDokumenAkreditasiData) {
        setDokumenAkreditasiData(updatedDokumenAkreditasiData.data);
        reset(updatedDokumenAkreditasiData.data);
      }
      setEditable(false);
    }
  }, [updatedDokumenAkreditasiData, state, reset, id]);

  const onSubmit = (data) => {
    const dokumenAkreditasiFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dokumenAkreditasiFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchDokumenAkreditasi(
        { data: dokumenAkreditasiFormData, id: id },
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
      postDokumenAkreditasi(dokumenAkreditasiFormData, {
        onSuccess: ({ data }) => {
          postKriteria(
            { nama: 'Kriteria 0', dokumenAkreditasiId: data.id },
            {
              onSuccess: () => {
                navigate(`/akreditasi/dokumen-akreditasi/${data.id}`);
              },
            }
          );
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
      {id && (
        <>
          <ModalDelete
            title="Poin Penilaian"
            isOpen={openModalDelete}
            setIsOpen={setOpenModalDelete}
            deleteFunc={() => {
              deletePoinPenilaian(selectedPoinPenilaian.id, {
                onSuccess: () => {
                  refetchMatriksPenilaianData();
                  setOpenModalDelete(false);
                },
              });
            }}
          />
          <ModalDelete
            title="Kriteria"
            isOpen={openModalDeleteKriteria}
            setIsOpen={setOpenModalDeleteKriteria}
            deleteFunc={() => {
              deleteKriteria(selectedKriteria.id, {
                onSuccess: () => {
                  refetchMatriksPenilaianData();
                  setOpenModalDeleteKriteria(false);
                },
              });
            }}
          />
          <KriteriaModalForm
            selectedKriteria={selectedKriteria}
            refetchMatriksPenilaianData={refetchMatriksPenilaianData}
            matriksPenilaianData={matriksPenilaianData}
            openKriteriaModalForm={openKriteriaModalForm}
            setOpenKriteriaModalForm={setOpenKriteriaModalForm}
            dokumenAkreditasiId={id}
          />
          <PoinPenilaianModalForm
            selectedPoinPenilaian={selectedPoinPenilaian}
            refetchMatriksPenilaianData={refetchMatriksPenilaianData}
            matriksPenilaianData={matriksPenilaianData}
            selectedKriteria={selectedKriteria}
            openPoinPenilaianModalForm={openPoinPenilaianModalForm}
            setOpenPoinPenilaianModalForm={setOpenPoinPenilaianModalForm}
            dokumenAkreditasiId={id}
          />
        </>
      )}
      <section id="dokumen-akreditasi-form" className="section-container">
        <BreadCrumbs
          links={[
            {
              name: 'Daftar Dokumen Akreditasi',
              link: '/akreditasi/dokumen-akreditasi',
            },
            { name: id ? 'Detail' : 'Buat' },
          ]}
        />
        <p className="text-lg font-semibold">
          {id ? 'Edit' : 'Buat'} Dokumen Akreditasi
        </p>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
          <CRUDropdownInput
            control={control}
            name="Program Studi"
            registeredName="prodiId"
            options={programStudiDataSuccess ? programStudiData : []}
            isDisabled={!editable}
          />
          <CRUInput
            register={register}
            name="nama"
            registeredName="name"
            required
            errors={errors}
            isDisabled={!editable}
          />
          <CRUFileInput
            control={control}
            fileLink={dokumenAkreditasiData?.file}
            register={register}
            registeredName="file"
            name="File"
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
                  isLoading={patchDokumenAkreditasiLoading}
                  name="Update"
                />
              )}
              {editable && <CancelButton onClick={() => setEditable(false)} />}
            </div>
          ) : (
            <PrimaryButton
              className={`!mt-8`}
              isLoading={postDokumenAkreditasiLoading}
            >
              Buat
            </PrimaryButton>
          )}
        </form>
      </section>
      {id && (
        <section className="section-container mt-4">
          <MatriksPenilaianTable
            setOpenModalDeleteKriteria={setOpenModalDeleteKriteria}
            setSelectedPoinPenilaian={setSelectedPoinPenilaian}
            criteriaState={criteriaState}
            setCriteriaState={setCriteriaState}
            setSelectedKriteria={setSelectedKriteria}
            openKriteriaModalForm={openKriteriaModalForm}
            setOpenKriteriaModalForm={setOpenKriteriaModalForm}
            openPoinPenilaianModalForm={openPoinPenilaianModalForm}
            setOpenPoinPenilaianModalForm={setOpenPoinPenilaianModalForm}
            matriksPenilaianData={matriksPenilaianData}
            setOpenModalDelete={setOpenModalDelete}
          />
        </section>
      )}
    </>
  );
};

export default DokumenAkreditasiForm;
