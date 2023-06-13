import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';

const SuratPenugasanTable = ({
  setOpenModalDelete,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Judul',
      accessor: 'judul',
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
                navigate(
                  `/pelaksanaan-pendidikan/surat-penugasan/${value.id}`,
                  { state: value }
                );
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

  return <Table {...options} columns={columns} />;
};

export default SuratPenugasanTable;
