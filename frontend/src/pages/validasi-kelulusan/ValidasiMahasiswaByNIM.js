/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { useMonitoringMahasiswaDataByNIM } from '../../hooks/useMonitoringMahasiswa';
import { useTranskripNilaiDataByNIM } from '../../hooks/useTranskripNilai';
import {
  usePostValidasiMahasiswa,
  useValidasiMahasiswaDataByNIM,
} from '../../hooks/useValidasiMahasiswa';
import jsPDF from 'jspdf';
import { RxTriangleUp, RxTriangleRight } from 'react-icons/rx';
import autoTable from 'jspdf-autotable';
import { ExportPrimaryButton } from '../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';
import { useCreateSuratKeterangan } from '../../hooks/useSuratSKPI';
import { ClipLoader } from 'react-spinners';

const ValidasiMahasiswaByNIM = () => {
  const userRole = useCheckRole();
  const { nim } = useParams();
  const [namamahasiswa, setNamaMahasiswa] = useState('');
  const [nim1, setNim] = useState('');
  const { state } = useLocation();
  const { data: responseResult, isLoading: isLoadingResult } =
    useMonitoringMahasiswaDataByNIM(nim);
  const { data: responseData, isLoading: isLoadingTranskrip } =
    useTranskripNilaiDataByNIM(nim);
  const { data: responseValidasi, isLoading: isLoadingValidasi } =
    useValidasiMahasiswaDataByNIM(nim);
  const [nilaiD, setNilaiD] = useState('');
  const [nilaiE, setNilaiE] = useState('');
  const [jumlahSks, setJumlahSks] = useState('');
  // const [dataFilter, setDataFilter] = useState([])
  // const [excelData, setExcelData] = useState([])
  const [transkripData, setTranskripData] = useState([]);
  const [tahunAcademic, setTahunAcademic] = useState([]);
  const [ipsSemester, setIpsSemester] = useState([]);
  const [nilaiIpk, setNilaiIpk] = useState('');
  const [statusKelulusan, setStatusKelulusan] = useState('');
  const [validasi, setValidasi] = useState([]);
  const [result, setResult] = useState([]);
  const [readyAudit, setReadyAudit] = useState(false);
  const [showTableD, setShowTableD] = useState(false);
  const [showTableE, setShowTableE] = useState(false);
  const [ngulangNilai, setNgulangNilai] = useState(false);
  const [nilaiTA, setNilaiTA] = useState('');

  const navigate = useNavigate();

  const {
    mutate: postValidasiMahasiswa,
    isLoading: postValidasiMahasiswaLoading,
  } = usePostValidasiMahasiswa();
  const { mutate: createSuratKeterangan } = useCreateSuratKeterangan();

  const getCreditValue = (data) => {
    const masterCredits = parseInt(data?.mata_kuliah_detail?.sks_total, 10);
    if (!Number.isNaN(masterCredits) && masterCredits > 0) {
      return masterCredits;
    }

    const earnedCredits = parseInt(data?.earned_credits, 10);
    return Number.isNaN(earnedCredits) ? 0 : earnedCredits;
  };

  // useEffect(()=> {
  //   if(isLoadingResult == false) {
  //     setTranskripData(responseData.data);
  //     setResult(responseResult.data);

  //   }
  // }, [isLoadingResult, isLoadingTranskrip])
  // useEffect(() => {
  //   if (!isLoadingResult && responseData) {
  //     setTranskripData(responseData.data);
  //   }
  //   if (!isLoadingTranskrip && responseResult) {
  //     setResult(responseResult.data);
  //   }
  // }, [isLoadingResult, isLoadingTranskrip, responseData, responseResult]);

  useEffect(() => {
    if (!isLoadingResult && responseData) {
      // Sort data by Academic Year and Academic Session
      const sortedTranskripData = responseData.data.sort((a, b) => {
        // First sort by academic year (ascending)
        if (a.academic_year !== b.academic_year) {
          return a.academic_year - b.academic_year;
        }
        // Then sort by academic session (ascending)
        return a.academic_session - b.academic_session;
      });
      setTranskripData(sortedTranskripData);
    }
    if (!isLoadingTranskrip && responseResult) {
      setResult(responseResult.data);
    }
  }, [isLoadingResult, isLoadingTranskrip, responseData, responseResult]);

  useEffect(() => {
    const validasiMahasiswa = responseValidasi?.data?.[0];
    if (!validasiMahasiswa) {
      return;
    }

    setJumlahSks(validasiMahasiswa.jumlah_sks ?? '');
    setNilaiD(validasiMahasiswa.nilaid ?? '');
    setNilaiE(validasiMahasiswa.nilaie ?? '');
    setNilaiIpk(validasiMahasiswa.nilai_ipk ?? '');
    setStatusKelulusan(validasiMahasiswa.status_kelulusan ?? '');
    setNgulangNilai(validasiMahasiswa.keterangan_lulus === 'Pernah Mengulang');
  }, [responseValidasi]);

  useEffect(() => {
    const calculateTotalCreditsD = (transkripData, gradeSymbol) => {
      return transkripData.reduce((totalCredits, getdata) => {
        if ((getdata.grade_symbol || '').includes(gradeSymbol)) {
          return totalCredits + getCreditValue(getdata);
        }
        return totalCredits;
      }, 0);
    };

    const calculateTotalCreditsE = (transkripData, gradeSymbol) => {
      return transkripData.reduce((totalCredits, getdata) => {
        if ((getdata.grade_symbol || '').includes(gradeSymbol)) {
          return totalCredits + getCreditValue(getdata);
        }
        return totalCredits;
      }, 0);
    };

    const getGradeSymbolByCourseName = (data, courseName) => {
      const matchedCourse = data.find(
        (item) => item.mata_kuliah_detail?.name === courseName
      );
      return matchedCourse?.grade_symbol || null;
    };

    const isGradeAtLeastB = (gradeSymbol) => {
      const gradeRank = {
        A: 4,
        AB: 3,
        B: 2,
        BC: 1,
        C: 0,
        D: -1,
        E: -2,
        T: -3,
      };

      return (gradeRank[gradeSymbol] ?? -99) >= gradeRank.B;
    };

    const totalSKSNilaiD = calculateTotalCreditsD(
      transkripData,
      'D'
    ).toString();
    setNilaiD(totalSKSNilaiD);

    const totalSKSNilaiE = calculateTotalCreditsE(
      transkripData,
      'E'
    ).toString();
    setNilaiE(totalSKSNilaiE);

    const checkDuplicateData = result.some((resultData, index, self) => {
      // Use your own criteria to determine if data is duplicated
      return (
        self.findIndex(
          (item) => item.mata_kuliah === resultData.mata_kuliah
        ) !== index
      );
    });
    // console.log(checkDuplicateData);
    setNgulangNilai(checkDuplicateData);

    // const totalSKS = transkripData.reduce((totalCredits, getdata) => {
    //   return totalCredits + parseInt(getdata.earned_credits);
    // }, 0);
    // console.log('Total SKS:', totalSKS);
    // const totalEarnedCredits = totalSKS.toString();

    const totalSKS = transkripData.reduce((totalCredits, getdata) => {
      const currentCredits = getCreditValue(getdata);
      const updatedTotal = totalCredits + currentCredits;
      // console.log('Matkul:', getdata.mata_kuliah_detail.name);
      // console.log('Current Total SKS:', updatedTotal); // Log the current totalSKS value
      return updatedTotal;
    }, 0);

    const AkumulatifSKS = transkripData.reduce((totalCredits, getdata) => {
      const currentCredits = getCreditValue(getdata);
      const updatedTotal = totalCredits + currentCredits;
      // console.log('Matkul:', getdata.mata_kuliah_detail.name);
      // console.log('Current Total SKS:', updatedTotal); // Log the current totalSKS value
      return updatedTotal;
    }, 0);

    const totalEarnedCredits = totalSKS.toString();

    setJumlahSks(totalEarnedCredits);

    const uniqueTahunAkademik = Array.from(
      new Set(
        transkripData.map((getdata) =>
          JSON.stringify({
            academicYear: getdata.academic_year,
            academicSession: getdata.academic_session,
          })
        )
      )
    ).map(JSON.parse);
    setTahunAcademic(uniqueTahunAkademik);

    const calculateIPS = (gradesData) => {
      const ipsResults = [];

      uniqueTahunAkademik.forEach((academicData) => {
        let ips = 0.0;
        let sks = 0;

        const filteredGrades = gradesData.filter(
          (dataGet) =>
            dataGet.academic_year === academicData.academicYear &&
            dataGet.academic_session === academicData.academicSession
        );

        filteredGrades.forEach((transkripData) => {
          const gradeValues = {
            A: 4.0,
            AB: 3.5,
            B: 3.0,
            BC: 2.5,
            C: 2.0,
            D: 1.0,
            E: 0.0,
            T: 0.0,
          };
          const currentCredits = getCreditValue(transkripData);
          ips += gradeValues[transkripData.grade_symbol] * currentCredits;
          sks += currentCredits;
        });

        ipsResults.push({
          academicYear: academicData.academicYear,
          academicSession: academicData.academicSession,
          ips: ips / sks,
          sks: sks,
        });
      });

      return ipsResults;
    };

    const ipsData = calculateIPS(transkripData);
    setIpsSemester(ipsData);

    if (responseValidasi?.data?.length) {
      return;
    }

    // const calculateIPK = (ipsData) => {
      //   const totalIPS = ipsData.reduce(
    //     (sum, dataIPS) => sum + parseFloat(dataIPS.ips * dataIPS.sks),
    //     0
    //   );
    //   return totalIPS / AkumulatifSKS;
    // };

    const calculateIPK = (ipsData) => {
      // Filter out IPS values that are NaN and ensure sks is not 0
      const validIpsData = ipsData.filter(
        (dataIPS) => !isNaN(dataIPS.ips) && dataIPS.sks > 0
      );

      // Sum the weighted IPS (IPS * SKS)
      const totalWeightedIps = validIpsData.reduce(
        (sum, dataIPS) => sum + parseFloat(dataIPS.ips * dataIPS.sks),
        0
      );

      // Sum the total SKS from valid IPS data
      const totalSks = validIpsData.reduce(
        (sum, dataIPS) => sum + dataIPS.sks,
        0
      );

      // Calculate IPK, avoiding division by zero
      return totalSks > 0 ? (totalWeightedIps / totalSks).toFixed(2) : '0.00';
    };

    // const ipkData = calculateIPK(ipsData).toFixed(2);
    // // const twoDigitAfterDecimal = ipkData.toString().match(/\d+\.\d{2}/)
    // // console.log('IPK Data = ', ipkData);
    // setNilaiIpk(ipkData);
    const ipkData = calculateIPK(ipsData);
    setNilaiIpk(ipkData);

    const checkNilaiTA = transkripData.reduce((gradeSymbol, transkripData) => {
      if (
        transkripData.mata_kuliah_detail.name == 'Final Project' ||
        transkripData.mata_kuliah_detail.name == 'Final Project II'
      ) {
        return transkripData.grade_symbol; // Return the gradeSymbol for "Final Project"
      }
      return gradeSymbol; // Return the accumulated gradeSymbol
    }, null);

    setNilaiTA(checkNilaiTA);

    const englishScientificCommunicationIIGrade = getGradeSymbolByCourseName(
      transkripData,
      'English Scientific Communication II'
    );
    const hasEnglishScientificCommunicationIIRule =
      isGradeAtLeastB(englishScientificCommunicationIIGrade);

    let status = '';

    if (
      parseFloat(ipkData) > 3.5 &&
      totalSKSNilaiD == 0 &&
      totalSKSNilaiE == 0 &&
      totalEarnedCredits >= 144 &&
      !checkDuplicateData &&
      hasEnglishScientificCommunicationIIRule &&
      (checkNilaiTA == 'A' || checkNilaiTA == 'AB' || checkNilaiTA == 'B')
    ) {
      // console.log(ngulangNilai);
      status = 'Cum Laude';
      setStatusKelulusan(status);
    } else if (
      ipkData > 3.0 &&
      totalSKSNilaiD <= 7 &&
      totalSKSNilaiE == 0 &&
      totalEarnedCredits >= 144 &&
      hasEnglishScientificCommunicationIIRule &&
      checkNilaiTA
    ) {
      status = 'Sangat Memuaskan';
      setStatusKelulusan(status);
    } else if (
      ipkData > 2.75 &&
      totalSKSNilaiD <= 7 &&
      totalSKSNilaiE == 0 &&
      totalEarnedCredits >= 144 &&
      hasEnglishScientificCommunicationIIRule &&
      checkNilaiTA
    ) {
      status = 'Memuaskan';
      setStatusKelulusan(status);
    } else if (
      ipkData >= 2.0 &&
      totalSKSNilaiD <= 7 &&
      totalSKSNilaiE == 0 &&
      totalEarnedCredits >= 144 &&
      hasEnglishScientificCommunicationIIRule &&
      checkNilaiTA
    ) {
      status = 'Cukup';
      setStatusKelulusan(status);
    } else {
      status = 'Tidak Lulus';
      setStatusKelulusan(status);
    }

    let keterangan_lulus = '';
    if (!checkDuplicateData) {
      keterangan_lulus = 'Aman';
    } else if (checkDuplicateData) {
      keterangan_lulus = 'Pernah Mengulang';
    }

    const dataValidasi = [];

    dataValidasi.push({
      nim_mahasiswa: nim,
      jumlah_sks: totalEarnedCredits,
      nilaie: totalSKSNilaiE,
      nilaid: totalSKSNilaiD,
      status_kelulusan: status,
      nilai_ipk: ipkData,
      keterangan_lulus: keterangan_lulus,
    });

    setReadyAudit(true);
    // console.log('Data Validasi = ', dataValidasi);
    setValidasi(dataValidasi);
  }, [transkripData]);

  useEffect(() => {
    if (isLoadingValidasi || responseValidasi?.data?.length) {
      return;
    }

    for (let index = 0; index < validasi.length; index++) {
      const data = validasi[index];
      const validasiFormData = new FormData();

      for (const key in data) {
        validasiFormData.append(key, data[key]);
      }
      try {
        postValidasiMahasiswa(validasiFormData, {
          onSuccess: () => {},
          onError: (error) => {
            console.error(error);
          },
        });
      } catch (error) {
        console.error(error);
      }
    }
  }, [validasi, responseValidasi, isLoadingValidasi]);

  const handleExport = () => {
    const doc = new jsPDF();

    const pageSize = doc.internal.pageSize;
    const pageWidth = pageSize.width;
    const pageHeight = pageSize.height;

    doc.setFontSize(16);
    doc.text('Hasil Degree Audit Mahasiswa - SIMANTAP', 105, 25, {
      align: 'center',
    });

    let startY = 30;

    const mainTable = document.getElementById('id-table');
    if (mainTable) {
      doc.autoTable({ html: mainTable, startY: startY });
      startY = doc.autoTable.previous.finalY + 10;
    }

    ipsSemester.forEach((getData, tableIndex) => {
      const ipsTable = document.getElementById(`ips-table${tableIndex}`);
      if (ipsTable) {
        doc.autoTable({
          html: ipsTable,
          theme: 'striped',
          startY:
            tableIndex === 0 ? startY : doc.autoTable.previous.finalY + 10,
          styles: { fontSize: 10 },
        });
      }
    });

    doc.save(`${transkripData[0].mahasiswa_detail.nama} Degree Audit.pdf`);
  };

  const handleButtonHideD = () => {
    if (showTableD) {
      setShowTableD(false);
    } else {
      setShowTableD(true);
      setShowTableE(false);
    }
  };

  const handleButtonHideE = () => {
    if (showTableE) {
      setShowTableE(false);
    } else {
      setShowTableE(true);
      setShowTableD(false);
    }
  };

  const handleExportExcel = () => {
    const filterToExcel = transkripData.map((data) => {
      const filteredItem = {
        'Nama Mahasiswa': data.mahasiswa_detail.nama,
        'NIM Mahasiswa': data.mahasiswa_detail.nim,
        Jurusan: data.mahasiswa_detail.prodi_detail.name,
        Angkatan: data.mahasiswa_detail.angkatan,
        'Kode Mata Kuliah': data.mata_kuliah_detail.kode,
        'Mata Kuliah': data.mata_kuliah_detail.name,
        'Earned Credits': getCreditValue(data),
        'Graded Credits': getCreditValue(data),
        'Academic Year': data.academic_year,
        'Academic Session': data.academic_session,
        Nilai: data.grade_symbol,
      };
      return filteredItem;
    });

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(filterToExcel);

    utils.book_append_sheet(wb, ws, `${filterToExcel[0]['Nama Mahasiswa']}`);

    writeFile(
      wb,
      `Validasi Mahasiswa ${filterToExcel[0]['Nama Mahasiswa']}.xlsx`
    );
  };

  const handleExportSKPI = () => {
    createSuratKeterangan(
      { nim },
      {
        onSuccess: (response) => {
          // console.log('SKPI Response = ', response);
          if (response.status === 200 || response.status === 201) {
            navigate(`/degreeaudit/skpi/${nim}`, { state: { nim } });
          }
        },
        onError: (error) => {
          console.error('Error creating Surat Keterangan:', error);
        },
      }
    );
  };

  return (
    <section id="monitoring-mahasiswa" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Validasi Mahasiswa
          {!userRole.admin}
        </p>
        <PrimaryButton
          onClick={async () => {
            setShowTableD(false);
            setShowTableE(false);
            await handleExport();
          }}
        >
          Export to PDF
        </PrimaryButton>
        <div className="flex gap-4">
          <PrimaryButton onClick={handleExportSKPI}>Export SKPI</PrimaryButton>
          <ExportPrimaryButton onClick={handleExportExcel} />
        </div>
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
          onClick={() => {
            navigate(`/degreeaudit/validasi-kelulusan/${nim1}`);
          }}
        >
          Audit
        </PrimaryButton>
      </form>

      <div className="overflow-x-auto">
        {/* add spinner when fetch data */}
        {isLoadingTranskrip && (
          <div className="flex justify-center items-center">
            <ClipLoader
              size={50}
              color={'#123abc'}
              loading={isLoadingTranskrip}
            />
          </div>
        )}
        <table id="id-table" className="w-full mt-6">
          <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
            <tr>
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
                <p className="flex flex-row items-center">Jumlah SKS Lulus</p>
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
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Status Lulus</p>
              </th>
              <th className="px-4 py-3 font-semibold">
                <p className="flex flex-row items-center">Ket.</p>
              </th>
            </tr>
          </thead>

          {transkripData.length > 0 ? (
            <tbody>
              <tr className="bg-white border-b text-gray-600">
                <td className="px-4 py-3">
                  {transkripData[0].mahasiswa_detail.nama}
                </td>
                <td className="px-4 py-3">
                  {transkripData[0].mahasiswa_detail.nim}
                </td>
                <td className="px-4 py-3">
                  {transkripData[0].mahasiswa_detail.prodi_detail.name}
                </td>
                <td className="px-4 py-3 text-center">
                  {transkripData[0].mahasiswa_detail.angkatan}
                </td>
                <td className="px-4 py-3 text-center">{jumlahSks} / 144</td>
                <td className="px-4 py-3">
                  {nilaiD} sks
                  {showTableD ? (
                    <RxTriangleUp
                      size={20}
                      color="gray"
                      className="inline ml-1"
                      onClick={() => {
                        handleButtonHideD();
                      }}
                    />
                  ) : (
                    <RxTriangleRight
                      size={20}
                      color="gray"
                      className="inline ml-1"
                      onClick={() => {
                        handleButtonHideD();
                      }}
                    />
                  )}
                </td>
                <td className="px-4 py-3">
                  {nilaiE} sks
                  {showTableE ? (
                    <RxTriangleUp
                      size={20}
                      color="gray"
                      className="inline ml-1"
                      onClick={() => {
                        handleButtonHideE();
                      }}
                    />
                  ) : (
                    <RxTriangleRight
                      size={20}
                      color="gray"
                      className="inline ml-1"
                      onClick={() => {
                        handleButtonHideE();
                      }}
                    />
                  )}
                </td>
                <td className="px-4 py-3">{nilaiIpk}</td>
                <td className="px-4 py-3">{statusKelulusan}</td>
                <td className="px-4 py-3">
                  {ngulangNilai ? <p>Pernah Mengulang</p> : <p>Aman</p>}
                </td>
              </tr>
            </tbody>
          ) : (
            <div />
          )}
        </table>
      </div>
      {showTableD ? (
        <div className="overflow-x-auto">
          <table id="table-nilaid" className="w-full mt-10">
            <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
              <tr>
                <th className="px-4 py-3 font-semibold">Kode Mata Kuliah</th>
                <th className="px-4 py-3 font-semibold">Mata Kuliah</th>
                <th className="px-4 py-3 font-semibold">Sesi Akademik</th>
                <th className="px-4 py-3 font-semibold">SKS</th>
                <th className="px-4 py-3 font-semibold">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {transkripData
                .filter((getdata) => getdata.grade_symbol == 'D') // Use === for comparison
                .map((filteredData, index) => (
                  <tr key={index} className="bg-white border-b text-gray-600">
                    <td className="px-4 py-3">
                      <p className="flex flex-row items-center">
                        {filteredData.mata_kuliah_detail.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="flex flex-row">
                        {filteredData.academic_year} -
                        {filteredData.academic_session === '10'
                          ? ' Odd'
                          : filteredData.academic_session === '20'
                          ? ' Odd Short'
                          : filteredData.academic_session === '30'
                          ? ' Even'
                          : filteredData.academic_session === '40'
                          ? ' Even Short'
                          : ' Unknown Session Type'}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="flex flex-row items-center">
                        {filteredData.mata_kuliah_detail.sks_total}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="flex flex-row items-center">
                        {filteredData.grade_symbol}
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div></div>
      )}
      {showTableE ? (
        <div className="overflow-x-auto">
          <table id="table-nilaid" className="w-full mt-10">
            <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
              <tr>
                <th className="px-4 py-3 font-semibold">Mata Kuliah</th>
                <th className="px-4 py-3 font-semibold">Sesi Akademik</th>
                <th className="px-4 py-3 font-semibold">SKS</th>
                <th className="px-4 py-3 font-semibold">Nilai</th>
              </tr>
            </thead>
            <tbody>
              {transkripData
                .filter((getdata) => getdata.grade_symbol == 'E') // Use === for comparison
                .map((filteredData, index) => (
                  <tr key={index} className="bg-white border-b text-gray-600">
                    <td className="px-4 py-3">
                      {filteredData.mata_kuliah_detail.name}
                    </td>
                    <td className="px-4 py-3">
                      <p className="flex flex-row items-center">
                        {filteredData.academic_year} -
                        {filteredData.academic_session === '10'
                          ? ' Odd'
                          : filteredData.academic_session === '20'
                          ? ' Odd Short'
                          : filteredData.academic_session === '30'
                          ? ' Even'
                          : filteredData.academic_session === '40'
                          ? ' Even Short'
                          : ' Unknown Session Type'}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="flex flex-row items-center">
                        {filteredData.mata_kuliah_detail.sks_total}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <p className="flex flex-row items-center">
                        {filteredData.grade_symbol}
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div></div>
      )}

      {ipsSemester && showTableD == false && showTableE == false ? (
        <div className="overflow-x-auto">
          {ipsSemester.map((getData, tableIndex) => (
            <table
              id={`ips-table${tableIndex}`}
              key={tableIndex}
              className="w-full mt-10"
            >
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {getData.academicYear}
                    {getData.academicSession === '10'
                      ? ' Odd'
                      : getData.academicSession === '20'
                      ? ' Odd Short'
                      : getData.academicSession === '30'
                      ? ' Even'
                      : getData.academicSession === '40'
                      ? ' Even Short'
                      : ' Unknown Session Type'}
                  </th>
                  {/* <th className="px-4 py-3 font-semibold"></th> */}
                  <th className="px-4 py-3 font-semibold"></th>
                  <th className="px-4 py-3 font-semibold">
                    Total SKS : {getData.sks}
                  </th>
                  <th className="px-4 py-3 font-semibold">
                    IPS : {getData.ips.toFixed(2)}
                  </th>
                </tr>
              </thead>
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                <tr>
                  <th className="px-4 py-3 font-semibold">Kode Mata Kuliah</th>
                  <th className="px-4 py-3 font-semibold">Mata Kuliah</th>
                  <th className="px-4 py-3 font-semibold">SKS</th>
                  <th className="px-4 py-3 font-semibold">Nilai</th>
                  <th className="px-4 py-3 font-semibold">Kurikulum</th>
                </tr>
              </thead>
              <tbody>
                {transkripData
                  .filter(
                    (getdata) =>
                      getdata.academic_year === getData.academicYear &&
                      getdata.academic_session === getData.academicSession
                  ) // Use === for comparison
                  .map((filteredData, index) => (
                    <tr key={index} className="bg-white border-b text-gray-600">
                      <td
                        className={`px-4 py-3 text-center ${
                          filteredData.grade_symbol == 'D'
                            ? 'bg-yellow-500'
                            : '' || filteredData.grade_symbol == 'E'
                            ? 'bg-red-500 text-white'
                            : '' || filteredData.grade_symbol == 'T'
                            ? 'bg-blue-800 text-white'
                            : ''
                        }`}
                      >
                        {filteredData.mata_kuliah_detail.kode}
                      </td>
                      <td
                        className={`px-4 py-3 ${
                          filteredData.grade_symbol == 'D'
                            ? 'bg-yellow-500'
                            : '' || filteredData.grade_symbol == 'E'
                            ? 'bg-red-500 text-white'
                            : '' || filteredData.grade_symbol == 'T'
                            ? 'bg-blue-800 text-white'
                            : ''
                        }`}
                      >
                        {filteredData.mata_kuliah_detail.name}
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${
                          filteredData.grade_symbol == 'D'
                            ? 'bg-yellow-500'
                            : '' || filteredData.grade_symbol == 'E'
                            ? 'bg-red-500 text-white '
                            : '' || filteredData.grade_symbol == 'T'
                            ? 'bg-blue-800 text-white'
                            : ''
                        }`}
                      >
                        {filteredData.mata_kuliah_detail.sks_total}
                      </td>
                      <td
                        className={`px-4 py-3 text-center ${
                          filteredData.grade_symbol == 'D'
                            ? 'bg-yellow-500'
                            : '' || filteredData.grade_symbol == 'E'
                            ? 'bg-red-500 text-white'
                            : '' || filteredData.grade_symbol == 'T'
                            ? 'bg-blue-800 text-white'
                            : ''
                        }`}
                      >
                        {filteredData.grade_symbol}
                      </td>

                      <td
                        className={`px-4 py-3 text-center ${
                          filteredData.grade_symbol == 'D'
                            ? 'bg-yellow-500'
                            : '' || filteredData.grade_symbol == 'E'
                            ? 'bg-red-500 text-white '
                            : '' || filteredData.grade_symbol == 'T'
                            ? 'bg-blue-800 text-white'
                            : ''
                        }`}
                      >
                        {filteredData.mata_kuliah_detail.kurikulum_detail.map(
                          (kurikulum) => (
                            <div key={kurikulum.id}>{kurikulum.name}</div>
                          )
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
        </div>
      ) : (
        <div></div>
      )}
    </section>
  );
};

export default ValidasiMahasiswaByNIM;
