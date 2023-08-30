import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';

const MataKuliah = ({ setOpenModalDelete, setSelectedItem, ...options }) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Nama',
      // accessor: 'name',
      Cell: ({row}) => (
        <a 
            href={`/degreeaudit/monitoring-akademik/matkul/${row.original.kode}`} 
            target="_blank" 
            rel="noopener noreferrer"
        >
            {row.original.name}
        </a>
      )
    },
    {
      Header: 'Kode',
      accessor: 'kode',
    },
    {
      Header: 'SKS Total',
      accessor: 'sks_total',
    },
    {
      Header: 'SKS Praktikum',
      accessor: 'sks_praktikum',
    },
    {
      Header: 'Semester',
      accessor: 'semester',
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
                navigate(`/data-master/mata-kuliah/${value.id}`, {
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

export default MataKuliah;
