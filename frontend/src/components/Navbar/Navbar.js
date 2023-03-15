/* eslint-disable no-unused-vars */
import React from 'react';
import NavigationLink from './NavigationLink';
import { BiHome } from 'react-icons/bi';
import { AiOutlineMail, AiOutlineFileText } from 'react-icons/ai';
import { MdOutlineAssignment, MdKeyboardArrowLeft } from 'react-icons/md';

const Navbar = () => {
  return (
    <div className="w-[20rem] h-full flex flex-col">
      <div className="h-[5.5rem] py-4 bg-primary-400 flex items-center justify-center relative">
        <img
          className="w-[72%] h-full object-contain"
          src={require('../../assets/logo/prasmul-logo-white.png')}
          alt="prasmul"
        />
        <div className="absolute w-[2.5rem] rounded-full h-[2.5rem] bg-gray-200 border-2 border-white right-0 translate-x-[50%]"></div>
      </div>
      <nav className="flex-1 bg-secondary-400">
        <div className="pt-6">
          <NavigationLink url="/" icon={<BiHome size={22} />}>
            Dashboard
          </NavigationLink>
          <NavigationLink
            url="/evaluasi-perkuliahan"
            icon={<AiOutlineFileText size={22} />}
          >
            Evaluasi Perkuliahan
          </NavigationLink>
          <NavigationLink
            url="/surat-penugasan"
            icon={<AiOutlineMail size={22} />}
          >
            Surat Penugasan
          </NavigationLink>
          <NavigationLink
            url="/penugasan-pengajaran"
            icon={<MdOutlineAssignment size={22} />}
          >
            Penugasan Pengajaran
          </NavigationLink>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
