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
    <section id="evaluasi-perkuliahan" className="p-6 bg-white rounded-lg over">
      <div className="flex justify-between items-center">
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
