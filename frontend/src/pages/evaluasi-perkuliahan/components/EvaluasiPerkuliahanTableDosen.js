import React from 'react';
import LinkButton from '../../../components/LinkButton';
import Table from '../../../components/Table';
import EditButton from '../../../components/EditButton';
import DeleteButton from '../../../components/DeleteButton';
import { useNavigate } from 'react-router-dom';

const EvaluasiPerkuliahanTableDosen = ({
  setOpenModal,
  setSelectedItem,
  ...options
}) => {
  const navigate = useNavigate();

  const columns = [
    {
      Header: 'Mata Kuliah',
      accessor: 'penugasan_detail.mata_kuliah_detail.name',
    },
    { Header: 'Catatan', accessor: 'notes' },
    {
      Header: 'RPS',
      accessor: 'rps',
      Cell: ({ value }) => {
        return (
          <LinkButton href={value} className="inline-flex">
            Lihat
          </LinkButton>
        );
      },
    },
    {
      Header: 'Rubrik',
      accessor: 'rubrik',
      Cell: ({ value }) => {
        return (
          <LinkButton href={value} className="inline-flex">
            Lihat
          </LinkButton>
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

export default EvaluasiPerkuliahanTableDosen;
