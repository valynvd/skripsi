/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LinkIconAccepted,
  LinkIconRejected,
  LinkIconWarning,
} from '../../../components/LinkIcon';
import { DeleteIcon } from '../../../components/IconButton';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import { AiOutlineSearch } from 'react-icons/ai';
import Pagination from '../../../components/Pagination';
import CRUDropdownInput from '../../../components/CRUDropdownInput';
import { useCycleData } from '../../../hooks/useCycle';
import { useForm } from 'react-hook-form';
import { useProgramStudiData } from '../../../hooks/useProdi';
// import CRUDropdownInput from '../../../components/CRUDropdownInput';

const DokumenPembelajaranTable = ({
  setOpenModalDelete,
  setSelectedItem,
  loading,
  data,
  userRole,
}) => {
  const navigate = useNavigate();
  const semesterName2 = {
    Odd: '1',
    Even: '2',
    'Odd Short': '1P',
    'Even Short': '2P',
  };

  const columns = [
    // {
    //   Header: 'Info',
    //   Cell: ({
    //     cell: {
    //       row: { original: value },
    //     },
    //   }) => {
    //     return value.rps ? (
    //       <TooltipAccept>RPS sudah diisi</TooltipAccept>
    //     ) : (
    //       <TooltipWarning>Tolong untuk segera mengisi RPS</TooltipWarning>
    //     );
    //   },
    // },
    {
      Header: 'Siklus',
      accessor:
        'penugasan_pengajaran_detail.surat_penugasan_detail.cycle_detail',
      Cell: ({ value }) => {
        return value.start_year + '-' + semesterName2[value.semester];
      },
    },
    {
      Header: 'Dosen',
      accessor: 'penugasan_pengajaran_detail.dosen_pengampu_detail.name',
    },
    {
      Header: 'Mata Kuliah',
      accessor: 'penugasan_pengajaran_detail.mata_kuliah_detail.name',
    },
    {
      Header: 'Prodi',
      accessor:
        'penugasan_pengajaran_detail.dosen_pengampu_detail.prodi_detail.name',
    },
    // { Header: 'Catatan', accessor: 'notes' },
    {
      Header: 'Rubrik',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return value.accepted_rubrik ? (
          <LinkIconAccepted
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat Rubrik' },
                }
              );
            }}
          />
        ) : (
          <LinkIconWarning
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat Rubrik' },
                }
              );
            }}
          />
        );
      },
    },
    {
      Header: 'RPS',
      accessor: 'accepted_rps',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return value.accepted_rps ? (
          <LinkIconAccepted
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat RPS' },
                }
              );
            }}
          />
        ) : (
          <LinkIconWarning
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat RPS' },
                }
              );
            }}
          />
        );
      },
    },
    {
      Header: 'Portofolio',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        if (value.accepted_rps && value.accepted_rubrik) {
          if (value.portofolio_perkuliahan) {
            return (
              <LinkIconAccepted
                onClick={() => {
                  navigate(
                    `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                    {
                      state: {
                        data: value,
                        selectedPage: 'Portofolio Perkuliahan',
                      },
                    }
                  );
                }}
              />
            );
          } else {
            return (
              <LinkIconWarning
                onClick={() => {
                  navigate(
                    `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                    {
                      state: {
                        data: value,
                        selectedPage: 'Portofolio Perkuliahan',
                      },
                    }
                  );
                }}
              />
            );
          }
        } else {
          return <LinkIconRejected />;
        }
      },
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
            {/* <EditIcon
              onClick={() => {
                navigate(
                  `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                  { state: value }
                );
              }}
            /> */}
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

  const cycleWatch = watch('cycle');
  const prodiWatch = watch('prodi');

  const { data: dataCycle, isSuccess: dataCycleSuccess } = useCycleData({
    select: (response) => {
      const semesterName = {
        Odd: 'Ganjil',
        Even: 'Genap',
        'Odd Short': 'Pendek Ganjil',
        'Even Short': 'Pendek Genap',
      };

      const formatUserData = response.data.map(
        ({ id, start_year, end_year, semester }) => {
          return {
            value: id,
            label: `${start_year}/${end_year} ${semesterName[semester]}`,
          };
        }
      );

      return formatUserData;
    },
  });
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

    console.log(data);

    if (cycleWatch) {
      filteredData = filteredData.filter(
        (item) =>
          item.penugasan_pengajaran_detail?.surat_penugasan_detail?.cycle ===
          cycleWatch
      );
    }

    if (prodiWatch) {
      filteredData = filteredData.filter(
        (item) =>
          item.penugasan_pengajaran_detail?.dosen_pengampu_detail?.prodi ===
          prodiWatch
      );
    }

    return filteredData;
  }, [data, cycleWatch, prodiWatch]);

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
        <form className="mb-4 flex space-x-4">
          <CRUDropdownInput
            clearFunc={() => {
              setValue('cycle', null);
            }}
            isClearable
            className="w-64"
            control={control}
            name="Siklus"
            registeredName="cycle"
            options={dataCycleSuccess ? dataCycle : []}
          />
          <CRUDropdownInput
            clearFunc={() => {
              setValue('prodi', null);
            }}
            isClearable
            className="w-80"
            control={control}
            name="Prodi"
            registeredName="prodi"
            options={dataProgramStudiSuccess ? dataProgramStudi : []}
          />
        </form>
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AiOutlineSearch size={20} color="gray" />
          </div>
          <input
            type="text"
            id="simple-search"
            className="border mb-4 border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-full pl-10 p-2.5"
            placeholder="Cari..."
            value={globalFilter || ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
          />
        </div>
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

export default DokumenPembelajaranTable;
