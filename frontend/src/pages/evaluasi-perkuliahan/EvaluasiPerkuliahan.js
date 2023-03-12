/* eslint-disable no-unused-vars */
import React from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import Table from './components/Table';
import { useEvaluasiPerkuliahanData } from '../../hooks/useEvaluasiPerkuliahan';

const EvaluasiPerkuliahan = () => {
  const { data: response, isLoading } = useEvaluasiPerkuliahanData();

  console.log(response?.data);

  return (
    <section id="evaluasi-perkuliahan" className="p-6 bg-white rounded-lg">
      <div className="flex justify-between items-center">
        <p className="font-semibold">Daftar Evaluasi Perkuliahan</p>
        <PrimaryButton icon={<BiPlusCircle size={22} />}>
          Buat Surat Penugasan
        </PrimaryButton>
      </div>
      <div className="mt-8">
        <Table loading={isLoading} data={response?.data ?? []} />
      </div>
    </section>
  );
};

export default EvaluasiPerkuliahan;
