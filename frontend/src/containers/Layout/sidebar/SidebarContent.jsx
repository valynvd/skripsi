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
          <SidebarLink title="Matrix Penilaian" route="/dashboard/akreditasi" onClick={handleHideSidebar} />
        </SidebarCategory>
      </ul>
    </div>
  );
};

SidebarContent.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default SidebarContent;
