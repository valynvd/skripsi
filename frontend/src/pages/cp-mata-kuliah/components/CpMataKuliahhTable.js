/* eslint-disable react/jsx-key */
import React, { useEffect, useMemo } from 'react';
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

const CpMataKuliahTable = ({
  setOpenModalDelete,
  userRole,
  setSelectedItem,
  loading,
  data,
}) => {
  const navigate = useNavigate();
  const columns = [
    {
      Header: 'Kode CPL',
      accessor: 'cpl_detail.kode',
    },
    {
      Header: 'Deskripsi CPL',
      accessor: 'cpl_detail.deskripsi',
    },
    {
      Header: 'Kode CPMK',
      // accessor: ({ prodi_detail, kode }) => `${prodi_detail.kode} - ${kode}`
      accessor: 'kode',
    },
    {
      Header: 'Deskripsi CPMK',
      accessor: 'deskripsi',
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
                navigate(`/kurikulum-obe/cpmk/${value.id}`, {
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

        return formatUserData;
      },
    });

  useEffect(() => {
    if (dataProgramStudiSuccess && dataProgramStudi.length > 0 && !prodiWatch) {
      setValue('prodi', dataProgramStudi[0].value);
    }
  }, [dataProgramStudiSuccess, dataProgramStudi, prodiWatch, setValue]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];
    if (prodiWatch) {
      // filteredData = filteredData.filter((item) => item.prodi === prodiWatch);
      filteredData = filteredData.filter(
        (item) => item.cpl_detail.prodi === prodiWatch
      );
    }

    filteredData.sort((a, b) =>
      a.cpl_detail.kode.localeCompare(b.cpl_detail.kode)
    );

    return filteredData;
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
    // rows,
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
    return (
      prevRow.original.cpl_detail.kode === currentRow.original.cpl_detail.kode
    );
  };

  // Function to calculate rowspan for merged cells
  const calculateRowSpan = (rowIndex, columnId) => {
    let span = 1;
    for (let i = rowIndex + 1; i < page.length; i++) {
      if (
        page[i].original.cpl_detail.kode !==
        page[rowIndex].original.cpl_detail.kode
      ) {
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
            , belum ada data CPMK. Silahkan buatkan{' '}
            <button
              onClick={() => navigate('/kurikulum-obe/capaian-pembelajaran')}
              className="text-blue-500 underline"
            >
              CPL
            </button>{' '}
            terlebih dahulu dan apabila sudah ada silahkan buatkan CPMK untuk
            prodi terkait.
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
                          cell.column.id === 'cpl_detail.kode' ||
                          cell.column.id === 'cpl_detail.deskripsi'
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

export default CpMataKuliahTable;
