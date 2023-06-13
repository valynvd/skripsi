import React, { Fragment, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';

const ModalCreateForm = ({ isOpen, setIsOpen, children }) => {
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
            <div className="flex items-start justify-center h-full overflow-y-auto p-4 pt-8">
              <Dialog.Panel className="bg-white p-2 rounded-xl shadow-lg flex flex-col items-center justify-center">
                {children}
              </Dialog.Panel>
            </div>
          </div>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default ModalCreateForm;
