/* eslint-disable no-unused-vars */
import React, { useEffect } from 'react';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import TableSimulate from './TableSimulate';
import TableForm from './TableForm';

const MatriksPenilaian = () => {
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors, dirtyFields },
  } = useForm({});
  const [simulateData, setSimulateData] = useState([]);

  const onSubmit = (values) => {
    let filteredValues = [];
    let countMaxScore = 0;

    for (const id in values) {
      const item = values[id];
      countMaxScore += item.max_score;
    }

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
      max_score: countMaxScore,
      weight_percent: 0,
    };

    for (const id in values) {
      const item = values[id];

      totalSimulation.total += 1;
      totalSimulation.mark_counted += (item.value / 4) * item.max_score;
      totalSimulation.weight_percent += (item.max_score / countMaxScore) * 100;

      if (item.description === formattedObject.name) {
        formattedObject['mark'] += item.value;
        formattedObject['mark_counted'] += (item.value / 4) * item.max_score;
        formattedObject['max_score'] += item.max_score;
        formattedObject['weight_percent'] +=
          (item.max_score / countMaxScore) * 100;
        formattedObject['total'] += 1;
      } else {
        formattedObject['number'] = item.item_number;
        formattedObject['name'] = item.description;
        formattedObject['total'] = 1;
        formattedObject['mark'] = item.value;
        formattedObject['mark_counted'] = (item.value / 4) * item.max_score;
        formattedObject['max_score'] = item.max_score;
        formattedObject['weight_percent'] =
          (item.max_score / countMaxScore) * 100;
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
      <TableForm
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        control={control}
        errors={errors}
        reset={reset}
      />
      {simulateData.length !== 0 && (
        <TableSimulate simulateData={simulateData} />
      )}
    </>
  );
};

export default MatriksPenilaian;
