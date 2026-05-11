import React from 'react';
import { useNavigate } from 'react-router-dom';

import Table from '../../../components/Table';
import TableIfNull from '../../../components/TableIfNull';
import { DeleteIcon, EditIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';

const formatTipe = (value) => {
  if (!value) {
    return '-';
  }
  return value === 'LAB' ? 'Laboratorium' : 'Kelas';
};

const formatBoard = (value) => {
  if (!value) {
    return <TableIfNull value={value} />;
  }
  return value === 'SMARTBOARD' ? 'Smartboard' : 'Papan Tulis';
};

const hasValue = (value) => value !== null && value !== undefined && value !== '';

const RuanganTable = ({ setSelectedItem, setOpenModalDelete, ...options }) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Kode',
      accessor: 'kode',
      Cell: ({ value }) => (value ? value : <TableIfNull value={value} />),
    },
    {
      Header: 'Nama',
      accessor: 'nama',
      Cell: ({ value }) => (value ? value : <TableIfNull value={value} />),
    },
    {
      Header: 'Tipe',
      accessor: 'tipe',
      Cell: ({ value }) => formatTipe(value),
    },
    {
      Header: 'Kapasitas',
      accessor: 'kapasitas',
      Cell: ({ value }) => (hasValue(value) ? value : <TableIfNull value={value} />),
    },
    {
      Header: 'Board',
      accessor: 'board_type',
      Cell: ({ value }) => formatBoard(value),
    },
    {
      Header: 'Prodi',
      accessor: 'prodi',
      Cell: ({ value }) => (value ? value : <TableIfNull value={value} />),
    },
    {
      Header: 'Status',
      accessor: 'aktif',
      Cell: ({ value }) => (value ? 'Aktif' : 'Nonaktif'),
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
                navigate(`/data-master/ruangan/${value.id}`, {
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

export default RuanganTable;
