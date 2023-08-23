/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import { AiOutlineSearch } from 'react-icons/ai';
import Pagination from '../../../components/Pagination';
import { useForm } from 'react-hook-form';
import { useProgramStudiData } from '../../../hooks/useProdi';
import FilterInput from '../../../components/FitlerInput';

const PenugasanPenelitianTable = ({
  setOpenModalDelete,
  setSelectedItem,
  loading,
  data,
  userRole,
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Prodi',
      accessor: 'prodi_detail.name',
    },
    {
      Header: 'Jenis',
      accessor: 'type',
    },
    {
      Header: 'No. Urut',
      accessor: 'order_number',
    },
    {
      Header: 'No. Butir',
      accessor: 'item_number',
    },
    {
      Header: 'Bobot dari 400',
      accessor: 'max_score',
    },
    {
      Header: 'Elemen Penilaian LAM',
      accessor: 'element',
    },
    {
      Header: 'Deskriptor',
      accessor: 'description',
    },
    // {
    //   Header: '1',
    //   accessor: 'description_grade_1',
    // },
    // {
    //   Header: '2',
    //   accessor: 'description_grade_2',
    // },
    // {
    //   Header: '3',
    //   accessor: 'description_grade_3',
    // },
    // {
    //   Header: '4',
    //   accessor: 'description_grade_4',
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
                navigate(`/data-master/poin-penilaian/${value.id}`, {
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];
    if (prodiWatch) {
      filteredData = filteredData.filter(
        (item) => item.prodi_detail?.id === prodiWatch
      );
    }

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
    rows,
  } = useTable(
    { columns: memoColumns, data: memoData },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  // const handleExport = () => {
  //   let filterToExcel = [];

  //   rows.forEach(({ values }) => {
  //     let filteredItem = {
  //       siklus: null,
  //       dosen: null,
  //       'mata kuliah': null,
  //       prodi: null,
  //     };

  //     filteredItem['siklus'] =
  //       values[
  //         'penugasan_pengajaran_detail.surat_penugasan_detail.cycle_detail'
  //       ].start_year +
  //       '-' +
  //       semesterName2[
  //         values[
  //           'penugasan_pengajaran_detail.surat_penugasan_detail.cycle_detail'
  //         ].semester
  //       ];

  //     filteredItem['dosen'] =
  //       values['penugasan_pengajaran_detail.dosen_pengampu_detail.name'];
  //     filteredItem['mata kuliah'] =
  //       values['penugasan_pengajaran_detail.mata_kuliah_detail.name'];
  //     filteredItem['prodi'] =
  //       values[
  //         'penugasan_pengajaran_detail.dosen_pengampu_detail.prodi_detail.name'
  //       ];

  //     filterToExcel.push(filteredItem);
  //   });

  //   let wb = utils.book_new();
  //   let ws = utils.json_to_sheet(filterToExcel);

  //   utils.book_append_sheet(wb, ws, 'testing');

  //   writeFile(wb, 'testing.xlsx');
  // };

  const { pageIndex, globalFilter } = state;

  return (
    <>
      <div>
        <form className="flex gap-4 flex-wrap items-center mb-4">
          <div className="relative w-[20rem]">
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
            isClearable
            className="w-80"
            control={control}
            name="Prodi"
            registeredName="prodi"
            placeholder="Semua Prodi"
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
          />
          {/* <ExportPrimaryButton onClick={handleExport} /> */}
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

export default PenugasanPenelitianTable;
