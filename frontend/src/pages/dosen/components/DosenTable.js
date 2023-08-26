import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';
import TableIfNull from '../../../components/TableIfNull';

const Dosen = ({ setOpenModalDelete, setSelectedItem, ...options }) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Nama',
      accessor: 'name',
    },
    {
      Header: 'Inisial',
      accessor: 'inisial',
    },
    {
      Header: 'Jabatan',
      accessor: 'user_detail.jabatan',
    },
    {
      Header: 'Prodi',
      accessor: 'prodi_detail.name',
    },
    {
      Header: 'NIDN',
      accessor: 'nidn',
      Cell: ({ value }) => (value ? value : <TableIfNull />),
    },
    {
      Header: 'NIK',
      accessor: 'nik',
      Cell: ({ value }) => (value ? value : <TableIfNull />),
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
                navigate(`/data-master/dosen/${value.id}`, { state: value });
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

export default Dosen;
