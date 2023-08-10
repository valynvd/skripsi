/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import CRUDropdownInput from '../../components/CRUDropdownInput';
import { PrimaryButton } from '../../components/PrimaryButton';
import { useKriteriaData } from '../../hooks/useKriteria';
import CRUInput from '../../components/CRUInput';
import { useForm, Controller } from 'react-hook-form';
import Select from 'react-select';
import { primary400 } from '../../utils/colors';
import { useSuratPenugasanData } from '../../hooks/useSuratPenugasan';
import { BiSolidDownArrow } from 'react-icons/bi';
import { TooltipInfo } from '../../components/Tooltip';

const TableForm = ({ handleSubmit, onSubmit, control, errors, reset }) => {
  const { data } = useKriteriaData();
  const { data: suratPenugasanData } = useSuratPenugasanData({
    select: (response) =>
      response.data.map(({ judul, id }) => {
        return { label: judul, value: id };
      }),
  });
  const [criteriaState, setCriteriaState] = useState({});

  // useEffect(() => {
  //   console.log(suratPenugasanData);
  // }, [suratPenugasanData]);

  useEffect(() => {
    console.log(data);
    if (data) {
      const formatCriteriaState = {};
      const formatFormState = {};

      data.data.forEach((item) => {
        formatCriteriaState[item.nama] = false;

        item.poin_penilaian_detail.forEach((item2) => {
          if (item.nama === 'Kriteria 0') {
            formatFormState[item2.id] = {
              item_number: item2.item_number,
              description: item2.element,
              value: '',
              max_score: item2.max_score,
            };
          } else {
            formatFormState[item2.id] = {
              item_number: item2.item_number,
              description: item.deskripsi,
              value: '',
              max_score: item2.max_score,
            };
          }
        });
      });

      formatCriteriaState['Kriteria 0'] = true;
      reset(formatFormState);

      setCriteriaState(formatCriteriaState);
    }
  }, [data, reset]);

  const TableTh = ({ children, className }) => {
    return (
      <th className={`font-semibold border-r border-gray-300 p-3 ${className}`}>
        {children}
      </th>
    );
  };
  const TableTd = ({ children, className }) => {
    return (
      <td className={`border-gray-300 border-t border-r p-3 ${className}`}>
        {children}
      </td>
    );
  };

  return (
    <section className="section-container mt-4">
      <p className="font-semibold text-lg">Matriks Penilaian</p>
      <form onSubmit={handleSubmit(onSubmit)}>
        <table className="w-full mt-5">
          <thead className="table table-fixed w-full relative">
            <tr>
              <TableTh className="w-20">Jenis</TableTh>
              <TableTh className="w-20">No. Urut</TableTh>
              <TableTh className="w-20">No. Butir</TableTh>
              <TableTh className="w-20">Bobot dari 400</TableTh>
              <TableTh className="w-[15%]">Elemen Penilaian LAM</TableTh>
              <TableTh>Deskriptor</TableTh>
              <TableTh className="w-16">1</TableTh>
              <TableTh className="w-16">2</TableTh>
              <TableTh className="w-16">3</TableTh>
              <TableTh className="w-16">4</TableTh>
              <TableTh className="w-[10%]">Nilai</TableTh>
              <TableTh className="border-r-0 w-[20%] z-10">
                Dokumen Pendukung
              </TableTh>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan="8" className="h-03.5 bg-primary-400 rounded"></td>
            </tr>
          </tbody>
          {data?.data.map((item, index) => {
            let matriksList = [];

            if (index !== 0) {
              matriksList.push(
                <tbody
                  key={item.id}
                  className="cursor-pointer"
                  onClick={() =>
                    setCriteriaState((e) => {
                      let dupeCriteriaState = { ...e };

                      dupeCriteriaState[item.nama] =
                        !dupeCriteriaState[item.nama];

                      return dupeCriteriaState;
                    })
                  }
                >
                  <tr>
                    <td
                      colSpan="8"
                      className="py-3 px-6 bg-primary-400 rounded-lg text-white flex justify-between items-center"
                    >
                      <p>
                        {item.nama} {item.deskripsi}
                      </p>
                      <BiSolidDownArrow
                        size={13}
                        className={`duration-200 ${
                          criteriaState[item.nama] ? 'rotate-0' : 'rotate-180'
                        }`}
                      />
                    </td>
                  </tr>
                </tbody>
              );
            }

            matriksList.push(
              <tbody
                key={item.nama + ' child'}
                className={`w-full table-fixed ${
                  criteriaState[item.nama] ? 'block' : 'hidden'
                }`}
                // style={{
                //   maxHeight: criteriaState[item.nama]
                //     ? 400 * item.poin_penilaian_detail.length
                //     : 0,
                // }}
              >
                {item.poin_penilaian_detail.map((item2) => (
                  <tr key={item2.order_number}>
                    <TableTd className="text-center w-20">{item2.type}</TableTd>
                    <TableTd className="text-center w-20">
                      {item2.order_number}
                    </TableTd>
                    <TableTd className="text-center w-20">
                      {item2.item_number}
                    </TableTd>
                    <TableTd className="text-center w-20">
                      {item2.max_score}
                    </TableTd>
                    <TableTd className="w-[15%]">{item2.element}</TableTd>
                    <TableTd>{item2.description}</TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_1}</TooltipInfo>
                      </div>
                    </TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_1}</TooltipInfo>
                      </div>
                    </TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_1}</TooltipInfo>
                      </div>
                    </TableTd>
                    <TableTd className="relative w-16">
                      <div className="flex justify-center">
                        <TooltipInfo>{item2.description_grade_1}</TooltipInfo>
                      </div>
                    </TableTd>
                    <td className="border-gray-300 border-t border-r p-3 w-[10%]">
                      <Controller
                        control={control}
                        name={`${item2.id}`}
                        render={({ field }) => {
                          return (
                            <input
                              type="number"
                              {...field}
                              className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
                                false && '!border-primary-400'
                              }`}
                              onChange={(e) =>
                                field.onChange({
                                  ...field.value,
                                  value: e.target.value,
                                })
                              }
                              value={field.value?.value || ''}
                            />
                          );
                        }}
                      />
                    </td>
                    <td className="border-r-0 w-[20%] border-gray-300 border-t p-3">
                      <Controller
                        control={control}
                        name={`${item2.order_number}-doc`}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Select
                              isClearable={true}
                              placeholder="pilih..."
                              theme={(theme) => ({
                                ...theme,
                                colors: {
                                  ...theme.colors,
                                  primary: primary400,
                                  primary25: '#fde3e4',
                                  primary50: '#fbd0d2',
                                },
                              })}
                              classNamePrefix="react-select"
                              styles={{
                                control: (base) => ({
                                  ...base,
                                  boxShadow: 'none',
                                }),
                              }}
                              classNames={{
                                control: (state) =>
                                  `!px-0.5 !text-red-400 !w-[17rem] !mx-auto !py-0.5 ${
                                    error ? '!border-primary-400' : ''
                                  } ${
                                    state.isFocused
                                      ? '!border-primary-400'
                                      : '!border-gray-200'
                                  }`,
                              }}
                              inputRef={field.ref}
                              options={
                                suratPenugasanData ? suratPenugasanData : []
                              }
                              value={[].find((c) => c.value === field.value)}
                              isMulti
                              onChange={(val, triggeredAction) => {
                                field.onChange(val.value);
                              }}
                            />
                          </>
                        )}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            );
            return matriksList;
          })}
        </table>
        <PrimaryButton className="mt-4 ml-auto">Simulasi</PrimaryButton>
      </form>
    </section>
  );
};

export default TableForm;
