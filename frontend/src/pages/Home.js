/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useMatriksPenilaianByProdi } from '../hooks/useMatriksPenilaian';

const Home = () => {
  const [testing, setTesting] = useState();
  const [counter, setCounter] = useState({});

  const { data, refetch: kriteriaRefetch } = useMatriksPenilaianByProdi(1);

  return (
    <>
      <section className="relative min-w-[30rem]" id="dashboard">
        <div className="bg-primary-400 z-0 w-full h-full absolute top-1 left-0 rounded-lg"></div>
        <div className="p-6 bg-white rounded-lg divide-y relative z-20">
          <h3 className="text-xl font-semibold pb-4">Dashboard</h3>
          <p className="pt-4">
            Selamat datang di dashboard Sistem Managemen Tata Kelola Pendidikan
            Tinggi (SIMANTAP)
          </p>
        </div>
      </section>
    </>
  );
};

export default Home;
