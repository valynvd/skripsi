/* eslint-disable no-unused-vars */
import React, { useState, useMemo, Fragment, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { Dialog, Transition } from '@headlessui/react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePostGrupMahasiswa } from '../../hooks/useGrupMahasiswa';
// import { usePostTranskripNilai } from '../../hooks/useTranskripNilai';
import * as xlsx from 'xlsx';
import { AlertError } from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { AiOutlineConsoleSql, AiOutlineSearch } from 'react-icons/ai';
import ProgressBar from '@ramonak/react-progress-bar';
import { DeleteIcon } from '../../components/IconButton';
import { LinkIconRejected } from '../../components/LinkIcon';
import {
  TooltipAccept,
  TooltipAccept2,
  TooltipError,
} from '../../components/Tooltip';

const GrupMahasiswaImportExcel = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [open, setOpen] = useState(false);
  const [namamahasiswa, setNamaMahasiswa] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('');
  const [dataError, setDataError] = useState([]);

  const [progress, setProgress] = useState(0);

  const [nilaiD, setNilaiD] = useState('');
  const [nilaiE, setNilaiE] = useState('');
  const [jumlahSks, setJumlahSks] = useState('');
  const [dataFilter, setDataFilter] = useState([]);
  const [excelData, setExcelData] = useState([]);
  const [responseData, setResponseData] = useState();
  const [tahunAcademic, setTahunAcademic] = useState([]);
  const [ipsSemester, setIpsSemester] = useState([]);
  const [nilaiIpk, setNilaiIpk] = useState('');
  const navigate = useNavigate();

  const readExcel = async (e) => {
    const file = e.target.files[0];
    const data = await file.arrayBuffer(file);
    const excelfile = xlsx.read(data);
    const excelsheet = excelfile.Sheets[excelfile.SheetNames[0]];
    const exceljson = xlsx.utils.sheet_to_json(excelsheet);

    setExcelData(exceljson);
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const {
    mutateAsync: postGrupMahasiswa,
    isLoading: postGrupMahasiswaLoading,
  } = usePostGrupMahasiswa();

  // const {mutate: postTranskripNilai, isLoading: postTranskripNilaiLoading} =
  //   usePostTranskripNilai();

  const onSubmit = async () => {
    if (excelData.length === 0) {
      return;
    }

    let getResponseData = [];

    for (let index = 0; index < excelData.length; index++) {
      const data = excelData[index];
      const grupMahasiswaFormData = new FormData();
      const transkripNilaiFormData = new FormData();

      for (const key in data) {
        grupMahasiswaFormData.append(key, data[key]);
        transkripNilaiFormData.append(key, data[key]);
      }

      try {
        await postGrupMahasiswa(grupMahasiswaFormData, {
          onSuccess: (res) => {
            getResponseData.push(res.data);
            const newProgress = ((index + 1) / excelData.length) * 100;
            if (newProgress == 100.0) {
              setOpen(true);
            }
            setProgress(newProgress.toFixed(2));
          },
        });
        await delay(150);
      } catch (err) {
        getResponseData.push(err.response.data);
      }
    }

    setResponseData(getResponseData);
  };

  const handleToClose = () => {
    setOpen(false);
    setProgress('');
  };

  return (
    <section id="grupmahasiswa-form" className="section-container">
      <Transition
        show={open}
        as={Fragment}
      >
        <Dialog onClose={() => setOpen(false)} className={`relative z-100`}>
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
              <div className="flex min-h-full items-center justify-center p-4">
                <Dialog.Panel className="bg-white p-5 rounded-xl shadow-lg flex flex-col items-center justify-center text-center">
                  <Dialog.Title className="text-xl font-bold text-black-800">
                    Sukses
                  </Dialog.Title>
                  <p className="text-gray-600 mt-2 max-w-md">
                    Unggah Anggota Mahasiswa Berhasil
                  </p>
                  <PrimaryButton
                    className={`!mt-8 !mb-5`}
                    onClick={handleToClose}
                  >
                    Tutup
                  </PrimaryButton>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            {
              name: ' Pengaturan Grup',
              link: '/stem-chatbot/pengaturan-grup',
            },
            { name: 'Buat' },
          ]}
        />
        Buat Import Excel
      </p>
      <div>
        <form className="flex gap-4 flex-wrap items-center mb-4 mt-4">
          <div>
            <label className="form-label">File</label>
            <input
              type="file"
              className="form-control"
              onChange={(e) => readExcel(e)}
            />
          </div>
        </form>
      </div>

      <div>
        {errorMessage ? (
          <AlertError className="inline-block">{errorMessage}</AlertError>
        ) : (
          <PrimaryButton
            className={`!mt-8 !mb-5`}
            onClick={onSubmit}
            disabled={postGrupMahasiswaLoading}
          >
            Simpan Data
          </PrimaryButton>
        )}

        {progress ? <ProgressBar completed={progress} /> : null}

        <form className="flex gap-4 flex-wrap items-center mb-4 mt-10">
          <div className="relative w-[]20rem">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AiOutlineSearch size={20} color="gray" />
            </div>
            <input
              type="text"
              id="simple-search"
              className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
              placeholder="Nama Mahasiswa"
              onChange={(e) => setNamaMahasiswa(e.target.value)}
            />
          </div>
          <p>Atau</p>
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
          <p>Atau</p>
          <div className="relative w-[]20rem">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AiOutlineSearch size={20} color="gray" />
            </div>
            <input
              type="text"
              id="simple-search"
              className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
              placeholder="Program Studi"
              onChange={(e) => setProdi(e.target.value)}
            />
          </div>
        </form>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full mt-6">
          <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
            <tr>
              {responseData && (
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Status</p>
                </th>
              )}
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">No</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Nama Mahasiswa</p>
              </th>
               <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">NIM Mahasiswa</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Jurusan</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Angkatan</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Nomor HP</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Email</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {responseData
              ? responseData
                  .filter((getdata) => {
                    return (
                      (namamahasiswa === '' ||
                        getdata.nama_mahasiswa
                          .toLowerCase()
                          .includes(namamahasiswa.toLowerCase())) &&
                      (nim === '' ||
                        getdata.nim_mahasiswa.toString().includes(nim)) &&
                      (prodi === '' ||
                        getdata.name_prody
                          .toLowerCase()
                          .includes(prodi.toLowerCase()))
                    );
                  })
                  .map((filteredData, index) => (
                    <tr
                      key={index}
                      className={`border-b text-gray-600 ${
                        filteredData
                          ? filteredData.error
                            ? 'bg-red-50'
                            : 'bg-green-50'
                          : 'bg-white'
                      }`}
                    >
                      <td className="px-4 py-3">
                        {filteredData.error ? (
                          <TooltipError>
                            {filteredData.error_message}
                          </TooltipError>
                        ) : (
                          <TooltipAccept2>
                            Data berhasil diunggah
                          </TooltipAccept2>
                        )}
                      </td>
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">
                        {filteredData.nama_mahasiswa}
                      </td>
                      <td className="px-4 py-3">
                        {filteredData.nim_mahasiswa}
                      </td>
                      <td className="px-4 py-3">{filteredData.nama_prody}</td>
                      <td className="px-4 py-3">{filteredData.angkatan}</td>
                      <td className="px-4 py-3">{filteredData.telephone}</td>
                      <td className="px-4 py-3">{filteredData.email_universitas}</td>
                    </tr>
                  ))
              : excelData
                  .filter((getdata) => {
                    return (
                      (namamahasiswa === '' ||
                        getdata.nama_mahasiswa
                          .toLowerCase()
                          .includes(namamahasiswa.toLowerCase())) &&
                      (nim === '' ||
                        getdata.nim_mahasiswa.toString().includes(nim)) &&
                      (prodi === '' ||
                        getdata.name_prody
                          .toLowerCase()
                          .includes(prodi.toLowerCase()))
                    );
                  })
                  .map((filteredData, index) => (
                    <tr key={index} className="bg-white border-b text-gray-600">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">
                        {filteredData.nama_mahasiswa}
                      </td>
                      <td className="px-4 py-3">
                        {filteredData.nim_mahasiswa}
                      </td>
                      <td className="px-4 py-3">{filteredData.nama_prody}</td>
                      <td className="px-4 py-3">{filteredData.angkatan}</td>
                      <td className="px-4 py-3">{filteredData.telephone}</td>
                      <td className="px-4 py-3">{filteredData.email_universitas}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default GrupMahasiswaImportExcel;
