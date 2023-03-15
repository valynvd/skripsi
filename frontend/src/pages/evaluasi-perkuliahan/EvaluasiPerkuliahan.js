import React, { useEffect } from 'react';
import PrimaryButton from '../../components/PrimaryButton';
import { BiPlusCircle } from 'react-icons/bi';
import EvaluasiPerkuliahanTable from './components/EvaluasiPerkuliahanTable';
import { useEvaluasiPerkuliahanData } from '../../hooks/useEvaluasiPerkuliahan';

const EvaluasiPerkuliahan = () => {
  const { data: response, isLoading } = useEvaluasiPerkuliahanData();

  useEffect(() => {
    console.log(response?.data);
  }, [response]);

  return (
    <section id="evaluasi-perkuliahan" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">Daftar Evaluasi Perkuliahan</p>
        <PrimaryButton icon={<BiPlusCircle size={22} />}>
          Buat Evaluasi Perkuliahan
        </PrimaryButton>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <EvaluasiPerkuliahanTable
          loading={isLoading}
          data={response?.data ?? []}
        />
      </div>
    </section>
  );
};

export default EvaluasiPerkuliahan;
