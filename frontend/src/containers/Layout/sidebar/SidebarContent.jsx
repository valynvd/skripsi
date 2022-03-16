import React from 'react';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import SidebarCategory from './SidebarCategory';

const SidebarContent = ({ onClick }) => {
  const handleHideSidebar = () => {
    onClick();
  };

  return (
    <div className="sidebar__content">
      <ul className="sidebar__block">
        <SidebarLink title="Dashboard" icon="home" route="/dashboard" onClick={handleHideSidebar} />
      </ul>
      <ul className="sidebar__block">
        <SidebarCategory title="Akreditasi" icon="diamond">
          {/* <SidebarLink title="Matrix Penilaian" route="/dashboard/akreditasi" onClick={handleHideSidebar} /> */}
          <SidebarLink title="Kriteria 1" route="/dashboard/kriteria/1" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 2" route="/dashboard/kriteria/2" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 3" route="/dashboard/kriteria/3" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 4" route="/dashboard/kriteria/4" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 5" route="/dashboard/kriteria/5" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 6" route="/dashboard/kriteria/6" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 7" route="/dashboard/kriteria/7" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 8" route="/dashboard/kriteria/8" onClick={handleHideSidebar} />
          <SidebarLink title="Kriteria 9" route="/dashboard/kriteria/9" onClick={handleHideSidebar} />
        </SidebarCategory>
        <SidebarCategory title="Aktivitas Prodi" icon="diamond">
          <SidebarLink title="Evaluasi Perkuliahan" route="/dashboard/evaluasi" onClick={handleHideSidebar} />
          <SidebarLink title="Portofolio Perkuliahan" route="/dashboard/portofolio" onClick={handleHideSidebar} />
          <SidebarLink title="Surat Penugasan" route="/dashboard/suratpenugasan" onClick={handleHideSidebar} />
          <SidebarLink title="Penugasan Pengajaran" route="/dashboard/penugasan" onClick={handleHideSidebar} />
          <SidebarLink title="Mata Kuliah" route="/dashboard/matakuliah" onClick={handleHideSidebar} />
          <SidebarLink title="Kurikulum" route="/dashboard/kurikulum" onClick={handleHideSidebar} />
          <SidebarLink title="Program Studi" route="/dashboard/programstudi" onClick={handleHideSidebar} />
          <SidebarLink title="Dosen" route="/dashboard/dosen" onClick={handleHideSidebar} />
        </SidebarCategory>
      </ul>
    </div>
  );
};

SidebarContent.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SidebarContent;
