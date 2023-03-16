import React from 'react';
import LinkButton from '../../../components/LinkButton';
import Table from '../../../components/Table';
import EditButton from '../../../components/EditButton';
import DeleteButton from '../../../components/DeleteButton';
import { useNavigate } from 'react-router-dom';
import { TooltipAccept, TooltipWarning } from '../../../components/Tooltip';

const EvaluasiPerkuliahanTable = ({
  setOpenModal,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Info',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return value.rps ? (
          <TooltipAccept>RPS sudah diisi</TooltipAccept>
        ) : (
          <TooltipWarning>Tolong untuk segera mengisi RPS</TooltipWarning>
        );
      },
    },
    {
      Header: 'Dosen',
      accessor: 'penugasan_detail.dosen_pengampu_detail.name',
    },
    {
      Header: 'Mata Kuliah',
      accessor: 'penugasan_detail.mata_kuliah_detail.name',
    },
    { Header: 'Catatan', accessor: 'notes' },
    {
      Header: 'RPS',
      accessor: 'rps',
      Cell: ({ value }) => {
        return value ? (
          <LinkButton href={value} className="inline-flex">
            Lihat
          </LinkButton>
        ) : (
          <p className="text-primary-400 font-semibold">Tidak ada</p>
        );
      },
    },
    {
      Header: 'Rubrik',
      accessor: 'rubrik',
      Cell: ({ value }) => {
        return value ? (
          <LinkButton href={value} className="inline-flex">
            Lihat
          </LinkButton>
        ) : (
          <p className="text-primary-400 font-semibold">Tidak ada</p>
        );
      },
    },
    {
      Header: 'Evaluasi',
      accessor: 'evaluation_report',
      Cell: ({ value }) => {
        return value ? (
          <LinkButton href={value} className="inline-flex">
            Lihat
          </LinkButton>
        ) : (
          <p className="text-primary-400 font-semibold">Tidak ada</p>
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
            <EditButton
              onClick={() => {
                navigate(`/evaluasi-perkuliahan/${value.id}`, { state: value });
              }}
            />
            <DeleteButton
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

export default EvaluasiPerkuliahanTable;
