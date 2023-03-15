import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar/Navbar';
import Topbar from '../components/Topbar';

const Base = () => {
  return (
    <div className="flex flex-row w-full h-full">
      <Navbar />
      <div className="flex flex-col w-[calc(100%-20rem)] bg-gray-100">
        <Topbar />
        <div className="p-6 flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Base;
