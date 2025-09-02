import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useNilaiMahasiswaDataByNIM } from '../../hooks/useNilaiMahasiswa';
import BreadCrumbs from '../../components/BreadCrumbs';
import SKPISE from '../skpi/SKPISE';
import SKPIPDE from '../skpi/SKPIPDE';
import SKPIBM from '../skpi/SKPIBM';
import SKPIFBT from '../skpi/SKPIFBT';
import SKPIREE from '../skpi/SKPIREE';
import SKPICSE from '../skpi/SKPICSE';
import ClipLoader from 'react-spinners/ClipLoader';

// Import komponen untuk jurusan lain jika ada

const SKPIPage = () => {
  const { nim } = useParams();
  const {
    data: responseResult,
    isLoading,
    error,
  } = useNilaiMahasiswaDataByNIM(nim);

  useEffect(() => {
    // console.log('NIM from useParams:', nim);
    // console.log('Response Data from API:', responseResult);
  }, [nim, responseResult]);

  // if (isLoading) {
  //   return <p>Loading...</p>;
  // }

  if (error) {
    return (
      <>
        <section id="skpi" className="section-container">
          <BreadCrumbs
            links={[
              {
                name: 'Validasi Mahasiswa',
                // link: `/degreeaudit/validasi-kelulusan/${mahasiswaDetail.nim}`,
                link: '#',
              },
              { name: `SKPI` },
            ]}
          />
          <div className="flex gap-4">
            <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
              <p className="font-semibold text-lg mb-4">
                Capaian Pembelajaran Lulusan Mahasiswa
              </p>
            </div>
          </div>
          <p>Error loading data: {error.message}</p>
        </section>
      </>
    );
  }

  if (
    !responseResult ||
    !responseResult.data ||
    responseResult.data.length === 0
  ) {
    return (
      <>
        <section id="skpi" className="section-container">
          <BreadCrumbs
            links={[
              {
                name: 'Validasi Mahasiswa',
                // link: `/degreeaudit/validasi-kelulusan/${mahasiswaDetail.nim}`,
                link: '#',
              },
              { name: `SKPI` },
            ]}
          />
          <div className="flex gap-4">
            <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
              <p className="font-semibold text-lg mb-4">
                Capaian Pembelajaran Lulusan Mahasiswa
              </p>
            </div>
          </div>
          {/* <p>No data available for the given NIM.</p> */}
          {/* add spinner when fetch data */}
          <ClipLoader size={50} color={'#123abc'} loading={isLoading} />
        </section>
      </>
    );
  }

  const mahasiswaDetail = responseResult?.data?.[0]?.mahasiswa_detail;
  const prodi = mahasiswaDetail?.prodi_detail?.name;

  return (
    <section id="skpi" className="section-container">
      <BreadCrumbs
        links={[
          {
            name: 'Validasi Mahasiswa',
            link: `/degreeaudit/validasi-kelulusan/${mahasiswaDetail.nim}`,
          },
          { name: `SKPI` },
        ]}
      />
      <div className="flex gap-4">
        <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
          <p className="font-semibold text-lg mb-4">
            Capaian Pembelajaran Lulusan {mahasiswaDetail.nama}
          </p>
        </div>
      </div>

      {isLoading && (
        <div className="flex justify-center items-center">
          <ClipLoader size={50} color={'#123abc'} loading={isLoading} />
        </div>
      )}

      {/* Render komponen yang sesuai dengan jurusan */}
      {!isLoading && (
        <>
          {prodi === 'Software Engineering' && <SKPISE />}
          {prodi === 'Product Design Engineering' && <SKPIPDE />}
          {prodi === 'Mathematics' && <SKPIBM />}
          {prodi === 'Food Technology' && <SKPIFBT />}
          {prodi === 'Renewable Energy Engineering' && <SKPIREE />}
          {prodi === 'Computer Systems Engineering' && <SKPICSE />}
        </>
      )}
    </section>
  );
};

export default SKPIPage;
