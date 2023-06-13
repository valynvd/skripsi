import React from 'react';
import Table from '../../../components/Table';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';

const PenugasanPengajaranTable = ({
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
      Header: 'Mata Kuliah',
      accessor: 'mata_kuliah_detail.name',
    },
    {
      Header: 'Kode Mata Kuliah',
      accessor: 'mata_kuliah_detail.kode',
    },
    {
      Header: 'Program Studi',
      accessor: 'dosen_pengampu_detail.prodi_detail.name',
    },
    {
      Header: 'Kode Kelas',
      accessor: 'class_code',
    },
    {
      Header: 'SKS Mata Kuliah',
      accessor: 'mata_kuliah_detail.sks_total',
    },
    {
      Header: 'SKS Realisasi',
      accessor: 'sks_realisasi',
    },
    {
      Header: 'Jumlah Mahasiswa',
      accessor: 'students_amount',
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

export default PenugasanPengajaranTable;
