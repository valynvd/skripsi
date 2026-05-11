/* eslint-disable no-unused-vars */
import React, { useState, Fragment, useEffect, useMemo } from 'react';
import BreadCrumbs from '../../components/BreadCrumbs';
import { Dialog, Transition } from '@headlessui/react';
import { PrimaryButton } from '../../components/PrimaryButton';
import * as xlsx from 'xlsx';
import { AlertError } from '../../components/Alert';
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import ProgressBar from '@ramonak/react-progress-bar';
import { TooltipAccept2, TooltipError } from '../../components/Tooltip';

import ClipLoader from 'react-spinners/ClipLoader';
import { usePostNilaiMahasiswa } from '../../hooks/useNilaiMahasiswa';

const prodiMapping = {
  10: { name: 'Mathematics', kode: 'BM' },
  20: { name: 'Food Technology', kode: 'FBT' },
  30: {
    name: 'Renewable Energy Engineering',
    kode: 'REE',
  },
  40: {
    name: 'Computer Systems Engineering',
    kode: 'CSE',
  },
  50: { name: 'Software Engineering', kode: 'SE' },
  60: { name: 'Product Design Engineering', kode: 'PDE' },
};

const importTemplateColumns = [
  'NIM',
  'Nama',
  'Prodi',
  'Angkatan',
  'Kode MK',
  'Nama MK',
  'Tahun Akademik',
  'UTS',
  'UAS',
  'Teaching Ass',
  'Final Grade',
];

const getFirstNonEmpty = (row, keys) => {
  for (const key of keys) {
    const value = row?.[key];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return value;
    }
  }
  return '';
};

const normalizeNilaiRow = (row) => {
  const nimValue = String(
    getFirstNonEmpty(row, ['NIM', 'Student ID', 'MhswID'])
  ).trim();
  const prodiFromInput = String(
    getFirstNonEmpty(row, ['Prodi', 'Program Studi', 'Jurusan'])
  ).trim();
  const angkatanFromInput = String(
    getFirstNonEmpty(row, ['Angkatan', 'Tahun Angkatan'])
  ).trim();
  const kodeMk = String(
    getFirstNonEmpty(row, ['Kode MK', 'Subject Short', 'MKKode'])
  ).trim();
  const namaMk = String(
    getFirstNonEmpty(row, ['Nama MK', 'Subject', 'MKNama'])
  ).trim();
  const tahunAkademikRaw = String(
    getFirstNonEmpty(row, ['Tahun Akademik', 'Academic Year'])
  ).trim();
  const academicYearFromInput = String(
    getFirstNonEmpty(row, ['Academic Year'])
  ).trim();
  const academicSessionFromInput = String(
    getFirstNonEmpty(row, ['Academic Session', 'Semester'])
  ).trim();
  const academicYear =
    academicYearFromInput ||
    (tahunAkademikRaw.length >= 4 ? tahunAkademikRaw.slice(0, 4) : tahunAkademikRaw);
  const academicSession =
    academicSessionFromInput ||
    (tahunAkademikRaw.length >= 6 ? tahunAkademikRaw.slice(-2) : '');
  const finalGrade = String(
    getFirstNonEmpty(row, ['Final Grade', 'Final Marks', 'GradeNIlai'])
  ).trim();
  const prodiCode = nimValue.length >= 4 ? nimValue.slice(2, 4) : '';
  const angkatanPrefix = nimValue.length >= 6 ? nimValue.slice(4, 6) : '';
  const prodiInfo = prodiMapping[prodiCode] || { name: prodiFromInput || 'Unknown' };
  const angkatanValue =
    angkatanFromInput || (angkatanPrefix ? `20${angkatanPrefix}` : '');
  const namaMahasiswa = getFirstNonEmpty(row, ['Nama', 'Student Name']);

  return {
    ...row,
    NIM: nimValue,
    'Student ID': getFirstNonEmpty(row, ['Student ID', 'NIM', 'MhswID']) || nimValue,
    'Student Name': namaMahasiswa,
    Nama: namaMahasiswa,
    prodi: prodiInfo.name,
    Prodi: getFirstNonEmpty(row, ['Prodi', 'Program Studi', 'Jurusan']) || prodiInfo.name,
    angkatan: angkatanValue,
    Angkatan: angkatanValue,
    'Subject Short': kodeMk,
    'Kode MK': kodeMk,
    Subject: namaMk,
    'Nama MK': namaMk,
    'Academic Year': academicYear,
    'Tahun Akademik': tahunAkademikRaw || academicYear,
    'Academic Session': academicSession,
    Semester: academicSession,
    'Mid Sem.': getFirstNonEmpty(row, ['Mid Sem.', 'UTS']),
    UTS: getFirstNonEmpty(row, ['UTS', 'Mid Sem.']),
    'End Sem.': getFirstNonEmpty(row, ['End Sem.', 'UAS']),
    UAS: getFirstNonEmpty(row, ['UAS', 'End Sem.']),
    'Teaching Ass.': getFirstNonEmpty(row, ['Teaching Ass.', 'TeachingAss', 'Teaching Ass']),
    'Graded Credits': getFirstNonEmpty(row, ['Graded Credits', 'SKS', 'Earned Credits']),
    SKS: getFirstNonEmpty(row, ['SKS', 'Graded Credits', 'Earned Credits']),
    'Final Marks': finalGrade,
    'Final Grade': finalGrade,
    name_prody: prodiInfo.name,
    nama_mahasiswa: namaMahasiswa,
    nim_mahasiswa: nimValue,
    student_name: namaMahasiswa,
    subject_short: kodeMk,
    subject: namaMk,
    graded_credits: getFirstNonEmpty(row, ['Graded Credits', 'SKS', 'Earned Credits']),
    earned_credits: getFirstNonEmpty(row, ['Earned Credits', 'Graded Credits', 'SKS']),
    academic_year: academicYear,
    academic_session: academicSession,
    grade_symbol: finalGrade || 'T',
  };
};

