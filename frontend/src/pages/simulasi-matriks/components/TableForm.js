/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { BiPlusCircle, BiSolidDownArrow } from 'react-icons/bi';
import { TooltipInfo } from '../../../components/Tooltip';
import { useCheckRole } from '../../../hooks/useCheckRole';
import {
  useKriteriaByDokumenAkreditasi,
  useKriteriaByDokumenAkreditasiAndSimulasiMatriks,
} from '../../../hooks/useKriteria';
import { Controller, useForm } from 'react-hook-form';
import { useParams } from 'react-router-dom';
import { BeatLoader } from 'react-spinners';
import { yellow400 } from '../../../utils/colors';
import { DeleteIcon } from '../../../components/IconButton';
import EditButton from '../../../components/EditButton';
import { PrimaryButton } from '../../../components/PrimaryButton';
import CancelButton from '../../../components/CancelButton';
import AddModal from './AddModal';
import { useFileData } from '../../../hooks/useFile.js';
import { useSuratPenugasanData } from '../../../hooks/useSuratPenugasan';
import {
  usePatchRiwayatPoinPenilaian,
  usePostRiwayatPoinPenilaian,
} from '../../../hooks/useRiwayatPoinPenilaian';

const TableForm = ({ simulasiMatriksData }) => {
  const [criteriaState, setCriteriaState] = useState();
  const [selectedPoinPenilaian, setSelectedPoinPenilaian] = useState();
  const [answerData, setAnswerData] = useState();
  const userRole = useCheckRole();
  const { id } = useParams();
  const [pointId, setPointId] = useState();
  const [selectedDokumenPendukung, setSelectedDokumenPendukung] =
    useState(null);
  const [selectedDokumenPendukung2, setSelectedDokumenPendukung2] =
    useState(null);
  const [matriksEdit, setMatriksEdit] = useState({});
  const [openModal2, setOpenModal2] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [poinPenilaianLoading, setPoinPenilaianLoading] = useState({});
  const [dokumenPendukungList, setDokumenPendukungList] = useState([]);

  const { data: matriksPenilaianData, refetch: matriksPenilaianDataRefetch } =
    useKriteriaByDokumenAkreditasiAndSimulasiMatriks(
      simulasiMatriksData?.dokumenAkreditasiId,
      id,
      {
        select: (response) => response.data,
        enabled: !!simulasiMatriksData,
      }
    );

  const { mutate: patchRiwayatPoinPenilaian } = usePatchRiwayatPoinPenilaian();
  const { mutate: postRiwayatPoinPenilaian } = usePostRiwayatPoinPenilaian();

  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({});

  const onSubmit = (values) => {
    let filteredValues = [];
    let countMaxScore = 0;

    for (const id in values) {
      const item = values[id];
      countMaxScore += item.max_score;
    }

    const formattedObject = {
      number: 0,
      name: '',
      total: 0,
      mark: 0,
      max_score: 0,
      mark_counted: 0,
      weight_percent: 0,
    };
    const totalSimulation = {
      name: 'total',
      total: 0,
      mark_counted: 0,
      max_score: countMaxScore,
      weight_percent: 0,
    };

    for (const id in values) {
      const item = values[id];

      totalSimulation.total += 1;
      totalSimulation.mark_counted += (item.value / 4) * item.max_score;
      totalSimulation.weight_percent += (item.max_score / countMaxScore) * 100;

      if (item.description === formattedObject.name) {
        formattedObject['mark'] += item.value;
        formattedObject['mark_counted'] += (item.value / 4) * item.max_score;
        formattedObject['max_score'] += item.max_score;
        formattedObject['weight_percent'] +=
          (item.max_score / countMaxScore) * 100;
        formattedObject['total'] += 1;
      } else {
        formattedObject['number'] = item.item_number;
        formattedObject['name'] = item.description;
        formattedObject['total'] = 1;
        formattedObject['mark'] = item.value;
        formattedObject['mark_counted'] = (item.value / 4) * item.max_score;
        formattedObject['max_score'] = item.max_score;
        formattedObject['weight_percent'] =
          (item.max_score / countMaxScore) * 100;
      }

      if (formattedObject.name !== values[Number(id) + 1]?.description) {
        filteredValues.push({ ...formattedObject });
      }
    }
    filteredValues.push(totalSimulation);

    let radarLabels = [];
    let radarData = [];

    filteredValues.forEach((item) => {
      if (item.name !== 'total') {
        radarLabels.push(item.name);
        radarData.push((item.mark_counted / item.max_score) * 100);
      }
    });

    // setRadarData({ label: radarLabels, data: radarData });
    // setSimulateData(filteredValues);
  };

  const timeoutCounter = useRef({});

  useEffect(() => {
    if (pointId) {
      clearTimeout(timeoutCounter.current[pointId]);

      const riwayatPoinPenilaianFormData = new FormData();

      riwayatPoinPenilaianFormData.append(
        'simulasiMatriksId',
        simulasiMatriksData.id
      );
      riwayatPoinPenilaianFormData.append('score', answerData[pointId].score);

      riwayatPoinPenilaianFormData.append(
        'poinPenilaianId',
        selectedPoinPenilaian?.id
      );

      answerData[pointId].dokumenPendukung.forEach((item) => {
        if (item.document_type === 'file') {
          riwayatPoinPenilaianFormData.append(
            'dokumenPendukungFile',
            item.value
          );
        } else if (item.document_type === 'surat penugasan') {
          riwayatPoinPenilaianFormData.append(
            'dokumenPendukungSuratPenugasan',
            item.value
          );
        }
      });

      timeoutCounter.current[pointId] = setTimeout(() => {
        setPoinPenilaianLoading((prev) => {
          let copyPoinPenilaianLoading = { ...prev };

          copyPoinPenilaianLoading[selectedPoinPenilaian.id] = 'loading';
          return copyPoinPenilaianLoading;
        });

        if (answerData[selectedPoinPenilaian.id].riwayatId) {
          patchRiwayatPoinPenilaian(
            {
              id: answerData[selectedPoinPenilaian.id].riwayatId,
              data: riwayatPoinPenilaianFormData,
            },
            {
              onSuccess: () => {
                setPoinPenilaianLoading((prev) => {
                  let copyPoinPenilaianLoading = { ...prev };

                  copyPoinPenilaianLoading[selectedPoinPenilaian.id] =
                    'updated';
                  return copyPoinPenilaianLoading;
                });
                setTimeout(() => {
                  setPoinPenilaianLoading((prev) => {
                    let copyPoinPenilaianLoading = { ...prev };

                    copyPoinPenilaianLoading[selectedPoinPenilaian.id] =
                      'stale';
                    return copyPoinPenilaianLoading;
                  });
                }, 2000);
              },
            }
          );
        } else {
          postRiwayatPoinPenilaian(riwayatPoinPenilaianFormData, {
            onSuccess: () => {
              setPoinPenilaianLoading((prev) => {
                let copyPoinPenilaianLoading = { ...prev };

                copyPoinPenilaianLoading[selectedPoinPenilaian.id] = 'updated';
                return copyPoinPenilaianLoading;
              });
              setTimeout(() => {
                setPoinPenilaianLoading((prev) => {
                  let copyPoinPenilaianLoading = { ...prev };

                  copyPoinPenilaianLoading[selectedPoinPenilaian.id] = 'stale';
                  return copyPoinPenilaianLoading;
                });
              }, 2000);
            },
          });
        }
      }, 800);
    }
  }, [answerData, pointId]);

  useEffect(() => {
    if (matriksPenilaianData) {
      const criteriaLocalStorage = JSON.parse(
        localStorage.getItem('criteriaStateSimulasiMatriks')
      );

      let formatCriteriaState = {};

      if (criteriaLocalStorage) {
        formatCriteriaState = { ...criteriaLocalStorage };
      } else {
        matriksPenilaianData.forEach((item) => {
          formatCriteriaState[item.nama] = false;
        });

        formatCriteriaState['Kriteria 0'] = true;
      }

      const formatAnswerData = {};

      matriksPenilaianData.forEach((item) => {
        item.poin_penilaian_detail.forEach((item2) => {
          if (item2.riwayat_poin_penilaian_detail.length === 0) {
            formatAnswerData[item2.id] = {
              max_score: item2.max_score,
              item_number: item2.item_number,
              description: item2.description,
              riwayatId: false,
              dokumenPendukung: [],
              score: 0,
            };
          } else {
            item2.riwayat_poin_penilaian_detail.forEach((item3) => {
              formatAnswerData[item2.id] = {
                ...item3,
                max_score: item2.max_score,
                item_number: item2.item_number,
                description: item2.description,
                riwayatId: item3.id,
                dokumenPendukung: [
                  ...item3.dokumen_pendukung_surat_penugasan_detail.map(
                    (item3) => {
                      return {
                        ...item3,
                        value: item3.id,
                        label: item3.judul,
                        document_type: 'surat penugasan',
                      };
                    }
                  ),
                  ...item3.dokumen_pendukung_file_detail.map((item3) => {
                    return {
                      ...item3,
                      value: item3.id,
                      label: item3.title,
                      document_type: 'file',
                    };
                  }),
                ],
              };
            });
          }
        });
      });

      setAnswerData(formatAnswerData);
      setCriteriaState(formatCriteriaState);
    }
  }, [matriksPenilaianData]);

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

  useEffect(() => {
    if (fileData && suratPenugasanData) {
      setDokumenPendukungList([...fileData, ...suratPenugasanData]);
    }
  }, [fileData, suratPenugasanData]);

  const TableTh = ({ children, className }) => {
    return (
      <th className={`font-semibold border-r border-gray-300 p-3 ${className}`}>
        {children}
      </th>
    );
  };
  const TableTd = ({ children, className }) => {
    return (
      <td className={`border-gray-300 border-t border-r p-3 ${className}`}>
        {children}
      </td>
    );
  };

  const LoadingInfo = () => (
    <div className="flex items-center justify-center rounded-lg bg-yellow-50 border-yellow-400 border px-2 py-1 mt-3">
      <p className="text-yellow-500">Loading...</p>
      <BeatLoader size={9} color={yellow400} />
    </div>
  );
  const UpdatedInfo = () => (
    <div className="flex items-center justify-center rounded-lg bg-green-50 border-green-400 border px-2 py-1 mt-3">
      <p className="text-green-500">Updated</p>
    </div>
  );

  useEffect(() => {
    console.log(matriksPenilaianData);
  }, [matriksPenilaianData]);

  return (
    <>
      <AddModal
        dokumenPendukungList={dokumenPendukungList}
        pointId={pointId}
        setPointId={setPointId}
        openModal={openModal}
        setOpenModal={setOpenModal}
        selectedDokumenPendukung={selectedDokumenPendukung}
        setSelectedDokumenPendukung={setSelectedDokumenPendukung}
        suratPenugasanData={suratPenugasanData}
        selectedPoinPenilaian={selectedPoinPenilaian}
        matriksPenilaianDataRefetch={matriksPenilaianDataRefetch}
        answerData={answerData}
        setAnswerData={setAnswerData}
      />
      <section className="section-container mt-4">
        <form onSubmit={handleSubmit(onSubmit)}>
          <table className="w-full mt-5">
            <thead className="table table-fixed w-full relative">
              <tr>
                <TableTh className="w-20">Jenis</TableTh>
                <TableTh className="w-20">No. Urut</TableTh>
                <TableTh className="w-20">No. Butir</TableTh>
                <TableTh className="w-20">Bobot dari 400</TableTh>
                <TableTh className="w-[15%]">Elemen Penilaian LAM</TableTh>
                <TableTh>Deskriptor</TableTh>
                <TableTh className="w-16">1</TableTh>
                <TableTh className="w-16">2</TableTh>
                <TableTh className="w-16">3</TableTh>
                <TableTh className="w-16">4</TableTh>
                <TableTh className="w-[10%]">Nilai</TableTh>
                {/* {userRole.admin && (
                  <>
                    <TableTh className="">Nilai Audit UPM</TableTh>
                    <TableTh className="">Komentar UPM</TableTh>
                  </>
                )} */}
                <TableTh className="w-[20%] z-10">Dokumen Pendukung</TableTh>
                <TableTh className="w-40 border-r-0">Status</TableTh>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan="8" className="h-1 bg-primary-400 rounded"></td>
              </tr>
            </tbody>
            {answerData &&
              criteriaState &&
              matriksPenilaianData?.map((item, index) => {
                let matriksList = [];
                if (item.nama !== 'Kriteria 0') {
                  matriksList.push(
                    <tbody
                      key={item.id}
                      className="cursor-pointer"
                      onClick={() =>
                        setCriteriaState((e) => {
                          let criteriaState2 = { ...e };
                          criteriaState2[item.nama] =
                            !criteriaState2[item.nama];
                          localStorage.setItem(
                            'criteriaStateSimulasiMatriks',
                            JSON.stringify(criteriaState2)
                          );
                          return criteriaState2;
                        })
                      }
                    >
                      <tr>
                        <td
                          colSpan="8"
                          className="py-3 my-0.5 px-6 bg-primary-400 rounded-lg text-white flex justify-between items-center"
                        >
                          <p>
                            {item.nama} {item.deskripsi}
                          </p>
                          <BiSolidDownArrow
                            size={13}
                            className={`duration-200 ${
                              criteriaState[item.nama]
                                ? 'rotate-0'
                                : 'rotate-180'
                            }`}
                          />
                        </td>
                      </tr>
                    </tbody>
                  );
                  matriksList.push(
                    <tbody
                      key={item.nama + ' child'}
                      className={`w-full table-fixed ${
                        criteriaState[item.nama] ? 'block' : 'hidden'
                      }`}
                    >
                      {item.poin_penilaian_detail.map((item2) => (
                        <tr className="w-full" key={item2.order_number}>
                          <TableTd className="text-center w-20">
                            {item2.type}
                          </TableTd>
                          <TableTd className="text-center w-20">
                            {item2.order_number}
                          </TableTd>
                          <TableTd className="text-center w-20">
                            {item2.item_number}
                          </TableTd>
                          <TableTd className="text-center w-20">
                            {item2.max_score}
                          </TableTd>
                          <TableTd className="w-[15%]">{item2.element}</TableTd>
                          <TableTd>{item2.description}</TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_1}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_2}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_3}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_4}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <Controller
                            control={control}
                            name={`${item2.order_number}`}
                            render={({ field }) => {
                              return (
                                <>
                                  <td className="border-gray-300 border-t border-r p-3 w-[10%]">
                                    <input
                                      type="number"
                                      {...field}
                                      className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
                                        false && '!border-primary-400'
                                      }`}
                                      onChange={(e) => {
                                        field.onChange({
                                          ...field.value,
                                          value: e.target.value,
                                        });
                                        setSelectedPoinPenilaian(item2);
                                        setAnswerData((prev) => {
                                          let copyCounter = { ...prev };
                                          copyCounter[item2.id] = {
                                            ...copyCounter[item2.id],
                                            score: e.target.value,
                                          };
                                          return copyCounter;
                                        });
                                        setPointId(item2.id);
                                      }}
                                      value={answerData[item2.id].score || ''}
                                    />
                                  </td>
                                  <td className="border-gray-300 border-t border-r p-3 w-[20%] space-y-3">
                                    {/* {answerData[item2.id]?.dokumenPendukung.map(
                                      (item3) => {
                                        return (
                                          <div
                                            key={item3.id}
                                            className="w-full flex flex-row items-center space-x-2"
                                          >
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedDokumenPendukung2(
                                                  item3
                                                );
                                                setOpenModal2((prev) => !prev);
                                              }}
                                              className=" bg-gray-700 hover:bg-gray-800 duration-200 transition-all px-4 py-1 border border-gray-700 rounded-full cursor-pointer"
                                            >
                                              <p className="overflow-hidden break-all overflow-ellipsisfont-medium line-clamp-1 text-white">
                                                {item3.label}
                                              </p>
                                            </button>
                                            {matriksEdit[item2.id] && (
                                              <DeleteIcon
                                                className="shrink-0"
                                                onClick={() => {
                                                  setSelectedPoinPenilaian(item2);
                                                  setAnswerData((prev) => {
                                                    let copyCounter = { ...prev };
                                                    copyCounter[item2.id] = {
                                                      ...copyCounter[item2.id],
                                                      dokumenPendukung:
                                                        copyCounter[
                                                          item2.id
                                                        ].dokumenPendukung.filter(
                                                          (item) =>
                                                            item.value !==
                                                            item3.value
                                                        ),
                                                    };
                                                    return copyCounter;
                                                  });
                                                  setPointId(item2.id);
                                                  // setDocumentLoading((prev) => {
                                                  //   let dupeDocumentLoading = {
                                                  //     ...prev,
                                                  //   };
                                                  //   dupeDocumentLoading[item2.id] =
                                                  //     'loading';
                                                  //   return dupeDocumentLoading;
                                                  // });
                                                  // patchPoinPenilaian(
                                                  //   {
                                                  //     data: {
                                                  //       dokumenPendukungSuratPenugasan:
                                                  //         item2.dokumenPendukungSuratPenugasan.filter(
                                                  //           (item) => item !== item3.id
                                                  //         ),
                                                  //     },
                                                  //     id: item2.id,
                                                  //   },
                                                  //   {
                                                  //     onSuccess: () => {
                                                  //       setDocumentLoading((prev) => {
                                                  //         let dupeDocumentLoading = {
                                                  //           ...prev,
                                                  //         };
                                                  //         dupeDocumentLoading[item2.id] =
                                                  //           'updated';
                                                  //         return dupeDocumentLoading;
                                                  //       });
                                                  //       kriteriaRefetch();
                                                  //     },
                                                  //   }
                                                  // );
                                                }}
                                              />
                                            )}
                                          </div>
                                        );
                                      }
                                    )} */}
                                    <div className="flex space-x-2">
                                      {matriksEdit[item2.id] ? (
                                        <CancelButton
                                          onClick={() => {
                                            setMatriksEdit((prev) => {
                                              const changeMatriksEdit = {
                                                ...prev,
                                              };
                                              changeMatriksEdit[
                                                item2.id
                                              ] = false;
                                              return changeMatriksEdit;
                                            });
                                          }}
                                        />
                                      ) : (
                                        answerData[item2.id]?.dokumenPendukung
                                          .length !== 0 && (
                                          <EditButton
                                            onClick={() => {
                                              setMatriksEdit((prev) => {
                                                const changeMatriksEdit = {
                                                  ...prev,
                                                };
                                                changeMatriksEdit[
                                                  item2.id
                                                ] = true;
                                                return changeMatriksEdit;
                                              });
                                            }}
                                            name="Edit"
                                            className="text-base"
                                          />
                                        )
                                      )}
                                      <PrimaryButton
                                        onClick={() => {
                                          setSelectedDokumenPendukung(false);
                                          setSelectedPoinPenilaian(item2);
                                          setOpenModal((prev) => !prev);
                                        }}
                                        type="button"
                                        icon={<BiPlusCircle size={22} />}
                                      >
                                        Tambah
                                      </PrimaryButton>
                                    </div>
                                  </td>
                                </>
                              );
                            }}
                          />
                          <TableTd className="w-40 border-r-0">
                            {poinPenilaianLoading[item2.id] === 'loading' && (
                              <LoadingInfo />
                            )}
                            {poinPenilaianLoading[item2.id] === 'updated' && (
                              <UpdatedInfo />
                            )}
                          </TableTd>
                        </tr>
                      ))}
                    </tbody>
                  );
                } else {
                  matriksList.push(
                    <tbody
                      key={item.nama + ' child'}
                      className={`w-full table-fixed ${
                        criteriaState[item.nama] ? 'block' : 'hidden'
                      }`}
                    >
                      {item.poin_penilaian_detail.map((item2) => (
                        <tr className="w-full" key={item2.order_number}>
                          <TableTd className="text-center w-20">
                            {item2.type}
                          </TableTd>
                          <TableTd className="text-center w-20">
                            {item2.order_number}
                          </TableTd>
                          <TableTd className="text-center w-20">
                            {item2.item_number}
                          </TableTd>
                          <TableTd className="text-center w-20">
                            {item2.max_score}
                          </TableTd>
                          <TableTd className="w-[15%]">{item2.element}</TableTd>
                          <TableTd>{item2.description}</TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_1}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_2}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_3}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <TableTd className="relative w-16">
                            <div className="flex justify-center">
                              <TooltipInfo>
                                {item2.description_grade_4}
                              </TooltipInfo>
                            </div>
                          </TableTd>
                          <Controller
                            control={control}
                            name={`${item2.order_number}`}
                            render={({ field }) => {
                              return (
                                <>
                                  <td className="border-gray-300 border-t border-r p-3 w-[10%]">
                                    <input
                                      type="number"
                                      {...field}
                                      className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
                                        false && '!border-primary-400'
                                      }`}
                                      onChange={(e) => {
                                        field.onChange({
                                          ...field.value,
                                          value: e.target.value,
                                        });
                                        setSelectedPoinPenilaian(item2);
                                        setAnswerData((prev) => {
                                          let copyCounter = { ...prev };
                                          copyCounter[item2.id] = {
                                            ...copyCounter[item2.id],
                                            score: e.target.value,
                                          };
                                          return copyCounter;
                                        });
                                        setPointId(item2.id);
                                      }}
                                      value={answerData[item2.id].score || ''}
                                    />
                                  </td>
                                  <td className="border-gray-300 border-t border-r p-3 w-[20%] space-y-3">
                                    {answerData[item2.id]?.dokumenPendukung.map(
                                      (item3) => {
                                        return (
                                          <div
                                            key={item3.id}
                                            className="w-full flex flex-row items-center space-x-2"
                                          >
                                            <button
                                              type="button"
                                              onClick={() => {
                                                setSelectedDokumenPendukung2(
                                                  item3
                                                );
                                                setOpenModal2((prev) => !prev);
                                              }}
                                              className=" bg-gray-700 hover:bg-gray-800 duration-200 transition-all px-4 py-1 border border-gray-700 rounded-full cursor-pointer"
                                            >
                                              <p className="overflow-hidden break-all overflow-ellipsisfont-medium line-clamp-1 text-white">
                                                {item3.label}
                                              </p>
                                            </button>
                                            {matriksEdit[item2.id] && (
                                              <DeleteIcon
                                                className="shrink-0"
                                                onClick={() => {
                                                  setSelectedPoinPenilaian(
                                                    item2
                                                  );
                                                  setAnswerData((prev) => {
                                                    let copyCounter = {
                                                      ...prev,
                                                    };
                                                    copyCounter[item2.id] = {
                                                      ...copyCounter[item2.id],
                                                      dokumenPendukung:
                                                        copyCounter[
                                                          item2.id
                                                        ].dokumenPendukung.filter(
                                                          (item) =>
                                                            item.value !==
                                                            item3.value
                                                        ),
                                                    };
                                                    return copyCounter;
                                                  });
                                                  setPointId(item2.id);
                                                  // setDocumentLoading((prev) => {
                                                  //   let dupeDocumentLoading = {
                                                  //     ...prev,
                                                  //   };
                                                  //   dupeDocumentLoading[item2.id] =
                                                  //     'loading';
                                                  //   return dupeDocumentLoading;
                                                  // });
                                                  // patchPoinPenilaian(
                                                  //   {
                                                  //     data: {
                                                  //       dokumenPendukungSuratPenugasan:
                                                  //         item2.dokumenPendukungSuratPenugasan.filter(
                                                  //           (item) => item !== item3.id
                                                  //         ),
                                                  //     },
                                                  //     id: item2.id,
                                                  //   },
                                                  //   {
                                                  //     onSuccess: () => {
                                                  //       setDocumentLoading((prev) => {
                                                  //         let dupeDocumentLoading = {
                                                  //           ...prev,
                                                  //         };
                                                  //         dupeDocumentLoading[item2.id] =
                                                  //           'updated';
                                                  //         return dupeDocumentLoading;
                                                  //       });
                                                  //       kriteriaRefetch();
                                                  //     },
                                                  //   }
                                                  // );
                                                }}
                                              />
                                            )}
                                          </div>
                                        );
                                      }
                                    )}
                                    <div className="flex space-x-2">
                                      {matriksEdit[item2.id] ? (
                                        <CancelButton
                                          onClick={() => {
                                            setMatriksEdit((prev) => {
                                              const changeMatriksEdit = {
                                                ...prev,
                                              };
                                              changeMatriksEdit[
                                                item2.id
                                              ] = false;
                                              return changeMatriksEdit;
                                            });
                                          }}
                                        />
                                      ) : // answerData[item2.id]?.dokumenPendukung
                                      //   .length !== 0 && (
                                      //   <EditButton
                                      //     onClick={() => {
                                      //       setMatriksEdit((prev) => {
                                      //         const changeMatriksEdit = {
                                      //           ...prev,
                                      //         };
                                      //         changeMatriksEdit[
                                      //           item2.id
                                      //         ] = true;
                                      //         return changeMatriksEdit;
                                      //       });
                                      //     }}
                                      //     name="Edit"
                                      //     className="text-base"
                                      //   />
                                      // )
                                      null}
                                      <PrimaryButton
                                        onClick={() => {
                                          setSelectedDokumenPendukung(false);
                                          setSelectedPoinPenilaian(item2);
                                          setOpenModal((prev) => !prev);
                                        }}
                                        type="button"
                                        icon={<BiPlusCircle size={22} />}
                                      >
                                        Tambah
                                      </PrimaryButton>
                                    </div>
                                  </td>
                                </>
                              );
                            }}
                          />
                          <TableTd className="w-40 border-r-0">
                            {poinPenilaianLoading[item2.id] === 'loading' && (
                              <LoadingInfo />
                            )}
                            {poinPenilaianLoading[item2.id] === 'updated' && (
                              <UpdatedInfo />
                            )}
                          </TableTd>
                        </tr>
                      ))}
                    </tbody>
                  );
                }
                return matriksList;
              })}
          </table>
        </form>
      </section>
    </>
  );
};

export default TableForm;
