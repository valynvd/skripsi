/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react';
import Pagination from '../../../components/Pagination';
// import { DeleteIcon, EditIcon } from '../../../components/IconButton';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table';
// import { AiOutlineSearch } from 'react-icons/ai';
// import FilterInput from '../../../components/FitlerInput';
// import { useForm } from 'react-hook-form';
// import { useProgramStudiData } from '../../../hooks/useProdi';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
// import { useNavigate } from 'react-router-dom';

const NilaiMahasiswaImportExcelTable = ({
  // setOpenModalDelete,
  userRole,
  // setSelectedItem,
  loading,
  data,
}) => {
  // const navigate = useNavigate();
  const columns = [
    {
      Header: 'Nama Mahasiswa',
      accessor: 'nama_mahasiswa',
    },
    {
      Header: 'NIM',
      accessor: 'nim_mahasiswa',
    },
    {
      Header: 'Jurusan',
      accessor: 'name_prody',
    },
    {
      Header: 'Angkatan',
      accessor: 'angkatan',
    },
    {
      Header: 'Mata Kuliah',
      accessor: 'subject',
    },
    {
      Header: 'SKS',
      accessor: 'graded_credits',
    },
    {
      Header: 'Nilai',
      accessor: 'grade_symbol',
    },
  ];
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];

    return filteredData;
  }, [data]);

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

  const { pageIndex } = state;

  return (
    <>
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
                    className="bg-white border-b text-gray-600"
                  >
                    {row.cells.map((cell) => {
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
      </div>
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

export default NilaiMahasiswaImportExcelTable;
