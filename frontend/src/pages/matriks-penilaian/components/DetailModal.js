import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  LinkIconAccepted,
  LinkIconRejected,
} from '../../../components/LinkIcon';

const DetailModal = ({
  openModal2,
  setOpenModal2,
  selectedSuratPenugasan2,
  semesterName,
}) => {
  return (
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
                    <div className="flex flex-col">
                      <p className="font-semibold">Judul</p>
                      <p>{selectedSuratPenugasan2.judul || 'Tidak ada'}</p>
                    </div>
                    <div className="flex">
                      <div className="w-1/3">
                        <p className="font-semibold">Kategori</p>
                        <p>{selectedSuratPenugasan2.category || 'Tidak ada'}</p>
                      </div>
                      <div className="w-1/3">
                        <p className="font-semibold">Siklus</p>
                        <p>
                          {selectedSuratPenugasan2.cycle_detail
                            ? `${
                                selectedSuratPenugasan2.cycle_detail.start_year
                              }/${
                                selectedSuratPenugasan2.cycle_detail.end_year
                              } ${
                                semesterName[
                                  selectedSuratPenugasan2.cycle_detail.semester
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
                        href={
                          'https://api-simantap.kaospoloskato.com' +
                          selectedSuratPenugasan2.files
                        }
                        rel="noreferrer"
                      >
                        {`${
                          'https://api-simantap.kaospoloskato.com' +
                          selectedSuratPenugasan2.files
                        }` || 'Tidak ada'}
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
  );
};

export default DetailModal;
