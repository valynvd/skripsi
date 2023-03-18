import React from 'react';
import NavigationLink from './NavigationLink';
import { BiHome } from 'react-icons/bi';
import { AiOutlineMail, AiOutlineFileText } from 'react-icons/ai';
import { MdOutlineAssignment, MdKeyboardArrowLeft } from 'react-icons/md';
import { RiUser2Line } from 'react-icons/ri';
import { primary400 } from '../../utils/colors';
import useOther from '../../hooks/useOther';
import { useCheckRole } from '../../hooks/useCheckRole';

const Navbar = () => {
  const userRole = useCheckRole();
  const { navbarMinimize, setNavbarMinimize } = useOther();

  return (
    <div
      className={`${
        navbarMinimize ? 'w-[4rem]' : 'w-[20rem]'
      } duration-200 h-full flex flex-col`}
    >
      <div className="h-[5.5rem] py-4 bg-primary-400 flex items-center justify-center relative">
        {!navbarMinimize && (
          <img
            className="w-[72%] h-full object-contain"
            src={require('../../assets/logo/prasmul-logo-white.png')}
            alt="prasmul"
          />
        )}
        <button
          className={`absolute w-[2.5rem] transition-all duration-300 rounded-full h-[2.5rem] bg-gray-200 border-2 border-white right-0 translate-x-[50%] ${
            navbarMinimize && 'rotate-180'
          }`}
          onClick={() => {
            setNavbarMinimize(!navbarMinimize);
          }}
        >
          <MdKeyboardArrowLeft size={'100%'} color={primary400} />
        </button>
      </div>
      <nav className="flex-1 bg-secondary-400">
        <div className="pt-6">
          <NavigationLink url="/" icon={<BiHome size={22} />}>
            Dashboard
          </NavigationLink>
          {(userRole.admin || (userRole.facultyMember && userRole.kaprodi)) && (
            <NavigationLink url="/dosen" icon={<RiUser2Line size={22} />}>
              Dosen
            </NavigationLink>
          )}
          <NavigationLink
            url="/evaluasi-perkuliahan"
            icon={<AiOutlineFileText size={22} />}
          >
            Evaluasi Perkuliahan
          </NavigationLink>
          {userRole.admin && (
            <>
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
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
