/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useProgramStudiData } from '../../hooks/useProdi';
import { useTranskripNilaiDataByNIM2 } from '../../hooks/useTranskripNilai';
import FilterInput from '../../components/FitlerInput';
import { useForm } from 'react-hook-form';
import { useDataMahasiswaData } from '../../hooks/useDataMahasiswa';

const ValidasiMahasiswa = () => {
  const userRole = useCheckRole();
//   const [namamahasiswa, setNamaMahasiswa] = useState('')
  const [nim, setNim] = useState('')
  const [selectedProdi, setSelectedProdi] = useState('');
  const [selectedAngkatan, setSelectedAngkatan] = useState('');
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [filterMahasiswa, setFilterMahasiswa] = useState([]);
  const [transkripData, setTranskripData] = useState([])

  const navigate = useNavigate();
  const { control, watch, setValue } = useForm({
    defaultValues: {},
  })
  const { data: responseData, isLoading: isLoadingMahasiswa} = useDataMahasiswaData();
  
  useEffect(() => {
    if (isLoadingMahasiswa === false) {
      setDataMahasiswa(responseData.data);
      setFilterMahasiswa(responseData.data); // Initialize with all students
    }
  }, [isLoadingMahasiswa, responseData]);

  useEffect(() => {
    if (selectedProdi || selectedAngkatan) {
      const filteredMahasiswa = dataMahasiswa.filter(
        (mahasiswa) => mahasiswa.prodi == selectedProdi
      );
      const filteredByAngkatan = filteredMahasiswa.filter(
        (mahasiswa) => mahasiswa.angkatan === selectedAngkatan
      );
      console.log(filteredMahasiswa)
      setFilterMahasiswa(filteredByAngkatan);
      
    } else {
      setFilterMahasiswa(dataMahasiswa);
    }
  }, [selectedProdi, selectedAngkatan, dataMahasiswa]);

  const { data: dataProgramStudi, isSuccess: dataProgramStudiSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatUserData = response.data.map(({ id, name, kode }) => {
          return {
            value: id,
            label: `${name} (${kode})`,
          };
        });

        return formatUserData;
      },
    });

  const uniqueAngkatanValues = [...new Set(dataMahasiswa.map(item => item.angkatan))];

 
  const onAudit = async () => {
    try {
      for (let index = 0; index < filterMahasiswa.length; index++) {
        const nimMahasiswa = filterMahasiswa[index].nim;
  
        const responseData = await useTranskripNilaiDataByNIM2.fetchTranskripData(nimMahasiswa);
  
        console.log(responseData); // Handle the responseData as needed inside the loop
      }
    } catch (error) {
      console.error("Error fetching transkrip data:", error);
    }
  };

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
      <p className="flex gap-4 flex-wrap items-center mb-4 mt-4"> Atau </p>
      <div className="flex gap-4 flex-wrap items-center mb-10 mt-4">
        <select
          value={selectedProdi}
          onChange={(e) => setSelectedProdi(e.target.value)}
          className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-40 p-2.5"
        >
          <option value="">Semua Program Studi</option>
          {dataProgramStudiSuccess &&
            dataProgramStudi.map((prodi) => (
              <option key={prodi.value} value={prodi.value}>
                {prodi.label}
              </option>
            ))}
        </select>
        <select 
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-40 p-2.5"
        >
            <option value="">Semua Angkatan</option>
            {uniqueAngkatanValues.map(angkatan => (
                <option key={angkatan} value={angkatan}>{angkatan}</option>
            ))}
        </select>
        <PrimaryButton onClick={onAudit}>Grup Audit</PrimaryButton>
      </div>
      
      
      { nim ? 
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
        </div> : selectedAngkatan ?
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
              {filterMahasiswa.map((mahasiswa, index) => (
                <tr key={mahasiswa.nim} className="bg-white border-b text-gray-600">
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{mahasiswa.nama}</td>
                  <td className="px-4 py-3">{mahasiswa.nim}</td>
                  <td className="px-4 py-3">{mahasiswa.prodi_detail.name}</td>
                  <td className="px-4 py-3">{mahasiswa.angkatan}</td>
                  <td className="px-4 py-3">{mahasiswa.jumlahSKS}</td>
                  <td className="px-4 py-3">{mahasiswa.nilaiD}</td>
                  <td className="px-4 py-3">{mahasiswa.nilaiE}</td>
                  <td className="px-4 py-3">{mahasiswa.ipk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div> : 
        <p>Anda dapat melakukan validasi dengan mengisi kolom NIM Mahsiswa atau dengan memilih Program dan angkatan</p>
      }
      
      
    </section>
  );
};

export default ValidasiMahasiswa;