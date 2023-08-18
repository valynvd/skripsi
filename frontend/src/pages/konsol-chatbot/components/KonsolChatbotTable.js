/* eslint-disable react/jsx-key */
import React, { useMemo} from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table';
import { ViewIcon, EditIcon } from '../../../components/IconButton';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import Pagination from '../../../components/Pagination';
import { AiOutlineSearch } from 'react-icons/ai';
import { ClipLoader } from 'react-spinners';
// import { ExportPrimaryButton } from '../../../components/PrimaryButton';

const KonsolChatbotTable = ({
  setOpenModalDelete,
  setSelectedItem,
  loading,
  data,
  useRole,
}) => {
  const navigate = useNavigate();
  const navigateToTimelineAkademik = () => {
    navigate('/stem-chatbot/konsol-chatbot/timelineakademik')
  }
  const navigateToPeriodePembayaran = () => {
    navigate('/stem-chatbot/konsol-chatbot/periodepembayaran')
  }
  const navigateToSeputarSAP = () => {
    navigate('/stem-chatbot/konsol-chatbot/seputarsap')
  }
  const navigateToSeputarLMS = () => {
    navigate('/stem-chatbot/konsol-chatbot/seputarlms')
  }
  const columns = [
    {
      Header: 'Kategori Pertanyaan',
      accessor: 'layanan',
    },
    {
      Header: 'Pilihan Pertanyaan',
      accessor: 'pertanyaan',
    },
    {
      Header: 'Jawaban',
      accessor: 'jawaban',
    },
    {
      Header: 'Aksi',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return value.layanan == "timelineakademik" ? (
          <div className="flex flex-row space-x-2">
            <ViewIcon
              onClick={navigateToTimelineAkademik}
            />
          </div>
        ) : value.layanan == "periodepembayaran" ?(
          <div className="flex flex-row space-x-2">
            <ViewIcon
              onClick={navigateToPeriodePembayaran}
            />
          </div>
        ) : value.layanan == "seputarsap" ?(
          <div className="flex flex-row space-x-2">
            <ViewIcon
              onClick={navigateToSeputarSAP}
            />
          </div>
        ) : value.layanan == "seputarlms" ?(
          <div className="flex flex-row space-x-2">
            <ViewIcon
              onClick={navigateToSeputarLMS}
            />
          </div>
        ) : (
          <div className="flex flex-row space-x-2">
              <EditIcon/>
          </div>
        )
      },
    },
    
  ];

  const memoColumns = useMemo(() => columns, [useRole]);
  const memoData = useMemo(() => {
    let filteredData = [...data];

    return filteredData;
  }, [data]);

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
    { columns: memoColumns, data: memoData},
    useGlobalFilter,
    useSortBy,
    usePagination
  );

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
            <div className='center'>
              <ClipLoader color="#ff0000" />
            </div>
          
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

export default KonsolChatbotTable;
