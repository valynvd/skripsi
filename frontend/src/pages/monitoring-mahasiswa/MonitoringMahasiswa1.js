/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { BiPlusCircle } from 'react-icons/bi';

const MonitoringMahasiswa1 = () => {
  const userRole = useCheckRole();
  //   const [namamahasiswa, setNamaMahasiswa] = useState('')
  const [nim, setNim] = useState('');
  const navigate = useNavigate();

  return (
    <section id="monitoring-mahasiswa" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Monitoring Mahasiswa
          {!userRole.admin}
        </p>
        <PrimaryButton
          icon={<BiPlusCircle size={22} />}
          link="/kurikulum-obe/monitoring-akademik/import"
          // link="/degreeaudit/monitoring-akademik/import"
        >
          Import Excel
        </PrimaryButton>
      </div>

      <form className="flex gap-4 flex-wrap items-center mb-4 mt-10">
        <div className="relative w-[]20rem">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AiOutlineSearch size={20} color="gray" />
          </div>
          <input
            type="text"
            id="simple-search"
            className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
            placeholder="NIM"
            onChange={(e) => setNim(e.target.value)}
          />
        </div>
        <PrimaryButton
          onClick={async () => {
            navigate(`/kurikulum-obe/monitoring-akademik/${nim}`, {
              // navigate(`/degreeaudit/monitoring-akademik/${nim}`, {
              state: nim,
            });
          }}
        >
          Cari
        </PrimaryButton>
      </form>
      <p>
        Anda dapat melihat hasil akademik mahasiswa dengan mencari melalui NIM
        Mahasiswa
      </p>
    </section>
  );
};

export default MonitoringMahasiswa1;
