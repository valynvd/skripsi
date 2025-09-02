/* eslint-disable react/jsx-key */
import React, { useEffect, useState } from 'react';
// import ModalDelete from '../../components/ModalDelete';
import { useCheckRole } from '../../hooks/useCheckRole';
// import { PrimaryButton } from '../../components/PrimaryButton';
// import { BiPlusCircle } from 'react-icons/bi';
import {
  // useDeleteValidasiMahasiswa,
  useValidasiMahasiswaData,
} from '../../hooks/useValidasiMahasiswa';
// import { useQueryClient } from 'react-query';
import SkpiRecapTable from './components/SkpiRecapTable';
import axios from 'axios';
import { useProgramStudiData } from '../../hooks/useProdi';
import { AiOutlineSearch } from 'react-icons/ai';
import FilterInput from '../../components/FitlerInput';
import { useForm } from 'react-hook-form';
import { ExportPrimaryButton } from '../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';

const SkpiRecap = () => {
  const userRole = useCheckRole();
  const { data: responseData } = useValidasiMahasiswaData({
    enabled: !!userRole.admin,
  });

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

  const { control } = useForm({
    defaultValues: {},
  });

  // fetch api
  const [recaps, setRecaps] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // search
  const [selectedAngkatan, setSelectedAngkatan] = useState('');
  const [globalFilter, setGlobalFilter] = useState('');
  const [idProdi, setIdProdi] = useState(3);
  // console.log('🚀 ~ SkpiRecap ~ idProdi:', idProdi);

  // token user

  const userToken = localStorage.getItem('userToken');
  // console.log('🚀 ~ SkpiRecap ~ userToken:', userToken);

  const fetchRecap = async (search, idprodi, angkatan) => {
    setIsLoading(true);

    const BASEURL = 'https://api-simantap.prasetiyamulya.ac.id'
    // const BASEURL = 'http://127.0.0.1:8000';
    let url = `${BASEURL}/api-stem/skpirecapbyidprodi/3/?search=${search}&angkatan=${angkatan}`;
    if (idprodi) {
      url = `${BASEURL}/api-stem/skpirecapbyidprodi/${idprodi}/?search=${search}&angkatan=${angkatan}`;
    }

    axios
      .get(url, {
        headers: { Authorization: 'Token ' + userToken },
      })
      .then((res) => {
        setRecaps(res.data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.log('err', err);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchRecap();
  }, []);

  const uniqueAngkatanValues = [
    ...new Set(
      responseData?.data?.map((item) => item.mahasiswa_detail.angkatan)
    ),
  ];
  // console.log("🚀 ~ SkpiRecap ~ uniqueAngkatanValues:", uniqueAngkatanValues)

  // export excel
  const handleExport = () => {
    // Mapping CPL-CSE dan CPL-FBT ke label baru
    const cplCodeMap =
      idProdi === 3
        ? {
            'CPL-FBT-S1': '3.A.1',
            'CPL-FBT-S2': '3.A.2',
            'CPL-FBT-S3': '3.A.3',
            'CPL-FBT-S4': '3.A.4',
            'CPL-FBT-S5': '3.A.5',
            'CPL-FBT-S6': '3.A.6',
            'CPL-FBT-KU1': '3.B.1',
            'CPL-FBT-KU2': '3.B.2',
            'CPL-FBT-KU3': '3.B.3',
            'CPL-FBT-KU4': '3.B.4',
            'CPL-FBT-P1': '3.C.1',
            'CPL-FBT-P2': '3.C.2',
            'CPL-FBT-P3': '3.C.3',
            'CPL-FBT-KK1': '3.D.1',
            'CPL-FBT-KK2': '3.D.2',
            'CPL-FBT-KK3': '3.D.3',
          }
        : idProdi === 1
        ? {
            'CPL-SE-S1': '3.A.1',
            'CPL-SE-S2': '3.A.2',
            'CPL-SE-S3': '3.A.3',
            'CPL-SE-S4': '3.A.4',
            'CPL-SE-S5': '3.A.5',
            'CPL-SE-S6': '3.A.6',
            'CPL-SE-KU1': '3.B.1',
            'CPL-SE-KU2': '3.B.2',
            'CPL-SE-KU3': '3.B.3',
            'CPL-SE-P1': '3.C.1',
            'CPL-SE-P2': '3.C.2',
            'CPL-SE-P3': '3.C.3',
            'CPL-SE-P4': '3.C.4',
            'CPL-SE-P5': '3.C.5',
            'CPL-SE-P6': '3.C.6',
            'CPL-SE-P7': '3.C.7',
            'CPL-SE-P8': '3.C.8',
            'CPL-SE-P9': '3.C.9',
            'CPL-SE-KK1': '3.D.1',
            'CPL-SE-KK2': '3.D.2',
            'CPL-SE-KK3': '3.D.3',
            'CPL-SE-KK4': '3.D.4',
            'CPL-SE-KK5': '3.D.5',
          }
        : idProdi === 2
        ? {
            'CPL-BM-S1': '3.A.1',
            'CPL-BM-S2': '3.A.2',
            'CPL-BM-S3': '3.A.3',
            'CPL-BM-S4': '3.A.4',
            'CPL-BM-S5': '3.A.5',
            'CPL-BM-S6': '3.A.6',
            'CPL-BM-KU1': '3.B.1',
            'CPL-BM-KU2': '3.B.2',
            'CPL-BM-KU3': '3.B.3',
            'CPL-BM-KU4': '3.B.4',
            'CPL-BM-P1': '3.C.1',
            'CPL-BM-P2': '3.C.2',
            'CPL-BM-P3': '3.C.3',
            'CPL-BM-P4': '3.C.4',
            'CPL-BM-P5': '3.C.5',
            'CPL-BM-KK1': '3.D.1',
            'CPL-BM-KK2': '3.D.2',
            'CPL-BM-KK3': '3.D.3',
            'CPL-BM-KK4': '3.D.4',
          }
        : idProdi === 4
        ? {
            'CPL-REE-S1': '3.A.1',
            'CPL-REE-S2': '3.A.2',
            'CPL-REE-S3': '3.A.3',
            'CPL-REE-S4': '3.A.4',
            'CPL-REE-S5': '3.A.5',
            'CPL-REE-S6': '3.A.6',
            'CPL-REE-KU1': '3.B.1',
            'CPL-REE-KU2': '3.B.2',
            'CPL-REE-KU3': '3.B.3',
            'CPL-REE-KU4': '3.B.4',
            'CPL-REE-P1': '3.C.1',
            'CPL-REE-P2': '3.C.2',
            'CPL-REE-KK1': '3.D.1',
            'CPL-REE-KK2': '3.D.2',
            'CPL-REE-KK3': '3.D.3',
            'CPL-REE-KK4': '3.D.4',
          }
        : idProdi === 5
        ? {
            'CPL-CSE-S1': '3.A.1',
            'CPL-CSE-S2': '3.A.2',
            'CPL-CSE-S3': '3.A.3',
            'CPL-CSE-S4': '3.A.4',
            'CPL-CSE-S5': '3.A.5',
            'CPL-CSE-S6': '3.A.6',
            'CPL-CSE-KU1': '3.B.1',
            'CPL-CSE-KU2': '3.B.2',
            'CPL-CSE-KU3': '3.B.3',
            'CPL-CSE-KU4': '3.B.4',
            'CPL-CSE-KU5': '3.B.5',
            'CPL-CSE-KU6': '3.B.6',
            'CPL-CSE-KU7': '3.B.7',
            'CPL-CSE-KU8': '3.B.8',
            'CPL-CSE-KU9': '3.B.9',
            'CPL-CSE-P1': '3.C.1',
            'CPL-CSE-P2': '3.C.2',
            'CPL-CSE-P3': '3.C.3',
            'CPL-CSE-KK1': '3.D.1',
            'CPL-CSE-KK2': '3.D.2',
          }
        : idProdi === 5
        ? {
            'CPL-PDE-S1': '3.A.1',
            'CPL-PDE-S2': '3.A.2',
            'CPL-PDE-S3': '3.A.3',
            'CPL-PDE-S4': '3.A.4',
            'CPL-PDE-S5': '3.A.5',
            'CPL-PDE-S6': '3.A.6',
            'CPL-PDE-KU1': '3.B.1',
            'CPL-PDE-KU2': '3.B.2',
            'CPL-PDE-KU3': '3.B.3',
            'CPL-PDE-KU4': '3.B.4',
            'CPL-PDE-KU5': '3.B.5',
            'CPL-PDE-KU6': '3.B.6',
            'CPL-PDE-P1': '3.C.1',
            'CPL-PDE-P2': '3.C.2',
            'CPL-PDE-P3': '3.C.3',
            'CPL-PDE-P4': '3.C.4',
            'CPL-PDE-P5': '3.C.5',
            'CPL-PDE-P6': '3.C.6',
            'CPL-PDE-P7': '3.C.7',
            'CPL-PDE-P8': '3.C.8',
            'CPL-PDE-P9': '3.C.9',
            'CPL-PDE-P10': '3.C.10',
            'CPL-PDE-P11': '3.C.11',
            'CPL-PDE-KK1': '3.D.1',
            'CPL-PDE-KK2': '3.D.2',
            'CPL-PDE-KK3': '3.D.3',
            'CPL-PDE-KK4': '3.D.4',
            'CPL-PDE-KK5': '3.D.5',
            'CPL-PDE-KK6': '3.D.6',
            'CPL-PDE-KK7': '3.D.7',
            'CPL-PDE-KK8': '3.D.8',
          }
        : {};

    // Ambil semua CPL dari mapping
    const cplHeaders = Object.values(cplCodeMap);

    const filterToExcel = recaps.map((item) => {
      const mahasiswa = item.mahasiswa_detail;
      const cplScores = {};

      // Isi nilai CPL jika ada
      item.cpmks.forEach((cpmk) => {
        const label = cplCodeMap[cpmk.cpl_kode] || cpmk.cpl_kode;
        cplScores[label] = cpmk.total_score;
      });

      // Pastikan semua CPL muncul, yang tidak ada nilainya diberi "-"
      return {
        nim: mahasiswa.nim,
        nama: mahasiswa.nama,
        ...cplHeaders.reduce((acc, code) => {
          acc[code] = cplScores[code] !== undefined ? cplScores[code] : '-';
          return acc;
        }, {}),
      };
    });

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(filterToExcel);
    utils.book_append_sheet(wb, ws, 'Data Mahasiswa');


    writeFile(wb, `Rekap_SKPI_Mahasiswa.xlsx`);
  };

  return (
    <section id="degreeaudit-kelulusan" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Rekap SKPI Mahasiswa
          {!userRole.admin}
        </p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <div>
          <form className="flex gap-4 flex-wrap items-center mb-4">
            <div className="relative w-[]20rem">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <AiOutlineSearch size={20} color="gray" />
              </div>
              <input
                type="text"
                id="simple-search"
                className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
                placeholder="Cari..."
                value={globalFilter || ''}
                onChange={(e) => {
                  setGlobalFilter(e.target.value);
                  fetchRecap(e.target.value, idProdi, selectedAngkatan);
                }}
              />
            </div>
            <FilterInput
              // clearFunc={() => {
              //   setIdProdi(null);
              //   setValue('prodi', null);
              //   setSelectedAngkatan('');
              //   fetchRecap(globalFilter, null, selectedAngkatan);
              // }}
              // isClearable
              className="w-80"
              control={control}
              name="Prodi"
              registeredName="prodi"
              placeholder="Semua Prodi"
              options={dataProgramStudiSuccess ? dataProgramStudi : []}
              defaultValue={{
                value: 3,
                label: 'Food Technology (FBT)',
              }}
              onChange={(e) => {
                setIdProdi(e);
                fetchRecap(globalFilter, e, selectedAngkatan);
              }}
            />
            <select
              value={selectedAngkatan}
              onChange={(e) => {
                setSelectedAngkatan(e.target.value);
                fetchRecap(globalFilter, idProdi, e.target.value);
              }}
              className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-40 p-2.5"
            >
              <option value="">Semua Angkatan</option>
              {recaps &&
                recaps.length > 0 &&
                uniqueAngkatanValues.map((angkatan) => (
                  <option key={angkatan} value={angkatan}>
                    {angkatan}
                  </option>
                ))}
            </select>
            <ExportPrimaryButton onClick={handleExport} />
          </form>
        </div>
        <SkpiRecapTable
          loading={isLoading}
          data={recaps ?? []}
          idProdi={idProdi}
        />
      </div>
    </section>
  );
};

export default SkpiRecap;
