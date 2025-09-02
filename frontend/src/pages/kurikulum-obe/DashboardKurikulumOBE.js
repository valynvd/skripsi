import React from 'react';

import { useCheckRole } from '../../hooks/useCheckRole';
import DashboardKurikulumOBECharts from './components/DashboardKurikulumOBECharts';
const DashboardKurikulumOBE = () => {
  const userRole = useCheckRole();

  return (
    <section id="kurikulum-obe" className="section-container">
      <div className="flex flex-col items-start lg:justify-between lg:items-center lg:flex-row space-y-2 lg:space-y-0">
        <p className="font-semibold text-lg">
          Dashboard Lulusan Mahasiswa
          {!userRole.admin}
        </p>
      </div>
      <div className="mt-8 w-full rounded-t-lg">
        <DashboardKurikulumOBECharts />
      </div>
    </section>
  );
};

export default DashboardKurikulumOBE;
