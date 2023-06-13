import React, { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import DeleteButton from './DeleteButton';

const ModalDelete = ({ isOpen, setIsOpen, deleteFunc, title }) => {
  let completeButtonRef = useRef(null);

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog
        initialFocus={completeButtonRef}
        onClose={() => {
          setIsOpen(false);
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
              <Dialog.Panel className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center justify-center text-center">
                <Dialog.Title className="text-xl font-bold text-black-800">
                  Hapus {title}
                </Dialog.Title>
                <p className="text-gray-600 mt-2 max-w-md">
                  Apakah anda yakin ingin menghapus data ini ?
                </p>
                <DeleteButton
                  className="mt-4 !text-base"
                  onClick={deleteFunc}
                />
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default ModalDelete;
