/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react'; 
import Pagination from '../../../components/Pagination';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table'; 
import { AiOutlineSearch } from 'react-icons/ai';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { ExportPrimaryButton } from '../../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';

const MataKuliahTable = ({ 
  setOpenModalDelete, 
  setSelectedItem, 
  userRole,
  loading,
  data,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Nama',
      accessor: 'name',
      Cell: ({row}) => (
        <a 
            href={`/degreeaudit/monitoring-akademik/matkul/${row.original.kode}`} 
            target="_blank" 
            rel="noopener noreferrer"
        >
            {row.original.name}
        </a>
      )
    },
    {
      Header: 'Kode',
      accessor: 'kode',
    },
    {
      Header: 'SM Objid',
      accessor: 'sm_objid',
    },
    {
      Header: 'SKS Total',
      accessor: 'sks_total',
    },
    {
      Header: 'SKS Praktikum',
      accessor: 'sks_praktikum',
    },
    // {
    //   Header: 'Semester',
    //   accessor: 'semester',
    // },
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
                navigate(`/data-master/mata-kuliah/${value.id}`, {
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];
    return filteredData;
}, [data]);

  const handleExport = () => {
    const filterToExcel = rows.map(({ original }) => ({
      'Kode Mata Kuliah': original.kode,
      'Mata Kuliah': original.name,
      'SKS Total': original.sks_total,
      'SKS Praktikum': original.sks_praktikum,
    }));
  
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(filterToExcel);
  
    utils.book_append_sheet(wb, ws, 'Mata Kuliah');
  
    writeFile(wb, 'List Mata Kuliah STEM.xlsx');
  };

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
              <ExportPrimaryButton onClick={handleExport} />
          </form>
      </div>
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
              {page.map((row)=> {
                prepareRow(row);
                return(
                  <tr
                      {...row.getRowProps()}
                      className="bg-white border-b text-gray-600 border-black" 
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

export default MataKuliahTable;
