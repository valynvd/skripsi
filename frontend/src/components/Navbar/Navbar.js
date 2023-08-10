import React, { useState } from 'react';
import NavigationLink from './NavigationLink';
import { BiHome } from 'react-icons/bi';
import { AiOutlineBook } from 'react-icons/ai';
import {
  MdChatBubble,
  MdCheckCircle,
  MdKeyboardArrowLeft,
  MdWorkspacePremium,
  MdWorkspacesOutline,
} from 'react-icons/md';
import { BsClipboardData } from 'react-icons/bs';
import { primary400 } from '../../utils/colors';
import useOther from '../../hooks/useOther';
import { useCheckRole } from '../../hooks/useCheckRole';
import NavigationDropdownLink from './NavigationDropdownLink';
import { GoBeaker } from 'react-icons/go';

const Navbar = () => {
  const userRole = useCheckRole();
  const { navbarMinimize, setNavAndUpdStr } = useOther();
  const [dropdownActive, setDropdownActive] = useState();

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
            setNavAndUpdStr(!navbarMinimize);
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
          {(userRole.admin || userRole.facultyMember) && (
            <NavigationDropdownLink
              title="Pelaks. Pendidikan"
              url="/pelaksanaan-pendidikan"
              setDropdownActive={setDropdownActive}
              dropdownActive={dropdownActive}
              childrenUrl={[
                {
                  title: 'Surat Penugasan',
                  url: '/surat-penugasan',
                  allowedRoles: userRole.admin,
                },
                {
                  title: 'Dokumen Pembelajaran',
                  url: '/dokumen-pembelajaran',
                  allowedRoles: userRole.facultyMember || userRole.admin,
                },
                {
                  title: 'RPS',
                  url: '/rps',
                  allowedRoles: userRole.admin,
                },
              ]}
              icon={<AiOutlineBook size={22} />}
            />
          )}
          {userRole.admin && (
            <>
              <NavigationDropdownLink
                title="Pelaks. Penelitian"
                url="/pelaksanaan-penelitian"
                setDropdownActive={setDropdownActive}
                dropdownActive={dropdownActive}
                childrenUrl={[
                  {
                    title: 'Penelitian',
                    url: '/penelitian',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Publikasi Karya',
                    url: '/publikasi-karya',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Paten/HKI',
                    url: '/paten-hki',
                    allowedRoles: userRole.admin,
                  },
                ]}
                icon={<GoBeaker size={22} />}
              />
              <NavigationDropdownLink
                title="Pelaks. Pengabdian"
                url="/pelaksanaan-pengabdian"
                setDropdownActive={setDropdownActive}
                dropdownActive={dropdownActive}
                childrenUrl={[
                  {
                    title: 'Pengabdian',
                    url: '/pengabdian',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Pengelola Jurnal',
                    url: '/pengelola-jurnal',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Pembicara',
                    url: '/pembicara',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Jabatan Struktural',
                    url: '/jabatan-struktural',
                    allowedRoles: userRole.admin,
                  },
                ]}
                icon={<MdWorkspacesOutline size={22} />}
              />
              <NavigationDropdownLink
                title="Akreditasi"
                url="/akreditasi"
                setDropdownActive={setDropdownActive}
                dropdownActive={dropdownActive}
                childrenUrl={[
                  {
                    title: 'Matriks Penilaian',
                    url: '/matriks-penilaian',
                    allowedRoles: userRole.admin,
                  },
                ]}
                icon={<MdWorkspacePremium size={22} />}
              />
              <NavigationDropdownLink
                title="Data Master"
                url="/data-master"
                setDropdownActive={setDropdownActive}
                dropdownActive={dropdownActive}
                childrenUrl={[
                  {
                    title: 'User',
                    url: '/user',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Mahasiswa',
                    url: '/data-mahasiswa',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Dosen',
                    url: '/dosen',
                    allowedRoles:
                      userRole.admin ||
                      (userRole.facultyMember && userRole.kaprodi),
                  },
                  {
                    title: 'Mata Kuliah',
                    url: '/mata-kuliah',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Kurikulum',
                    url: '/kurikulum',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Penugasan Pengajaran',
                    url: '/penugasan-pengajaran',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Siklus',
                    url: '/cycle',
                    allowedRoles: userRole.admin,
                  },
                ]}
                icon={<BsClipboardData size={22} />}
              />
              <NavigationDropdownLink
                title="STEM ChatBot"
                url="/stem-chatbot"
                setDropdownActive={setDropdownActive}
                dropdownActive={dropdownActive}
                childrenUrl={[
                  {
                    title: 'BroadCast Pesan',
                    url: '/broadcast-pesan',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Pengaturan Grup',
                    url: '/pengaturan-grup',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Konsol ChatBot',
                    url: '/konsol-chatbot',
                    allowedRoles: userRole.admin,
                  },
                ]}
                icon={<MdChatBubble size={22} />}
              />
              <NavigationDropdownLink
                title="Degree Audit"
                url="/degreeaudit"
                setDropdownActive={setDropdownActive}
                dropdownActive={dropdownActive}
                childrenUrl={[
                  {
                    title: 'Validasi Kelulusan',
                    url: '/validasi-kelulusan',
                    allowedRoles: userRole.admin,
                  },
                  {
                    title: 'Monitoring Akademik',
                    url: '/monitoring-akademik',
                    allowedRoles: userRole.admin,
                  },
                ]}
                icon={<MdCheckCircle size={22} />}
              />
            </>
          )}
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
