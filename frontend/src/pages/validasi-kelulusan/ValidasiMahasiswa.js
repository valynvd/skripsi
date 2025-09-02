/* eslint-disable no-unused-vars */
import React, { useEffect, useState, Fragment } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate } from 'react-router-dom';
import { useProgramStudiData } from '../../hooks/useProdi';
import { useTranskripNilaiDataByNIM2 } from '../../hooks/useTranskripNilai';
import FilterInput from '../../components/FitlerInput';
import ProgressBar from '@ramonak/react-progress-bar';
import { Dialog, Transition } from '@headlessui/react';
import { useForm } from 'react-hook-form';
import { useDataMahasiswaData } from '../../hooks/useDataMahasiswa';
import { usePostValidasiMahasiswa } from '../../hooks/useValidasiMahasiswa';
import { useMonitoringMahasiswaDataByNIM2 } from '../../hooks/useMonitoringMahasiswa';

const ValidasiMahasiswa = () => {
  const userRole = useCheckRole();
  //   const [namamahasiswa, setNamaMahasiswa] = useState('')
  const [nim, setNim] = useState('');
  const [selectedProdi, setSelectedProdi] = useState('');
  const [selectedAngkatan, setSelectedAngkatan] = useState('');
  const [dataMahasiswa, setDataMahasiswa] = useState([]);
  const [filterMahasiswa, setFilterMahasiswa] = useState([]);
  const [transkripData, setTranskripData] = useState([]);

  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const navigate = useNavigate();
  const { control, watch, setValue } = useForm({
    defaultValues: {},
  });
  const { data: responseData, isLoading: isLoadingMahasiswa } =
    useDataMahasiswaData();

  const {
    mutate: postValidasiMahasiswa,
    isLoading: postValidasiMahasiswaLoading,
  } = usePostValidasiMahasiswa();

  const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  console.log('Response Data ===', responseData);

  useEffect(() => {
    if (isLoadingMahasiswa === false) {
      setDataMahasiswa(responseData.data);
      setFilterMahasiswa(responseData.data); // Initialize with all students
    }
  }, [isLoadingMahasiswa, responseData]);

  useEffect(() => {
    if (selectedProdi && selectedAngkatan) {
      const filteredMahasiswa = dataMahasiswa.filter(
        (mahasiswa) => mahasiswa.prodi == selectedProdi
      );
      const filteredByAngkatan = filteredMahasiswa.filter(
        (mahasiswa) => mahasiswa.angkatan === selectedAngkatan
      );
      console.log('Ini data hasil filter', filteredByAngkatan);
      setFilterMahasiswa(filteredByAngkatan);
    } else if (selectedAngkatan) {
      const filteredByAngkatan = dataMahasiswa.filter(
        (mahasiswa) => mahasiswa.angkatan === selectedAngkatan
      );
      console.log('Ini data hasil filter', dataMahasiswa);
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

  const uniqueAngkatanValues = [
    ...new Set(dataMahasiswa.map((item) => item.angkatan)),
  ];

  const { mutateAsync: getTranskripNilaiDataByNIMAsync } =
    useTranskripNilaiDataByNIM2();
  const { mutateAsync: getMonitoringMahasiswaDataByNIMAsync } =
    useMonitoringMahasiswaDataByNIM2();

  const calculateTotalCreditsD = (responseData, gradeSymbol) => {
    return responseData.reduce((totalCredits, data) => {
      if (data.grade_symbol.includes(gradeSymbol)) {
        return totalCredits + parseInt(data.earned_credits);
      }
      return totalCredits;
    }, 0);
  };

  const calculateTotalCreditsE = (transkripData, gradeSymbol) => {
    return transkripData.reduce((totalCredits, getdata) => {
      if (getdata.grade_symbol.includes(gradeSymbol)) {
        return totalCredits + parseInt(getdata.mata_kuliah_detail.sks_total);
      }
      return totalCredits;
    }, 0);
  };

  const onAudit = async () => {
    try {
      for (let index = 0; index < filterMahasiswa.length; index++) {
        const nimMahasiswa = filterMahasiswa[index].nim;
        const responseData = await getTranskripNilaiDataByNIMAsync(
          nimMahasiswa
        );
        const result = await getMonitoringMahasiswaDataByNIMAsync(nimMahasiswa);

        // Check nilai D dan E
        const totalSKSNilaiD = calculateTotalCreditsD(
          responseData.data,
          'D'
        ).toString();
        const totalSKSNilaiE = calculateTotalCreditsE(
          responseData.data,
          'E'
        ).toString();
        const checkNilai = result.data.reduce((fixResult, resultData) => {
          if (['D', 'E'].includes(resultData.grade_symbol)) {
            return (fixResult = true);
          }
          return fixResult;
        }, false);

        // Hitung SKS lulus
        // const totalSKS = responseData.data.reduce((totalCredits, getdata) => {
        //   if (!['E'].includes(getdata.grade_symbol)) {
        //     return totalCredits + parseInt(getdata.earned_credits);
        //   }
        //   return totalCredits;
        // }, 0);
        // const totalEarnedCredits = totalSKS.toString();

        const totalSKS = responseData.data.reduce((totalCredits, getdata) => {
          // const currentCredits = parseInt(getdata.earned_credits);
          // const updatedTotal = totalCredits + currentCredits;
          if (getdata.grade_symbol !== 'T') {
            const currentCredits = parseInt(getdata.earned_credits);
            return totalCredits + currentCredits;
          }
          return totalCredits;
        }, 0);
        const totalEarnedCredits = totalSKS.toString();

        const AkumulatifSKS = responseData.data.reduce(
          (totalCredits, getdata) => {
            // const currentCredits = parseInt(
            //   getdata.mata_kuliah_detail.sks_total
            // );
            // const updatedTotal = totalCredits + currentCredits;
            // return updatedTotal;
            if (getdata.grade_symbol !== 'T') {
              const currentCredits = parseInt(
                getdata.mata_kuliah_detail.sks_total
              );
              return totalCredits + currentCredits;
            }
            return totalCredits;
            // if (getdata.grade_symbol !== 'T') {
            //   const currentCredits = parseInt(
            //     getdata.mata_kuliah_detail.sks_total
            //   );
            //   // return totalCredits + currentCredits;
            //   const updatedTotal = totalCredits + currentCredits;
            //   return updatedTotal;
            // }
          },
          0
        );

        // Pisah tiap tahun untuk hitung IPS
        const uniqueTahunAkademik = Array.from(
          new Set(
            responseData.data.map((getdata) =>
              JSON.stringify({
                academicYear: getdata.academic_year,
                academicSession: getdata.academic_session,
              })
            )
          )
        ).map(JSON.parse);

        // Hitung IPS
        const calculateIPS = (gradesData) => {
          const ipsResults = [];

          uniqueTahunAkademik.forEach((academicData) => {
            let ips = 0.0;
            let sks = 0;

            const filteredGrades = gradesData.filter(
              (dataGet) =>
                dataGet.academic_year === academicData.academicYear &&
                dataGet.academic_session === academicData.academicSession &&
                dataGet.grade_symbol !== 'T'
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
              };
              ips +=
                gradeValues[transkripData.grade_symbol] *
                parseInt(transkripData.earned_credits);
              sks += parseInt(transkripData.earned_credits);
            });

            if (sks > 0) {
              // EDITED: Menghindari pembagian dengan nol
              ipsResults.push({
                academicYear: academicData.academicYear,
                academicSession: academicData.academicSession,
                ips: ips / sks,
                sks: sks,
              });
            }

            // ipsResults.push({
            //   academicYear: academicData.academicYear,
            //   academicSession: academicData.academicSession,
            //   ips: ips / sks,
            //   sks: sks,
            // });
          });

          return ipsResults;
        };

        const ipsData = calculateIPS(responseData.data);
        console.log(ipsData);

        // Hitung IPK
        const calculateIPK = (ipsData) => {
          if (AkumulatifSKS === 0) {
            return '0.00'; // Jika tidak ada SKS yang dihitung, IPK adalah 0
          }
          const totalIPS = ipsData.reduce(
            (sum, dataIPS) => sum + parseFloat(dataIPS.ips * dataIPS.sks),
            0
          );
          return (totalIPS / AkumulatifSKS).toFixed(2);
        };
        const ipkData = calculateIPK(ipsData);

        // Check Nilai TA
        const checkNilaiTA = responseData.data.reduce(
          (gradeSymbol, transkripData) => {
            if (
              transkripData.mata_kuliah_detail.name == 'Final Project' ||
              transkripData.mata_kuliah_detail.name == 'Final Project II'
            ) {
              return transkripData.grade_symbol;
            }
            return gradeSymbol;
          },
          null
        );

        let status = '';

        if (
          parseFloat(ipkData) > 3.5 &&
          totalSKSNilaiD == 0 &&
          totalSKSNilaiE == 0 &&
          totalEarnedCredits >= 144 &&
          !checkNilai &&
          (checkNilaiTA == 'A' || checkNilaiTA == 'AB' || checkNilaiTA == 'B')
        ) {
          status = 'Cum Laude';
        } else if (
          ipkData > 3.0 &&
          totalSKSNilaiD <= 7 &&
          totalSKSNilaiE == 0 &&
          totalEarnedCredits >= 144 &&
          checkNilaiTA
        ) {
          status = 'Sangat Memuaskan';
        } else if (
          ipkData > 2.75 &&
          totalSKSNilaiD <= 7 &&
          totalSKSNilaiE == 0 &&
          totalEarnedCredits >= 144 &&
          checkNilaiTA
        ) {
          status = 'Memuaskan';
        } else if (
          ipkData >= 2.0 &&
          totalSKSNilaiD <= 7 &&
          totalSKSNilaiE == 0 &&
          totalEarnedCredits >= 144 &&
          checkNilaiTA
        ) {
          status = 'Cukup';
        } else {
          status = 'Tidak Lulus';
        }

        console.log('INI CEK KETERANGAN');
        let keterangan_lulus = '';
        if (!checkNilai) {
          keterangan_lulus = 'Aman';
        } else if (checkNilai) {
          keterangan_lulus = 'Pernah Mengulang';
        }

        filterMahasiswa[index] = {
          ...filterMahasiswa[index],
          nim_mahasiswa: filterMahasiswa[index].nim,
          jumlah_sks: totalEarnedCredits,
          nilaid: totalSKSNilaiD,
          nilaie: totalSKSNilaiE,
          nilai_ipk: ipkData,
          status_kelulusan: status,
          keterangan_lulus: keterangan_lulus,
        };

        const data = filterMahasiswa[index];
        const validasiFormData = new FormData();

        for (const key in data) {
          validasiFormData.append(key, data[key]);
        }
        try {
          postValidasiMahasiswa(validasiFormData, {
            onSuccess: () => {
              const newProgress = ((index + 1) / filterMahasiswa.length) * 100;
              if (newProgress == 100.0) {
                setOpen(true);
              }
              setProgress(newProgress.toFixed(2));
            },
            onError: (error) => {
              console.error(error);
            },
          });
        } catch (error) {
          console.error(error);
        }

        await delay(300);
      }
    } catch (error) {
      console.error('Error fetching transkrip data:', error);
    }
  };

  const handleToClose = () => {
    setOpen(false);
    setProgress('');
    setSelectedAngkatan('');
    setSelectedProdi('');
  };

  return (
    <section id="monitoring-mahasiswa" className="section-container">
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
                    Berhasil
                  </Dialog.Title>
                  <p className="text-gray-600 mt-2 max-w-md">
                    Validasi Mahasiswa Berhasil
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
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Validasi Mahasiswa
          {!userRole.admin}
        </p>
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
            navigate(`/degreeaudit/validasi-kelulusan/${nim}`, {
              state: nim,
            });
          }}
        >
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
          {uniqueAngkatanValues.map((angkatan) => (
            <option key={angkatan} value={angkatan}>
              {angkatan}
            </option>
          ))}
        </select>
        <PrimaryButton onClick={onAudit}>Grup Audit</PrimaryButton>
      </div>
      {progress ? <ProgressBar completed={progress} /> : null}
      {nim ? (
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
      ) : selectedAngkatan ? (
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
                <th className="px-4 py-3 font-semibold">
                  <p className="flex flex-row items-center">Status Lulus</p>
                </th>
              </tr>
            </thead>
            <tbody>
              {filterMahasiswa.map((mahasiswa, index) => (
                <tr
                  key={mahasiswa.nim}
                  className="bg-white border-b text-gray-600"
                >
                  <td className="px-4 py-3">{index + 1}</td>
                  <td className="px-4 py-3">{mahasiswa.nama}</td>
                  <td className="px-4 py-3">{mahasiswa.nim}</td>
                  <td className="px-4 py-3">{mahasiswa.prodi_detail.name}</td>
                  <td className="px-4 py-3 item-center">
                    {mahasiswa.angkatan}
                  </td>
                  <td className="px-4 py-3 item-center">
                    {mahasiswa.jumlah_sks} / 144
                  </td>
                  <td className="px-4 py-3 item-center">
                    {mahasiswa.nilaid} SKS
                  </td>
                  <td className="px-4 py-3 item-center">
                    {mahasiswa.nilaie} SKS
                  </td>
                  <td className="px-4 py-3 item-center">
                    {mahasiswa.nilai_ipk}
                  </td>
                  <td className="px-4 py-3">{mahasiswa.status_kelulusan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>
          Anda dapat melakukan validasi dengan mengisi kolom NIM Mahsiswa atau
          dengan memilih Program dan angkatan
        </p>
      )}
    </section>
  );
};

export default ValidasiMahasiswa;
