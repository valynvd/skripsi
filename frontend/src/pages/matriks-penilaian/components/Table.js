/* eslint-disable no-unused-vars */
import React, { useEffect, useRef, useState } from 'react';
import { BiSolidDownArrow } from 'react-icons/bi';
import { Controller } from 'react-hook-form';
import { TooltipInfo } from '../../../components/Tooltip';
import { BeatLoader } from 'react-spinners';
import { yellow400 } from '../../../utils/colors';
import { DeleteIcon } from '../../../components/IconButton';
import CancelButton from '../../../components/CancelButton';
import EditButton from '../../../components/EditButton';
import { BiPlusCircle } from 'react-icons/bi';
import { PrimaryButton } from '../../../components/PrimaryButton';
import useAuth from '../../../hooks/useAuth';
import { useCheckRole } from '../../../hooks/useCheckRole';

const Table = ({
  setPoinPenilaianLoading,
  poinPenilaianLoading,
  postRiwayatPoinPenilaian,
  data,
  setCriteriaState,
  criteriaState,
  control,
  setScoreLoading,
  patchPoinPenilaian,
  kriteriaRefetch,
  scoreLoading,
  setSelectedDokumenPendukung2,
  setOpenModal2,
  matriksEdit,
  setDocumentLoading,
  setMatriksEdit,
  setSelectedDokumenPendukung,
  setSelectedPoinPenilaian,
  selectedPoinPenilaian,
  setOpenModal,
  documentLoading,
  counter,
  setCounter,
  pointId,
  setPointId,
}) => {
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
  const userRole = useCheckRole();

  const timeoutCounter = useRef({});

  useEffect(() => {
    if (pointId) {
      clearTimeout(timeoutCounter.current[pointId]);

      const riwayatPoinPenilaianFormData = new FormData();

      riwayatPoinPenilaianFormData.append('score', counter[pointId].score);
      riwayatPoinPenilaianFormData.append(
        'poinPenilaianId',
        selectedPoinPenilaian?.id
      );

      counter[pointId].dokumenPendukung.forEach((item) => {
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
      }, 5000);
    }
  }, [counter, pointId]);

  // useEffect(() => {
  //   console.log(counter);
  // }, [counter]);

  // const changeCounter = (id, value) => {
  //   setCounter((prev) => {
  //     let prevCounter = { ...prev };
  //     let timeOutCounter = {};

  //     if (prev[id]) {
  //       clearTimeout(timeOutCounter[id]);
  //     }

  //     timeOutCounter[id] = setTimeout(() => {
  //       setCounter((prev2) => {
  //         let prevCounter2 = { ...prev2 };

  //         prevCounter2[id].timeout = 'finished';
  //         return prevCounter2;
  //       });
  //     }, 5000);

  //     prevCounter[id] = {
  //       ...value,
  //       status: 'waiting',
  //     };

  //     return prevCounter;
  //   });
  // };

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

  return (
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
          {userRole.admin && (
            <>
              <TableTh className="">Nilai Audit UPM</TableTh>
              <TableTh className="">Komentar UPM</TableTh>
            </>
          )}
          <TableTh className="w-[20%] z-10">Dokumen Pendukung</TableTh>
          <TableTh className="w-40 border-r-0">Status</TableTh>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="8" className="h-1 bg-primary-400 rounded"></td>
        </tr>
      </tbody>
      {data.map((item, index) => {
        let matriksList = [];

        if (item.poin_penilaian_detail) {
          matriksList.push(
            <tbody
              key={item.id}
              className="cursor-pointer"
              onClick={() =>
                setCriteriaState((e) => {
                  let dupeCriteriaState = { ...e };

                  dupeCriteriaState[item.nama] = !dupeCriteriaState[item.nama];

                  localStorage.setItem(
                    'criteriaState',
                    JSON.stringify(dupeCriteriaState)
                  );

                  return dupeCriteriaState;
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
                      criteriaState[item.nama] ? 'rotate-0' : 'rotate-180'
                    }`}
                  />
                </td>
              </tr>
            </tbody>
          );
        } else {
          matriksList.push(
            <tbody
              key={item.order_number + ' child'}
              className={`w-full table-fixed block`}
            >
              <tr className="w-full" key={item.order_number}>
                <TableTd className="text-center w-20">{item.type}</TableTd>
                <TableTd className="text-center w-20">
                  {item.order_number}
                </TableTd>
                <TableTd className="text-center w-20">
                  {item.item_number}
                </TableTd>
                <TableTd className="text-center w-20">{item.max_score}</TableTd>
                <TableTd className="w-[15%]">{item.element}</TableTd>
                <TableTd>{item.description}</TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item.description_grade_1}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item.description_grade_2}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item.description_grade_3}</TooltipInfo>
                  </div>
                </TableTd>
                <TableTd className="relative w-16">
                  <div className="flex justify-center">
                    <TooltipInfo>{item.description_grade_4}</TooltipInfo>
                  </div>
                </TableTd>
                <Controller
                  control={control}
                  name={`${item.order_number}`}
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

                              setSelectedPoinPenilaian(item);

                              setCounter((prev) => {
                                let copyCounter = { ...prev };

                                copyCounter[item.id] = {
                                  ...copyCounter[item.id],
                                  score: e.target.value,
                                };

                                return copyCounter;
                              });

                              setPointId(item.id);
                            }}
                            value={field.value?.value || ''}
                          />
                        </td>
                        <td className="border-gray-300 border-t border-r p-3 w-[20%] space-y-3">
                          {counter[item.id]?.dokumenPendukung.map((item3) => {
                            return (
                              <div
                                key={item3.id}
                                className="w-full flex flex-row items-center space-x-2"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setSelectedDokumenPendukung2(item3);
                                    setOpenModal2((prev) => !prev);
                                  }}
                                  className=" bg-gray-700 hover:bg-gray-800 duration-200 transition-all px-4 py-1 border border-gray-700 rounded-full cursor-pointer"
                                >
                                  <p className="overflow-hidden break-all overflow-ellipsisfont-medium line-clamp-1 text-white">
                                    {item3.label}
                                  </p>
                                </button>
                                {matriksEdit[item.id] && (
                                  <DeleteIcon
                                    className="shrink-0"
                                    onClick={() => {
                                      setSelectedPoinPenilaian(item);

                                      setCounter((prev) => {
                                        let copyCounter = { ...prev };

                                        copyCounter[item.id] = {
                                          ...copyCounter[item.id],
                                          dokumenPendukung: copyCounter[
                                            item.id
                                          ].dokumenPendukung.filter(
                                            (item) => item.value !== item3.value
                                          ),
                                        };

                                        return copyCounter;
                                      });

                                      setPointId(item.id);
                                      // setDocumentLoading((prev) => {
                                      //   let dupeDocumentLoading = {
                                      //     ...prev,
                                      //   };

                                      //   dupeDocumentLoading[item.id] =
                                      //     'loading';

                                      //   return dupeDocumentLoading;
                                      // });
                                      // patchPoinPenilaian(
                                      //   {
                                      //     data: {
                                      //       dokumenPendukungSuratPenugasan:
                                      //         item.dokumenPendukungSuratPenugasan.filter(
                                      //           (item) => item !== item3.id
                                      //         ),
                                      //     },
                                      //     id: item.id,
                                      //   },
                                      //   {
                                      //     onSuccess: () => {
                                      //       setDocumentLoading((prev) => {
                                      //         let dupeDocumentLoading = {
                                      //           ...prev,
                                      //         };

                                      //         dupeDocumentLoading[item.id] =
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
                          })}

                          <div className="flex space-x-2">
                            {matriksEdit[item.id] ? (
                              <CancelButton
                                onClick={() => {
                                  setMatriksEdit((prev) => {
                                    const changeMatriksEdit = { ...prev };

                                    changeMatriksEdit[item.id] = false;

                                    return changeMatriksEdit;
                                  });
                                }}
                              />
                            ) : (
                              counter[item.id]?.dokumenPendukung.length !==
                                0 && (
                                <EditButton
                                  onClick={() => {
                                    setMatriksEdit((prev) => {
                                      const changeMatriksEdit = { ...prev };

                                      changeMatriksEdit[item.id] = true;

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
                                setSelectedPoinPenilaian(item);
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
                  {poinPenilaianLoading[item.id] === 'loading' && (
                    <LoadingInfo />
                  )}
                  {poinPenilaianLoading[item.id] === 'updated' && (
                    <UpdatedInfo />
                  )}
                </TableTd>
              </tr>
            </tbody>
          );
        }

        matriksList.push(
          <tbody
            key={item.nama + ' child'}
            className={`w-full table-fixed ${
              criteriaState[item.nama] ? 'block' : 'hidden'
            }`}
          >
            {item.poin_penilaian_detail
              ? item.poin_penilaian_detail.map((item2) => (
                  <tr className="w-full" key={item2.order_number}>
                    <TableTd className="text-center w-20">{item2.type}</TableTd>
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
                        <TooltipInfo>{item2.description_grade_1}</TooltipInfo>
                      </div>
                    </TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_2}</TooltipInfo>
                      </div>
                    </TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_3}</TooltipInfo>
                      </div>
                    </TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_4}</TooltipInfo>
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

                                  setCounter((prev) => {
                                    let copyCounter = { ...prev };

                                    copyCounter[item2.id] = {
                                      ...copyCounter[item2.id],
                                      score: e.target.value,
                                    };

                                    return copyCounter;
                                  });

                                  setPointId(item2.id);
                                }}
                                value={field.value?.value || ''}
                              />
                              {scoreLoading[item2.id] === 'loading' && (
                                <LoadingInfo />
                              )}
                              {scoreLoading[item2.id] === 'updated' && (
                                <UpdatedInfo />
                              )}
                            </td>
                            <td className="border-gray-300 border-t border-r p-3 w-[20%] space-y-3">
                              {counter[item2.id]?.dokumenPendukung.map(
                                (item3) => {
                                  return (
                                    <div
                                      key={item3.id}
                                      className="w-full flex flex-row items-center space-x-2"
                                    >
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setSelectedDokumenPendukung2(item3);
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

                                            setCounter((prev) => {
                                              let copyCounter = { ...prev };

                                              copyCounter[item2.id] = {
                                                ...copyCounter[item2.id],
                                                dokumenPendukung: copyCounter[
                                                  item2.id
                                                ].dokumenPendukung.filter(
                                                  (item) =>
                                                    item.value !== item3.value
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
                                        const changeMatriksEdit = { ...prev };

                                        changeMatriksEdit[item2.id] = false;

                                        return changeMatriksEdit;
                                      });
                                    }}
                                  />
                                ) : (
                                  counter[item2.id]?.dokumenPendukung.length !==
                                    0 && (
                                    <EditButton
                                      onClick={() => {
                                        setMatriksEdit((prev) => {
                                          const changeMatriksEdit = { ...prev };

                                          changeMatriksEdit[item2.id] = true;

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
                ))
              : null}
          </tbody>
        );
        return matriksList;
      })}
    </table>
  );
};

export default Table;
