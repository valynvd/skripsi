/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useCheckRole } from '../../hooks/useCheckRole';
import { PrimaryButton } from '../../components/PrimaryButton';
import { AiOutlineSearch } from 'react-icons/ai';
import { useNavigate, useParams } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
// import { useMonitoringMahasiswaDataByNIM } from '../../hooks/useMonitoringMahasiswa';
import { useTranskripNilaiDataByNIM } from '../../hooks/useTranskripNilai';

const ValidasiMahasiswaByNIM = () => {
  const userRole = useCheckRole();
  const { nim } = useParams()
  const [namamahasiswa, setNamaMahasiswa] = useState('')
  const [nim1, setNim] = useState('')
  const { state } = useLocation();
  const { data: responseData, isLoading} = useTranskripNilaiDataByNIM(nim)
  const [nilaiD, setNilaiD] = useState('')
  const [nilaiE, setNilaiE] = useState('')
  const [jumlahSks, setJumlahSks] = useState('')
  // const [dataFilter, setDataFilter] = useState([])
  // const [excelData, setExcelData] = useState([])
  const [transkripData, setTranskripData] = useState([])
  const [tahunAcademic, setTahunAcademic] = useState([])
  const [ipsSemester, setIpsSemester] = useState([])
  const [nilaiIpk, setNilaiIpk] = useState('')
  
  const navigate = useNavigate();
  
  useEffect(()=> {
    if(isLoading == false) {
      console.log(responseData.data)
      setTranskripData(responseData.data);
      console.log(transkripData);
    }
  }, [isLoading])

  useEffect(() => {
  
    const calculateTotalCredits = (transkripData, gradeSymbol) => {
      return transkripData.reduce((totalCredits, getdata) => {
        if (getdata.grade_symbol.includes(gradeSymbol)) {
          return totalCredits + parseInt(getdata.earned_credits);
        }
        return totalCredits;
      }, 0);
    };
  
    const totalSKSNilaiD = calculateTotalCredits(transkripData, 'D').toString();
    setNilaiD(totalSKSNilaiD);
  
    const totalSKSNilaiE = calculateTotalCredits(transkripData, 'E').toString();
    setNilaiE(totalSKSNilaiE);
  
    const totalSKS = transkripData.reduce((totalCredits, getdata) => {
      if (!['D', 'E'].includes(getdata.grade_symbol)) {
        return totalCredits + parseInt(getdata.earned_credits);
      }
      return totalCredits;
    }, 0);
    const totalEarnedCredits = totalSKS.toString();
    setJumlahSks(totalEarnedCredits);
  
    const uniqueTahunAkademik = Array.from(
      new Set(
        transkripData.map((getdata) => JSON.stringify({
          academicYear: getdata.academic_year,
          academicSession: getdata.academic_session,
        }))
      )
    ).map(JSON.parse);
    setTahunAcademic(uniqueTahunAkademik);
  
    const calculateIPS = (gradesData) => {
      const ipsResults = [];
  
      uniqueTahunAkademik.forEach((academicData) => {
        let ips = 0.0;
        let sks = 0;
  
        const filteredGrades = gradesData.filter((dataGet) =>
          dataGet.academic_year === academicData.academicYear &&
          dataGet.academic_session === academicData.academicSession
        );
  
        filteredGrades.forEach((transkripData) => {
          const gradeValues = {
            A: 4.0, AB: 3.5, B: 3.0, BC: 2.5, C: 2.0, D: 1.0, E: 0.0
          };
          ips += gradeValues[transkripData.grade_symbol] * parseInt(transkripData.earned_credits);
          sks += parseInt(transkripData.earned_credits);
        });
  
        ipsResults.push({
          academicYear: academicData.academicYear,
          academicSession: academicData.academicSession,
          ips: (ips / sks).toFixed(2),
        });
      });
  
      return ipsResults;
    };
  
    const ipsData = calculateIPS(transkripData);
    setIpsSemester(ipsData);
  
    const calculateIPK = (ipsData) => {
      const totalIPS = ipsData.reduce((sum, dataIPS) => sum + parseFloat(dataIPS.ips), 0);
      return (totalIPS / ipsData.length).toFixed(2);
    };
    const ipkData = calculateIPK(ipsData);
    setNilaiIpk(ipkData);
  }, [transkripData])
  


  return (
    <section id="monitoring-mahasiswa" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Validasi Mahasiswa
          {!userRole.admin}
        </p>
      </div>

      <form  className="flex gap-4 flex-wrap items-center mb-4 mt-10">
          {/* <div className="relative w-[]20rem">
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
          <p>Atau</p> */}
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
              </tr>
            </thead>
            
            {transkripData.length > 0 ? (
              <tbody>
              <tr className="bg-white border-b text-gray-600">
              <td className="px-4 py-3">1</td>
              <td className="px-4 py-3">{transkripData[0].mahasiswa_detail.nama}</td>
              <td className="px-4 py-3">{transkripData[0].mahasiswa_detail.nim}</td>
              <td className="px-4 py-3">{transkripData[0].mahasiswa_detail.prodi_detail.name}</td>
              <td className="px-4 py-3">{transkripData[0].mahasiswa_detail.angkatan}</td>
              <td className="px-4 py-3">{jumlahSks}</td>
              <td className="px-4 py-3">{nilaiD} sks</td>
              <td className="px-4 py-3">{nilaiE} sks</td>
              <td className="px-4 py-3">{nilaiIpk}</td>
            </tr>
          </tbody>
            ) : <div/>}
            
          </table>
      </div>

      {ipsSemester ? (
          <div className="overflow-x-auto">
          {ipsSemester.map((getData, tableIndex) => (
            <table key={tableIndex} className="w-full mt-10">
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                <tr>
                  <th className="px-4 py-3 font-semibold">
                    {getData.academicYear} 
                      {getData.academicSession === '10'
                      ? " Odd"
                      : getData.academicSession === '20'
                      ? " Odd Short"
                      : getData.academicSession === '30'
                      ? " Even"
                      : getData.academicSession === '40'
                      ? " Even Short"
                      : " Unknown Session Type"}</th>
                  <th className="px-4 py-3 font-semibold">
                    IPS : {getData.ips}
                  </th>
                </tr>
              </thead>
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                <tr>
                  <th className="px-4 py-3 font-semibold">Mata Kuliah</th>
                  <th className="px-4 py-3 font-semibold">SKS</th>
                  <th className="px-4 py-3 font-semibold">Nilai</th>
                </tr>
              </thead>
              <tbody>
                {transkripData
                  .filter((getdata) => getdata.academic_year === getData.academicYear &&
                  getdata.academic_session === getData.academicSession) // Use === for comparison
                  .map((filteredData, index) => (
                    <tr key={index} className="bg-white border-b text-gray-600">
                      <td className="px-4 py-3">{filteredData.mata_kuliah_detail.name}</td>
                      <td className="px-4 py-3">{filteredData.mata_kuliah_detail.sks_total}</td>
                      <td className="px-4 py-3">{filteredData.grade_symbol}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ))}
        </div>
        ):(
          <div></div>
        )}
      
    </section>
  );
};

export default ValidasiMahasiswaByNIM;