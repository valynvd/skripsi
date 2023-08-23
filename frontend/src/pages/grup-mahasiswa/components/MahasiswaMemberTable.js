/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react';
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

const MahasiswaMemberTable = ({
    setOpenModalDelete,
    userRole,
    setSelectedItem,
    loading,
    data,
}) => {
    const navigate = useNavigate();
    const columns = [
        {
            Header:'Nama Mahasiswa',
            accessor:'nama_mahasiswa.nama',
        },
        {
            Header:'Jurusan',
            accessor:'nama_mahasiswa.prodi_detail.name'
        },
        {
            Header:'Angkatan',
            accessor:'nama_mahasiswa.angkatan'
        },
        {
            Header:'Nomor HP',
            accessor:'nama_mahasiswa.telephone'
        },
        {
            Header:'Aksi',
            Cell: ({
                cell: {
                  row: { original: value },
                },
              }) => {
                return (
                  <div className="flex flex-row space-x-2">
                    <EditIcon
                        onClick={() => {
                            navigate(`/data-master/data-mahasiswa/${value.nama_mahasiswa.id}`, {
                            state: value.nama_mahasiswa,
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
        }
    ];
    const { control, watch, setValue } = useForm({
        defaultValues: {},
    })
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

    const memoColumns = useMemo(() => columns, [userRole]);
    const memoData = useMemo(() => {
        let filteredData = [...data];
        if (prodiWatch) {
            filteredData = filteredData.filter(
              (item) =>
                item.prodi == prodiWatch
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
        // rows,
    } = useTable(
        { columns: memoColumns, data: memoData },
        useGlobalFilter,
        useSortBy,
        usePagination
    );
    
    const { pageIndex, globalFilter } = state;

    return(
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
                        isClearable
                        className="w-80"
                        control={control}
                        name="Prodi"
                        registeredName="prodi"
                        placeholder="Semua Prodi"
                        options={dataProgramStudiSuccess ? dataProgramStudi : []}
                    />
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

export default MahasiswaMemberTable;