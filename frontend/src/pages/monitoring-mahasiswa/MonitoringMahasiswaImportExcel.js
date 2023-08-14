/* eslint-disable no-unused-vars */
import React, {useState, useMemo} from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import BreadCrumbs from '../../components/BreadCrumbs';
import { usePostMonitoringMahasiswa } from '../../hooks/useMonitoringMahasiswa';
import *as xlsx from 'xlsx'
import { useNavigate } from 'react-router-dom';
import { AiOutlineSearch } from 'react-icons/ai';
import ProgressBar from "@ramonak/react-progress-bar";


const MonitoringMahasiswaImportExcel = () => {
  const [namamahasiswa, setNamaMahasiswa] = useState('')
  const [nim, setNim] = useState('')
  const [prodi, setProdi] = useState('')

  const [progress, setProgress] = useState(0);

  const [nilaiD, setNilaiD] = useState('')
  const [nilaiE, setNilaiE] = useState('')
  const [jumlahSks, setJumlahSks] = useState('')
  const [dataFilter, setDataFilter] = useState([])
  const [excelData, setExcelData] = useState([])
  const [tahunAcademic, setTahunAcademic] = useState([])
  const [ipsSemester, setIpsSemester] = useState([])
  const [nilaiIpk, setNilaiIpk] = useState('')
  const navigate = useNavigate();

  const readExcel = async(e)=>{
    const file= e.target.files[0];
    const data= await file.arrayBuffer(file);
    const excelfile= xlsx.read(data);
    const excelsheet= excelfile.Sheets[excelfile.SheetNames[0]];
    const exceljson=xlsx.utils.sheet_to_json(excelsheet);
 
    setExcelData(exceljson);
  }
  const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

  const {mutate: postMonitoringMahasiswa, isLoading: postMonitoringMahasiswaLoading} = 
    usePostMonitoringMahasiswa();

  const onSubmit = async() => {
    if (excelData.length === 0) {
      console.log('No data to submit');
      return;
    }

    for (let index = 0; index < excelData.length; index++) {
      const data = excelData[index];
      const monitoringMahasiswaFormData = new FormData();
      
      for (const key in data) {
        monitoringMahasiswaFormData.append(key, data[key]);
      }
      
      try {
        postMonitoringMahasiswa(monitoringMahasiswaFormData, {
          onSuccess: () => {
            console.log('Data submitted successfully for index:', index);
            const newProgress = ((index + 1) / excelData.length) * 100;
            setProgress(newProgress.toFixed(2));
          },
          onError: (error) => {
            console.error('Error submitting data for index:', index, error);
          },
        });
  
        await delay(5);
      } catch (error) {
        console.error('Error while processing data:', error);
      }
    }
  }

  const handleSubmit = () => {
    const filteredData = excelData.filter((getdata) => {
      const lowerCaseNama = getdata.nama_mahasiswa.toLowerCase();
      return lowerCaseNama.includes(namamahasiswa.toLowerCase());
    });
  
    setDataFilter(filteredData);
  
    const calculateTotalCredits = (filteredData, gradeSymbol) => {
      return filteredData.reduce((totalCredits, getdata) => {
        if (getdata.grade_symbol.includes(gradeSymbol)) {
          return totalCredits + parseInt(getdata.earned_credits);
        }
        return totalCredits;
      }, 0);
    };
  
    const totalSKSNilaiD = calculateTotalCredits(filteredData, 'D').toString();
    setNilaiD(totalSKSNilaiD);
  
    const totalSKSNilaiE = calculateTotalCredits(filteredData, 'E').toString();
    setNilaiE(totalSKSNilaiE);
  
    const totalSKS = filteredData.reduce((totalCredits, getdata) => {
      if (!['D', 'E'].includes(getdata.grade_symbol)) {
        return totalCredits + parseInt(getdata.earned_credits);
      }
      return totalCredits;
    }, 0);
    const totalEarnedCredits = totalSKS.toString();
    setJumlahSks(totalEarnedCredits);
  
    const uniqueTahunAkademik = Array.from(
      new Set(
        filteredData.map((getdata) => JSON.stringify({
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
  
        filteredGrades.forEach((filteredData) => {
          const gradeValues = {
            A: 4.0, AB: 3.5, B: 3.0, BC: 2.5, C: 2.0, D: 1.0, E: 0.0
          };
          ips += gradeValues[filteredData.grade_symbol] * parseInt(filteredData.earned_credits);
          sks += parseInt(filteredData.earned_credits);
        });
  
        ipsResults.push({
          academicYear: academicData.academicYear,
          academicSession: academicData.academicSession,
          ips: (ips / sks).toFixed(2),
        });
      });
  
      return ipsResults;
    };
  
    const ipsData = calculateIPS(filteredData);
    setIpsSemester(ipsData);
  
    const calculateIPK = (ipsData) => {
      const totalIPS = ipsData.reduce((sum, data) => sum + parseFloat(data.ips), 0);
      return (totalIPS / ipsData.length).toFixed(2);
    };
    const ipkData = calculateIPK(ipsData);
    console.log(ipkData);
    console.log(ipsData);
    setNilaiIpk(ipkData);
  };
  

  return (
    <section id="datamahasiswa-form" className="section-container">
      <p className="text-lg font-semibold">
        <BreadCrumbs
          links={[
            { name: 'Mentoring Mahasiswa', link: '/degreeaudit/monitoring-akademik' },
            { name: 'Buat' },
          ]}
        />
        Buat Import Excel
      </p>
      <div>
      <form className="flex gap-4 flex-wrap items-center mb-4 mt-4">
        <div>
          <label className="form-label">File</label>
          <input type="file" className="form-control" onChange={ (e)=>readExcel(e)}/>
        </div>
      </form>
      </div>
      
      <div>
        <PrimaryButton className={`!mt-8 !mb-5`} onClick={onSubmit} disabled={postMonitoringMahasiswaLoading}>
          Simpan Data
        </PrimaryButton>
        {progress ? (<ProgressBar completed={progress}/>) : null}
        
        <form  className="flex gap-4 flex-wrap items-center mb-4 mt-10">
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
      ):(
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
                      ? " Odd"
                      : getData.academicSession === 20
                      ? " Odd Short"
                      : getData.academicSession === 30
                      ? " Even"
                      : getData.academicSession === 40
                      ? " Even Short"
                      : " Unknown Session Type"}</th>
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
                  .filter((getdata) => getdata.academic_year === getData.academicYear &&
                  getdata.academic_session === getData.academicSession) // Use === for comparison
                  .map((filteredData, index) => (
                    <tr key={index} className="bg-white border-b text-gray-600">
                      <td className="px-4 py-3">{index + 1}</td>
                      <td className="px-4 py-3">{filteredData.subject}</td>
                      <td className="px-4 py-3">{filteredData.graded_credits}</td>
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
              { excelData.filter((getdata)=> {
                return (
                  (namamahasiswa === '' || getdata.nama_mahasiswa.toLowerCase().includes(namamahasiswa.toLowerCase())) &&
                  (nim === '' || getdata.nim_mahasiswa.toString().includes(nim))&&
                  (prodi === '' || getdata.name_prody.toLowerCase().includes(prodi.toLowerCase()))
                  )
              }).map((filteredData, index)=> (
                <tr key={index} className="bg-white border-b text-gray-600">
                <td className="px-4 py-3">{index+1}</td>
                <td className="px-4 py-3">{filteredData.nama_mahasiswa}</td>
                <td className="px-4 py-3">{filteredData.nim_mahasiswa}</td>
                <td className="px-4 py-3">{filteredData.name_prody}</td>
                <td className="px-4 py-3">{filteredData.angkatan}</td>
                <td className="px-4 py-3">{filteredData.subject}</td>
                <td className="px-4 py-3">{filteredData.graded_credits}</td>
                <td className="px-4 py-3">{filteredData.grade_symbol}</td>
              </tr>
              ))}
              
            </tbody>
          </table>
      </div>
    </section>
  );
};

export default MonitoringMahasiswaImportExcel;
