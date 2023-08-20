/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { BiPlusCircle } from 'react-icons/bi';
import {
  usePostDokumenPembelajaran,
  usePatchDokumenPembelajaran,
  useRiwayatDokumenPembelajaranByDokumenPembelajaran,
  useDeleteRiwayatDokumenPembelajaran,
  useDokumenPembelajaranById,
} from '../../hooks/useDokumenPembelajaran';
import { AlertError } from '../../components/Alert';
import EditButton from '../../components/EditButton';
import CRUTextAreaInput from '../../components/CRUTextAreaInput';
import { useCheckRole } from '../../hooks/useCheckRole';
import RiwayatDokumenPembelajaranTable from './components/RiwayatDokumenPembelajaranTable';
import ModalDelete from '../../components/ModalDelete';
import RiwayatDokumenPembelajaranEvaluasiModalForm from './components/RiwayatDokumenPembelajaranEvaluasiModalForm';
import RiwayatDokumenPembelajaranUploadModalForm from './components/RiwayatDokumenPembelajaranUploadModalForm';
import PageButton from './components/PageButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import PortofolioPerkuliahanModalForm from './components/PortofolioPerkuliahanModalForm';
import {
  useDeletePortofolioPerkuliahan,
  usePortofolioPerkuliahanByDosenData,
} from '../../hooks/usePortofolioPerkuliahan';
import PortofolioPerkuliahanTable from './components/PortofolioPerkuliahanTable';

