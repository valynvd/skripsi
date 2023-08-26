import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';
import TableIfNull from '../../../components/TableIfNull';

const ProgramStudiTable = ({
  setOpenModalDelete,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Nama',
      accessor: 'name',
    },
    {
      Header: 'Kode',
      accessor: 'kode',
      Cell: ({ value }) => (value ? value : <TableIfNull value={value} />),
    },
    {
      Header: 'Kode SAP',
      accessor: 'kode_sap',
      Cell: ({ value }) => (value ? value : <TableIfNull value={value} />),
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
            <EditIcon
              onClick={() => {
                navigate(`/data-master/program-studi/${value.id}`, {
                  state: value,
                });
              }}
            />
            {userRole.admin && (
              <DeleteIcon
                onClick={() => {
                  setSelectedItem(value.id);
                  setOpenModalDelete(true);
                }}
              />
            )}
          </div>
        );
      },
    },
  ];

  return <Table {...options} userRole={userRole} columns={columns} />;
};

export default ProgramStudiTable;
