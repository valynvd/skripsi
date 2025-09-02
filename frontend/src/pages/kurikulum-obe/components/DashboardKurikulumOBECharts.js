/* eslint-disable react/jsx-key */
import React from 'react';
import FilterInput from '../../../components/FitlerInput';
import { useForm } from 'react-hook-form';
import { useProgramStudiData } from '../../../hooks/useProdi';

const DashboardKurikulumOBECharts = () => {

  const { control, setValue } = useForm({
    defaultValues: {},
  });

  const { data: dataProgramStudi, isSuccess: dataProgramStudiSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatUserData = response.data.map(({ id, name, kode }) => {
          return {
            value: id,
            label: `${name} (${kode})`,
          };
        });

        console.log('Data Program Studi:', formatUserData);
        return formatUserData;
      },
    });

  return (
    <>
      <div>
        <form className="flex gap-4 flex-wrap items-center mb-4">
          <FilterInput
            clearFunc={() => {
              setValue('prodi', null);
            }}
            isClearable
            className="w-80"
            control={control}
            name="Prodi"
            registeredName="prodi"
            placeholder="Semua Prodi"
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
          />
        </form>
      </div>
    </>
  );
};

export default DashboardKurikulumOBECharts;
