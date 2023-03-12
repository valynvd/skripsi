import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconContext } from 'react-icons';

const NavigationLink = ({ children, url, icon }) => {
  return (
    <NavLink
      to={url}
      className={({ isActive }) =>
        `text-white px-8 py-3 relative flex flex-row items-center ${
          isActive ? 'bg-primary-400/[.06] opacity-100' : 'opacity-70'
        }`
      }
    >
      {({ isActive }) => (
        <>
          <IconContext.Provider
            value={{
              className: 'text-black',
              color: isActive ? 'hsla(357, 85%, 52%, 1)' : 'white',
            }}
          >
            {icon}
          </IconContext.Provider>
          {isActive && (
            <div className="bg-primary-400 top-0 absolute left-0 w-[0.3rem] h-full"></div>
          )}
          <p className={`ml-2 ${isActive ? 'font-medium' : 'font-light'}`}>
            {children}
          </p>
        </>
      )}
    </NavLink>
  );
};

export default NavigationLink;
