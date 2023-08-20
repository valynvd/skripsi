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
  setDocumentLoading,
  kriteriaRefetch,
  openModal,
  setOpenModal,
  selectedSuratPenugasan,
  suratPenugasanData,
  selectedPoinPenilaian,
  semesterName,
  setSelectedSuratPenugasan,
  patchPoinPenilaian,
}) => {
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
                  options={
                    suratPenugasanData && selectedPoinPenilaian
                      ? suratPenugasanData.filter(
                          (item) =>
                            !selectedPoinPenilaian.dokumenPendukungSuratPenugasan.includes(
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
                        <p>{selectedSuratPenugasan.category || 'Tidak ada'}</p>
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
                        setDocumentLoading((prev) => {
                          let dupeDocumentLoading = {
                            ...prev,
                          };

                          dupeDocumentLoading[selectedPoinPenilaian.id] =
                            'loading';

                          return dupeDocumentLoading;
                        });

                        patchPoinPenilaian(
                          {
                            data: {
                              dokumenPendukungSuratPenugasan: [
                                ...selectedPoinPenilaian.dokumenPendukungSuratPenugasan,
                                selectedSuratPenugasan.value,
                              ],
                            },
                            id: selectedPoinPenilaian.id,
                          },
                          {
                            onSuccess: () => {
                              setDocumentLoading((prev) => {
                                let dupeDocumentLoading = {
                                  ...prev,
                                };

                                dupeDocumentLoading[selectedPoinPenilaian.id] =
                                  'updated';

                                return dupeDocumentLoading;
                              });
                              kriteriaRefetch();
                            },
                          }
                        );
                        setOpenModal(false);
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
  );
};

export default AddModal;
