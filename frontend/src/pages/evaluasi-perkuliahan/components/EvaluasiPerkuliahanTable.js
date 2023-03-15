import React from 'react';
import LinkButton from '../../../components/LinkButton';
import Table from '../../../components/Table';

const EvaluasiPerkuliahanTable = (options) => {
  const columns = [
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
  ];

  return <Table {...options} columns={columns} />;
};

export default EvaluasiPerkuliahanTable;
