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
import { compareCplCodes, getCplDisplayCode } from '../../utils/cplDisplay';

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
    const orderedCplCodes = Array.from(
      new Set(
        recaps.flatMap((item) =>
          item?.cpmks?.map((cpmk) => cpmk.cpl_kode).filter(Boolean) ?? []
        )
      )
    ).sort(compareCplCodes);

    const filterToExcel = recaps.map((item) => {
      const mahasiswa = item.mahasiswa_detail;
      const cplScores = {};

      // Isi nilai CPL jika ada
      item.cpmks.forEach((cpmk) => {
        cplScores[cpmk.cpl_kode] = cpmk.total_score;
      });

      // Pastikan semua CPL muncul, yang tidak ada nilainya diberi "-"
      return {
        nim: mahasiswa.nim,
        nama: mahasiswa.nama,
        ...orderedCplCodes.reduce((acc, code) => {
          const displayCode = getCplDisplayCode(code);
          acc[displayCode] =
            cplScores[code] !== undefined ? cplScores[code] : '-';
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
