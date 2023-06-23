import React from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';

const MatriksPenilaian = () => {
  const TableTh = ({ children }) => {
    return (
      <th className="font-semibold border border-black p-3">{children}</th>
    );
  };
  const TableTd = ({ children, className }) => {
    return (
      <td className={`border border-black p-3 ${className}`}>{children}</td>
    );
  };

  return (
    <section className="section-container">
      <p className="font-semibold text-lg">Matriks Penilaian</p>
      <table className="w-full mt-5">
        <thead>
          <tr>
            <TableTh>Jenis</TableTh>
            <TableTh>No. Urut</TableTh>
            <TableTh>No. Butir</TableTh>
            <TableTh>Bobot dari 400</TableTh>
            <TableTh>Elemen Penilaian LAM</TableTh>
            <TableTh>Deskriptor</TableTh>
            <TableTh>Nilai</TableTh>
            <TableTh>Dokumen Pendukung</TableTh>
          </tr>
        </thead>
        <tbody>
          <tr>
            <TableTd className="text-center">i</TableTd>
            <TableTd className="text-center">1</TableTd>
            <TableTd className="text-center">A</TableTd>
            <TableTd className="text-center">6</TableTd>
            <TableTd>Kondisi Eksternal</TableTd>
            <TableTd>
              Kemampuan UPPS dalam menganalisis aspek- aspek dalam lingkungan
              makro dan lingkungan mikro yang relevan dan dapat mempengaruhi
              eksistensi dan pengembangan PS maupun UPPS.
            </TableTd>
            <TableTd>
              <input className="focus:outline-none border border-black p-2"></input>
            </TableTd>
            <TableTd>
              <input type="file" className="focus:outline-none"></input>
            </TableTd>
          </tr>
          <tr>
            <TableTd className="text-center">i</TableTd>
            <TableTd className="text-center">2</TableTd>
            <TableTd className="text-center">B</TableTd>
            <TableTd className="text-center">6</TableTd>
            <TableTd>
              Profil Unit Pengelola Program Studi / Analisis Internal
            </TableTd>
            <TableTd>
              Kemampuan UPPS dan PS dalam menyajikan seluruh informasi secara
              ringkas, komprehensif, serta konsisten terhadap data dan informasi
              yang disampaikan pada masingmasing kriteria.
            </TableTd>
            <TableTd>
              <input className="focus:outline-none border border-black p-2"></input>
            </TableTd>
            <TableTd>
              <input type="file" className="focus:outline-none"></input>
            </TableTd>
          </tr>
          <tr>
            <td colSpan="8" className="text-center">
              testing
            </td>
          </tr>
        </tbody>
      </table>
      <PrimaryButton className="mt-4 ml-auto">Simulasi</PrimaryButton>
    </section>
  );
};

export default MatriksPenilaian;
