import React, { useEffect } from 'react';

const TableSimulate = ({ simulateData }) => {
  useEffect(() => {
    console.log(simulateData);
  }, [simulateData]);

  const TableTh = ({ children, className }) => {
    return (
      <th className={`border border-black p-3 ${className}`}>{children}</th>
    );
  };

  const TableTd = ({ children, className }) => {
    return (
      <td className={`border border-black p-3 ${className}`}>{children}</td>
    );
  };

  return (
    <section id="penugasan-pengajaran" className="section-container">
      <table>
        <thead>
          <tr>
            <TableTh>No.</TableTh>
            <TableTh>Kriteria</TableTh>
            <TableTh>Jumlah Butir</TableTh>
            <TableTh>Nilai Terhitung</TableTh>
            <TableTh>Bobot dari 400</TableTh>
            <TableTh>Bobot %</TableTh>
          </tr>
        </thead>
        <tbody>
          {simulateData.map((item, index) => {
            if (item.name === 'total') {
              return (
                <tr className="bg-red-50" key={index}>
                  <TableTd className="text-center">{item.number}</TableTd>
                  <TableTd>{item.name}</TableTd>
                  <TableTd className="text-center">{item.total}</TableTd>
                  <TableTd>{item.mark_counted}</TableTd>
                  <TableTd>{item.max_score}</TableTd>
                  <TableTd>
                    {Math.round(item.weight_percent * 100) / 100} %
                  </TableTd>
                </tr>
              );
            } else {
              return (
                <tr key={index}>
                  <TableTd className="text-center">{item.number}</TableTd>
                  <TableTd>{item.name}</TableTd>
                  <TableTd className="text-center">{item.total}</TableTd>
                  <TableTd>{item.mark_counted}</TableTd>
                  <TableTd>{item.max_score}</TableTd>
                  <TableTd>
                    {Math.round(item.weight_percent * 100) / 100} %
                  </TableTd>
                </tr>
              );
            }
          })}
        </tbody>
      </table>
    </section>
  );
};

export default TableSimulate;
