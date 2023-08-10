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

    // const formattedSubTotal = {
    //   subTotalElement: 0,
    //   subTotalMark: 0,
    //   subTotalCountedMark: 0,
    // };
    // let itemNumber = 'A';

    for (const id in values) {
      const item = values[id];
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
        // filteredValues.push({ description: 'Sub Total' });
        filteredValues.push({ ...formattedObject });
      }

      // if (itemNumber !== values[Number(id) + 1]?.item_number) {
      //   formattedSubTotal.subTotalElement += 1;
      //   formattedSubTotal.subTotalMark += item.value;
      //   formattedSubTotal.subTotalCountedMark +=
      //     (item.value / 4) * item.max_score;
      // } else {
      //   filteredValues.push({ ...formattedSubTotal });
      //   formattedSubTotal.subTotalElement = 0;
      //   formattedSubTotal.subTotalMark = 0;
      //   formattedSubTotal.subTotalCountedMark = 0;
      // }
      // if(item.item_number.includes('.')){
      //   formattedSubTotal.subTotalElement += 1;
      //   formattedSubTotal.subTotalMark += item.value;
      //   formattedSubTotal.subTotalCountedMark +=
      //     (item.value / 4) * item.max_score;
      // }else{

      // }
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
