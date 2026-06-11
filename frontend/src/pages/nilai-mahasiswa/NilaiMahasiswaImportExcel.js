/* eslint-disable no-unused-vars */
import React, { useState, Fragment, useEffect, useMemo, useRef } from 'react';
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
import { useMataKuliahData } from '../../hooks/useMataKuliah';

const prodiMapping = {
  10: {
    name: 'Mathematics',
    kode: 'BM',
    aliases: ['S1BM', 'MATHEMATICS', 'MATH'],
  },
  20: {
    name: 'Food Technology',
    kode: 'FBT',
    aliases: ['S1FBT', 'FOOD TECHNOLOGY', 'FOODTECHNOLOGY'],
  },
  30: {
    name: 'Renewable Energy Engineering',
    kode: 'REE',
    aliases: [
      'S1REE',
      'RENEWABLE ENERGY ENGINEERING',
      'RENEWABLEENERGYENGINEERING',
    ],
  },
  40: {
    name: 'Computer Systems Engineering',
    kode: 'CSE',
    aliases: [
      'S1CSE',
      'COMPUTER SYSTEMS ENGINEERING',
      'COMPUTERSYSTEMSENGINEERING',
    ],
  },
  50: {
    name: 'Software Engineering',
    kode: 'SE',
    aliases: [
      'S1SE',
      'S1ESE',
      'ESE',
      'SOFTWARE ENGINEERING',
      'SOFTWAREENGINEERING',
    ],
  },
  60: {
    name: 'Product Design Engineering',
    kode: 'PDE',
    aliases: [
      'S1PDE',
      'PRODUCT DESIGN ENGINEERING',
      'PRODUCTDESIGNENGINEERING',
    ],
  },
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
  'TA',
  'Nilai Akhir',
  'Grade Nilai',
];

const requiredImportColumns = importTemplateColumns.filter(
  (column) => column !== 'Angkatan'
);

const importColumnAliases = {
  NIM: ['Student ID', 'MhswID'],
  Nama: ['Student Name', 'Nama Mahasiswa'],
  Prodi: ['Program Studi', 'Jurusan', 'ProdiID'],
  Angkatan: ['Tahun Angkatan'],
  'Kode MK': ['Subject Short', 'MKKode'],
  'Nama MK': ['Subject', 'Mata Kuliah', 'MKNama'],
  'Tahun Akademik': ['Academic Year', 'TahunID'],
  TA: ['Teaching Ass.', 'TeachingAss', 'Teaching Ass'],
  'Nilai Akhir': ['Final Marks', 'Final Grade', 'Nilai', 'NilaiAkhir'],
  'Grade Nilai': ['GradeNIlai', 'Grade'],
};

