/* eslint-disable no-unused-vars */
import React, { useState, useMemo, Fragment, useEffect } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { Dialog, Transition } from '@headlessui/react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { usePostMonitoringMahasiswa } from '../../hooks/useMonitoringMahasiswa';
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

const MonitoringMahasiswaImportExcel = () => {
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
    console.log(exceljson)
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const {
    mutateAsync: postMonitoringMahasiswa,
    isLoading: postMonitoringMahasiswaLoading,
  } = usePostMonitoringMahasiswa();

  const onSubmit = async () => {
    if (excelData.length === 0) {
      return;
    }

    let getResponseData = [];

    for (let index = 0; index < excelData.length; index++) {
      const data = excelData[index];
      const monitoringMahasiswaFormData = new FormData();
      const transkripNilaiFormData = new FormData();

      for (const key in data) {
        monitoringMahasiswaFormData.append(key, data[key]);
        transkripNilaiFormData.append(key, data[key]);
      }

      try {
        await postMonitoringMahasiswa(monitoringMahasiswaFormData, {
          onSuccess: (res) => {
            getResponseData.push(res.data);
          },
        });
        await delay(50);
      } catch (err) {
        getResponseData.push(err.response.data);
      }
      const newProgress = ((index + 1) / excelData.length) * 100;
        if (newProgress == 100.0) {
          setOpen(true);
        }
        setProgress(newProgress.toFixed(2));
    }
    console.log(getResponseData)
    setResponseData(getResponseData);
  };

  const handleToClose = () => {
    setOpen(false);
    setProgress('');
  };

  return (
    <section id="datamahasiswa-form" className="section-container">
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
                    Unggah Akademik Mahasiswa Berhasil
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
              name: 'Mentoring Mahasiswa',
              link: '/degreeaudit/monitoring-akademik',
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
            disabled={postMonitoringMahasiswaLoading}
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
        {/* {namamahasiswa ? (
            <PrimaryButton onClick={handleSubmit}>
              Audit
            </PrimaryButton>
          ): null } */}
      </div>

      {jumlahSks ? (
        <div className="overflow-x-auto mt-10">
          <p>Nama Mahasiswa : {dataFilter[0].nama_mahasiswa}</p>
          <p>NIM : {dataFilter[0].nim_mahasiswa}</p>
          <p>Program Studi : {dataFilter[0].name_prody}</p>
          <p>Angkatan : {dataFilter[0].angkatan}</p>
          <p>Jumlah SKS : {jumlahSks}</p>
          <p>Jumlah Nilai D : {nilaiD} sks</p>
          <p>Jumlah Nilai E : {nilaiE} sks</p>
          <p>IPK : {nilaiIpk}</p>
        </div>
      ) : (
        <div></div>
      )}
      {ipsSemester ? (
        <div className="overflow-x-auto">
          {ipsSemester.map((getData, tableIndex) => (
            <table key={tableIndex} className="w-full mt-10">
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {getData.academicYear}
                    {getData.academicSession === 10
                      ? ' Odd'
                      : getData.academicSession === 20
                      ? ' Odd Short'
                      : getData.academicSession === 30
                      ? ' Even'
                      : getData.academicSession === 40
                      ? ' Even Short'
                      : ' Unknown Session Type'}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    IPS : {getData.ips}
                  </th>
                </tr>
              </thead>
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                <tr>
                  <th className="px-4 py-3 font-semibold">No</th>
                  <th className="px-4 py-3 font-semibold">Mata Kuliah</th>
                  <th className="px-4 py-3 font-semibold">SKS</th>
                  <th className="px-4 py-3 font-semibold">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {dataFilter
                  .filter(
                    (getdata) =>
                      getdata.academic_year === getData.academicYear &&
                      getdata.academic_session === getData.academicSession
                  ) // Use === for comparison
                  .map((filteredData, index) => (
                    <tr key={index} className="bg-white border-b text-gray-600">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{filteredData.subject}</td>
                      <td className="px-4 py-3">
                        {filteredData.graded_credits}
                      </td>
                      <td className="px-4 py-3">{filteredData.grade_symbol}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
        </div>
      ) : (
        <div></div>
      )}

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
                <p className="flex flex-row items-center">NIM</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Jurusan</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Angkatan</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Mata Kuliah</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">SKS</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Nilai</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {responseData
              ? responseData
                  .filter((getdata) => {
                    return (
                      (namamahasiswa === '' ||
                        (getdata.mahasiswa_detail.nama
                          .toLowerCase()
                          .includes(namamahasiswa.toLowerCase()))
                        ) &&
                      (nim === '' ||
                        (getdata.mahasiswa_detail.nim.toString().includes(nim))) &&
                      (prodi === '' ||
                        (getdata.mahasiswa_detail.prodi_detail.name
                          .toLowerCase()
                          .includes(prodi.toLowerCase())) 
                        )
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
                        {/* {filteredData.mahasiswa_detail.nama} */}
                        {filteredData.mahasiswa_detail['nama']}
                      </td>
                      <td className="px-4 py-3">
                        {filteredData.mahasiswa_detail.nim}
                        {/* {filteredData.mahasiswa_detail.nim} */}
                      </td>
                      <td className="px-4 py-3">{filteredData.mahasiswa_detail.prodi_detail.name}
                        {/* {filteredData.mahasiswa_detail.prodi_detail.name} */}
                      </td>
                      <td className="px-4 py-3">{filteredData.mahasiswa_detail.angkatan}
                        {/* {filteredData.mahasiswa_detail.angkatan} */}
                        </td>
                      <td className="px-4 py-3">{filteredData.mata_kuliah_detail.name}
                        {/* {filteredData.mata_kuliah_detail.name} */}
                        </td>
                      <td className="px-4 py-3">
                        {filteredData.earned_credits}
                      </td>
                      <td className="px-4 py-3">{filteredData.grade_symbol}</td>
                    </tr>
                  ))
              : excelData
                  .filter((getdata) => {
                    return (
                      (namamahasiswa === '' ||
                        getdata.Name
                          .toLowerCase()
                          .includes(namamahasiswa.toLowerCase())) &&
                      (nim === '' ||
                        getdata.NIM.toString().includes(nim)) &&
                      (prodi === '' ||
                        getdata['Program (Desc.)']

                          .toLowerCase()
                          .includes(prodi.toLowerCase()))
                    );
                  })
                  .map((filteredData, index) => (
                    <tr key={index} className="bg-white border-b text-gray-600">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">
                        {filteredData.Name}
                      </td>
                      <td className="px-4 py-3">
                        {filteredData.NIM}
                      </td>
                      <td className="px-4 py-3">{filteredData['Program (Desc.)']}</td>
                      <td className="px-4 py-3">{filteredData.Angkatan}</td>
                      <td className="px-4 py-3">{filteredData.Subject}</td>
                      <td className="px-4 py-3">
                        {filteredData['Graded Credits']}
                      </td>
                      <td className="px-4 py-3">{filteredData['Grade symbol'] || "T"}</td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default MonitoringMahasiswaImportExcel;
