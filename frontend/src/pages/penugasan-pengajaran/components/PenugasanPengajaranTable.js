import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';

const PenugasanPengajaranTable = ({
  setOpenModal,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Dosen',
      accessor: 'dosen_pengampu_detail.name',
    },
    {
      Header: 'Judul',
      accessor: 'surat_penugasan_detail.judul',
    },
    {
      Header: 'Mata Kuliah',
      accessor: 'mata_kuliah_detail.name',
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
                navigate(`/penugasan-pengajaran/${value.id}`, { state: value });
              }}
            />
            <DeleteIcon
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

export default PenugasanPengajaranTable;
