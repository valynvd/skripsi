/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment, useRef } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useKriteriaData } from '../../hooks/useKriteria';
import CRUInput from '../../components/CRUInput';
import { useForm, Controller } from 'react-hook-form';
import { primary400, yellow400 } from '../../utils/colors';
import { useSuratPenugasanData } from '../../hooks/useSuratPenugasan';
import { TooltipInfo } from '../../components/Tooltip';
import { Dialog, Transition } from '@headlessui/react';
import { LinkIconAccepted, LinkIconRejected } from '../../components/LinkIcon';
import { usePatchPoinPenilaian } from '../../hooks/usePoinPenilaian';
import { DeleteIcon, ViewIcon } from '../../components/IconButton';
import DetailModal from './components/DetailModal';
import AddModal from './components/AddModal';
import CancelButton from '../../components/CancelButton';
import { BeatLoader } from 'react-spinners';
import Table from './components/Table';
import { usePostRiwayatPoinPenilaian } from '../../hooks/useRiwayatPoinPenilaian';
import { useFileData } from '../../hooks/useFile.js';
import useAuth from '../../hooks/useAuth';
import { useMatriksPenilaianByProdi } from '../../hooks/useMatriksPenilaian';
import { useParams } from 'react-router-dom';

const TableForm = ({
  handleSubmit,
  onSubmit,
  control,
  counter,
  setCounter,
  errors,
  reset,
}) => {
  const {
    auth: { userData },
  } = useAuth();
  const { id } = useParams();

  const { data, refetch: kriteriaRefetch } = useMatriksPenilaianByProdi(
    id ? id : userData.dosen_detail.id
  );

  // const { refetch: kriteriaRefetch } = useKriteriaData();
  const { data: fileData } = useFileData({
    select: (response) =>
      response.data.map(({ title, id, ...options }) => {
        return { label: title, value: id, ...options, document_type: 'file' };
      }),
  });
  const { data: suratPenugasanData } = useSuratPenugasanData({
    select: (response) =>
      response.data.map(({ judul, id, ...options }) => {
        return {
          label: judul,
          value: id,
          ...options,
          document_type: 'surat penugasan',
        };
      }),
  });
  const { mutate: postRiwayatPoinPenilaian } = usePostRiwayatPoinPenilaian();
  const [criteriaState, setCriteriaState] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [selectedDokumenPendukung, setSelectedDokumenPendukung] =
    useState(null);
  const [selectedDokumenPendukung2, setSelectedDokumenPendukung2] =
    useState(null);
  const [selectedPoinPenilaian, setSelectedPoinPenilaian] = useState(null);
  const [matriksEdit, setMatriksEdit] = useState({});
  const [poinPenilaianLoading, setPoinPenilaianLoading] = useState({});
  const [scoreLoading, setScoreLoading] = useState({});
  const [documentLoading, setDocumentLoading] = useState({});
  const { mutate: patchPoinPenilaian } = usePatchPoinPenilaian();
  const [filteredKriteria, setFilteredKriteria] = useState();
  const [pointId, setPointId] = useState();
  const [dokumenPendukungList, setDokumenPendukungList] = useState([]);

  const semesterName = {
    Odd: 'Ganjil',
    'Odd Short': 'Pendek Ganjil',
    Even: 'Genap',
    'Even Short': 'Pendek Genap',
  };

  useEffect(() => {
    if (fileData && suratPenugasanData) {
      setDokumenPendukungList([...fileData, ...suratPenugasanData]);
    }
  }, [fileData, suratPenugasanData]);

  useEffect(() => {
    if (data) {
      const criteriaLocalStorage = JSON.parse(
        localStorage.getItem('criteriaState')
      );
      let formatCriteriaState = {};
      if (criteriaLocalStorage) {
        formatCriteriaState = { ...criteriaLocalStorage };
      } else {
        data.data.forEach((item) => {
          formatCriteriaState[item.nama] = false;
        });
      }
      const formatFormState = {};
      const formatMatriksPenilaianEdit = {};
      const formatPoinPenilaianLoading = {};
      const formatCounter = {};
      data.data.forEach((item) => {
        if (item.poin_penilaian_detail) {
          item.poin_penilaian_detail.forEach((item2) => {
            formatMatriksPenilaianEdit[item2.id] = false;
            formatPoinPenilaianLoading[item2.id] = 'stale';
            const riwayatPoinPenilaianLastItem =
              item2.riwayat_poin_penilaian_detail[
                item2.riwayat_poin_penilaian_detail.length - 1
              ];
            if (item2.riwayat_poin_penilaian_detail.length === 0) {
              formatCounter[item2.id] = {
                score: 0,
                dokumenPendukung: [],
              };
            } else {
              formatCounter[item2.id] = {
                score: riwayatPoinPenilaianLastItem.score,
                dokumenPendukung: [
                  ...riwayatPoinPenilaianLastItem.dokumen_pendukung_surat_penugasan_detail.map(
                    (item3) => {
                      return {
                        ...item3,
                        value: item3.id,
                        label: item3.judul,
                        document_type: 'surat penugasan',
                      };
                    }
                  ),
                  ...riwayatPoinPenilaianLastItem.dokumen_pendukung_file_detail.map(
                    (item3) => {
                      return {
                        ...item3,
                        value: item3.id,
                        label: item3.title,
                        document_type: 'file',
                      };
                    }
                  ),
                ],
              };
            }
            formatFormState[item2.order_number] = {
              id: item2.id,
              item_number: item2.item_number,
              value: riwayatPoinPenilaianLastItem?.score || null,
              max_score: item2.max_score,
              dokumen_pendukung_surat_penugasan: [],
            };
            // if (item2.riwayat_poin_penilaian_detail.length > 0) {
            //   item2.dokumen_pendukung_surat_penugasan_detail.forEach((item3) => {
            //     formatFormState[item2.order_number][
            //       'dokumen_pendukung_surat_penugasan'
            //     ].push({
            //       label: item3.judul,
            //       value: item3.id,
            //     });
            //   });
            // }
            if (item.nama === 'Kriteria 0') {
              formatFormState[item2.order_number]['description'] =
                item2.element;
            } else {
              formatFormState[item2.order_number]['description'] =
                item.deskripsi;
            }
          });
        } else {
          formatMatriksPenilaianEdit[item.id] = false;
          formatPoinPenilaianLoading[item.id] = 'stale';
          const riwayatPoinPenilaianLastItem =
            item.riwayat_poin_penilaian_detail[
              item.riwayat_poin_penilaian_detail.length - 1
            ];
          if (item.riwayat_poin_penilaian_detail.length === 0) {
            formatCounter[item.id] = {
              score: 0,
              dokumenPendukung: [],
            };
          } else {
            formatCounter[item.id] = {
              score: riwayatPoinPenilaianLastItem.score,
              dokumenPendukung: [
                ...riwayatPoinPenilaianLastItem.dokumen_pendukung_surat_penugasan_detail.map(
                  (item3) => {
                    return {
                      ...item3,
                      value: item3.id,
                      label: item3.judul,
                      document_type: 'surat penugasan',
                    };
                  }
                ),
                ...riwayatPoinPenilaianLastItem.dokumen_pendukung_file_detail.map(
                  (item3) => {
                    return {
                      ...item3,
                      value: item3.id,
                      label: item3.title,
                      document_type: 'file',
                    };
                  }
                ),
              ],
            };
          }
          formatFormState[item.order_number] = {
            id: item.id,
            item_number: item.item_number,
            value: riwayatPoinPenilaianLastItem?.score || null,
            max_score: item.max_score,
            dokumen_pendukung_surat_penugasan: [],
          };
          // if (item.riwayat_poin_penilaian_detail.length > 0) {
          //   item.dokumen_pendukung_surat_penugasan_detail.forEach((item3) => {
          //     formatFormState[item.order_number][
          //       'dokumen_pendukung_surat_penugasan'
          //     ].push({
          //       label: item3.judul,
          //       value: item3.id,
          //     });
          //   });
          // }
          if (item.nama === 'Kriteria 0') {
            formatFormState[item.order_number]['description'] = item.element;
          } else {
            formatFormState[item.order_number]['description'] = item.deskripsi;
          }
        }
      });
      formatCriteriaState['Kriteria 0'] = true;
      reset(formatFormState);
      setCounter(formatCounter);
      setCriteriaState(formatCriteriaState);
      setMatriksEdit(formatMatriksPenilaianEdit);
      setScoreLoading({ ...formatMatriksPenilaianEdit });
      setDocumentLoading({ ...formatMatriksPenilaianEdit });
      setPoinPenilaianLoading(formatPoinPenilaianLoading);
    }
  }, [data, reset]);

  const { register: register2, handleSubmit: handleSubmit2 } = useForm();

  const onSubmit2 = (values) => {
    const filterKriteria = [];

    data.data.forEach((item) => {
      let found = false;

      if (item.poin_penilaian_detail) {
        item.poin_penilaian_detail.forEach((item2) => {
          if (
            item2.element.toLowerCase().includes(values.search.toLowerCase()) ||
            item2.description
              .toLowerCase()
              .includes(values.search.toLowerCase())
          ) {
            if (found) {
              filterKriteria[filterKriteria.length - 1].poin_penilaian_detail =
                [
                  ...filterKriteria[filterKriteria.length - 1]
                    .poin_penilaian_detail,
                  item2,
                ];
            } else {
              filterKriteria.push(item);
              filterKriteria[filterKriteria.length - 1].poin_penilaian_detail =
                [item2];
              found = true;
            }
          }
        });
      } else {
        if (
          item.element.toLowerCase().includes(values.search.toLowerCase()) ||
          item.description.toLowerCase().includes(values.search.toLowerCase())
        ) {
          filterKriteria.push(item);
        }
      }
      found = false;
    });

    setFilteredKriteria(filterKriteria);
  };

  return (
    <section className="section-container">
      <DetailModal
        openModal2={openModal2}
        setOpenModal2={setOpenModal2}
        selectedDokumenPendukung2={selectedDokumenPendukung2}
        semesterName={semesterName}
      />
      <AddModal
        dokumenPendukungList={dokumenPendukungList}
        pointId={pointId}
        setPointId={setPointId}
        setDocumentLoading={setDocumentLoading}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedDokumenPendukung={selectedDokumenPendukung}
        setSelectedDokumenPendukung={setSelectedDokumenPendukung}
        semesterName={semesterName}
        suratPenugasanData={suratPenugasanData}
        selectedPoinPenilaian={selectedPoinPenilaian}
        patchPoinPenilaian={patchPoinPenilaian}
        kriteriaRefetch={kriteriaRefetch}
        counter={counter}
        setCounter={setCounter}
      />
      <form
        onSubmit={handleSubmit2(onSubmit2)}
        className="flex flex-row space-x-3 items-center"
      >
        <input
          className={`accent-primary-400 focus:outline-none w-[24rem] rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
          placeholder={`Cari`}
          {...register2('search')}
        />
        <PrimaryButton>Cari</PrimaryButton>
      </form>
      <p className="font-semibold text-lg mt-4">Matriks Penilaian</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Table
          setPoinPenilaianLoading={setPoinPenilaianLoading}
          poinPenilaianLoading={poinPenilaianLoading}
          postRiwayatPoinPenilaian={postRiwayatPoinPenilaian}
          selectedPoinPenilaian={selectedPoinPenilaian}
          setPointId={setPointId}
          pointId={pointId}
          data={filteredKriteria ? filteredKriteria : data ? data.data : []}
          counter={counter}
          setCounter={setCounter}
          setCriteriaState={setCriteriaState}
          criteriaState={criteriaState}
          control={control}
          setScoreLoading={setScoreLoading}
          patchPoinPenilaian={patchPoinPenilaian}
          kriteriaRefetch={kriteriaRefetch}
          scoreLoading={scoreLoading}
          setSelectedDokumenPendukung2={setSelectedDokumenPendukung2}
          setOpenModal2={setOpenModal2}
          setMatriksEdit={setMatriksEdit}
          matriksEdit={matriksEdit}
          setDocumentLoading={setDocumentLoading}
          documentLoading={documentLoading}
          setSelectedDokumenPendukung={setSelectedDokumenPendukung}
          setSelectedPoinPenilaian={setSelectedPoinPenilaian}
          setOpenModal={setOpenModal}
        />
        <PrimaryButton className="mt-4 ml-auto">Simulasi</PrimaryButton>
      </form>
    </section>
  );
};

export default TableForm;
