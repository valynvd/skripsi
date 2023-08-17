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

const TableForm = ({ handleSubmit, onSubmit, control, errors, reset }) => {
  const { data, refetch: kriteriaRefetch } = useKriteriaData();
  const { data: suratPenugasanData } = useSuratPenugasanData({
    select: (response) =>
      response.data.map(({ judul, id, ...options }) => {
        return { label: judul, value: id, ...options };
      }),
  });
  const [criteriaState, setCriteriaState] = useState({});
  const [openModal, setOpenModal] = useState(false);
  const [openModal2, setOpenModal2] = useState(false);
  const [selectedSuratPenugasan, setSelectedSuratPenugasan] = useState(null);
  const [selectedSuratPenugasan2, setSelectedSuratPenugasan2] = useState(null);
  const [selectedPoinPenilaian, setSelectedPoinPenilaian] = useState(null);
  const [matriksEdit, setMatriksEdit] = useState({});
  const [scoreLoading, setScoreLoading] = useState({});
  const [documentLoading, setDocumentLoading] = useState({});
  const { mutate: patchPoinPenilaian } = usePatchPoinPenilaian();
  const [filteredKriteria, setFilteredKriteria] = useState();

  const semesterName = {
    Odd: 'Ganjil',
    'Odd Short': 'Pendek Ganjil',
    Even: 'Genap',
    'Even Short': 'Pendek Genap',
  };

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
          formatCriteriaState[item.nama] = true;
        });
      }

      const formatFormState = {};
      const formatMatriksPenilaianEdit = {};
      const formatScoreAndDocumentLoading = {};

      data.data.forEach((item) => {
        item.poin_penilaian_detail.forEach((item2) => {
          formatMatriksPenilaianEdit[item2.id] = false;
          formatScoreAndDocumentLoading[item2.id] = 'stale';

          formatFormState[item2.order_number] = {
            id: item2.id,
            item_number: item2.item_number,
            value: item2.score,
            max_score: item2.max_score,
            dokumen_pendukung: [],
          };

          item2.dokumen_pendukung_detail.forEach((item3) => {
            formatFormState[item2.order_number]['dokumen_pendukung'].push({
              label: item3.judul,
              value: item3.id,
            });
          });

          if (item.nama === 'Kriteria 0') {
            formatFormState[item2.order_number]['description'] = item2.element;
          } else {
            formatFormState[item2.order_number]['description'] = item.deskripsi;
          }
        });
      });

      formatCriteriaState['Kriteria 0'] = true;
      reset(formatFormState);

      setCriteriaState(formatCriteriaState);
      setMatriksEdit(formatMatriksPenilaianEdit);
      setScoreLoading({ ...formatMatriksPenilaianEdit });
      setDocumentLoading({ ...formatMatriksPenilaianEdit });
    }
  }, [data, reset]);

  const { register: register2, handleSubmit: handleSubmit2 } = useForm();

  const onSubmit2 = (values) => {
    const filterKriteria = [];

    data.data.forEach((item) => {
      let found = false;

      item.poin_penilaian_detail.forEach((item2) => {
        if (
          item2.element.toLowerCase().includes(values.search.toLowerCase()) ||
          item2.description.toLowerCase().includes(values.search.toLowerCase())
        ) {
          if (found) {
            filterKriteria[filterKriteria.length - 1].poin_penilaian_detail = [
              ...filterKriteria[filterKriteria.length - 1]
                .poin_penilaian_detail,
              item2,
            ];
          } else {
            filterKriteria.push(item);
            filterKriteria[filterKriteria.length - 1].poin_penilaian_detail = [
              item2,
            ];
            found = true;
          }
        }
      });

      found = false;
    });

    setFilteredKriteria(filterKriteria);
  };

  return (
    <section className="section-container mt-4">
      <DetailModal
        openModal2={openModal2}
        setOpenModal2={setOpenModal2}
        selectedSuratPenugasan2={selectedSuratPenugasan2}
        semesterName={semesterName}
      />
      <AddModal
        setDocumentLoading={setDocumentLoading}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedSuratPenugasan={selectedSuratPenugasan}
        setSelectedSuratPenugasan={setSelectedSuratPenugasan}
        semesterName={semesterName}
        suratPenugasanData={suratPenugasanData}
        selectedPoinPenilaian={selectedPoinPenilaian}
        patchPoinPenilaian={patchPoinPenilaian}
        kriteriaRefetch={kriteriaRefetch}
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
          data={filteredKriteria ? filteredKriteria : data ? data.data : []}
          setCriteriaState={setCriteriaState}
          criteriaState={criteriaState}
          control={control}
          setScoreLoading={setScoreLoading}
          patchPoinPenilaian={patchPoinPenilaian}
          kriteriaRefetch={kriteriaRefetch}
          scoreLoading={scoreLoading}
          setSelectedSuratPenugasan2={setSelectedSuratPenugasan2}
          setOpenModal2={setOpenModal2}
          setMatriksEdit={setMatriksEdit}
          matriksEdit={matriksEdit}
          setDocumentLoading={setDocumentLoading}
          documentLoading={documentLoading}
          setSelectedSuratPenugasan={setSelectedSuratPenugasan}
          setSelectedPoinPenilaian={setSelectedPoinPenilaian}
          setOpenModal={setOpenModal}
        />
        <PrimaryButton className="mt-4 ml-auto">Simulasi</PrimaryButton>
      </form>
    </section>
  );
};

export default TableForm;
