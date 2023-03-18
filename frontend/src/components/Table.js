/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
} from 'react-table';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import { AiOutlineSearch } from 'react-icons/ai';
import Pagination from './Pagination';

const Table = ({ loading, data, columns, userRole }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, [userRole]);
  const memoData = useMemo(() => data, [data]);

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
        <label htmlFor="simple-search" className="sr-only">
          Search
        </label>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <AiOutlineSearch size={20} color="gray" />
          </div>
          <input
            type="text"
            id="search"
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

export default Table;
