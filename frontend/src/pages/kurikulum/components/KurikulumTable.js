import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import { useCheckRole } from '../../../hooks/useCheckRole';

const Kurikulum = ({ setOpenModalDelete, setSelectedItem, ...options }) => {
  const navigate = useNavigate();
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Nama',
      accessor: 'name',
    },
    {
      Header: 'File Panduan Kurikulum',
      accessor: 'file_panduan_kurikulum',
      Cell: ({ value }) => {
        return (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-block max-w-[12rem] text-primary-400 overflow-ellipsis overflow-hidden whitespace-nowrap"
          >
            {value}
          </a>
        );
      },
    },
    {
      Header: 'File Pendukung',
      accessor: 'file_pendukung',
      Cell: ({ value }) => {
        return (
          <a
            href={value}
            target="_blank"
            rel="noreferrer"
            className="inline-block max-w-[12rem] text-primary-400 overflow-ellipsis overflow-hidden whitespace-nowrap"
          >
            {value}
          </a>
        );
      },
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
                navigate(`/data-master/kurikulum/${value.id}`, {
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

export default Kurikulum;
