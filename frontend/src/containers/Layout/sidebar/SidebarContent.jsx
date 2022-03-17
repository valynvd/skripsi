import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import SidebarCategory from './SidebarCategory';
import dataApi from '../../../utils/dataApi';

const SidebarContent = ({ onClick }) => {
  const [listKriteria, setListKriteria] = useState([]);
  const handleHideSidebar = () => {
    onClick();
  };

  const getKriteria = async () => {
    try {
      const resp = await dataApi.getKriteria();
      // // eslint-disable-next-line no-console
      // console.log('CINTA', resp);
      setListKriteria(resp.data);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log(error);
    }
  };

  useEffect(() => {
    // get sibar API
    getKriteria();
  }, []);
  return (
    <div className="sidebar__content">
      <ul className="sidebar__block">
        <SidebarLink title="Dashboard" icon="home" route="/dashboard" onClick={handleHideSidebar} />
      </ul>
      <ul className="sidebar__block">
        <SidebarCategory title="Akreditasi" icon="diamond">
          <SidebarLink title="List Kriteria" route="/dashboard/listkriteria" onClick={handleHideSidebar} />
          {listKriteria.length > 0 && listKriteria.map((el) => (
            <SidebarLink
              key={el.id}
              title={el.nama}
              route={`/dashboard/kriteria/${el.id}`}
              onClick={handleHideSidebar}
            />
          ))}
        </SidebarCategory>
        {/* <SidebarCategory title="Aktivitas Prodi" icon="diamond">
          <SidebarLink title="Evaluasi Perkuliahan" route="/dashboard/evaluasi" onClick={handleHideSidebar} />
          <SidebarLink title="Portofolio Perkuliahan" route="/dashboard/portofolio" onClick={handleHideSidebar} />
          <SidebarLink title="Surat Penugasan" route="/dashboard/suratpenugasan" onClick={handleHideSidebar} />
          <SidebarLink title="Penugasan Pengajaran" route="/dashboard/penugasan" onClick={handleHideSidebar} />
          <SidebarLink title="Mata Kuliah" route="/dashboard/matakuliah" onClick={handleHideSidebar} />
          <SidebarLink title="Kurikulum" route="/dashboard/kurikulum" onClick={handleHideSidebar} />
          <SidebarLink title="Program Studi" route="/dashboard/programstudi" onClick={handleHideSidebar} />
          <SidebarLink title="Dosen" route="/dashboard/dosen" onClick={handleHideSidebar} />
        </SidebarCategory> */}
      </ul>
    </div>
  );
};

SidebarContent.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SidebarContent;
