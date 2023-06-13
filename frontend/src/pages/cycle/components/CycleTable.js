/* eslint-disable no-unused-vars */
import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';

const Cycle = ({ setOpenModalDelete, setSelectedItem, ...options }) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();
  const semesterName = {
    Odd: 'Ganjil',
    Even: 'Genap',
    'Odd Short': 'Pendek Ganjil',
    'Even Short': 'Pendek Genap',
  };

  const semesterName2 = {
    Odd: '1',
    Even: '2',
    'Odd Short': '1P',
    'Even Short': '2P',
  };

  const columns = [
    {
      Header: 'Nama',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => value.start_year + '-' + semesterName2[value.semester],
    },
    {
      Header: 'Tahun',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => value.start_year + '/' + value.end_year,
    },
    {
      Header: 'Semester',
      accessor: 'semester',
      Cell: ({ value }) => semesterName[value],
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
                navigate(`/data-master/cycle/${value.id}`, {
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

export default Cycle;
