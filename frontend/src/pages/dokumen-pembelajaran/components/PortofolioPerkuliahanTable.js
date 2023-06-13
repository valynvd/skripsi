/* eslint-disable no-unused-vars */
import React from 'react';
import Table from '../../../components/Table';
// import { EditIcon, DeleteIcon } from '../../../components/IconButton';
import {
  LinkIconAccepted,
  LinkIconRejected,
  LinkIconWarning,
} from '../../../components/LinkIcon';
import { useCheckRole } from '../../../hooks/useCheckRole';
import { DeleteIcon, EditIcon } from '../../../components/IconButton';

const PortofolioPerkuliahanTable = ({
  setOpenModalDelete,
  setOpenModalPortofolio,
  setSelectedItem,
  setSelectedItemEditPortofolio,
  setOpenModalEdit,
  setOpenModalEvaluasi,
  setOpenModalUploadType,
  setOpenModalUpload,
  type,
  ...options
}) => {
  const userRole = useCheckRole();

  const columns = [
    {
      Header: 'Tanggal Dibuat',
      accessor: 'created_at',
    },
    {
      Header: 'Tipe',
      accessor: 'type',
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
                setSelectedItemEditPortofolio(value);
                setOpenModalPortofolio(true);
              }}
            />
            {userRole.admin ? (
              <DeleteIcon
                onClick={() => {
                  setSelectedItem(value.id);
                  setOpenModalDelete(true);
                }}
              />
            ) : null}
          </div>
        );
      },
    },
  ];

  return <Table {...options} columns={columns} userRole={userRole} />;
};

export default PortofolioPerkuliahanTable;
