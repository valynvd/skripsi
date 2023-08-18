/* eslint-disable react/jsx-key */
import React, { useMemo, useState } from 'react';
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
import { ExportPrimaryButton } from '../../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';


const DegreeAuditKelulusanTable = ({
    setOpenModalDelete,
    userRole,
    setSelectedItem,
    loading,
    data,
}) => {
    const navigate = useNavigate();
    const [selectedAngkatan, setSelectedAngkatan] = useState('');
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
            accessor:'mahasiswa_detail.prodi_detail.name',
        },
        {
            Header:'Angkatan',
            accessor:'mahasiswa_detail.angkatan',
        },
        {
            Header:'Jumlah SKS Lulus',
            accessor:'jumlah_sks',
        },
        {
            Header:'Nilai D',
            accessor:'nilaid',
        },
        {
            Header:'Nilai E',
            accessor:'nilaie'
        },
        {
            Header:'IPK',
            accessor:'nilai_ipk'
        },
        {
            Header:'Status Kelulusan',
            accessor:'status_kelulusan'
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
                            navigate(`/degreeaudit/degreeaudit-kelulusan/${value.id}`, {
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
        }
    ];
    const { control, watch, setValue } = useForm({
        defaultValues: {},
    })
    const uniqueAngkatanValues = [...new Set(data.map(item => item.mahasiswa_detail.angkatan))];

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
              (item) =>
                item.mahasiswa_detail.prodi === prodiWatch
            );
          }

        if (selectedAngkatan) {
            filteredData = filteredData.filter(
                (item) => item.mahasiswa_detail.angkatan === selectedAngkatan
            );
        }

        return filteredData;
    }, [data, prodiWatch, selectedAngkatan]);
    
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
    const handleExport = () => {
        let filterToExcel = [];
    
        rows.forEach(({ values }) => {
          let filteredItem = {
            'Nama Mahasiswa': null,
            'NIM Mahasiswa': null,
            'Jurusan': null,
            'Angkatan': null,
            'Jumlah SKS Lulus': null,
            'Jumlah Nilai D (SKS)': null,
            'Jumlah Nilai E (SKS)': null,
            'IPK': null,
            'Status Kelulusan': null,
          };
    
          filteredItem['Nama Mahasiswa'] =
            values['mahasiswa_detail.nama'];
          filteredItem['NIM Mahasiswa'] =
            values['mahasiswa_detail.nim'];
          filteredItem['Jurusan'] =
            values['mahasiswa_detail.prodi_detail.name'];
          filteredItem['Angkatan'] =
            values['mahasiswa_detail.angkatan'];
          filteredItem['Jumlah SKS Lulus'] =
            values['jumlah_sks'];
          filteredItem['Jumlah Nilai D (SKS)'] =
            values['nilaid'];
          filteredItem['Jumlah Nilai E (SKS)'] =
            values['nilaie'];
          filteredItem['IPK'] =
            values['nilai_ipk'];
          filteredItem['Status Kelulusan'] =
            values['status_kelulusan'];
    
          filterToExcel.push(filteredItem);
        });
    
        let wb = utils.book_new();
        let ws = utils.json_to_sheet(filterToExcel);
    
        utils.book_append_sheet(wb, ws, `${filterToExcel[0].Jurusan}`);
    
        writeFile(wb, `Degree Audit ${filterToExcel[0].Jurusan}.xlsx`);
      };
    
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
                        setSelectedAngkatan('');
                        }}
                        isClearable
                        className="w-80"
                        control={control}
                        name="Prodi"
                        registeredName="prodi"
                        placeholder="Semua Prodi"
                        options={dataProgramStudiSuccess ? dataProgramStudi : []}
                    />
                    <select 
                        value={selectedAngkatan}
                        onChange={(e) => setSelectedAngkatan(e.target.value)}
                        className="border border-gray-300 focus:border-primary-400 text-gray-900 text-sm rounded-lg focus:ring-turquoise-normal focus:border-turquoise-normal focus-visible:outline-none block w-40 p-2.5"
                    >
                        <option value="">Semua Angkatan</option>
                        {uniqueAngkatanValues.map(angkatan => (
                            <option key={angkatan} value={angkatan}>{angkatan}</option>
                        ))}
                    </select>
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

export default DegreeAuditKelulusanTable;