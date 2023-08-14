/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment, useRef } from 'react';
import { BiPlusCircle } from 'react-icons/bi';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useKriteriaData } from '../../hooks/useKriteria';
import CRUInput from '../../components/CRUInput';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { primary400 } from '../../utils/colors';
import { useSuratPenugasanData } from '../../hooks/useSuratPenugasan';
import { BiSolidDownArrow } from 'react-icons/bi';
import { TooltipInfo } from '../../components/Tooltip';
import { Dialog, Transition } from '@headlessui/react';
import { LinkIconAccepted, LinkIconRejected } from '../../components/LinkIcon';
import { usePatchPoinPenilaian } from '../../hooks/usePoinPenilaian';
import { DeleteIcon, ViewIcon } from '../../components/IconButton';

const TableForm = ({ handleSubmit, onSubmit, control, errors, reset }) => {
  const { data } = useKriteriaData();
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
  const { mutate: patchPoinPenilaian } = usePatchPoinPenilaian();

  const semesterName = {
    Odd: 'Ganjil',
    'Odd Short': 'Pendek Ganjil',
    Even: 'Genap',
    'Even Short': 'Pendek Genap',
  };

  // useEffect(() => {
  //   console.log(suratPenugasanData);
  // }, [suratPenugasanData]);

  useEffect(() => {
    if (data) {
      const formatCriteriaState = {};
      const formatFormState = {};

      data.data.forEach((item) => {
        formatCriteriaState[item.nama] = false;

        item.poin_penilaian_detail.forEach((item2) => {
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
    }
  }, [data, reset]);

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

  const { register: register2, handleSubmit: handleSubmit2 } = useForm();

  const onSubmit2 = (values) => {
    console.log(values);
  };

  return (
    <section className="section-container mt-4">
      <Transition show={openModal2} as={Fragment}>
        <Dialog
          onClose={() => {
            setOpenModal2(false);
          }}
          className={`relative z-50`}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0">
              <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="bg-white w-full max-w-[41rem] p-5 rounded-xl shadow-lg flex flex-col text-lg">
                  <Dialog.Title className="text-xl font-semibold text-black-800">
                    Detail Dokumen Pendukung
                  </Dialog.Title>
                  {selectedSuratPenugasan2 && (
                    <div className="mt-4 space-y-4">
                      <div className="flex">
                        <div className="w-1/3">
                          <p className="font-semibold">Kategori</p>
                          <p>
                            {selectedSuratPenugasan2.category || 'Tidak ada'}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className="font-semibold">Siklus</p>
                          <p>
                            {selectedSuratPenugasan2.cycle_detail
                              ? `${
                                  selectedSuratPenugasan2.cycle_detail
                                    .start_year
                                }/${
                                  selectedSuratPenugasan2.cycle_detail.end_year
                                } ${
                                  semesterName[
                                    selectedSuratPenugasan2.cycle_detail
                                      .semester
                                  ]
                                }`
                              : 'Tidak ada'}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className="font-semibold">Diterima</p>
                          <p>
                            {selectedSuratPenugasan2.approved ? (
                              <LinkIconAccepted />
                            ) : (
                              <LinkIconRejected />
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">File</p>
                        <a
                          target="_blank"
                          className={`w-full block ${
                            selectedSuratPenugasan2.files && 'text-primary-400'
                          } whitespace-nowrap overflow-hidden overflow-ellipsis`}
                          href={selectedSuratPenugasan2.files}
                          rel="noreferrer"
                        >
                          {selectedSuratPenugasan2.files || 'Tidak ada'}
                        </a>
                      </div>
                    </div>
                  )}
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
      <Transition show={openModal} as={Fragment}>
        <Dialog
          onClose={() => {
            setOpenModal(false);
          }}
          className={`relative z-50`}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30" />
          </Transition.Child>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="fixed inset-0">
              <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="bg-white w-full max-w-[41rem] p-5 rounded-xl shadow-lg flex flex-col text-lg">
                  <Dialog.Title className="text-xl font-semibold text-black-800">
                    Tambah Dokumen Pendukung
                  </Dialog.Title>
                  <Select
                    isClearable={true}
                    placeholder="pilih..."
                    theme={(theme) => ({
                      ...theme,
                      colors: {
                        ...theme.colors,
                        primary: primary400,
                        primary25: '#fde3e4',
                        primary50: '#fbd0d2',
                      },
                    })}
                    classNamePrefix="react-select"
                    styles={{
                      control: (base) => ({
                        ...base,
                        boxShadow: 'none',
                      }),
                    }}
                    classNames={{
                      control: (state) =>
                        `!px-0.5 !text-red-400 mt-4 !mx-auto !py-0.5  ${
                          state.isFocused
                            ? '!border-primary-400'
                            : '!border-gray-200'
                        }`,
                    }}
                    options={
                      suratPenugasanData && selectedPoinPenilaian
                        ? suratPenugasanData.filter(
                            (item) =>
                              !selectedPoinPenilaian.dokumenPendukung.includes(
                                item.value
                              )
                          )
                        : []
                    }
                    value={selectedSuratPenugasan}
                    onChange={(val, triggeredAction) => {
                      setSelectedSuratPenugasan(val);
                    }}
                  />
                  {selectedSuratPenugasan && (
                    <div className="mt-4 space-y-4">
                      <div className="flex">
                        <div className="w-1/3">
                          <p className="font-semibold">Kategori</p>
                          <p>
                            {selectedSuratPenugasan.category || 'Tidak ada'}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className="font-semibold">Siklus</p>
                          <p>
                            {selectedSuratPenugasan.cycle_detail
                              ? `${
                                  selectedSuratPenugasan.cycle_detail.start_year
                                }/${
                                  selectedSuratPenugasan.cycle_detail.end_year
                                } ${
                                  semesterName[
                                    selectedSuratPenugasan.cycle_detail.semester
                                  ]
                                }`
                              : 'Tidak ada'}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className="font-semibold">Diterima</p>
                          <p>
                            {selectedSuratPenugasan.approved ? (
                              <LinkIconAccepted />
                            ) : (
                              <LinkIconRejected />
                            )}
                          </p>
                        </div>
                      </div>
                      <div>
                        <p className="font-semibold">File</p>
                        <a
                          target="_blank"
                          className={`w-full block ${
                            selectedSuratPenugasan.files && 'text-primary-400'
                          } whitespace-nowrap overflow-hidden overflow-ellipsis`}
                          href={selectedSuratPenugasan.files}
                          rel="noreferrer"
                        >
                          {selectedSuratPenugasan.files || 'Tidak ada'}
                        </a>
                      </div>
                      <PrimaryButton
                        onClick={() => {
                          patchPoinPenilaian({
                            data: {
                              dokumenPendukung: [
                                ...selectedPoinPenilaian.dokumenPendukung,
                                selectedSuratPenugasan.value,
                              ],
                            },
                            id: selectedPoinPenilaian.id,
                          });
                        }}
                        className="w-full rounded-lg"
                      >
                        Tambah
                      </PrimaryButton>
                    </div>
                  )}
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
      <form
        onSubmit={handleSubmit2(onSubmit2)}
        className="flex flex-row space-x-3 items-center"
      >
        <input
          className={`accent-primary-400 focus:outline-none w-[24rem] rounded-lg px-3 py-2 focus:border-primary-400 border-[1px]`}
          placeholder={`Cari`}
          {...register2('matriks-penilaian')}
        />
        <PrimaryButton>Cari</PrimaryButton>
      </form>
      <p className="font-semibold text-lg mt-4">Matriks Penilaian</p>
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
          {data?.data.map((item, index) => {
            let matriksList = [];

            if (index !== 0) {
              matriksList.push(
                <tbody
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() =>
                    setCriteriaState((e) => {
                      let dupeCriteriaState = { ...e };

                      dupeCriteriaState[item.nama] =
                        !dupeCriteriaState[item.nama];

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
                // style={{
                //   maxHeight: criteriaState[item.nama]
                //     ? 400 * item.poin_penilaian_detail.length
                //     : 0,
                // }}
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
                                onChange={(e) =>
                                  field.onChange({
                                    ...field.value,
                                    value: e.target.value,
                                  })
                                }
                                value={field.value?.value || ''}
                              />
                            </td>
                            <td className="border-gray-300 border-t border-r p-3 w-[20%] space-y-3">
                              {item2.dokumen_pendukung_detail.map((item3) => {
                                return (
                                  <div
                                    key={item3.id}
                                    className="w-full flex flex-row items-center space-x-2"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedSuratPenugasan2(item3);
                                        console.log(item3);
                                        setOpenModal2((prev) => !prev);
                                      }}
                                      className=" bg-gray-700 hover:bg-gray-800 duration-200 transition-all px-4 py-1 border border-gray-700 rounded-full cursor-pointer"
                                    >
                                      <p className="overflow-hidden break-all overflow-ellipsisfont-medium line-clamp-1 text-white">
                                        {item3.judul}
                                      </p>
                                    </button>
                                    <DeleteIcon className="shrink-0" />
                                  </div>
                                );
                              })}

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
                              {/* <Select
                                isClearable={true}
                                placeholder="pilih..."
                                theme={(theme) => ({
                                  ...theme,
                                  colors: {
                                   ...theme.colors,
                                    primary: primary400,
                                    primary25: '#fde3e4',
                                    primary50: '#fbd0d2',
                                  },
                                })}
                                classNamePrefix="react-select"
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    boxShadow: 'none',
                                  }),
                                }}
                                classNames={{
                                  control: (state) =>
                                    `!px-0.5 !text-red-400 !w-[17rem] !mx-auto !py-0.5 ${
                                      field.error ? '!border-primary-400' : ''
                                    } ${
                                      state.isFocused
                                        ? '!border-primary-400'
                                        : '!border-gray-200'
                                    }`,
                                }}
                                inputRef={field.ref}
                                options={
                                  suratPenugasanData ? suratPenugasanData : []
                                }
                                value={
                                  field?.value
                                    ? field.value['dokumen_pendukung']
                                    : []
                                }
                                isMulti
                                onChange={(val, triggeredAction) =>
                                  field.onChange({
                                    ...field.value,
                                    dokumen_pendukung: val,
                                  })
                                }
                              /> */}
                            </td>
                          </>
                        );
                      }}
                    />
                    {/* <td className="border-r-0 w-[20%] border-gray-300 border-t p-3">
                      <Controller
                        control={control}
                        name={`${item2.order_number}-doc`}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Select
                              isClearable={true}
                              placeholder="pilih..."
                              theme={(theme) => ({
                                ...theme,
                                colors: {
                                  ...theme.colors,
                                  primary: primary400,
                                  primary25: '#fde3e4',
                                  primary50: '#fbd0d2',
                                },
                              })}
                              classNamePrefix="react-select"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  boxShadow: 'none',
                                }),
                              }}
                              classNames={{
                                control: (state) =>
                                  `!px-0.5 !text-red-400 !w-[17rem] !mx-auto !py-0.5 ${
                                    error ? '!border-primary-400' : ''
                                  } ${
                                    state.isFocused
                                      ? '!border-primary-400'
                                      : '!border-gray-200'
                                  }`,
                              }}
                              inputRef={field.ref}
                              options={
                                suratPenugasanData ? suratPenugasanData : []
                              }
                              value={[].find((c) => c.value === field.value)}
                              isMulti
                              // onChange={(val, triggeredAction) => {
                              //   console.log(val);
                              //   field.onChange(val.value);
                              // }}
                              onChange={(val, triggeredAction) => {}}
                            />
                          </>
                        )}
                      />
                    </td> */}
                  </tr>
                ))}
              </tbody>
            );
            return matriksList;
          })}
        </table>
        <PrimaryButton className="mt-4 ml-auto">Simulasi</PrimaryButton>
      </form>
    </section>
  );
};

export default TableForm;
