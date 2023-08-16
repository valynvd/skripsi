/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';



const ValidasiMahasiswa = () => {
  const userRole = useCheckRole();
//   const [namamahasiswa, setNamaMahasiswa] = useState('')
  const [nim, setNim] = useState('')

  const navigate = useNavigate();

  return (
    <section id="monitoring-mahasiswa" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Validasi Mahasiswa
          {!userRole.admin}
        </p>
      </div>

      <form  className="flex gap-4 flex-wrap items-center mb-4 mt-10">
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
            onClick={async() => {
                navigate(`/degreeaudit/validasi-kelulusan/${nim}`,{
                    state: nim,
                });
              }}>
              Audit
            </PrimaryButton>
        </form>

      <div className="overflow-x-auto">
          <table className="w-full mt-6">
            <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
              <tr>
                <th className="px-4 py-3 font-semibold">
                 <p className="flex flex-row items-center">No</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Nama Mahasiswa</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">NIM</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Jurusan</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Angkatan</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Jumlah Lulus SKS</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Nilai D</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Nilai E</p> 
                </th>
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">IPK</p> 
                </th>
              </tr>
            </thead>
            <tbody>
                <tr className="bg-white border-b text-gray-600">
                {/* <td className="px-4 py-3">1</td>
                <td className="px-4 py-3">Gaizka Valencia</td>
                <td className="px-4 py-3">23501910003</td>
                <td className="px-4 py-3">Software Engineering</td>
                <td className="px-4 py-3">2019</td>
                <td className="px-4 py-3">144</td>
                <td className="px-4 py-3">0</td>
                <td className="px-4 py-3">0</td>
                <td className="px-4 py-3">3.71</td> */}
              </tr>
            </tbody>
          </table>
      </div>
      
    </section>
  );
};

export default ValidasiMahasiswa;