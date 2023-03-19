import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import {
  LinkIconAccepted,
  LinkIconWarning,
} from '../../../components/LinkIcon';
import { EditIcon } from '../../../components/IconButton';

const EvaluasiPerkuliahanTableDosen = ({
  setOpenModalDelete,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();

  const columns = [
    // {
    //   Header: 'Info',
    //   Cell: ({
    //     cell: {
    //       row: { original: value },
    //     },
    //   }) => {
    //     return value.rps ? (
    //       <TooltipAccept>RPS sudah diisi</TooltipAccept>
    //     ) : (
    //       <TooltipWarning>Tolong untuk segera mengisi RPS</TooltipWarning>
    //     );
    //   },
    // },
    {
      Header: 'Mata Kuliah',
      accessor: 'penugasan_detail.mata_kuliah_detail.name',
    },
    { Header: 'Catatan', accessor: 'notes' },
    {
      Header: 'RPS',
      accessor: 'rps',
      Cell: ({ value }) => {
        return value ? <LinkIconAccepted href={value} /> : <LinkIconWarning />;
      },
    },
    {
      Header: 'Rubrik',
      accessor: 'rubrik',
      Cell: ({ value }) => {
        return value ? <LinkIconAccepted href={value} /> : <LinkIconWarning />;
      },
    },
    {
      Header: 'Evaluasi',
      accessor: 'evaluation_report',
      Cell: ({ value }) => {
        return value ? <LinkIconAccepted href={value} /> : <LinkIconWarning />;
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
                navigate(`/evaluasi-perkuliahan/${value.id}`, { state: value });
              }}
            />
          </div>
        );
      },
    },
  ];

  return <Table {...options} columns={columns} />;
};

export default EvaluasiPerkuliahanTableDosen;
