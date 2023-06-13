import React from 'react';
import Table from '../../../components/Table';
import { useNavigate } from 'react-router-dom';
import {
  LinkIconAccepted,
  LinkIconRejected,
  LinkIconWarning,
} from '../../../components/LinkIcon';
// import { EditIcon } from '../../../components/IconButton';

const DokumenPembelajaranTableDosen = ({
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
      accessor: 'penugasan_pengajaran_detail.mata_kuliah_detail.name',
    },
    {
      Header: 'Rubrik',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return value.accepted_rubrik ? (
          <LinkIconAccepted
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat Rubrik' },
                }
              );
            }}
          />
        ) : (
          <LinkIconWarning
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat Rubrik' },
                }
              );
            }}
          />
        );
      },
    },
    {
      Header: 'RPS',
      accessor: 'accepted_rps',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        return value.accepted_rps ? (
          <LinkIconAccepted
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat RPS' },
                }
              );
            }}
          />
        ) : (
          <LinkIconWarning
            onClick={() => {
              navigate(
                `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                {
                  state: { data: value, selectedPage: 'Riwayat RPS' },
                }
              );
            }}
          />
        );
      },
    },
    {
      Header: 'Portofolio',
      Cell: ({
        cell: {
          row: { original: value },
        },
      }) => {
        if (value.accepted_rps && value.accepted_rubrik) {
          if (value.portofolio_perkuliahan) {
            return (
              <LinkIconAccepted
                onClick={() => {
                  navigate(
                    `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                    {
                      state: {
                        data: value,
                        selectedPage: 'Portofolio Perkuliahan',
                      },
                    }
                  );
                }}
              />
            );
          } else {
            return (
              <LinkIconWarning
                onClick={() => {
                  navigate(
                    `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
                    {
                      state: {
                        data: value,
                        selectedPage: 'Portofolio Perkuliahan',
                      },
                    }
                  );
                }}
              />
            );
          }
        } else {
          return <LinkIconRejected />;
        }
      },
    },
    // {
    //   Header: 'Aksi',
    //   Cell: ({
    //     cell: {
    //       row: { original: value },
    //     },
    //   }) => {
    //     return (
    //       <div className="flex flex-row space-x-2">
    //         <EditIcon
    //           onClick={() => {
    //             navigate(
    //               `/pelaksanaan-pendidikan/dokumen-pembelajaran/${value.id}`,
    //               { state: value }
    //             );
    //           }}
    //         />
    //       </div>
    //     );
    //   },
    // },
  ];

  return <Table {...options} columns={columns} />;
};

export default DokumenPembelajaranTableDosen;
