import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';

const PenugasanPengabdianTable = ({
  setOpenModalDelete,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Surat Penugasan',
      accessor: 'surat_penugasan_detail.judul',
    },
    {
      Header: 'Judul',
      accessor: 'title',
    },
    {
      Header: 'Tahun Pelaksanaan',
      accessor: 'start_year',
    },
    {
      Header: 'Lama Kegiatan',
      accessor: 'total_year',
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
                  `/pelaksanaan-pengabdian/penugasan-pengabdian/${value.id}`,
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

export default PenugasanPengabdianTable;
