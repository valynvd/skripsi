import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Topbar from '../components/Topbar';
import useOther from '../hooks/useOther';

const Base = () => {
  const { navbarMinimize } = useOther();

  return (
    <div className="flex flex-row w-full h-full">
      <Navbar />
      <div
        className={`flex flex-col duration-200 ${
          navbarMinimize ? 'w-[calc(100%-4rem)]' : 'w-[calc(100%-20rem)]'
        } bg-gray-100`}
      >
        <Topbar />
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Base;
