/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import TableSimulate from './TableSimulate';
import TableForm from './TableForm';
import { usePatchPoinPenilaian } from '../../hooks/usePoinPenilaian';

const MatriksPenilaian = () => {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({});

  const [simulateData, setSimulateData] = useState([]);

  const { mutate: patchPoinPenilaian, isLoading: patchPoinPenilaianLoading } =
    usePatchPoinPenilaian();

  const onSubmit = (values) => {
    console.log(values);
    let filteredValues = [];

    const formattedObject = {
      number: 0,
      name: '',
      total: 0,
      mark: 0,
      max_score: 0,
      mark_counted: 0,
      weight_percent: 0,
    };
    const totalSimulation = {
      name: 'total',
      total: 0,
      mark_counted: 0,
      max_score: 400,
      weight_percent: 0,
    };

    for (const id in values) {
      const item = values[id];

      const poinPenilaianFormData = new FormData();

      // poinPenilaianFormData.append('score', parseFloat(item.value));

      // item.dokumen_pendukung.forEach((item) => {
      //   poinPenilaianFormData.append('dokumenPendukung', item.value);
      // });

      // patchPoinPenilaian(
      //   { data: poinPenilaianFormData, id: item.id },
      //   {
      //     onSuccess: (e) => {},
      //   }
      // );

      totalSimulation.total += 1;
      totalSimulation.mark_counted += (item.value / 4) * item.max_score;
      totalSimulation.weight_percent += (item.max_score / 400) * 100;

      if (item.description === formattedObject.name) {
        formattedObject['mark'] += item.value;
        formattedObject['mark_counted'] += (item.value / 4) * item.max_score;
        formattedObject['max_score'] += item.max_score;
        formattedObject['weight_percent'] += (item.max_score / 400) * 100;
        formattedObject['total'] += 1;
      } else {
        formattedObject['number'] = item.item_number;
        formattedObject['name'] = item.description;
        formattedObject['total'] = 1;
        formattedObject['mark'] = item.value;
        formattedObject['mark_counted'] = (item.value / 4) * item.max_score;
        formattedObject['max_score'] = item.max_score;
        formattedObject['weight_percent'] = (item.max_score / 400) * 100;
      }

      if (formattedObject.name !== values[Number(id) + 1]?.description) {
        filteredValues.push({ ...formattedObject });
      }
    }
    filteredValues.push(totalSimulation);
    setSimulateData(filteredValues);
  };

  return (
    <>
      <TableSimulate simulateData={simulateData} />
      <TableForm
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        control={control}
        errors={errors}
        reset={reset}
      />
    </>
  );
};

export default MatriksPenilaian;
