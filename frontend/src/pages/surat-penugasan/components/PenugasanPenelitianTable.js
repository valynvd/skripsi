import React from 'react';
import Table from '../../../components/Table';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';

const PenugasanPenelitianTable = ({
  setOpenModalDelete,
  setSelectedItem,
  setSelectedItemEdit,
  setOpenModalEdit,
  ...options
}) => {
  const columns = [
    {
      Header: 'Nama Faculty Member',
      accessor: 'dosen_pengampu_detail.name',
    },
    {
      Header: 'Program Studi',
      accessor: 'dosen_pengampu_detail.prodi_detail.name',
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
                setSelectedItemEdit(value);
                setOpenModalEdit(true);
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

export default PenugasanPenelitianTable;
