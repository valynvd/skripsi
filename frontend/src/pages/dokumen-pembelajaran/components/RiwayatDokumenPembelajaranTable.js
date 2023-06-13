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
import { DeleteIcon } from '../../../components/IconButton';

const RiwayatDokumenPembelajaranTable = ({
  setOpenModalDelete,
  setSelectedItem,
  setSelectedItemEdit,
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
      Cell: ({ value }) => {
        return value;
      },
    },
    {
      Header: 'Tanggal Diubah',
      accessor: 'updated_at',
      Cell: ({ value }) => {
        return value;
      },
    },
    // {
    //   Header: type,
    //   accessor: 'initial_document',
    //   Cell: ({ value }) => {
    //     return value ? <LinkIconAccepted href={value} /> : <LinkIconWarning />;
    //   },
    // },
    {
      Header: type,
      accessor: 'initial_document',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        if (value) {
          return (
            <LinkIconAccepted
              onClick={() => {
                setOpenModalUploadType(type);
                setSelectedItemEdit(value);
                setOpenModalUpload(true);
              }}
            />
          );
        } else {
          return (
            <LinkIconWarning
              onClick={() => {
                setOpenModalUploadType(type);
                setSelectedItemEdit(value);
                setOpenModalUpload(true);
              }}
            />
          );
        }
      },
    },
    {
      Header: 'Evaluasi',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        if (value.status === 'waiting review') {
          return (
            <LinkIconRejected
              onClick={() => {
                setSelectedItemEdit(value);
                setOpenModalEvaluasi(true);
              }}
            />
          );
        } else if (value.status === 'revision') {
          return (
            <LinkIconWarning
              onClick={() => {
                setSelectedItemEdit(value);
                setOpenModalEvaluasi(true);
              }}
            />
          );
        } else if (value.status === 'accepted') {
          return <LinkIconAccepted />;
        }
      },
    },
    {
      Header: 'Status',
      accessor: 'status',
      Cell: ({ value }) => {
        if (value === 'waiting review') {
          return 'Menunggu Review';
        }
        if (value === 'revision') {
          return 'Revisi';
        }
        if (value === 'accepted') {
          return 'Diterima';
        }
      },
    },
    {
      Header: 'Catatan',
      accessor: 'notes',
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
            {/* {value.status === 'revision' && (
              <EditIcon
                onClick={() => {
                  setSelectedItemEdit(value);
                  setOpenModalEdit(true);
                }}
              />
            )} */}
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

  return (
    <Table
      {...options}
      columns={columns}
      userRole={userRole}
      hiddenColumns={userRole.admin ? [] : ['Aksi']}
    />
  );
};

export default RiwayatDokumenPembelajaranTable;
