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

const SkpiRecapTable = ({
  // setOpenModalDelete,
  // setSelectedItem,
  loading,
  data,
  idProdi,
}) => {
  // Step 1: Ambil semua kode CPL unik
  const uniqueCPLCodes = useMemo(() => {
    // const codes = new Set();
    // data.forEach((item) => {
    //   item.cpmks?.forEach((cpmk) => {
    //     if (cpmk?.cpl_kode) {
    //       codes.add(cpmk.cpl_kode);
    //     }
    //   });
    // });
    // return Array.from(codes);
    if (idProdi === 3) {
      // FBT
      return [
        'CPL-FBT-S1',
        'CPL-FBT-S2',
        'CPL-FBT-S3',
        'CPL-FBT-S4',
        'CPL-FBT-S5',
        'CPL-FBT-S6',
        'CPL-FBT-KU1',
        'CPL-FBT-KU2',
        'CPL-FBT-KU3',
        'CPL-FBT-KU4',
        'CPL-FBT-P1',
        'CPL-FBT-P2',
        'CPL-FBT-P3',
        'CPL-FBT-KK1',
        'CPL-FBT-KK2',
        'CPL-FBT-KK3',
      ];
    } else if (idProdi === 1) {
      // CSE
      return [
        'CPL-SE-S1',
        'CPL-SE-S2',
        'CPL-SE-S3',
        'CPL-SE-S4',
        'CPL-SE-S5',
        'CPL-SE-S6',
        'CPL-SE-KU1',
        'CPL-SE-KU2',
        'CPL-SE-KU3',
        'CPL-SE-KU4',
        'CPL-SE-P1',
        'CPL-SE-P2',
        'CPL-SE-P3',
        'CPL-SE-P4',
        'CPL-SE-P5',
        'CPL-SE-P6',
        'CPL-SE-P7',
        'CPL-SE-P8',
        'CPL-SE-P9',
        'CPL-SE-KK1',
        'CPL-SE-KK2',
        'CPL-SE-KK3',
        'CPL-SE-KK4',
        'CPL-SE-KK5',
      ];
    } else if (idProdi === 2) {
      // Mathematics
      return [
        'CPL-BM-S1',
        'CPL-BM-S2',
        'CPL-BM-S3',
        'CPL-BM-S4',
        'CPL-BM-S5',
        'CPL-BM-S6',
        'CPL-BM-KU1',
        'CPL-BM-KU2',
        'CPL-BM-KU3',
        'CPL-BM-KU4',
        'CPL-BM-P1',
        'CPL-BM-P2',
        'CPL-BM-P3',
        'CPL-BM-P4',
        'CPL-BM-P5',
        'CPL-BM-KK1',
        'CPL-BM-KK2',
        'CPL-BM-KK3',
        'CPL-BM-KK4',
      ];
    } else if (idProdi === 4) {
      // REE
      return [
        'CPL-REE-S1',
        'CPL-REE-S2',
        'CPL-REE-S3',
        'CPL-REE-S4',
        'CPL-REE-S5',
        'CPL-REE-S6',
        'CPL-REE-KU1',
        'CPL-REE-KU2',
        'CPL-REE-KU3',
        'CPL-REE-KU4',
        'CPL-REE-P1',
        'CPL-REE-P2',
        'CPL-REE-KK1',
        'CPL-REE-KK2',
        'CPL-REE-KK3',
        'CPL-REE-KK4',
      ];
    } else if (idProdi === 5) {
      // CSE
      return [
        'CPL-CSE-S1',
        'CPL-CSE-S2',
        'CPL-CSE-S3',
        'CPL-CSE-S4',
        'CPL-CSE-S5',
        'CPL-CSE-S6',
        'CPL-CSE-KU1',
        'CPL-CSE-KU2',
        'CPL-CSE-KU3',
        'CPL-CSE-KU4',
        'CPL-CSE-KU5',
        'CPL-CSE-KU6',
        'CPL-CSE-KU7',
        'CPL-CSE-KU8',
        'CPL-CSE-KU9',
        'CPL-CSE-P1',
        'CPL-CSE-P2',
        'CPL-CSE-P3',
        'CPL-CSE-KK1',
        'CPL-CSE-KK2',
      ];
    } else if (idProdi === 6) {
      // PDE
      return [
        'CPL-PDE-S1',
        'CPL-PDE-S2',
        'CPL-PDE-S3',
        'CPL-PDE-S4',
        'CPL-PDE-S5',
        'CPL-PDE-S6',
        'CPL-PDE-KU1',
        'CPL-PDE-KU2',
        'CPL-PDE-KU3',
        'CPL-PDE-KU4',
        'CPL-PDE-KU5',
        'CPL-PDE-KU6',
        'CPL-PDE-P1',
        'CPL-PDE-P2',
        'CPL-PDE-P3',
        'CPL-PDE-P4',
        'CPL-PDE-P5',
        'CPL-PDE-P6',
        'CPL-PDE-P7',
        'CPL-PDE-P8',
        'CPL-PDE-P9',
        'CPL-PDE-P10',
        'CPL-PDE-P11',
        'CPL-PDE-KK1',
        'CPL-PDE-KK3',
        'CPL-PDE-KK4',
        'CPL-PDE-KK5',
        'CPL-PDE-KK6',
        'CPL-PDE-KK7',
        'CPL-PDE-KK8',
      ];
    }
  }, [data]);
  // console.log('🚀 ~ uniqueCPLCodes ~ uniqueCPLCodes:', uniqueCPLCodes);

  // Step 2: Siapkan data untuk tabel
  const formattedData = useMemo(() => {
    return data?.map((item) => {
      const cplScores = {};

      item.cpmks?.forEach((cpmk) => {
        cplScores[cpmk.cpl_kode] = cpmk.total_score? cpmk.total_score.toFixed(2) : '-'; // Tambahkan nilai CPL
      });

      return {
        nim: item.mahasiswa_detail.nim,
        nama: item.mahasiswa_detail.nama,
        ...cplScores, // Gabungkan nilai CPL dengan NIM
      };
    });
  }, [data]);
  // console.log('🚀 ~ formattedData ~ formattedData:', formattedData);

  // Step 3: Definisikan kolom tabel
  const columns = useMemo(() => {
    const baseColumn = [
      { Header: 'NIM', accessor: 'nim' },
      {
        Header: 'Nama Mahasiswa',
        accessor: 'nama',
        Cell: ({ row }) => (
          <a
            href={`/degreeaudit/validasi-kelulusan/${row.original.nim}`} // Gunakan nim dari original
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline hover:text-blue-700"
          >
            {row.original.nama} {/* Akses langsung nama */}
          </a>
        ),
      },
    ];
    const dynamicColumns = uniqueCPLCodes?.map((code) => ({
      Header: code,
      accessor: code,
      Cell: ({ value }) => (value !== undefined ? value : '-'), // Tampilkan '-' jika tidak ada nilai
    }));

    return [...baseColumn, ...dynamicColumns];
  }, [uniqueCPLCodes]);

  // Step 4: Gunakan React Table
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
                        {idProdi === 3 && // FBT
                          (column.render('Header') === 'CPL-FBT-S1'
                            ? '3.A.1'
                            : column.render('Header') === 'CPL-FBT-S2'
                            ? '3.A.2'
                            : column.render('Header') === 'CPL-FBT-S3'
                            ? '3.A.3'
                            : column.render('Header') === 'CPL-FBT-S4'
                            ? '3.A.4'
                            : column.render('Header') === 'CPL-FBT-S5'
                            ? '3.A.5'
                            : column.render('Header') === 'CPL-FBT-S6'
                            ? '3.A.6'
                            : column.render('Header') === 'CPL-FBT-KU1'
                            ? '3.B.1'
                            : column.render('Header') === 'CPL-FBT-KU2'
                            ? '3.B.2'
                            : column.render('Header') === 'CPL-FBT-KU3'
                            ? '3.B.3'
                            : column.render('Header') === 'CPL-FBT-KU4'
                            ? '3.B.4'
                            : column.render('Header') === 'CPL-FBT-P1'
                            ? '3.C.1'
                            : column.render('Header') === 'CPL-FBT-P2'
                            ? '3.C.2'
                            : column.render('Header') === 'CPL-FBT-P3'
                            ? '3.C.3'
                            : column.render('Header') === 'CPL-FBT-KK1'
                            ? '3.D.1'
                            : column.render('Header') === 'CPL-FBT-KK2'
                            ? '3.D.2'
                            : column.render('Header') === 'CPL-FBT-KK3'
                            ? '3.D.3'
                            : column.render('Header'))}
                        {idProdi === 1 && // SE
                          (column.render('Header') === 'CPL-SE-S1'
                            ? '3.A.1'
                            : column.render('Header') === 'CPL-SE-S2'
                            ? '3.A.2'
                            : column.render('Header') === 'CPL-SE-S3'
                            ? '3.A.3'
                            : column.render('Header') === 'CPL-SE-S4'
                            ? '3.A.4'
                            : column.render('Header') === 'CPL-SE-S5'
                            ? '3.A.5'
                            : column.render('Header') === 'CPL-SE-S6'
                            ? '3.A.6'
                            : column.render('Header') === 'CPL-SE-KU1'
                            ? '3.B.1'
                            : column.render('Header') === 'CPL-SE-KU2'
                            ? '3.B.2'
                            : column.render('Header') === 'CPL-SE-KU3'
                            ? '3.B.3'
                            : column.render('Header') === 'CPL-SE-KU4'
                            ? '3.B.4'
                            : column.render('Header') === 'CPL-SE-P1'
                            ? '3.C.1'
                            : column.render('Header') === 'CPL-SE-P2'
                            ? '3.C.2'
                            : column.render('Header') === 'CPL-SE-P3'
                            ? '3.C.3'
                            : column.render('Header') === 'CPL-SE-P4'
                            ? '3.C.4'
                            : column.render('Header') === 'CPL-SE-P5'
                            ? '3.C.5'
                            : column.render('Header') === 'CPL-SE-P6'
                            ? '3.C.6'
                            : column.render('Header') === 'CPL-SE-P7'
                            ? '3.C.7'
                            : column.render('Header') === 'CPL-SE-P8'
                            ? '3.C.8'
                            : column.render('Header') === 'CPL-SE-P9'
                            ? '3.C.9'
                            : column.render('Header') === 'CPL-SE-KK1'
                            ? '3.D.1'
                            : column.render('Header') === 'CPL-SE-KK2'
                            ? '3.D.2'
                            : column.render('Header') === 'CPL-SE-KK3'
                            ? '3.D.3'
                            : column.render('Header') === 'CPL-SE-KK4'
                            ? '3.D.4'
                            : column.render('Header') === 'CPL-SE-KK5'
                            ? '3.D.5'
                            : column.render('Header'))}
                        {idProdi === 2 && // Mathematics
                          (column.render('Header') === 'CPL-BM-S1'
                            ? '3.A.1'
                            : column.render('Header') === 'CPL-BM-S2'
                            ? '3.A.2'
                            : column.render('Header') === 'CPL-BM-S3'
                            ? '3.A.3'
                            : column.render('Header') === 'CPL-BM-S4'
                            ? '3.A.4'
                            : column.render('Header') === 'CPL-BM-S5'
                            ? '3.A.5'
                            : column.render('Header') === 'CPL-BM-S6'
                            ? '3.A.6'
                            : column.render('Header') === 'CPL-BM-KU1'
                            ? '3.B.1'
                            : column.render('Header') === 'CPL-BM-KU2'
                            ? '3.B.2'
                            : column.render('Header') === 'CPL-BM-KU3'
                            ? '3.B.3'
                            : column.render('Header') === 'CPL-BM-KU4'
                            ? '3.B.4'
                            : column.render('Header') === 'CPL-BM-P1'
                            ? '3.C.1'
                            : column.render('Header') === 'CPL-BM-P2'
                            ? '3.C.2'
                            : column.render('Header') === 'CPL-BM-P3'
                            ? '3.C.3'
                            : column.render('Header') === 'CPL-BM-P4'
                            ? '3.C.4'
                            : column.render('Header') === 'CPL-BM-P5'
                            ? '3.C.5'
                            : column.render('Header') === 'CPL-BM-KK1'
                            ? '3.D.1'
                            : column.render('Header') === 'CPL-BM-KK2'
                            ? '3.D.2'
                            : column.render('Header') === 'CPL-BM-KK3'
                            ? '3.D.3'
                            : column.render('Header') === 'CPL-BM-KK4'
                            ? '3.D.4'
                            : column.render('Header'))}
                        {idProdi === 4 && // Mathematics
                          (column.render('Header') === 'CPL-REE-S1'
                            ? '3.A.1'
                            : column.render('Header') === 'CPL-REE-S2'
                            ? '3.A.2'
                            : column.render('Header') === 'CPL-REE-S3'
                            ? '3.A.3'
                            : column.render('Header') === 'CPL-REE-S4'
                            ? '3.A.4'
                            : column.render('Header') === 'CPL-REE-S5'
                            ? '3.A.5'
                            : column.render('Header') === 'CPL-REE-S6'
                            ? '3.A.6'
                            : column.render('Header') === 'CPL-REE-KU1'
                            ? '3.B.1'
                            : column.render('Header') === 'CPL-REE-KU2'
                            ? '3.B.2'
                            : column.render('Header') === 'CPL-REE-KU3'
                            ? '3.B.3'
                            : column.render('Header') === 'CPL-REE-KU4'
                            ? '3.B.4'
                            : column.render('Header') === 'CPL-REE-P1'
                            ? '3.C.1'
                            : column.render('Header') === 'CPL-REE-P2'
                            ? '3.C.2'
                            : column.render('Header') === 'CPL-REE-KK1'
                            ? '3.D.1'
                            : column.render('Header') === 'CPL-REE-KK2'
                            ? '3.D.2'
                            : column.render('Header') === 'CPL-REE-KK3'
                            ? '3.D.3'
                            : column.render('Header') === 'CPL-REE-KK4'
                            ? '3.D.4'
                            : column.render('Header'))}
                        {idProdi === 5 && // CSE
                          (column.render('Header') === 'CPL-CSE-S1'
                            ? '3.A.1'
                            : column.render('Header') === 'CPL-CSE-S2'
                            ? '3.A.2'
                            : column.render('Header') === 'CPL-CSE-S3'
                            ? '3.A.3'
                            : column.render('Header') === 'CPL-CSE-S4'
                            ? '3.A.4'
                            : column.render('Header') === 'CPL-CSE-S5'
                            ? '3.A.5'
                            : column.render('Header') === 'CPL-CSE-S6'
                            ? '3.A.6'
                            : column.render('Header') === 'CPL-CSE-KU1'
                            ? '3.B.1'
                            : column.render('Header') === 'CPL-CSE-KU2'
                            ? '3.B.2'
                            : column.render('Header') === 'CPL-CSE-KU3'
                            ? '3.B.3'
                            : column.render('Header') === 'CPL-CSE-KU4'
                            ? '3.B.4'
                            : column.render('Header') === 'CPL-CSE-KU5'
                            ? '3.B.5'
                            : column.render('Header') === 'CPL-CSE-KU6'
                            ? '3.B.6'
                            : column.render('Header') === 'CPL-CSE-KU7'
                            ? '3.B.7'
                            : column.render('Header') === 'CPL-CSE-KU8'
                            ? '3.B.8'
                            : column.render('Header') === 'CPL-CSE-KU9'
                            ? '3.B.9'
                            : column.render('Header') === 'CPL-CSE-P1'
                            ? '3.C.1'
                            : column.render('Header') === 'CPL-CSE-P2'
                            ? '3.C.2'
                            : column.render('Header') === 'CPL-CSE-P3'
                            ? '3.C.3'
                            : column.render('Header') === 'CPL-CSE-KK1'
                            ? '3.D.1'
                            : column.render('Header') === 'CPL-CSE-KK2'
                            ? '3.D.2'
                            : column.render('Header'))}
                        {idProdi === 6 && // PDE
                          (column.render('Header') === 'CPL-PDE-S1'
                            ? '3.A.1'
                            : column.render('Header') === 'CPL-PDE-S2'
                            ? '3.A.2'
                            : column.render('Header') === 'CPL-PDE-S3'
                            ? '3.A.3'
                            : column.render('Header') === 'CPL-PDE-S4'
                            ? '3.A.4'
                            : column.render('Header') === 'CPL-PDE-S5'
                            ? '3.A.5'
                            : column.render('Header') === 'CPL-PDE-S6'
                            ? '3.A.6'
                            : column.render('Header') === 'CPL-PDE-KU1'
                            ? '3.B.1'
                            : column.render('Header') === 'CPL-PDE-KU2'
                            ? '3.B.2'
                            : column.render('Header') === 'CPL-PDE-KU3'
                            ? '3.B.3'
                            : column.render('Header') === 'CPL-PDE-KU4'
                            ? '3.B.4'
                            : column.render('Header') === 'CPL-PDE-KU5'
                            ? '3.B.5'
                            : column.render('Header') === 'CPL-PDE-KU6'
                            ? '3.B.6'
                            : column.render('Header') === 'CPL-PDE-P1'
                            ? '3.C.1'
                            : column.render('Header') === 'CPL-PDE-P2'
                            ? '3.C.2'
                            : column.render('Header') === 'CPL-PDE-P3'
                            ? '3.C.3'
                            : column.render('Header') === 'CPL-PDE-P4'
                            ? '3.C.4'
                            : column.render('Header') === 'CPL-PDE-P5'
                            ? '3.C.5'
                            : column.render('Header') === 'CPL-PDE-P6'
                            ? '3.C.6'
                            : column.render('Header') === 'CPL-PDE-P7'
                            ? '3.C.7'
                            : column.render('Header') === 'CPL-PDE-P8'
                            ? '3.C.8'
                            : column.render('Header') === 'CPL-PDE-P9'
                            ? '3.C.9'
                            : column.render('Header') === 'CPL-PDE-P10'
                            ? '3.C.10'
                            : column.render('Header') === 'CPL-PDE-P11'
                            ? '3.C.11'
                            : column.render('Header') === 'CPL-PDE-KK1'
                            ? '3.D.1'
                            : column.render('Header') === 'CPL-PDE-KK2'
                            ? '3.D.2'
                            : column.render('Header') === 'CPL-PDE-KK3'
                            ? '3.D.3'
                            : column.render('Header') === 'CPL-PDE-KK4'
                            ? '3.D.4'
                            : column.render('Header') === 'CPL-PDE-KK5'
                            ? '3.D.5'
                            : column.render('Header') === 'CPL-PDE-KK6'
                            ? '3.D.6'
                            : column.render('Header') === 'CPL-PDE-KK7'
                            ? '3.D.7'
                            : column.render('Header') === 'CPL-PDE-KK8'
                            ? '3.D.8'
                            : column.render('Header'))}
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
