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
// import { ExportPrimaryButton } from '../../../components/PrimaryButton';
// import { utils, writeFile } from 'xlsx';

const ValidasiMataKuliahTable = ({ 
  userRole,
  loading,
  data,
}) => {
  // const navigate = useNavigate();

  const columns = [
    {
      Header: 'Academic Session',
      accessor: 'academic_year',
      Cell: ({ row }) => (
        <div>
          {row.original.academic_year} - {renderAcademicSession(row.original.academic_session)}
        </div>
      ),
    },    
    {
      Header: 'Kode Mata Kuliah',
      accessor: 'kode_mata_kuliah',
    },
    {
      Header: 'Mata Kuliah',
      accessor: 'mata_kuliah',
      Cell: ({row}) => (
        <a 
            href={`/degreeaudit/validasi-mata-kuliah/matkul/${row.original.kode_mata_kuliah}`} 
            target="_blank" 
            rel="noopener noreferrer"
        >
            {row.original.mata_kuliah}
        </a>
      )
    },
    {
      Header: 'SKS',
      accessor: 'sks',
    },
    {
      Header: 'Count',
      accessor: 'count',
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
    // Modify your data to include counts grouped by Academic Session and Mata Kuliah
    const counts = data.reduce((acc, entry) => {
      const { academic_session, mata_kuliah_detail, academic_year } = entry;
      const key = `${academic_session}-${mata_kuliah_detail.kode}`;

      if (!acc[key]) {
        acc[key] = {
          academic_year: academic_year,
          academic_session,
          kode_mata_kuliah: mata_kuliah_detail.kode,
          mata_kuliah: mata_kuliah_detail.name,
          sks: mata_kuliah_detail.sks_total,
          count: 0,
        };
      }

      acc[key].count++;

      return acc;
    }, {});

    return Object.values(counts);
  }, [data]);

  // const handleExport = () => {
  //   const filterToExcel = rows.map(({ original }) => ({
  //     'Kode Mata Kuliah': original.kode,
  //     'Mata Kuliah': original.name,
  //     'SKS Total': original.sks_total,
  //     'SKS Praktikum': original.sks_praktikum,
  //   }));
  
  //   const wb = utils.book_new();
  //   const ws = utils.json_to_sheet(filterToExcel);
  
  //   utils.book_append_sheet(wb, ws, 'Mata Kuliah');
  
  //   writeFile(wb, 'List Mata Kuliah STEM.xlsx');
  // };

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
