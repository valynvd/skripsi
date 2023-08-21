/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';

const Home = () => {
  const [testing, setTesting] = useState();
  const [counter, setCounter] = useState({});

  useEffect(() => {
    console.log(counter);
    // for (let id in counter) {
    //   console.log(counter[id]);
    // }
  }, [counter]);

  const changeCounter = (id, value) => {
    setCounter((prev) => {
      if (prev[id]) {
        clearTimeout(prev[id].timeout);
      }

      let prevCounter = { ...prev };

      prevCounter[id] = {
        ...value,
        timeout: setTimeout(() => {
          setCounter((prev2) => {
            let prevCounter2 = { ...prev2 };

            prevCounter2[id].timeout = true;
            return prevCounter2;
          });
        }, 5000),
      };

      return prevCounter;
    });
  };

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
      <section className="section-container mt-4">
        <input
          type="text"
          onChange={(e) => {
            changeCounter(1, { score: e.target.value });
          }}
        />
        <input
          type="text"
          onChange={(e) => {
            changeCounter(2, { score: e.target.value });
          }}
        />
      </section>
    </>
  );
};

export default Home;
