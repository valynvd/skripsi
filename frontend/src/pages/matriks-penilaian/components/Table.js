import React from 'react';
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

const Table = ({
  data,
  setCriteriaState,
  criteriaState,
  control,
  setScoreLoading,
  patchPoinPenilaian,
  kriteriaRefetch,
  scoreLoading,
  setSelectedSuratPenugasan2,
  setOpenModal2,
  matriksEdit,
  setDocumentLoading,
  setMatriksEdit,
  setSelectedSuratPenugasan,
  setSelectedPoinPenilaian,
  setOpenModal,
  documentLoading,
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
          <TableTh className="border-r-0 w-[20%] z-10">
            Dokumen Pendukung
          </TableTh>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td colSpan="8" className="h-1 bg-primary-400 rounded"></td>
        </tr>
      </tbody>
      {data.map((item, index) => {
        let matriksList = [];

        if (index !== 0) {
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
        }

        matriksList.push(
          <tbody
            key={item.nama + ' child'}
            className={`w-full table-fixed ${
              criteriaState[item.nama] ? 'block' : 'hidden'
            }`}
          >
            {item.poin_penilaian_detail.map((item2) => (
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
                  name={`${item2.id}`}
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

                              setScoreLoading((prev) => {
                                let dupeScoreLoading = { ...prev };

                                dupeScoreLoading[item2.id] = 'loading';

                                return dupeScoreLoading;
                              });

                              patchPoinPenilaian(
                                {
                                  data: {
                                    score: e.target.value,
                                  },
                                  id: item2.id,
                                },
                                {
                                  onSuccess: () => {
                                    setScoreLoading((prev) => {
                                      let dupeScoreLoading = { ...prev };

                                      dupeScoreLoading[item2.id] = 'updated';

                                      return dupeScoreLoading;
                                    });

                                    kriteriaRefetch();
                                  },
                                }
                              );
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
                          {item2.dokumen_pendukung_surat_penugasan_detail.map(
                            (item3) => {
                              return (
                                <div
                                  key={item3.id}
                                  className="w-full flex flex-row items-center space-x-2"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedSuratPenugasan2(item3);
                                      setOpenModal2((prev) => !prev);
                                    }}
                                    className=" bg-gray-700 hover:bg-gray-800 duration-200 transition-all px-4 py-1 border border-gray-700 rounded-full cursor-pointer"
                                  >
                                    <p className="overflow-hidden break-all overflow-ellipsisfont-medium line-clamp-1 text-white">
                                      {item3.judul}
                                    </p>
                                  </button>
                                  {matriksEdit[item2.id] && (
                                    <DeleteIcon
                                      className="shrink-0"
                                      onClick={() => {
                                        setDocumentLoading((prev) => {
                                          let dupeDocumentLoading = {
                                            ...prev,
                                          };

                                          dupeDocumentLoading[item2.id] =
                                            'loading';

                                          return dupeDocumentLoading;
                                        });
                                        patchPoinPenilaian(
                                          {
                                            data: {
                                              dokumenPendukungSuratPenugasan:
                                                item2.dokumenPendukungSuratPenugasan.filter(
                                                  (item) => item !== item3.id
                                                ),
                                            },
                                            id: item2.id,
                                          },
                                          {
                                            onSuccess: () => {
                                              setDocumentLoading((prev) => {
                                                let dupeDocumentLoading = {
                                                  ...prev,
                                                };

                                                dupeDocumentLoading[item2.id] =
                                                  'updated';

                                                return dupeDocumentLoading;
                                              });
                                              kriteriaRefetch();
                                            },
                                          }
                                        );
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
                              item2.dokumenPendukungSuratPenugasan.length >
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
                                setSelectedSuratPenugasan(false);
                                setSelectedPoinPenilaian(item2);
                                setOpenModal((prev) => !prev);
                              }}
                              type="button"
                              icon={<BiPlusCircle size={22} />}
                            >
                              Tambah
                            </PrimaryButton>
                          </div>
                          {documentLoading[item2.id] === 'loading' && (
                            <LoadingInfo />
                          )}
                          {documentLoading[item2.id] === 'updated' && (
                            <UpdatedInfo />
                          )}
                        </td>
                      </>
                    );
                  }}
                />
              </tr>
            ))}
          </tbody>
        );
        return matriksList;
      })}
    </table>
  );
};

export default Table;
