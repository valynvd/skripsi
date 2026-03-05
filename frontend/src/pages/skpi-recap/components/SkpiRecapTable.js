/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/jsx-key */

import { useMemo } from 'react';
import {
  useGlobalFilter,
  usePagination,
  useSortBy,
  useTable,
} from 'react-table';
import Pagination from '../../../components/Pagination';
import { ClipLoader } from 'react-spinners';
import { compareCplCodes, getCplDisplayCode } from '../../../utils/cplDisplay';

const SkpiRecapTable = ({
  // setOpenModalDelete,
  // setSelectedItem,
  loading,
  data,
}) => {
  const uniqueCPLCodes = useMemo(() => {
    const codes = new Set();
    data?.forEach((item) => {
      item?.cpmks?.forEach((cpmk) => {
        if (cpmk?.cpl_kode) {
          codes.add(cpmk.cpl_kode);
        }
      });
    });

    return Array.from(codes).sort(compareCplCodes);
  }, [data]);

  const formattedData = useMemo(() => {
    return data?.map((item) => {
      const cplScores = {};

      item.cpmks?.forEach((cpmk) => {
        cplScores[cpmk.cpl_kode] = cpmk.total_score
          ? cpmk.total_score.toFixed(2)
          : '-';
      });

      return {
        nim: item.mahasiswa_detail.nim,
        nama: item.mahasiswa_detail.nama,
        ...cplScores,
      };
    });
  }, [data]);

  const columns = useMemo(() => {
    const baseColumn = [
      { Header: 'NIM', accessor: 'nim' },
      {
        Header: 'Nama Mahasiswa',
        accessor: 'nama',
        Cell: ({ row }) => (
          <a
            href={`/degreeaudit/validasi-kelulusan/${row.original.nim}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            {row.original.nama}
          </a>
        ),
      },
    ];

    const dynamicColumns = uniqueCPLCodes.map((code) => ({
      Header: getCplDisplayCode(code),
      accessor: code,
      Cell: ({ value }) => (value !== undefined ? value : '-'),
    }));

    return [...baseColumn, ...dynamicColumns];
  }, [uniqueCPLCodes]);

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
  } = useTable(
    {
      columns,
      data: formattedData,
    },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const { pageIndex } = state;

  return (
    <>
      {loading ? (
        <div>
          <ClipLoader color={'hsla(357, 85%, 52%, 1)'} size={50} />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table {...getTableProps()} className="w-full border">
              <thead className="bg-primary-400/[0.03] whitespace-nowrap rounded-xl">
                {headerGroups.map((headerGroup) => (
                  <tr {...headerGroup.getHeaderGroupProps()}>
                    {headerGroup.headers.map((column) => (
                      <th
                        {...column.getHeaderProps()}
                        className="px-4 py-3 font-semibold"
                      >
                        {column.render('Header')}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody {...getTableBodyProps()}>
                {page?.map((row) => {
                  prepareRow(row);
                  return (
                    <tr
                      {...row.getRowProps()}
                      className="bg-white border-b text-gray-600 border-black"
                    >
                      {row.cells.map((cell) => (
                        <td
                          {...cell.getCellProps()}
                          className={`px-4 py-3 ${
                            cell.column?.id === 'nim' ||
                            cell.column?.id === 'nama'
                              ? 'text-left'
                              : 'text-center'
                          }`}
                        >
                          {cell.render('Cell')}
                        </td>
                      ))}
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
      )}
    </>
  );
};

export default SkpiRecapTable;
