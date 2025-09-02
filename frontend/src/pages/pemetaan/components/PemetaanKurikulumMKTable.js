/* eslint-disable react/jsx-key */
import React, { useEffect, useMemo, useState } from 'react';
import FilterInput from '../../../components/FitlerInput';
import { useForm } from 'react-hook-form';
import { useProgramStudiData } from '../../../hooks/useProdi';
import { useNavigate } from 'react-router-dom';
// import Select from 'react-select';
// import { primary400 } from '../../../utils/colors';

const PemetaanKurikulumMKTable = ({ loading, data }) => {
  const navigate = useNavigate();

  const { control, watch, setValue } = useForm({
    defaultValues: { prodi: null },
  });
  const prodiWatch = watch('prodi', null);
  const [selectedKurikulum, setSelectedKurikulum] = useState('');

  const { data: dataProgramStudi, isSuccess: dataProgramStudiSuccess } =
    useProgramStudiData({
      select: (response) => {
        const formatUserData = response.data.map(({ id, name, kode }) => {
          return { value: id, label: `${name} (${kode})` };
        });
        return formatUserData;
      },
    });

  useEffect(() => {
    if (dataProgramStudiSuccess && dataProgramStudi.length > 0 && !prodiWatch) {
      setValue('prodi', dataProgramStudi[0].value);
    }
    setSelectedKurikulum('');
  }, [dataProgramStudiSuccess, dataProgramStudi, prodiWatch, setValue]);

  const filteredKurikulum = useMemo(() => {
    if (!prodiWatch) return [];
    const kurikulumSet = new Set(
      data
        .filter((item) => item.prodi_detail.id === prodiWatch)
        .flatMap((item) =>
          item.kurikulum_detail.map((kurikulum) => kurikulum.name)
        )
    );
    return Array.from(kurikulumSet);
  }, [data, prodiWatch]);

  // useEffect(() => {
  //   if (filteredKurikulum.length > 0) {
  //     setSelectedKurikulum(filteredKurikulum[0]);
  //   } else {
  //     setSelectedKurikulum('');
  //   }
  // }, [filteredKurikulum]);
  useEffect(() => {
    if (filteredKurikulum.length > 0) {
      setSelectedKurikulum(filteredKurikulum[0]);
      setValue('kurikulum', filteredKurikulum[0]);
    } else {
      setSelectedKurikulum('');
      setValue('kurikulum', '');
    }
  }, [filteredKurikulum, setValue]);

  const formattedData = useMemo(() => {
    const semesters = data.reduce((acc, item) => {
      item.kurikulum_detail.forEach((kurikulum) => {
        if (kurikulum.name === selectedKurikulum) {
          const existingSemester = acc.find(
            (s) => s.semester === item.semester
          );
          const course = {
            course: item.name,
            code: item.kode,
            credits: item.sks_total,
          };

          if (existingSemester) {
            existingSemester.courses.push(course);
          } else {
            acc.push({
              semester: item.semester,
              courses: [course],
            });
          }
        }
      });

      return acc;
    }, []);

    const regularSemesters = semesters
      .filter((s) => !isNaN(s.semester))
      .sort((a, b) => a.semester - b.semester);
    const spSemesters = semesters
      .filter((s) => isNaN(s.semester))
      .sort((a, b) => a.semester.localeCompare(b.semester));

    return [...regularSemesters, ...spSemesters];
  }, [data, selectedKurikulum]);

  return (
    <>
      <div>
        <form className="flex gap-4 flex-wrap items-center mb-4">
          <FilterInput
            clearFunc={() => {
              setValue('prodi', null);
            }}
            className="w-80"
            control={control}
            name="Prodi"
            registeredName="prodi"
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
          />
          {/* <select
            value={selectedKurikulum}
            onChange={(e) => setSelectedKurikulum(e.target.value)}
            className="border border-gray-300 focus:border-primary-400 text-gray-900 rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-80 p-2.5"
          >
            {filteredKurikulum.length > 0 ? (
              filteredKurikulum.map((kurikulum) => (
                <option key={kurikulum} value={kurikulum}>
                  {kurikulum}
                </option>
              ))
            ) : (
              <option value="">Tidak ada Kurikulum</option>
            )}
          </select> */}
          <FilterInput
            clearFunc={() => {
              setSelectedKurikulum('');
            }}
            className="w-80"
            control={control}
            name="Kurikulum"
            registeredName="kurikulum"
            options={
              filteredKurikulum.length > 0
                ? filteredKurikulum.map((kurikulum) => ({
                    value: kurikulum,
                    label: kurikulum,
                  }))
                : [{ value: '', label: 'Tidak ada Kurikulum' }]
            }
            value={selectedKurikulum}
            onChange={(value) => setSelectedKurikulum(value)}
          />
        </form>
      </div>
      <div className="overflow-x-auto">
        {formattedData.length === 0 ? (
          <div className="p-4 bg-yellow-100 text-yellow-800 border border-yellow-400 rounded-md">
            Untuk program studi{' '}
            {prodiWatch &&
              dataProgramStudi.find((prodi) => prodi.value === prodiWatch)
                .label}
            , data matakuliah belum dilengkapi dengan kurikulumnya, silahkan
            lengkapi data matakuliah dengan kurikulum yang digunakan terlebih
            dahulu.{' '}
            <button
              onClick={() => navigate('/data-master/mata-kuliah')}
              className="text-blue-500 underline"
            >
              Lengkapi Kurikulum
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap -mx-2">
            {formattedData.map((semesterData, index) => (
              <div key={index} className="w-full md:w-1/2 px-2 mb-4">
                <div className="semester-table border p-4">
                  <h3 className="font-bold mb-2">
                    Semester {semesterData.semester}
                  </h3>
                  <table className="border-collapse border border-gray-400 w-full">
                    <thead>
                      <tr>
                        <th className="border border-gray-400 px-4 py-2">
                          COURSE
                        </th>
                        <th className="border border-gray-400 px-4 py-2">
                          COURSE CODE
                        </th>
                        <th className="border border-gray-400 px-4 py-2">
                          CREDITS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {semesterData.courses.map((course, courseIndex) => (
                        <tr key={courseIndex}>
                          <td className="border border-gray-400 px-4 py-2">
                            {course.course}
                          </td>
                          <td className="border border-gray-400 px-4 py-2">
                            {course.code}
                          </td>
                          <td className="border border-gray-400 px-4 py-2">
                            {course.credits}
                          </td>
                        </tr>
                      ))}
                      <tr>
                        <td
                          className="border border-gray-400 px-4 py-2 font-bold"
                          colSpan="2"
                        >
                          Total
                        </td>
                        <td className="border border-gray-400 px-4 py-2 font-bold">
                          {semesterData.courses.reduce(
                            (total, course) => total + course.credits,
                            0
                          )}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default PemetaanKurikulumMKTable;