const NilaiMahasiswaImportExcel = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [open, setOpen] = useState(false);
  const [namamahasiswa, setNamaMahasiswa] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('');

  const [nilaiD, setNilaiD] = useState('');
  const [nilaiE, setNilaiE] = useState('');
  const [jumlahSks, setJumlahSks] = useState('');
  const [dataFilter, setDataFilter] = useState([]);
  const [tahunAcademic, setTahunAcademic] = useState([]);
  const [ipsSemester, setIpsSemester] = useState([]);
  const [nilaiIpk, setNilaiIpk] = useState('');
  const [progress, setProgress] = useState(0);

  const [excelData, setExcelData] = useState([]);
  const [responseData, setResponseData] = useState();
  const navigate = useNavigate();

  const [excelRead, setExcelRead] = useState(false);
  const [loading, setLoading] = useState(false);

  const [rowStatus, setRowStatus] = useState([]);
  const [originalExcelData, setOriginalExcelData] = useState([]);
  const [importComplete, setImportComplete] = useState(false);

  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const handleDownloadTemplate = () => {
    const workbook = xlsx.utils.book_new();
    const worksheetData = [
      importTemplateColumns,
      ['', '', '', '', '', '', '', '', '', '', ''],
    ];
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = importTemplateColumns.map((column) => ({
      wch: Math.max(column.length + 2, 14),
    }));

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Template Nilai');
    xlsx.writeFile(workbook, 'Template Import Nilai Mahasiswa.xlsx');
  };

  const readExcel = async (e) => {
    try {
      // Reset state ke kondisi awal sebelum membaca file baru
      setLoading(true);
      setExcelData([]);
      setOriginalExcelData([]);
      setErrorMessage(null);
      setExcelRead(false);
      setResponseData([]);
      setProgress(0);
      setImportComplete(false);
      setRowStatus([]);

      // Reset checkbox states
      setSelectedRows([]);
      setIsAllSelected(false);

      const file = e.target.files[0];

      if (!file) {
        throw new Error('File tidak valid atau tidak dipilih');
      }

      const data = await file.arrayBuffer(); // Menggunakan `await` langsung pada `arrayBuffer`
      const excelfile = xlsx.read(data);
      const excelsheet = excelfile.Sheets[excelfile.SheetNames[0]];
      const exceljson = xlsx.utils.sheet_to_json(excelsheet, { defval: '' });

      const filteredExcelData = exceljson.map((data) => normalizeNilaiRow(data));

      setExcelData(filteredExcelData);
      setOriginalExcelData(filteredExcelData);
      setDataFilter(filteredExcelData);
      console.log('Filtered Data Nilai', filteredExcelData);
      setExcelRead(true);
      setLoading(false);
    } catch (error) {
      console.error('Error reading excel file:', error);
      setErrorMessage(
        'Terjadi kesalahan saat membaca file. Pastikan file valid dan sesuai format.'
      );
      setLoading(false);
    }
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const {
    mutateAsync: postNilaiMahasiswa,
    isLoading: postNilaiMahasiswaLoading,
  } = usePostNilaiMahasiswa();

  const onSubmit = async () => {
    // if (excelData.length === 0) {
    //   setErrorMessage('Tidak ada data untuk disubmit.');
    //   return;
    // }
    if (selectedRows.length === 0) {
      setErrorMessage('Tidak ada data yang dipilih untuk disubmit.');
      setHasSubmitError(true);
      return;
    }

    setHasSubmitError(false);
    setErrorMessage(null);

    let getResponseData = [];
    let newRowStatus = [];

    for (let index = 0; index < selectedRows.length; index++) {
      const selectedIndex = selectedRows[index];
      const data = excelData[selectedIndex];
      const nilaiMahasiswaFormData = new FormData();

      for (const key in data) {
        nilaiMahasiswaFormData.append(key, data[key]);
      }

      try {
        const response = await postNilaiMahasiswa(nilaiMahasiswaFormData);
        if (response && response.data) {
          getResponseData.push({ ...response.data, status: 'success' });
          newRowStatus[selectedIndex] = 'success';
        } else {
          getResponseData.push({
            ...data,
            status: 'error',
            errorMessage: 'Tidak ada data respon',
          });
          newRowStatus[selectedIndex] = 'error';
        }
      } catch (err) {
        getResponseData.push({
          ...data,
          status: 'error',
          errorMessage: err.response?.data || err.message,
        });
        newRowStatus[selectedIndex] = 'error';
      }

      const newProgress = ((index + 1) / selectedRows.length) * 100;
      if (newProgress === 100.0) {
        setOpen(true);
      }
      setProgress(newProgress.toFixed(2));
    }

    console.log('Get Respons Data', getResponseData);
    setResponseData(getResponseData);
    setRowStatus(newRowStatus);
    setImportComplete(true);
  };

  const handleToClose = () => {
    setOpen(false);
    setProgress('');
  };

  const filteredData = useMemo(() => {
    return excelData.filter((getdata) => {
      return (
        (namamahasiswa === '' ||
          getdata['Student Name']
            .toLowerCase()
            .includes(namamahasiswa.toLowerCase())) &&
        (nim === '' || getdata['NIM'].toString().includes(nim)) &&
        (prodi === '' ||
          getdata.prodi.toLowerCase().includes(prodi.toLowerCase()))
      );
    });
  }, [excelData, namamahasiswa, nim, prodi]);

  const handleCheckboxChange = (index) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((i) => i !== index));
    } else {
      setSelectedRows([...selectedRows, index]);
    }

    if (hasSubmitError && selectedRows.length >= 0) {
      setErrorMessage(null);
      setHasSubmitError(false);
    }
  };

  const handleCheckAllChange = () => {
    if (isAllSelected) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredData.map((_, index) => index));
    }
    setIsAllSelected(!isAllSelected);
  };

  return (
    <section id="datamahasiswa-form" className="section-container">
      <Transition show={open} as={Fragment}>
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
              name: 'Nilai Detail Mahasiswa',
              link: '/kurikulum-obe/nilai-detail',
            },
            { name: 'Buat' },
          ]}
        />
        Buat Import Excel
      </p>
      <div className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
        <p className="font-semibold text-gray-900">Template Excel yang dipakai</p>
        <p className="mt-1 text-gray-600">
          Kolom yang perlu diisi: {importTemplateColumns.join(', ')}.
        </p>
        <PrimaryButton
          type="button"
          className="!mt-4"
          onClick={handleDownloadTemplate}
        >
          Download Template Excel
        </PrimaryButton>
      </div>
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
        {errorMessage && (
          <AlertError className="inline-block">{errorMessage}</AlertError>
        )}

        <PrimaryButton
          className={`!mt-8 !mb-5 ${
            !excelRead ||
            postNilaiMahasiswaLoading ||
            (hasSubmitError && selectedRows.length === 0)
              ? '!bg-gray-200 !border-gray-400 !text-gray-500 cursor-not-allowed'
              : ''
          }`}
          onClick={onSubmit}
          disabled={
            !excelRead ||
            postNilaiMahasiswaLoading ||
            (hasSubmitError && selectedRows.length === 0)
          }
        >
          Simpan ke Database
        </PrimaryButton>

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
              <th className="px-4 py-3 font-semibold">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleCheckAllChange}
                />
              </th>

              {importComplete && responseData && (
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Status</p>
                </th>
              )}
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">No</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Nama</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">NIM</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Prodi</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Angkatan</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Kode MK</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Mata Kuliah</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">SKS</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">UAS</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">UTS</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">TA</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Final Grade</p>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="13" className="text-center">
                  <ClipLoader color={'hsla(357, 85%, 52%, 1)'} size={50} />
                </td>
              </tr>
            ) : (
              filteredData.map((data, index) => {
                const status = rowStatus[index]; // Ambil status untuk baris ini
                return (
                  <tr
                    key={index}
                    className={`border-b text-gray-600 ${
                      importComplete
                        ? status === 'success'
                          ? 'bg-green-50'
                          : status === 'error'
                          ? 'bg-red-50'
                          : 'bg-white'
                        : 'bg-white'
                    }`}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(index)}
                        onChange={() => handleCheckboxChange(index)}
                      />
                    </td>
                    {importComplete && (
                      <td className="px-4 py-3">
                        {status === 'error' ? (
                          <TooltipError>
                            {responseData &&
                              responseData[index] &&
                              responseData[index].errorMessage}
                          </TooltipError>
                        ) : (
                          <TooltipAccept2>
                            Data berhasil diunggah
                          </TooltipAccept2>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{data['Student Name']}</td>
                    <td className="px-4 py-3">{data['NIM']}</td>
                    <td className="px-4 py-3">{data.prodi}</td>
                    <td className="px-4 py-3">{data.angkatan}</td>
                    <td className="px-4 py-3">{data['Subject Short']}</td>
                    <td className="px-4 py-3">{data['Subject']}</td>
                    <td className="px-4 py-3">{data['Graded Credits']}</td>
                    <td className="px-4 py-3">{data['End Sem.'] || 0}</td>
                    <td className="px-4 py-3">{data['Mid Sem.'] || 0}</td>
                    <td className="px-4 py-3">{data['Teaching Ass.'] || 0}</td>
                    <td className="px-4 py-3">{data['Final Marks'] || 'T'}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default NilaiMahasiswaImportExcel;
