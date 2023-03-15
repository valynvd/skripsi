import React, { Fragment } from 'react';
import { FaUserCircle } from 'react-icons/fa';
import { RiArrowDropDownFill } from 'react-icons/ri';
import { Menu, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useOther from '../hooks/useOther';

const Topbar = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { navbarMinimize } = useOther();

  return (
    <div
      className={`h-[5.5rem] p-4 flex justify-end bg-white ${
        navbarMinimize && '3xs:justify-between'
      }`}
    >
      {navbarMinimize && (
        <img
          className="h-full object-contain ml-4 hidden 3xs:block 3xs:w-16 xs:w-24"
          src={require('../assets/logo/prasmul-logo-red.png')}
          alt="prasmul"
        />
      )}
      <Menu as="div" className="relative inline-block text-left z-30 my-auto">
        <Menu.Button className="flex space-x-3 items-center justify-center">
          <div className="text-end">
            <p className="text-sm text-gray-400 leading-4">Selamat Datang,</p>
            <p className="font-semibold text-lg leading-6">
              {auth.userData.fullname}
            </p>
          </div>
          <div className="flex flex-row items-center">
            <div className="w-9 rounded-full border border-primary-400 overflow-hidden">
              <FaUserCircle size={'100%'} color="#94a3b8" />
            </div>
            <RiArrowDropDownFill size={24} />
          </div>
        </Menu.Button>
        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-2 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-md ring-1 ring-gray-200 focus:outline-none">
            <div className="px-1 py-1 ">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={`${
                      active && ''
                    } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                    onClick={() => {
                      localStorage.clear();
                      navigate('/login');
                    }}
                  >
                    Logout
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
};

export default Topbar;
