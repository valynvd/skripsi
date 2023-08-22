import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { DeleteIcon, EditIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';

const DokumenAkreditasiTable = ({
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
                navigate(`/akreditasi/dokumen-akreditasi/${value.id}`, {
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

export default DokumenAkreditasiTable;
