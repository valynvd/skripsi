/* eslint-disable no-unused-vars */
/* eslint-disable react/jsx-key */
import React, { useMemo } from 'react';
import {
  useTable,
  usePagination,
  useGlobalFilter,
  useSortBy,
  useAsyncDebounce,
} from 'react-table';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';

const Table = ({ loading, data }) => {
  const columns = [{ Header: 'Catatan', accessor: 'notes' }];

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoColumns = useMemo(() => columns, []);
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

  return (
    <table {...getTableProps()} className="w-full">
      <thead className="text-sm bg-primary-400/[0.03] whitespace-nowrap">
        {headerGroups.map((headerGroup) => (
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              <th
                className="px-6 py-3 rounded-xl"
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
        <tbody {...getTableBodyProps()} className="whitespace-nowrap">
          {page.map((row) => {
            prepareRow(row);
            return (
              <tr
                {...row.getRowProps()}
                className="bg-white border-b text-gray-600"
              >
                {row.cells.map((cell) => {
                  return (
                    <td {...cell.getCellProps()} className="px-6 py-4">
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
  );
};

export default Table;