const academicYearGuideRows = [
  ['Keterangan', 'Contoh'],
  ['Format Tahun Akademik', '202230'],
  ['Arti 202230', 'Tahun 2022, semester genap'],
  ['Format lain yang dipakai sistem', '202210 = 2022 ganjil, 202220 = 2022 ganjil pendek, 202240 = 2022 genap pendek'],
  ['Angkatan', 'Opsional. Jika kosong/tidak ada, sistem mengambil angkatan dari NIM'],
  ['Acuan import', 'Grade Nilai menjadi sumber utama; baris dengan 0 atau - akan dilewati'],
  ['SKS', 'Diambil dari master mata kuliah jika kolom Excel kosong'],
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

const normalizeHeaderText = (value) =>
  String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ');

const getMissingColumns = (headers, requiredColumns) => {
  const normalizedHeaders = headers.map(normalizeHeaderText);
  return requiredColumns.filter((column) => {
    const acceptedHeaders = [column, ...(importColumnAliases[column] || [])].map(
      normalizeHeaderText
    );

    return !acceptedHeaders.some((header) => normalizedHeaders.includes(header));
  });
};

const normalizeAngkatanValue = (value) => {
  const text = String(value ?? '').trim();
  const yearMatch = text.match(/\d{4}/);
  return yearMatch ? yearMatch[0] : text;
};

const hasUsableGradeNilai = (value) => {
  const text = String(value ?? '').trim();
  if (!text) {
    return false;
  }

  const upperText = text.toUpperCase();
  if (['0', '0.0', 'T'].includes(upperText)) {
    return false;
  }

  if (['A', 'AB', 'B', 'BC', 'C', 'D', 'E'].includes(upperText)) {
    return true;
  }

  const numericValue = Number(text.replace(',', '.'));
  return Number.isFinite(numericValue) && numericValue > 0;
};

const normalizeNilaiRow = (row) => {
  const nimValue = String(
    getFirstNonEmpty(row, ['NIM', 'Student ID', 'MhswID'])
  ).trim();
  const prodiFromInput = String(
    getFirstNonEmpty(row, ['Prodi', 'Program Studi', 'Jurusan', 'ProdiID'])
  ).trim();
  const angkatanFromInput = normalizeAngkatanValue(
    getFirstNonEmpty(row, ['Angkatan', 'Tahun Angkatan'])
  );
  const kodeMk = String(
    getFirstNonEmpty(row, ['Kode MK', 'Subject Short', 'MKKode'])
  ).trim();
  const namaMk = String(
    getFirstNonEmpty(row, ['Nama MK', 'Subject', 'MKNama'])
  ).trim();
  const tahunAkademikRaw = String(
    getFirstNonEmpty(row, ['Tahun Akademik', 'Academic Year', 'TahunID'])
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
  const nilaiAkhir = String(
    getFirstNonEmpty(row, ['Nilai Akhir', 'Final Marks', 'Final Grade', 'Nilai', 'NilaiAkhir'])
  ).trim();
  const gradeNilai = String(
    getFirstNonEmpty(row, ['Grade Nilai', 'GradeNIlai'])
  ).trim();
  const prodiCode = nimValue.length >= 4 ? nimValue.slice(2, 4) : '';
  const angkatanPrefix = nimValue.length >= 6 ? nimValue.slice(4, 6) : '';
  const normalizedProdiFromInput = prodiFromInput.replace(/\s+/g, '').toUpperCase();
  const prodiInfo =
    prodiMapping[prodiCode] ||
    Object.values(prodiMapping).find((entry) =>
      [
        entry.kode,
        entry.name,
        ...(entry.aliases || []),
      ].some((alias) => String(alias).replace(/\s+/g, '').toUpperCase() === normalizedProdiFromInput)
    ) || { name: prodiFromInput || 'Unknown', kode: prodiCode };
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
    prodi_kode: prodiInfo.kode,
    Prodi: getFirstNonEmpty(row, ['Prodi', 'Program Studi', 'Jurusan', 'ProdiID']) || prodiInfo.name,
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
    TA: getFirstNonEmpty(row, ['TA', 'Teaching Ass.', 'TeachingAss', 'Teaching Ass']),
    'Graded Credits': getFirstNonEmpty(row, ['Graded Credits', 'SKS', 'Earned Credits']),
    SKS: getFirstNonEmpty(row, ['SKS', 'Graded Credits', 'Earned Credits']),
    'Nilai Akhir': nilaiAkhir,
    'Final Marks': nilaiAkhir,
    'Grade Nilai': gradeNilai,
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
    grade_symbol: gradeNilai || 'T',
  };
};

const NilaiMahasiswaImportExcel = () => {
  const [errorMessage, setErrorMessage] = useState();
  const [open, setOpen] = useState(false);
  const [namamahasiswa, setNamaMahasiswa] = useState('');
  const [nim, setNim] = useState('');
  const [prodi, setProdi] = useState('');
  const [angkatan, setAngkatan] = useState('');

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
  const [importSummary, setImportSummary] = useState(null);
  const [processMessage, setProcessMessage] = useState('');
  const [isImportRunning, setIsImportRunning] = useState(false);
  const [validationIssues, setValidationIssues] = useState([]);
  const uploadAbortRef = useRef(null);
  const cancelRequestedRef = useRef(false);

  const [selectedRows, setSelectedRows] = useState([]);
  const [isAllSelected, setIsAllSelected] = useState(false);
  const [hasSubmitError, setHasSubmitError] = useState(false);

  const { data: mataKuliahResponse } = useMataKuliahData({
    select: (response) => response?.data || [],
  });

  const handleDownloadTemplate = () => {
    const workbook = xlsx.utils.book_new();
    const worksheetData = [
      importTemplateColumns,
      importTemplateColumns.map(() => ''),
    ];
    const worksheet = xlsx.utils.aoa_to_sheet(worksheetData);

    worksheet['!cols'] = importTemplateColumns.map((column) => ({
      wch: Math.max(column.length + 2, 14),
    }));

    xlsx.utils.book_append_sheet(workbook, worksheet, 'Template Nilai');
    const guideWorksheet = xlsx.utils.aoa_to_sheet(academicYearGuideRows);
    guideWorksheet['!cols'] = [
      { wch: 28 },
      { wch: 70 },
    ];
    xlsx.utils.book_append_sheet(workbook, guideWorksheet, 'Panduan');
    xlsx.writeFile(workbook, 'Template Import Nilai Mahasiswa.xlsx');
  };

  const readExcel = async (e) => {
    try {
      // Reset state ke kondisi awal sebelum membaca file baru
      setLoading(true);
      setProcessMessage('Sedang membaca file Excel...');
      setIsImportRunning(false);
      cancelRequestedRef.current = false;
      uploadAbortRef.current = null;
      setExcelData([]);
      setOriginalExcelData([]);
      setErrorMessage(null);
      setExcelRead(false);
      setResponseData([]);
      setProgress(0);
      setImportComplete(false);
      setRowStatus([]);
      setImportSummary(null);
      setValidationIssues([]);

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

      if (!exceljson || exceljson.length === 0) {
        throw new Error('File Excel kosong atau tidak memiliki data.');
      }

      const firstRowHeaders = Object.keys(exceljson[0] || {});
      const missingColumns = getMissingColumns(firstRowHeaders, requiredImportColumns);
      if (missingColumns.length > 0) {
        throw new Error(
          `Template Excel tidak sesuai. Kolom yang kurang: ${missingColumns.join(', ')}`
        );
      }

      const filteredExcelData = exceljson.map((data) => normalizeNilaiRow(data));

      setExcelData(filteredExcelData);
      setOriginalExcelData(filteredExcelData);
      setDataFilter(filteredExcelData);
      console.log('Filtered Data Nilai', filteredExcelData);
      setExcelRead(true);
      setProcessMessage('File berhasil dibaca. Silakan cek data sebelum disimpan.');
      setLoading(false);
    } catch (error) {
      console.error('Error reading excel file:', error);
      setErrorMessage(
        error.message ||
          'Terjadi kesalahan saat membaca file. Pastikan file valid dan sesuai format.'
      );
      setProcessMessage('');
      setLoading(false);
    }
  };
  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  const normalizedMataKuliahList = useMemo(() => {
    return (mataKuliahResponse || []).map((item) => ({
      ...item,
      kode_normalized: String(item?.kode || '').trim().toUpperCase(),
      prodi_kode_normalized: String(
        item?.prodi_detail?.kode || item?.prodi_detail?.name || ''
      )
        .trim()
        .toUpperCase(),
    }));
  }, [mataKuliahResponse]);

  useEffect(() => {
    if (!excelData.length || !normalizedMataKuliahList.length) {
      setValidationIssues([]);
      return;
    }

    const missingMatkul = excelData
      .map((row, index) => {
        const kodeMk = String(row.subject_short || row['Kode MK'] || '').trim().toUpperCase();
        const prodiKode = String(row.prodi_kode || '').trim().toUpperCase();
        const matched = normalizedMataKuliahList.find(
          (item) =>
            item.kode_normalized === kodeMk &&
            item.prodi_kode_normalized === prodiKode
        );

        if (!matched) {
          return {
            index,
            nim: row.nim_mahasiswa || row.NIM || '',
            kodeMk,
            prodi: row.prodi || row.Prodi || '',
            namaMk: row.subject || row.Subject || row['Nama MK'] || '',
          };
        }

        return null;
      })
      .filter(Boolean);

    setValidationIssues(missingMatkul);
    if (missingMatkul.length > 0) {
      const preview = missingMatkul
        .slice(0, 5)
        .map((item) => `${item.nim} / ${item.kodeMk}`)
        .join(', ');
      setErrorMessage(
        `Ada ${missingMatkul.length} baris dengan Kode MK belum ada di master matkul. Contoh: ${preview}. Baris tersebut akan dilewati saat upload.`
      );
    }
  }, [excelData, normalizedMataKuliahList]);

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
    setIsImportRunning(true);
    cancelRequestedRef.current = false;
    const uploadController = new AbortController();
    uploadAbortRef.current = uploadController;
    setProcessMessage('Sedang mengunggah data ke database...');
    setImportSummary(null);

    let getResponseData = [];
    let newRowStatus = [];
    let successCount = 0;
    let skippedCount = 0;
    let errorCount = 0;
    let cancelledDuringUpload = false;
    const missingMasterByIndex = new Map(
      validationIssues.map((issue) => [issue.index, issue])
    );

    for (let index = 0; index < selectedRows.length; index++) {
      if (cancelRequestedRef.current || uploadController.signal.aborted) {
        cancelledDuringUpload = true;
        break;
      }

      const selectedIndex = selectedRows[index];
      const data = excelData[selectedIndex];
      setProcessMessage(
        `Sedang mengunggah data ke database... (${index + 1}/${selectedRows.length})`
      );

      const missingMasterIssue = missingMasterByIndex.get(selectedIndex);
      if (missingMasterIssue) {
        const skippedMessage =
          `Kode MK ${missingMasterIssue.kodeMk || '-'} belum ada di master matkul untuk prodi ${missingMasterIssue.prodi || '-'}.`;
        getResponseData[selectedIndex] = {
          ...data,
          status: 'skipped',
          errorMessage: skippedMessage,
        };
        newRowStatus[selectedIndex] = 'skipped';
        skippedCount += 1;

        const newProgress = ((index + 1) / selectedRows.length) * 100;
        setProgress(newProgress.toFixed(2));
        continue;
      }

      if (!hasUsableGradeNilai(data['Grade Nilai'])) {
        const skippedMessage = 'Grade Nilai kosong/0, baris dilewati.';
        getResponseData[selectedIndex] = {
          ...data,
          status: 'skipped',
          errorMessage: skippedMessage,
        };
        newRowStatus[selectedIndex] = 'skipped';
        skippedCount += 1;

        const newProgress = ((index + 1) / selectedRows.length) * 100;
        setProgress(newProgress.toFixed(2));
        continue;
      }

      const nilaiMahasiswaFormData = new FormData();

      for (const key in data) {
        nilaiMahasiswaFormData.append(key, data[key]);
      }

      try {
        const response = await postNilaiMahasiswa({
          data: nilaiMahasiswaFormData,
          signal: uploadController.signal,
        });
        if (response && response.data) {
          if (response.data.status === 'skipped') {
            getResponseData[selectedIndex] = {
              ...data,
              status: 'skipped',
              errorMessage: response.data.message || 'Grade Nilai kosong/0, baris dilewati.',
            };
            newRowStatus[selectedIndex] = 'skipped';
            skippedCount += 1;
          } else {
            getResponseData[selectedIndex] = { ...response.data, status: 'success' };
            newRowStatus[selectedIndex] = 'success';
            successCount += 1;
          }
        } else {
          getResponseData[selectedIndex] = {
            ...data,
            status: 'error',
            errorMessage: 'Tidak ada data respon',
          };
          newRowStatus[selectedIndex] = 'error';
          errorCount += 1;
        }
      } catch (err) {
        const isRequestCancelled =
          err?.code === 'ERR_CANCELED' ||
          err?.name === 'CanceledError' ||
          err?.message === 'canceled';

        if (isRequestCancelled || cancelRequestedRef.current || uploadController.signal.aborted) {
          cancelledDuringUpload = true;
          getResponseData[selectedIndex] = {
            ...data,
            status: 'cancelled',
            errorMessage: 'Import dibatalkan oleh pengguna.',
          };
          newRowStatus[selectedIndex] = 'cancelled';
          break;
        }

        getResponseData[selectedIndex] = {
          ...data,
          status: 'error',
          errorMessage: err.response?.data || err.message,
        };
        newRowStatus[selectedIndex] = 'error';
        errorCount += 1;
      }

      const newProgress = ((index + 1) / selectedRows.length) * 100;
      setProgress(newProgress.toFixed(2));
    }

    const processedCount = successCount + skippedCount + errorCount;
    const cancelledCount = cancelledDuringUpload
      ? Math.max(selectedRows.length - processedCount, 0)
      : 0;

    console.log('Get Respons Data', getResponseData);
    setResponseData(getResponseData);
    setRowStatus(newRowStatus);
    setImportComplete(true);
    setImportSummary({
      total: selectedRows.length,
      successCount,
      skippedCount,
      errorCount,
      cancelledCount,
      cancelledDuringUpload,
    });
    setProcessMessage(
      cancelledDuringUpload
        ? `Import dibatalkan. Berhasil: ${successCount}, dilewati: ${skippedCount}, gagal: ${errorCount}, dibatalkan: ${cancelledCount}.`
        : `Import selesai. Berhasil: ${successCount}, dilewati: ${skippedCount}, gagal: ${errorCount}.`
    );
    setIsImportRunning(false);
    uploadAbortRef.current = null;
    setOpen(true);
  };

  const handleToClose = () => {
    setOpen(false);
    setProgress('');
  };

  const handleCancelImport = () => {
    if (!isImportRunning) {
      return;
    }

    cancelRequestedRef.current = true;
    setProcessMessage('Permintaan pembatalan sedang diproses...');

    if (uploadAbortRef.current) {
      uploadAbortRef.current.abort();
    }
  };

  const filteredData = useMemo(() => {
    return excelData
      .map((getdata, originalIndex) => ({ ...getdata, originalIndex }))
      .filter((getdata) => {
        return (
          (namamahasiswa === '' ||
            getdata['Student Name']
              .toLowerCase()
              .includes(namamahasiswa.toLowerCase())) &&
          (nim === '' || getdata['NIM'].toString().includes(nim)) &&
          (prodi === '' ||
            getdata.prodi.toLowerCase().includes(prodi.toLowerCase())) &&
          (angkatan === '' ||
            String(getdata.angkatan || '').includes(angkatan))
        );
      });
  }, [excelData, namamahasiswa, nim, prodi, angkatan]);

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
      setSelectedRows(filteredData.map((data) => data.originalIndex));
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
                    {importSummary && importSummary.cancelledDuringUpload
                      ? 'Import dibatalkan'
                      : importSummary &&
                        (importSummary.errorCount > 0 ||
                          importSummary.skippedCount > 0)
                      ? 'Import selesai dengan catatan'
                      : 'Import berhasil'}
                  </Dialog.Title>
                  <p className="text-gray-600 mt-2 max-w-md">
                    {importSummary
                      ? importSummary.cancelledDuringUpload
                        ? `Total ${importSummary.total} baris. Berhasil ${importSummary.successCount}, dilewati ${importSummary.skippedCount}, gagal ${importSummary.errorCount}, dibatalkan ${importSummary.cancelledCount}.`
                        : `Total ${importSummary.total} baris. Berhasil ${importSummary.successCount}, dilewati ${importSummary.skippedCount}, gagal ${importSummary.errorCount}.`
                      : 'Proses import selesai.'}
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
          Kolom yang didukung: {importTemplateColumns.join(', ')}.
        </p>
        <p className="mt-2 text-gray-600">
          Kolom <span className="font-medium">Angkatan</span> opsional. Jika kosong
          atau tidak ada, sistem mengambil angkatan dari NIM.
        </p>
        <p className="mt-2 text-gray-600">
          Format <span className="font-medium">Tahun Akademik</span> mengikuti kode
          seperti <span className="font-medium">202230</span> (tahun 2022, semester
          genap). Contoh lain: <span className="font-medium">202210</span> untuk
          semester ganjil.
        </p>
        <PrimaryButton
          type="button"
          className="!mt-4"
          onClick={handleDownloadTemplate}
        >
          Download Template Excel
        </PrimaryButton>
      </div>

      {(loading || postNilaiMahasiswaLoading || processMessage) && (
        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
          <p className="font-semibold text-gray-900">
            {loading
              ? 'Sedang membaca file...'
              : postNilaiMahasiswaLoading
              ? 'Sedang mengunggah data...'
              : importComplete
              ? 'Status import selesai'
              : 'Status proses'}
          </p>
          <p className="mt-1 text-gray-600">
            {processMessage || 'Menunggu proses dimulai.'}
          </p>
          {isImportRunning && <p className="mt-1 text-gray-500">&nbsp;</p>}
        </div>
      )}

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
            isImportRunning ||
            postNilaiMahasiswaLoading ||
            (hasSubmitError && selectedRows.length === 0)
              ? '!bg-gray-200 !border-gray-400 !text-gray-500 cursor-not-allowed'
              : ''
          }`}
          onClick={onSubmit}
          disabled={
            !excelRead ||
            isImportRunning ||
            postNilaiMahasiswaLoading ||
            (hasSubmitError && selectedRows.length === 0)
          }
        >
          Simpan ke Database
        </PrimaryButton>

        {(isImportRunning || postNilaiMahasiswaLoading) && (
          <PrimaryButton
            type="button"
            className="!mt-8 !mb-5 !ml-3 !bg-red-500 !border-red-500 hover:!bg-red-600 hover:!border-red-600"
            onClick={handleCancelImport}
          >
            Cancel Upload
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
          <p>Atau</p>
          <div className="relative w-[]20rem">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AiOutlineSearch size={20} color="gray" />
            </div>
            <input
              type="text"
              id="simple-search"
              className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
              placeholder="Angkatan"
              onChange={(e) => setAngkatan(e.target.value)}
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
                <p className="flex flex-row items-center">Tahun Akademik</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">UTS</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">UAS</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">TA</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Nilai Akhir</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Grade Nilai</p>
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={importComplete ? 15 : 14} className="text-center">
                  <ClipLoader color={'hsla(357, 85%, 52%, 1)'} size={50} />
                </td>
              </tr>
            ) : (
              filteredData.map((data, index) => {
                const status = rowStatus[data.originalIndex]; // Ambil status untuk baris ini
                const isSelectedRow = selectedRows.includes(data.originalIndex);
                return (
                  <tr
                    key={index}
                    className="border-b bg-white text-gray-600"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedRows.includes(data.originalIndex)}
                        onChange={() => handleCheckboxChange(data.originalIndex)}
                      />
                    </td>
                    {importComplete && (
                      <td className="px-4 py-3">
                        {!isSelectedRow ? (
                          <span className="text-gray-400">-</span>
                        ) : status === 'error' ? (
                          <TooltipError>
                            {responseData &&
                              responseData[data.originalIndex] &&
                              responseData[data.originalIndex].errorMessage}
                          </TooltipError>
                        ) : status === 'cancelled' ? (
                          <span className="text-gray-500">Dibatalkan</span>
                        ) : status === 'skipped' ? (
                          <span className="text-gray-500">Dilewati</span>
                        ) : status === 'success' ? (
                          <TooltipAccept2>
                            Data berhasil diunggah
                          </TooltipAccept2>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    )}

                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3">{data['Student Name']}</td>
                    <td className="px-4 py-3">{data['NIM']}</td>
                    <td className="px-4 py-3">{data.prodi}</td>
                    <td className="px-4 py-3">{data.angkatan || '-'}</td>
                    <td className="px-4 py-3">{data['Subject Short']}</td>
                    <td className="px-4 py-3">{data['Subject']}</td>
                    <td className="px-4 py-3">{data['Tahun Akademik']}</td>
                    <td className="px-4 py-3">{data['Mid Sem.'] || 0}</td>
                    <td className="px-4 py-3">{data['End Sem.'] || 0}</td>
                    <td className="px-4 py-3">{data.TA || 0}</td>
                    <td className="px-4 py-3">
                      {data['Nilai Akhir'] !== undefined &&
                      data['Nilai Akhir'] !== null &&
                      data['Nilai Akhir'] !== ''
                        ? data['Nilai Akhir']
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {data['Grade Nilai'] !== undefined &&
                      data['Grade Nilai'] !== null &&
                      data['Grade Nilai'] !== ''
                        ? data['Grade Nilai']
                        : '-'}
                    </td>
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
