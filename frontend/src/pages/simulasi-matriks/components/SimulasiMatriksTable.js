import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { DeleteIcon, EditIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';

const SimulasiMatriksTable = ({
  setOpenModalDelete,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Dibuat Tanggal',
      accessor: 'created_at',
    },
    {
      Header: 'Diperbarui Tanggal',
      accessor: 'updated_at',
    },
    {
      Header: 'Judul',
      accessor: 'title',
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
                navigate(`/akreditasi/simulasi-matriks/${value.id}`, {
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
    },
  ];

  return <Table {...options} userRole={userRole} columns={columns} />;
};

export default SimulasiMatriksTable;
