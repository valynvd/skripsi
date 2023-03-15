import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import DeleteButton from '../../../components/DeleteButton';
import EditButton from '../../../components/EditButton';

const SuratPenugasanTable = ({ setOpenModal, setSelectedItem, ...options }) => {
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
            <EditButton
              onClick={() => {
                navigate(`/surat-penugasan/${value.id}`, { state: value });
              }}
            />
            <DeleteButton
              onClick={() => {
                setSelectedItem(value.id);
                setOpenModal(true);
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
