/* eslint-disable react/jsx-key */
import React, { useEffect, useMemo } from 'react';
import Pagination from '../../../components/Pagination';
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

const formatData = (data, prodiId) => {
  const result = [];

  data.forEach((item) => {
    item.cpmk_detail.forEach((cpmk) => {
      const cpl = cpmk.cpl_detail;
      if (prodiId === null || cpl.prodi_detail.id === prodiId) {
        const existingEntry = result.find(
          (entry) => entry.cpl === cpl.kode && entry.cpmk === cpmk.kode
        );

        if (existingEntry) {
          existingEntry.mkList.add(item.kode);
        } else {
          result.push({
            prodi: cpl.prodi_detail.name,
            cpl: cpl.kode,
            deskripsiCPL: cpl.deskripsi,
            cpmk: cpmk.kode,
            deskripsiCPMK: cpmk.deskripsi,
            mkList: new Set([item.kode]),
          });
        }
      }
    });
  });

  return result.map((entry) => ({
    ...entry,
    mkList: Array.from(entry.mkList),
  }));
};

const PemetaanCplCpmkMkTable = ({
  setOpenModalDelete,
  userRole,
  setSelectedItem,
  loading,
  data,
}) => {
  const { control, watch, setValue } = useForm({ defaultValues: {} });
  const prodiWatch = watch('prodi', null);
  const navigate = useNavigate();

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
  }, [dataProgramStudiSuccess, dataProgramStudi, prodiWatch, setValue]);

  const columns = useMemo(
    () => [
      // { Header: 'Prodi', accessor: 'prodi' },
      { Header: 'CPL', accessor: 'cpl' },
      { Header: 'Deskripsi CPL', accessor: 'deskripsiCPL' },
      { Header: 'CPMK', accessor: 'cpmk' },
      { Header: 'Deskripsi CPMK', accessor: 'deskripsiCPMK' },
      {
        Header: 'Mata Kuliah',
        accessor: 'mkList',
        Cell: ({ cell: { value } }) => (
          <ul>
            {value.map((mk, index) => (
              <li key={index}>{mk}</li>
            ))}
          </ul>
        ),
      },
    ],
    [userRole]
  );

  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    return formatData(data, prodiWatch);
  }, [data, prodiWatch]);

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
  } = useTable(
    { columns: memoColumns, data: memoData },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex, globalFilter } = state;

  // Function to check if the current cell should be merged
  const shouldMerge = (rowIndex, columnId) => {
    if (rowIndex === 0) return false;
    const prevRow = page[rowIndex - 1];
    const currentRow = page[rowIndex];
    // if (columnId === 'prodi') {
    //   return prevRow.original.prodi === currentRow.original.prodi;
    // }
    if (columnId === 'cpl') {
      return prevRow.original.cpl === currentRow.original.cpl;
    }
    if (columnId === 'deskripsiCPL') {
      return prevRow.original.deskripsiCPL === currentRow.original.deskripsiCPL;
    }
    return false;
  };

  // Function to calculate rowspan for merged cells
  const calculateRowSpan = (rowIndex, columnId) => {
    let span = 1;
    for (let i = rowIndex + 1; i < page.length; i++) {
      if (!shouldMerge(i, columnId)) {
        break;
      }
      span++;
    }
    return span;
  };

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
            }}
            className="w-80"
            control={control}
            name="Prodi"
            registeredName="prodi"
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
          />
        </form>
      </div>
      <div className="overflow-x-auto">
        {memoData.length === 0 ? (
          <div className="p-4 bg-yellow-100 text-yellow-800 border border-yellow-400 rounded-md">
            Untuk program studi{' '}
            {prodiWatch &&
              dataProgramStudi.find((prodi) => prodi.value === prodiWatch)
                .label}
            , data matakuliah belum dilengkapi dengan pemetaan terhadap CPL,
            silahkan lengkapi data matakuliah dengan CPL yang digunakan di
            penilaian terlebih dahulu.{' '}
            <button
              onClick={() => navigate('/data-master/mata-kuliah')}
              className="text-blue-500 underline"
            >
              Lengkapi CPL
            </button>
          </div>
        ) : (
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
                {page.map((row, rowIndex) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      className="bg-white border-b text-gray-600"
                    >
                      {row.cells.map((cell) => {
                        if (
                          cell.column.id === 'prodi' ||
                          cell.column.id === 'cpl' ||
                          cell.column.id === 'deskripsiCPL'
                        ) {
                          const rowSpan = shouldMerge(rowIndex, cell.column.id)
                            ? 0
                            : calculateRowSpan(rowIndex, cell.column.id);
                          return (
                            rowSpan > 0 && (
                              <td
                                {...cell.getCellProps()}
                                rowSpan={rowSpan}
                                className="px-4 py-3"
                              >
                                {cell.render('Cell')}
                              </td>
                            )
                          );
                        }
                        return (
                          <td {...cell.getCellProps()} className="px-4 py-3">
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
                      colSpan={`${columns.length}`}
                      className="w-full text-center p-3.5 border border-gray-200 text-gray-400"
                    >
                      Data tidak ditemukan...
                    </td>
                  </tr>
                )}
              </tbody>
            )}
          </table>
        )}
      </div>
      {memoData.length > 0 && (
        <Pagination
          initialPagesArray={pageOptions}
          goToPage={gotoPage}
          pageIndex={pageIndex}
          nextPage={nextPage}
          previousPage={previousPage}
          canNextPage={canNextPage}
          canPreviousPage={canPreviousPage}
        />
      )}
    </>
  );
};

export default PemetaanCplCpmkMkTable;
