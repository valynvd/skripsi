/* eslint-disable react/jsx-key */
import React, { useMemo, useState } from 'react';
import Pagination from '../../../components/Pagination';
import { DeleteIcon, EditIcon } from '../../../components/IconButton';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table';
import { AiOutlineSearch } from 'react-icons/ai';
import FilterInput from '../../../components/FitlerInput';
import { useForm } from 'react-hook-form';
import { useProgramStudiData } from '../../../hooks/useProdi';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { ExportPrimaryButton } from '../../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';

import ClipLoader from 'react-spinners/ClipLoader';

const DegreeAuditKelulusanTable = ({
  setOpenModalDelete,
  userRole,
  setSelectedItem,
  loading,
  data,
}) => {
  console.log('Cek Load Data =====', data);
  const navigate = useNavigate();
  const [selectedAngkatan, setSelectedAngkatan] = useState('');
  const columns = [
    {
      Header: 'Nama Mahasiswa',
      accessor: 'mahasiswa_detail.nama',
      Cell: ({ row }) => (
        <a
          href={`/degreeaudit/validasi-kelulusan/${row.original.mahasiswa_detail.nim}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700"
        >
          {row.original.mahasiswa_detail.nama}
        </a>
      ),
    },
    {
      Header: 'NIM',
      accessor: 'mahasiswa_detail.nim',
    },
    {
      Header: 'Jurusan',
      accessor: 'mahasiswa_detail.prodi_detail.name',
    },
    {
      Header: 'Angkatan',
      accessor: 'mahasiswa_detail.angkatan',
    },
    {
      Header: 'Jumlah SKS Lulus',
      accessor: 'jumlah_sks',
    },
    {
      Header: 'Nilai D',
      accessor: 'nilaid',
    },
    {
      Header: 'Nilai E',
      accessor: 'nilaie',
    },
    {
      Header: 'IPK',
      accessor: 'nilai_ipk',
    },
    {
      Header: 'Status Kelulusan',
      accessor: 'status_kelulusan',
    },
    {
      Header: 'Keterangan Kelulusan',
      accessor: 'keterangan_lulus',
    },
    {
      Header: 'Aksi',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return (
          <div className="flex flex-row space-x-2">
            <EditIcon
              onClick={() => {
                navigate(`/degreeaudit/degreeaudit-kelulusan/${value.id}`, {
                  state: value,
                });
              }}
            />
            <DeleteIcon
              onClick={() => {
                setSelectedItem(value.id);
                setOpenModalDelete(true);
              }}
            />
          </div>
        );
      },
    },
  ];
  const { control, watch, setValue } = useForm({
    defaultValues: {},
  });
  const uniqueAngkatanValues = [
    ...new Set(data.map((item) => item.mahasiswa_detail.angkatan)),
  ];
  console.log('Angkatan ===', uniqueAngkatanValues);
  console.log('Selected Angkatan ===', selectedAngkatan);

  const prodiWatch = watch('prodi');

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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];
    console.log('Data ====', filteredData);
    if (prodiWatch) {
      filteredData = filteredData.filter(
        (item) => item.mahasiswa_detail.prodi === prodiWatch
      );
    }

    if (selectedAngkatan) {
      filteredData = filteredData.filter(
        (item) => item.mahasiswa_detail.angkatan === selectedAngkatan
      );
    }

    return filteredData;
  }, [data, prodiWatch, selectedAngkatan]);

  console.log('Memo Data', memoData);
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    nextPage,
    previousPage,
    canNextPage,
    canPreviousPage,
    setGlobalFilter,
    gotoPage,
    pageOptions,
    state,
    rows,
  } = useTable(
    { columns: memoColumns, data: memoData },
    useGlobalFilter,
    useSortBy,
    usePagination
  );
  console.log('Rows', rows);
  const handleExport = () => {
    const filterToExcel = rows.map(({ original }) => {
      const filteredItem = {
        'Nama Mahasiswa': original.mahasiswa_detail.nama,
        'NIM Mahasiswa': original.mahasiswa_detail.nim,
        Jurusan: original.mahasiswa_detail.prodi_detail.name,
        Angkatan: original.mahasiswa_detail.angkatan,
        'Jumlah SKS Lulus': original.jumlah_sks,
        'Jumlah Nilai D (SKS)': original.nilaid,
        'Jumlah Nilai E (SKS)': original.nilaie,
        IPK: original.nilai_ipk,
        'Status Kelulusan': original.status_kelulusan,
        Keterangan: original.keterangan_lulus,
      };

      // Apply conditional formatting to Jumlah SKS Lulus column
      if (original.jumlah_sks < 144) {
        filteredItem['Jumlah SKS Lulus'] = {
          v: original.jumlah_sks,
          s: {
            fill: {
              bgColor: { rgb: 'FF0000' }, // Red background color
            },
            font: {
              color: { rgb: 'FFFFFF' }, // White text color
            },
          }, // Red background, white text
        };
      }

      return filteredItem;
    });
    console.log('Filter Excel', filterToExcel);

    const wb = utils.book_new();
    const ws = utils.json_to_sheet(filterToExcel);

    utils.book_append_sheet(wb, ws, `${filterToExcel[0].Jurusan}`);

    writeFile(wb, `Degree Audit ${filterToExcel[0].Jurusan}.xlsx`);
  };

  const { pageIndex, globalFilter } = state;

  return (
    <>
      <div>
        <form className="flex gap-4 flex-wrap items-center mb-4">
          <div className="relative w-[]20rem">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <AiOutlineSearch size={20} color="gray" />
            </div>
            <input
              type="text"
              id="simple-search"
              className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
              placeholder="Cari..."
              value={globalFilter || ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
            />
          </div>
          <FilterInput
            clearFunc={() => {
              setValue('prodi', null);
              setSelectedAngkatan('');
            }}
            isClearable
            className="w-80"
            control={control}
            name="Prodi"
            registeredName="prodi"
            placeholder="Semua Prodi"
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
          />
          <select
            value={selectedAngkatan}
            onChange={(e) => setSelectedAngkatan(e.target.value)}
            className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-40 p-2.5"
          >
            <option value="">Semua Angkatan</option>
            {data &&
              data.length > 0 &&
              uniqueAngkatanValues.map((angkatan) => (
                <option key={angkatan} value={angkatan}>
                  {angkatan}
                </option>
              ))}
          </select>
          <ExportPrimaryButton onClick={handleExport} />
        </form>
      </div>
      {loading ? (
        <div>
          <ClipLoader color={'hsla(357, 85%, 52%, 1)'} size={50} />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table {...getTableProps()} className="w-full">
            <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
              {headerGroups.map((headerGroup) => (
                <tr {...headerGroup.getHeaderGroupProps()}>
                  {headerGroup.headers.map((column) => (
                    <th
                      className="px-4 py-3 font-semibold"
                      {...column.getHeaderProps(column.getSortByToggleProps())}
                    >
                      <div className="flex flex-row items-center">
                        {column.render('Header')}
                        {column.isSorted ? (
                          column.isSortedDesc ? (
                            <RxTriangleDown
                              size={20}
                              color="gray"
                              className="inline ml-1"
                            />
                          ) : (
                            <RxTriangleUp
                              size={20}
                              color="gray"
                              className="inline ml-1"
                            />
                          )
                        ) : (
                          ''
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {!loading && (
              <tbody {...getTableBodyProps()}>
                {page.map((row) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      className="bg-white border-b text-gray-600 border-black"
                    >
                      {row.cells.map((cell) => {
                        return (
                          <td
                            {...cell.getCellProps()}
                            className={`px-4 py-3 ${
                              cell.column.id === 'jumlah_sks' &&
                              cell.value < 144
                                ? 'bg-red-500 text-white text-center'
                                : '' ||
                                  (cell.column.id === 'nilaid' &&
                                    cell.value >= 7)
                                ? 'bg-red-500 text-white text-center'
                                : '' ||
                                  (cell.column.id === 'nilaie' &&
                                    cell.value >= 1)
                                ? 'bg-red-500 text-white text-center'
                                : '' ||
                                  cell.column.id === 'jumlah_sks' ||
                                  cell.column.id === 'nilaid' ||
                                  cell.column.id ===
                                    'mahasiswa_detail.angkatan' ||
                                  cell.column.id === 'nilai_ipk' ||
                                  cell.column.id === 'nilaie'
                                ? 'text-center'
                                : ''
                            }`}
                          >
                            {cell.render('Cell')}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {memoData.length === 0 && (
                  <tr>
                    <td
                      colSpan={`${memoColumns.length}`}
                      className="w-full text-center p-3.5 border border-gray-200 text-gray-400"
                    >
                      Data tidak ditemukan...
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        </div>
      )}
      <Pagination
        initialPagesArray={pageOptions}
        goToPage={gotoPage}
        pageIndex={pageIndex}
        nextPage={nextPage}
        previousPage={previousPage}
        canNextPage={canNextPage}
        canPreviousPage={canPreviousPage}
      />
    </>
  );
};

export default DegreeAuditKelulusanTable;
