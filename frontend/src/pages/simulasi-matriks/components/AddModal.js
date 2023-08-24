import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { primary400 } from '../../../utils/colors';
import {
  LinkIconAccepted,
  LinkIconRejected,
} from '../../../components/LinkIcon';
import Select from 'react-select';
import { PrimaryButton } from '../../../components/PrimaryButton';

const AddModal = ({
  setPointId,
  pointId,
  openModal,
  setOpenModal,
  selectedDokumenPendukung,
  suratPenugasanData,
  selectedPoinPenilaian,
  setSelectedDokumenPendukung,
  answerData,
  setAnswerData,
  dokumenPendukungList,
}) => {
  const semesterName = {
    Odd: 'Ganjil',
    'Odd Short': 'Pendek Ganjil',
    Even: 'Genap',
    'Even Short': 'Pendek Genap',
  };

  return (
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
                  options={(() => {
                    let filteredDokumenPendukung = [];

                    if (answerData && selectedPoinPenilaian) {
                      if (
                        console.log()
                        // answerData[selectedPoinPenilaian.id].dokumenPendukung
                        //   .length === 0
                      ) {
                        return dokumenPendukungList;
                      } else {
                        dokumenPendukungList.forEach((item) => {
                          let found = false;
                          answerData[
                            selectedPoinPenilaian.id
                          ].dokumenPendukung.every((item2) => {
                            if (item.value === item2.value) {
                              found = true;
                              return false;
                            }
                            return true;
                          });
                          if (!found) {
                            filteredDokumenPendukung.push(item);
                          }
                        });
                        return filteredDokumenPendukung;
                      }
                    }
                  })()}
                  value={selectedDokumenPendukung}
                  onChange={(val, triggeredAction) => {
                    setSelectedDokumenPendukung(val);
                  }}
                />
                {selectedDokumenPendukung &&
                  (selectedDokumenPendukung.document_type === 'file' ? (
                    <div className="mt-4 space-y-4">
                      <div>
                        <p className="font-semibold">Deskripsi</p>
                        <p>{selectedDokumenPendukung.description}</p>
                      </div>
                      <div>
                        <p className="font-semibold">File</p>
                        <a
                          target="_blank"
                          className={`w-full block ${
                            selectedDokumenPendukung.files && 'text-primary-400'
                          } whitespace-nowrap overflow-hidden overflow-ellipsis`}
                          href={selectedDokumenPendukung.files}
                          rel="noreferrer"
                        >
                          {selectedDokumenPendukung.files || 'Tidak ada'}
                        </a>
                      </div>
                      <PrimaryButton
                        onClick={() => {
                          setAnswerData((prev) => {
                            let copyAnswerData = { ...prev };
                            let formattedDokumenPendukung = [];
                            if (
                              copyAnswerData[selectedPoinPenilaian.id]
                                .dokumenPendukung.length !== 0
                            ) {
                              formattedDokumenPendukung =
                                copyAnswerData[selectedPoinPenilaian.id]
                                  .dokumenPendukung;
                            }
                            formattedDokumenPendukung.push(
                              selectedDokumenPendukung
                            );
                            copyAnswerData[selectedPoinPenilaian.id] = {
                              ...copyAnswerData[selectedPoinPenilaian.id],
                              dokumenPendukung: formattedDokumenPendukung,
                            };
                            return copyAnswerData;
                          });
                          setPointId(selectedPoinPenilaian.id);
                          setOpenModal(false);
                        }}
                        className="w-full rounded-lg"
                      >
                        Tambah
                      </PrimaryButton>
                    </div>
                  ) : (
                    <div className="mt-4 space-y-4">
                      <div className="flex">
                        <div className="w-1/3">
                          <p className="font-semibold">Kategori</p>
                          <p>
                            {selectedDokumenPendukung.category || 'Tidak ada'}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className="font-semibold">Siklus</p>
                          <p>
                            {selectedDokumenPendukung.cycle_detail
                              ? `${
                                  selectedDokumenPendukung.cycle_detail
                                    .start_year
                                }/${
                                  selectedDokumenPendukung.cycle_detail.end_year
                                } ${
                                  semesterName[
                                    selectedDokumenPendukung.cycle_detail
                                      .semester
                                  ]
                                }`
                              : 'Tidak ada'}
                          </p>
                        </div>
                        <div className="w-1/3">
                          <p className="font-semibold">Diterima</p>
                          <p>
                            {selectedDokumenPendukung.approved ? (
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
                            selectedDokumenPendukung.files && 'text-primary-400'
                          } whitespace-nowrap overflow-hidden overflow-ellipsis`}
                          href={selectedDokumenPendukung.files}
                          rel="noreferrer"
                        >
                          {selectedDokumenPendukung.files || 'Tidak ada'}
                        </a>
                      </div>
                      <PrimaryButton
                        onClick={() => {
                          setAnswerData((prev) => {
                            let copyAnswerData = { ...prev };
                            let formattedDokumenPendukungSuratPenugasan = [];
                            if (
                              copyAnswerData[selectedPoinPenilaian.id]
                                .dokumenPendukung
                            ) {
                              formattedDokumenPendukungSuratPenugasan =
                                copyAnswerData[selectedPoinPenilaian.id]
                                  .dokumenPendukung;
                            }
                            formattedDokumenPendukungSuratPenugasan.push(
                              selectedDokumenPendukung
                            );
                            copyAnswerData[selectedPoinPenilaian.id] = {
                              ...copyAnswerData[selectedPoinPenilaian.id],
                              dokumenPendukung:
                                formattedDokumenPendukungSuratPenugasan,
                            };
                            return copyAnswerData;
                          });
                          setPointId(selectedPoinPenilaian.id);
                          setOpenModal(false);
                        }}
                        className="w-full rounded-lg"
                      >
                        Tambah
                      </PrimaryButton>
                    </div>
                  ))}
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default AddModal;
