import React, { useEffect } from 'react';

import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const TableSimulate = ({ simulateData, radarData }) => {
  useEffect(() => {}, [simulateData]);

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
    <section id="penugasan-pengajaran" className="section-container mt-4">
      <div className="flex gap-4">
        <table className="flex-1">
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
        {radarData && (
          <div className="flex-1">
            <Radar
              options={{ scales: { r: { max: 100 } } }}
              scale={{
                ticks: {
                  beginAtZero: true,
                  max: 5,
                  min: 0,
                  stepSize: 1,
                },
              }}
              data={{
                labels: radarData.label,
                datasets: [
                  {
                    label: 'nilai',
                    data: [...radarData.data],
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
        )}
      </div>
    </section>
  );
};

export default TableSimulate;
