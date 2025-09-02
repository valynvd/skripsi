// export default CPLDetail;
import React, { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import BreadCrumbs from '../../components/BreadCrumbs';
import { useNilaiMahasiswaDataByNIM } from '../../hooks/useNilaiMahasiswa';
import { useTable, useGlobalFilter, useSortBy } from 'react-table';
import { RxTriangleUp, RxTriangleDown } from 'react-icons/rx';
import ClipLoader from 'react-spinners/ClipLoader';
import { useCapaianPembelajaranData } from '../../hooks/useCapaianPembelajaran';

const CPLDetail = () => {
  const { nim, cplCode } = useParams();
  const {
    data: responseResult,
    isLoading,
    error,
  } = useNilaiMahasiswaDataByNIM(nim);

  const {
    data: capaianPembelajaranData,
    // isLoadingCPL,
    // errorCPL,
  } = useCapaianPembelajaranData();

  // Function to format the name
  const formatName = (name) => {
    if (name.includes(',')) {
      const [lastName, firstName] = name.split(', ');
      name = `${firstName} ${lastName}`;
    }

    if (name.length > 40) {
      const nameParts = name.split(' ');
      const formattedName = nameParts.reduce((acc, part, index) => {
        if (acc.length + part.length + 1 <= 40 || index === 0) {
          return acc ? `${acc} ${part}` : part;
        } else {
          return `${acc} ${part.charAt(0)}.`;
        }
      }, '');

      return formattedName;
    }

    return name;
  };

  const columns = useMemo(
    () => [
      {
        Header: 'Nama Mata Kuliah',
        accessor: 'mk_detail.name',
      },
      {
        Header: 'Total SKS',
        accessor: 'mk_detail.sks_total',
      },
      {
        Header: 'Penilaian',
        accessor: 'penilaian_detail.nama_penilaian',
      },
      {
        Header: 'Nilai',
        accessor: 'nilai_penilaian',
      },
      {
        Header: 'Bobot',
        accessor: 'bobot',
      },
      {
        Header: 'CPMK Terkait',
        accessor: 'penilaian_detail.cpmk_details',
        Cell: ({ cell: { value } }) => (
          <ul>
            {value
              .filter((cpmk) => cpmk.cpl_detail.kode === cplCode)
              .map((cpmk) => (
                <li key={cpmk.id}>{cpmk.kode}</li>
              ))}
          </ul>
        ),
      },
      {
        Header: 'Perolehan Nilai',
        accessor: 'perolehan_nilai',
      },
    ],
    [cplCode]
  );

  const bobotMataKuliah = useMemo(() => {
    const bobot_s = {};
    if (responseResult?.data) {
      responseResult.data.forEach((item) => {
        const mataKuliahName = item.mk_detail.name;
        const bobot = item.bobot;

        if (
          item.penilaian_detail.cpmk_details.some(
            (cpmk) => cpmk.cpl_detail.kode === cplCode
          )
        ) {
          if (!bobot_s[mataKuliahName]) {
            bobot_s[mataKuliahName] = 0;
          }

          bobot_s[mataKuliahName] += bobot;
        }
      });
    }
    return bobot_s;
  }, [responseResult, cplCode]);

  const detailData = useMemo(() => {
    if (responseResult?.data) {
      const bobotMataKuliah = {};

      responseResult.data.forEach((item) => {
        const mataKuliahName = item.mk_detail.name;
        const bobot = item.bobot;

        if (
          item.penilaian_detail.cpmk_details.some(
            (cpmk) => cpmk.cpl_detail.kode === cplCode
          )
        ) {
          if (!bobotMataKuliah[mataKuliahName]) {
            bobotMataKuliah[mataKuliahName] = 0;
          }
          bobotMataKuliah[mataKuliahName] += bobot;
        }
      });

      return responseResult.data
        .filter((item) =>
          item.penilaian_detail.cpmk_details.some(
            (cpmk) => cpmk.cpl_detail.kode === cplCode
          )
        )
        .map((item) => {
          const totalBobot = bobotMataKuliah[item.mk_detail.name];
          const perolehanNilai =
            (item.nilai_penilaian * item.bobot) / totalBobot;
          return {
            ...item,
            perolehan_nilai: perolehanNilai.toFixed(2),
          };
        });
    }
    return [];
  }, [responseResult, cplCode]);

  const calculateCPL = (data, bobotMataKuliah) => {
    const totalNilaiMK = {};
    const sksMK = {};

    data.forEach((item) => {
      const nilai = item.nilai_penilaian;
      const bobot = item.bobot;
      const sks = item.mk_detail.sks_total;
      const mataKuliahName = item.mk_detail.name;
      const totalBobot = bobotMataKuliah[mataKuliahName];
      const perolehanNilai = (nilai * bobot) / totalBobot;

      if (!totalNilaiMK[mataKuliahName]) {
        totalNilaiMK[mataKuliahName] = 0;
        sksMK[mataKuliahName] = sks;
      }

      totalNilaiMK[mataKuliahName] += perolehanNilai;
    });

    let totalScore = 0;
    let totalSKS = 0;

    Object.keys(totalNilaiMK).forEach((mataKuliahName) => {
      totalScore += totalNilaiMK[mataKuliahName] * sksMK[mataKuliahName];
      totalSKS += sksMK[mataKuliahName];
    });

    const finalCPLScore = totalScore / totalSKS;
    return finalCPLScore;
  };

  const finalCPLScore = useMemo(
    () => calculateCPL(detailData, bobotMataKuliah),
    [detailData, bobotMataKuliah]
  );

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    useTable({ columns, data: detailData }, useGlobalFilter, useSortBy);

  const shouldMerge = (rowIndex, columnId) => {
    if (rowIndex === 0) return false;
    const prevRow = rows[rowIndex - 1];
    const currentRow = rows[rowIndex];
    return (
      prevRow.values[columnId] === currentRow.values[columnId] &&
      prevRow.values['mk_detail.name'] === currentRow.values['mk_detail.name']
    );
  };

  const calculateRowSpan = (rowIndex, columnId) => {
    let span = 1;
    for (let i = rowIndex + 1; i < rows.length; i++) {
      if (
        rows[i].values[columnId] !== rows[rowIndex].values[columnId] ||
        rows[i].values['mk_detail.name'] !==
          rows[rowIndex].values['mk_detail.name']
      ) {
        break;
      }
      span++;
    }
    return span;
  };

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  const mahasiswaDetail = responseResult?.data[0]?.mahasiswa_detail;
  const cplDetail = capaianPembelajaranData?.data.find(
    (cpl) => cpl.kode === cplCode
  );

  const uniqueCPMKDetails = Array.from(
    new Set(
      responseResult?.data
        .flatMap((item) => item.penilaian_detail.cpmk_details)
        .filter((cpmk) => cpmk.cpl_detail.kode === cplCode)
        .map((cpmk) => JSON.stringify(cpmk))
    )
  ).map((cpmkString) => JSON.parse(cpmkString));

  // Format the student's name
  const formattedName = mahasiswaDetail
    ? formatName(mahasiswaDetail.nama)
    : 'Mahasiswa';

  return (
    <section id="skpi" className="section-container">
      <BreadCrumbs
        links={[
          {
            name: 'Validasi Mahasiswa',
            link: `/degreeaudit/validasi-kelulusan/${nim}`,
          },
          {
            name: 'SKPI',
            link: `/degreeaudit/skpi/${nim}`,
          },
          { name: `Detail CPL ${cplCode}` },
        ]}
      />
      <h1 className="text-lg font-bold mb-4">
        Capaian penilaian {formattedName} untuk {cplCode}
      </h1>

      <p>{cplDetail ? cplDetail.deskripsi : 'Deskripsi tidak tersedia'}</p>

      {detailData.length === 0 ? (
        <p></p>
      ) : (
        <>
          <h2 className="mt-8">{cplCode} digunakan di CPMK :</h2>
        </>
      )}

      {/* <h2 className="mt-8">{cplCode} digunakan di CPMK :</h2> */}
      <div className="overflow-x-auto mt-4">
        <table className="w-full bg-white border-collapse">
          <tbody>
            {uniqueCPMKDetails.map((cpmk, index) => (
              <tr key={index}>
                <td className="w-2/12 px-4 py-2 border-b border-gray-200">
                  {cpmk.kode}
                </td>
                <td className="w-10/12 px-4 py-2 border-b border-gray-200">
                  {cpmk.deskripsi}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="overflow-x-auto mt-8">
        {isLoading ? (
          <div className="flex justify-center items-center">
            <ClipLoader size={50} color={'#123abc'} loading={isLoading} />
          </div>
        ) : (
          <>
            {detailData.length === 0 ? (
              <p>Tidak ada data terkait untuk {formattedName}</p>
            ) : (
              <table
                {...getTableProps()}
                className="w-full bg-white border-collapse"
              >
                <thead className="bg-primary-400/[0.03]">
                  {headerGroups.map((headerGroup) => (
                    <tr
                      {...headerGroup.getHeaderGroupProps()}
                      key={headerGroup.id}
                    >
                      {headerGroup.headers.map((column) => (
                        <th
                          className="px-4 py-3 font-semibold text-left border-b border-gray-200"
                          {...column.getHeaderProps(
                            column.getSortByToggleProps()
                          )}
                          key={column.id}
                        >
                          <div className="flex flex-row items-center">
                            {column.render('Header')}
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <RxTriangleDown
                                  size={20}
                                  color="gray"
                                  className="inline ml-1"
                                />
                              ) : (
                                <RxTriangleUp
                                  size={20}
                                  color="gray"
                                  className="inline ml-1"
                                />
                              )
                            ) : (
                              ''
                            )}
                          </div>
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                  {rows.map((row, rowIndex) => {
                    prepareRow(row);
                    return (
                      <tr
                        {...row.getRowProps()}
                        className="border-b border-gray-200"
                        key={row.id}
                      >
                        {row.cells.map((cell) => {
                          if (
                            cell.column.id === 'mk_detail.name' ||
                            cell.column.id === 'mk_detail.sks_total'
                          ) {
                            const rowSpan = shouldMerge(
                              rowIndex,
                              cell.column.id
                            )
                              ? 0
                              : calculateRowSpan(rowIndex, cell.column.id);
                            return (
                              rowSpan > 0 && (
                                <td
                                  {...cell.getCellProps()}
                                  rowSpan={rowSpan}
                                  className="px-4 py-3"
                                  key={cell.column.id}
                                >
                                  {cell.render('Cell')}
                                </td>
                              )
                            );
                          }
                          return (
                            <td
                              {...cell.getCellProps()}
                              className="px-4 py-3 border-b border-gray-200"
                              key={cell.column.id}
                            >
                              {cell.render('Cell')}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>

      {detailData.length === 0 ? (
        <p></p>
      ) : (
        <>
          <h2 className="font-semibold mt-4">
            Capaian Pembelajaran Lulusan untuk {cplCode} :{' '}
            {finalCPLScore ? finalCPLScore.toFixed(2) : 'N/A'}
          </h2>
        </>
      )}
    </section>
  );
};

export default CPLDetail;
