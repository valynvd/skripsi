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
// import { AiOutlineSearch } from 'react-icons/ai';
// import FilterInput from '../../../components/FitlerInput';
import { useForm } from 'react-hook-form';
// import { useProgramStudiData } from '../../../hooks/useProdi';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import { useNavigate } from 'react-router-dom';
import { ClipLoader } from 'react-spinners';
import { ExportPrimaryButton } from '../../../components/PrimaryButton';
import { utils, writeFile } from 'xlsx';


const MonitoringMahasiswaTable = ({
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
                            navigate(`/data-master/data-mahasiswa/${value.id}`, {
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
    const { watch } = useForm({
        defaultValues: {},
    })
    const prodiWatch = watch('prodi');

    // const { data: dataProgramStudi, isSuccess: dataProgramStudiSuccess } =
    // useProgramStudiData({
    //   select: (response) => {
    //     const formatUserData = response.data.map(({ id, name, kode }) => {
    //       return {
    //         value: id,
    //         label: `${name} (${kode})`,
    //       };
    //     });

    //     return formatUserData;
    //   },
    // });
    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoColumns = useMemo(() => columns, [userRole]);
    const memoData = useMemo(() => {
        let filteredData = [...data];
        if (prodiWatch) {
            filteredData = filteredData.filter(
              (item) =>
                item.prodi === prodiWatch
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
        const filterToExcel = rows.map(({ original }) => {
            const filteredItem = {
                'Nama Mahasiswa': original.mahasiswa_detail.nama,
                'NIM Mahasiswa': original.mahasiswa_detail.nim,
                'Jurusan': original.mahasiswa_detail.prodi_detail.name,
                'Angkatan': original.mahasiswa_detail.angkatan,
                'Kode Mata Kuliah': original.mata_kuliah_detail.kode,
                'Mata Kuliah': original.mata_kuliah_detail.name,
                'Earned Credits': original.earned_credits,
                'Graded Credits': original.mata_kuliah_detail.sks_total,
                'Academic Year': original.academic_year,
                'Academic Session': original.academic_session,
                'Nilai' : original.grade_symbol,
            };
        
            // Apply conditional formatting to Jumlah SKS Lulus column
            if (original.jumlah_sks < 144) {
              filteredItem['Jumlah SKS Lulus'] = {
                v: original.jumlah_sks,
                s: {
                    fill: {
                      bgColor: { rgb: 'FF0000' } // Red background color
                    },
                    font: {
                      color: { rgb: 'FFFFFF' } // White text color
                    }
                  }, // Red background, white text
              };
            }
        
            return filteredItem;
        });
        
        const wb = utils.book_new();
        const ws = utils.json_to_sheet(filterToExcel);
    
        utils.book_append_sheet(wb, ws, `${filterToExcel[0]['Nama Mahasiswa']}`);
    
        writeFile(wb, `Academic Result ${filterToExcel[0]['Nama Mahasiswa']}.xlsx`);
      };
    
    const { pageIndex } = state;

    return(
        <>
            {/* <div>
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
            </div> */}
            <ExportPrimaryButton onClick={handleExport} />
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
                {!loading ? (
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
                ) : (
                    <ClipLoader color="#ff0000"/>
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

export default MonitoringMahasiswaTable;