const DokumenPembelajaranForm = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [
    OpenModalDeletePortofolioPerkuliahan,
    setOpenModalDeletePortofolioPerkuliahan,
  ] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemEdit, setSelectedItemEdit] = useState(null);
  const [openModalEvaluasi, setOpenModalEvaluasi] = useState(false);
  const [openModalUpload, setOpenModalUpload] = useState(false);
  const [openModalUploadType, setOpenModalUploadType] = useState(null);
  const [openModalPortofolio, setOpenModalPortofolio] = useState(false);
  const [selectedItemEditPortofolio, setSelectedItemEditPortofolio] =
    useState(null);
  const { state } = useLocation();
  const [dokumenPembelajaranData, setDokumenPembelajaranData] = useState(
    state?.data
  );
  const [page, setPage] = useState(null);
  const userRole = useCheckRole();
  const { id } = useParams();
  const selectedPage = state?.selectedPage;
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({
    defaultValues: {
      rps: null,
      evaluation_report: null,
      rubrik: null,
      notes: null,
    },
  });

  useEffect(() => {
    setPage(selectedPage);
  }, [selectedPage]);

  const {
    data: dataRiwayatDokumenPembelajaran,
    isLoading: isLoadingRiwayatDokumenPembelajaran,
    refetch: riwayatDokumenPembelajaranRefetch,
  } = useRiwayatDokumenPembelajaranByDokumenPembelajaran(id, { enabled: !!id });
  const {
    mutate: postDokumenPembelajaran,
    isLoading: postDokumenPembelajaranLoading,
  } = usePostDokumenPembelajaran();
  const {
    mutate: patchDokumenPembelajaran,
    isLoading: patchDokumenPembelajaranLoading,
  } = usePatchDokumenPembelajaran();
  const {
    mutate: deleteRiwayatDokumenPembelajaran,
    isLoading: deleteRiwayatDokumenPembelajaranLoading,
  } = useDeleteRiwayatDokumenPembelajaran();
  const {
    mutate: deletePortofolioPerkuliahan,
    isLoading: deletePortofolioPerkuliahanLoading,
  } = useDeletePortofolioPerkuliahan();
  const {
    data: updatedDokumenPembelajaranData,
    isLoading: updatedDokumenPembelajaranDataLoading,
    refetch: updatedDokumenPembelajaranDataRefetch,
  } = useDokumenPembelajaranById(id, {
    enabled: !!id && !dokumenPembelajaranData,
  });
  const {
    data: portofolioPerkuliahanByDosenData,
    isLoading: portofolioPerkuliahanByDosenDataLoading,
    refetch: portofolioPerkuliahanByDosenDataRefetch,
  } = usePortofolioPerkuliahanByDosenData(
    dokumenPembelajaranData?.penugasan_pengajaran_detail?.dosen_pengampu,
    {
      enabled:
        !!dokumenPembelajaranData?.rps_status.accepted &&
        !!dokumenPembelajaranData?.rubrik_status.accepted,
    }
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (updatedDokumenPembelajaranData) {
      setDokumenPembelajaranData(updatedDokumenPembelajaranData?.data);
    }
    if (!dokumenPembelajaranData) {
      setDokumenPembelajaranData(updatedDokumenPembelajaranData?.data);
    }
  }, [dokumenPembelajaranData, updatedDokumenPembelajaranData]);

  const onSubmit = (data) => {
    const dokumenPembelajaranFormData = new FormData();

    Object.keys(dirtyFields).forEach((key) => {
      if (dirtyFields[key]) {
        dokumenPembelajaranFormData.append(key, data[key]);
      }
    });

    if (id) {
      patchDokumenPembelajaran(
        { data: dokumenPembelajaranFormData, id: id },
        {
          onSuccess: () => {
            navigate('/pelaksanaan-pendidikan/dokumen-pembelajaran');
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
      postDokumenPembelajaran(dokumenPembelajaranFormData, {
        onSuccess: () => {
          navigate('/pelaksanaan-pendidikan/dokumen-pembelajaran');
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
      {id ? (
        <section className="section-container mb-4">
          <BreadCrumbs
            links={[
              {
                name: 'Daftar Dokumen Pembelajaran',
                link: '/pelaksanaan-pendidikan/dokumen-pembelajaran',
              },
              {
                name: 'Detail',
                link: '/pelaksanaan-pendidikan/dokumen-pembelajaran',
              },
            ]}
          />
          <p className="text-lg font-semibold">
            Detail Dokumen Pembelajaran
            {/* {`"${dokumenPembelajaranData?.penugasan_pengajaran_detail?.mata_kuliah_detail?.name}"`} */}
          </p>
          <div className="mt-3 space-y-1">
            {!userRole.dosen && (
              <p>
                {
                  dokumenPembelajaranData?.penugasan_pengajaran_detail
                    ?.dosen_pengampu_detail?.user_detail?.fullname
                }{' '}
                (
                {
                  dokumenPembelajaranData?.penugasan_pengajaran_detail
                    ?.dosen_pengampu_detail?.inisial
                }
                ) {'- '}
                {
                  dokumenPembelajaranData?.penugasan_pengajaran_detail
                    ?.dosen_pengampu_detail?.user_detail?.role
                }
              </p>
            )}
            <p>
              {
                dokumenPembelajaranData?.penugasan_pengajaran_detail
                  ?.mata_kuliah_detail?.name
              }
              {' - '}
              {
                dokumenPembelajaranData?.penugasan_pengajaran_detail
                  ?.dosen_pengampu_detail?.prodi_detail?.name
              }{' '}
              (
              {
                dokumenPembelajaranData?.penugasan_pengajaran_detail
                  ?.dosen_pengampu_detail?.prodi_detail?.kode
              }
              )
            </p>
          </div>
        </section>
      ) : null}
      {(dokumenPembelajaranData?.rps_status.accepted ||
        dokumenPembelajaranData?.rubrik_status.accepted) && (
        <section className="section-container mb-4">
          <div className="gap-4 flex flex-wrap">
            {dokumenPembelajaranData.rps_status.accepted && (
              <div className="space-y-1">
                <p>RPS Diterima</p>
                <a
                  href={dokumenPembelajaranData?.rps_status.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block max-w-md text-primary-400 overflow-ellipsis overflow-hidden focus:outline-none whitespace-nowrap"
                >
                  {dokumenPembelajaranData?.rps_status.link}
                </a>
              </div>
            )}
            {dokumenPembelajaranData.rubrik_status.accepted && (
              <div className="space-y-1">
                <p>Rubrik Diterima</p>
                <a
                  href={dokumenPembelajaranData?.rubrik_status.link}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-block max-w-md text-primary-400 overflow-ellipsis overflow-hidden focus:outline-none whitespace-nowrap"
                >
                  {dokumenPembelajaranData?.rubrik_status.link}
                </a>
              </div>
            )}
          </div>
        </section>
      )}
      {userRole.admin && (
        <section
          id="dokumen-pembelajaran-form"
          className="section-container mb-4"
        >
          <p className="text-lg font-semibold">
            {id ? 'Edit' : 'Buat'} Dokumen Pembelajaran
          </p>
          <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
            <>
              {/* <CRUFileInput
                fileLink={dokumenPembelajaranData?.rubrik}
                control={control}
                register={register}
                registeredName="rubrik"
                name="Rubrik"
              /> */}
              <CRUTextAreaInput
                register={register}
                name="Notes"
                registeredName="notes"
                errors={errors}
              />
              {/* <CRUDropdownInput
                  required
                  control={control}
                  name="Penugasan Pengajaran"
                  registeredName="penugasanPengajaranId"
                  defaultValue={
                    dokumenPembelajaranData?.penugasan_detail
                      ? {
                          value: dokumenPembelajaranData.penugasan_detail.id,
                          label: `[${dokumenPembelajaranData.periode} ${dokumenPembelajaranData.tahun}]-${dokumenPembelajaranData.dosen_pengampu_detail?.inisial}-${dokumenPembelajaranData.mata_kuliah_detail?.name}`,
                        }
                      : null
                  }
                  options={
                    penugasanPengajaranDataSuccess ? dataPenugasanPengajaran : []
                  }
                /> */}
            </>
            {errorMessage ? (
              <AlertError className="inline-block">{errorMessage}</AlertError>
            ) : null}
            {id ? (
              <EditButton
                className={`!mt-8 !text-base`}
                type="submit"
                isLoading={patchDokumenPembelajaranLoading}
              />
            ) : (
              <PrimaryButton
                className={`!mt-8`}
                isLoading={postDokumenPembelajaranLoading}
              >
                Buat
              </PrimaryButton>
            )}
          </form>
        </section>
      )}
      <section className="py-1 mb-4 flex gap-4">
        <PageButton
          active={page === 'Riwayat Rubrik'}
          onClick={() => {
            setPage('Riwayat Rubrik');
          }}
        >
          Riwayat Rubrik
        </PageButton>
        <PageButton
          active={page === 'Riwayat RPS'}
          onClick={() => {
            setPage('Riwayat RPS');
          }}
        >
          Riwayat RPS
        </PageButton>
        {dokumenPembelajaranData?.rps_status.accepted &&
          dokumenPembelajaranData?.rubrik_status.accepted && (
            <PageButton
              active={page === 'Portofolio Perkuliahan'}
              onClick={() => {
                setPage('Portofolio Perkuliahan');
              }}
            >
              Portofolio Perkuliahan
            </PageButton>
          )}
      </section>
      {id ? (
        <>
          <RiwayatDokumenPembelajaranEvaluasiModalForm
            riwayatDokumenPembelajaranRefetch={
              riwayatDokumenPembelajaranRefetch
            }
            updatedDokumenPembelajaranDataRefetch={
              updatedDokumenPembelajaranDataRefetch
            }
            openModalEvaluasi={openModalEvaluasi}
            setOpenModalEvaluasi={setOpenModalEvaluasi}
            riwayatDokumenPembelajaranData={selectedItemEdit}
            dokumenPembelajaranId={id}
          />
          <RiwayatDokumenPembelajaranUploadModalForm
            riwayatDokumenPembelajaranRefetch={
              riwayatDokumenPembelajaranRefetch
            }
            openModalUpload={openModalUpload}
            openModalUploadType={openModalUploadType}
            setOpenModalUpload={setOpenModalUpload}
            riwayatDokumenPembelajaranData={selectedItemEdit}
            dokumenPembelajaranId={id}
          />
          <PortofolioPerkuliahanModalForm
            portofolioPerkuliahanRefetch={
              portofolioPerkuliahanByDosenDataRefetch
            }
            openModalPortofolio={openModalPortofolio}
            setOpenModalPortofolio={setOpenModalPortofolio}
            portofolioPerkuliahanData={selectedItemEditPortofolio}
            dokumenPembelajaranData={dokumenPembelajaranData}
          />
          {/* <RiwayatDokumenPembelajaranInitialDocumentModalForm
            riwayatDokumenPembelajaranRefetch={
              riwayatDokumenPembelajaranRefetch
            }
            openModalInitialDocument={openModalInitialDocument}
            openModalUploadType={openModalUploadType}
            setOpenModalUploadType={setOpenModalUploadType}
            setOpenModalInitialDocument={setOpenModalInitialDocument}
            dokumenPembelajaranId={id}
          /> */}
          <ModalDelete
            title="Riwayat Perubahan"
            isOpen={openModalDelete}
            setIsOpen={setOpenModalDelete}
            deleteFunc={() =>
              deleteRiwayatDokumenPembelajaran(selectedItem, {
                onSuccess: () => {
                  riwayatDokumenPembelajaranRefetch();
                  setOpenModalDelete(false);
                },
              })
            }
          />
          <ModalDelete
            title="Portofolio Perkuliahan"
            isOpen={OpenModalDeletePortofolioPerkuliahan}
            setIsOpen={setOpenModalDeletePortofolioPerkuliahan}
            deleteFunc={() =>
              deletePortofolioPerkuliahan(selectedItem, {
                onSuccess: () => {
                  portofolioPerkuliahanByDosenDataRefetch();
                  setOpenModalDeletePortofolioPerkuliahan(false);
                },
              })
            }
          />
          {page === 'Riwayat RPS' && (
            <section
              id="penugasan-pengajaran-table-rps"
              className="section-container mb-4"
            >
              <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">Riwayat Perubahan RPS</p>
                <div className="flex space-x-4">
                  <PrimaryButton
                    onClick={() => {
                      navigate(
                        `/pelaksanaan-pendidikan/dokumen-pembelajaran/${id}/rps`,
                        { state: { data: dokumenPembelajaranData } }
                      );
                    }}
                  >
                    Buat RPS
                  </PrimaryButton>
                  <PrimaryButton
                    icon={<BiPlusCircle size={22} />}
                    onClick={() => {
                      setSelectedItemEdit(null);
                      setOpenModalUploadType('RPS');
                      setOpenModalUpload(true);
                    }}
                  >
                    Upload RPS
                  </PrimaryButton>
                </div>
              </div>

              <div className="mt-8 w-full rounded-t-lg">
                <RiwayatDokumenPembelajaranTable
                  type="RPS"
                  setSelectedItem={setSelectedItem}
                  setSelectedItemEdit={setSelectedItemEdit}
                  setOpenModalDelete={setOpenModalDelete}
                  setOpenModalEdit={setOpenModalEvaluasi}
                  setOpenModalEvaluasi={setOpenModalEvaluasi}
                  setOpenModalUpload={setOpenModalUpload}
                  setOpenModalUploadType={setOpenModalUploadType}
                  loading={isLoadingRiwayatDokumenPembelajaran}
                  data={
                    dataRiwayatDokumenPembelajaran?.data
                      ? dataRiwayatDokumenPembelajaran.data.filter(
                          (item) => item.type === 'rps'
                        )
                      : []
                  }
                />
              </div>
            </section>
          )}
          {page === 'Riwayat Rubrik' && (
            <section
              id="penugasan-pengajaran-table-rubrik"
              className="section-container"
            >
              <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">
                  Riwayat Perubahan Rubrik
                </p>
                <PrimaryButton
                  icon={<BiPlusCircle size={22} />}
                  onClick={() => {
                    setSelectedItemEdit(null);
                    setOpenModalUploadType('Rubrik');
                    setOpenModalUpload(true);
                  }}
                >
                  Upload Rubrik
                </PrimaryButton>
              </div>

              <div className="mt-8 w-full rounded-t-lg">
                <RiwayatDokumenPembelajaranTable
                  type="Rubrik"
                  setSelectedItem={setSelectedItem}
                  setSelectedItemEdit={setSelectedItemEdit}
                  setOpenModalDelete={setOpenModalDelete}
                  setOpenModalEdit={setOpenModalEvaluasi}
                  setOpenModalEvaluasi={setOpenModalEvaluasi}
                  setOpenModalUpload={setOpenModalUpload}
                  setOpenModalUploadType={setOpenModalUploadType}
                  loading={isLoadingRiwayatDokumenPembelajaran}
                  data={
                    dataRiwayatDokumenPembelajaran?.data
                      ? dataRiwayatDokumenPembelajaran.data.filter(
                          (item) => item.type === 'rubrik'
                        )
                      : []
                  }
                />
              </div>
            </section>
          )}
          {page === 'Portofolio Perkuliahan' && (
            <section
              id="penugasan-pengajaran-table-portofolio-perkuliahan"
              className="section-container"
            >
              <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
                <p className="font-semibold text-lg">Portofolio Perkuliahan</p>
                <PrimaryButton
                  icon={<BiPlusCircle size={22} />}
                  onClick={() => {
                    setSelectedItemEditPortofolio(null);
                    setOpenModalPortofolio(true);
                  }}
                >
                  Upload Portofolio Perkuliahan
                </PrimaryButton>
              </div>

              <div className="mt-8 w-full rounded-t-lg">
                <PortofolioPerkuliahanTable
                  setOpenModalPortofolio={setOpenModalPortofolio}
                  setSelectedItem={setSelectedItem}
                  setSelectedItemEditPortofolio={setSelectedItemEditPortofolio}
                  setOpenModalDelete={setOpenModalDeletePortofolioPerkuliahan}
                  setOpenModalEdit={setOpenModalEvaluasi}
                  setOpenModalEvaluasi={setOpenModalEvaluasi}
                  setOpenModalUpload={setOpenModalUpload}
                  setOpenModalUploadType={setOpenModalUploadType}
                  loading={portofolioPerkuliahanByDosenDataLoading}
                  data={portofolioPerkuliahanByDosenData?.data || []}
                />
              </div>
            </section>
            // <PortofolioPerkuliahanForm
            //   initialValue={dokumenPembelajaranData?.portofolio_perkuliahan}
            //   updatedDokumenPembelajaranDataRefetch={
            //     updatedDokumenPembelajaranDataRefetch
            //   }
            //   dokumenPembelajaranData={dokumenPembelajaranData}
            // />
          )}
        </>
      ) : null}
    </>
  );
};

export default DokumenPembelajaranForm;
