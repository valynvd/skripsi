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
// import { useNavigate } from 'react-router-dom';
// import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { ExportPrimaryButton } from '../../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';

const ValidasiMataKuliahTable = ({ 
  userRole,
  loading,
  data,
}) => {
  // const navigate = useNavigate();
  const columns = [
    {
      Header:'Nama Mahasiswa',
      accessor:'mahasiswa_detail.nama',
    },
    {
      Header:'NIM',
      accessor:'mahasiswa_detail.nim',
    },
    {
      Header:'Jurusan',
      accessor:'mahasiswa_detail.prodi_detail.name'
    },
    {
      Header:'Angkatan',
      accessor:'mahasiswa_detail.angkatan'
    },
  {
      Header:'Kode Mata Kuliah',
      accessor:'mata_kuliah_detail.kode'
    },
    {
      Header:'Mata Kuliah',
      accessor:'mata_kuliah_detail.name'
    },
    {
      Header:'SKS',
      accessor:'mata_kuliah_detail.sks_total'
    },
    {
        Header:'Academic Session',
        Cell: ({ row }) => (
            <div>
              {row.original.academic_year} - {renderAcademicSession(row.original.academic_session)}
            </div>
          ),
    },
    {
      Header:'Nilai',
      accessor:'grade_symbol'
    },
  ];
  const renderAcademicSession = academicSession => {
    if (academicSession === '10') {
      return 'Odd';
    } else if (academicSession === '20') {
      return 'Odd Short';
    } else if (academicSession === '30') {
      return 'Even';
    } else if (academicSession === '40') {
      return 'Even Short';
    } else {
      return 'Unknown Session Type';
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];
    return filteredData;
}, [data]);

  const handleExport = () => {
    const filterToExcel = rows.map(({ original }) => ({
      'Nama Mahasiswa': original.mahasiswa_detail.nama,
      'NIM': original.mahasiswa_detail.nim,
      'Jurusan': original.mahasiswa_detail.prodi_detail.name,
      'Angkatan': original.mahasiswa_detail.angkatan,
      'Kode Mata Kuliah': original.mata_kuliah_detail.kode,
      'Mata Kuliah': original.mata_kuliah_detail.name,
      'SKS Total': original.mata_kuliah_detail.sks_total,
      'Academic Year': original.academic_year,
      'Academic Session': original.academic_session,
      'Nilai': original.grade_symbol,
    }));
  
    const wb = utils.book_new();
    const ws = utils.json_to_sheet(filterToExcel);
  
    utils.book_append_sheet(wb, ws, `${filterToExcel[0]['Mata Kuliah']}`);
  
    writeFile(wb, `List Mahasiswa No Grade Mata Kuliah ${filterToExcel[0]['Mata Kuliah']}.xlsx`);
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
                      <td {...cell.getCellProps()} className="px-4 py-3">
                        {cell.render('Cell')}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
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

export default ValidasiMataKuliahTable;
