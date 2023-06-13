import React from 'react';
import { NavLink } from 'react-router-dom';
import { IconContext } from 'react-icons';
import useOther from '../../hooks/useOther';
import { useWindowSize } from '../../hooks/useWindowSize';
import { MdOutlineKeyboardArrowRight } from 'react-icons/md';

const NavigationDropdownLink = ({
  title,
  url,
  icon,
  setDropdownActive,
  dropdownActive,
  childrenUrl,
}) => {
  const { navbarMinimize, setNavbarMinimize } = useOther();
  const window = useWindowSize();

  return (
    <div>
      <NavLink
        to={url}
        onClick={(e) => {
          e.preventDefault();

          if (title === dropdownActive) {
            setDropdownActive();
          } else {
            setDropdownActive(title);
          }
          if (window[0] <= 768) {
            setNavbarMinimize(true);
          }
        }}
        className={({ isActive }) =>
          `text-white px-8 py-3 ${
            navbarMinimize && '!p-3 justify-center'
          } relative flex flex-row items-center ${
            isActive || dropdownActive === title
              ? 'bg-primary-400/[.06] opacity-100'
              : 'opacity-70'
          }`
        }
      >
        {({ isActive }) => (
          <>
            <IconContext.Provider
              value={{
                className: 'text-black',
                color:
                  isActive || dropdownActive === title
                    ? 'hsla(357, 85%, 52%, 1)'
                    : 'white',
              }}
            >
              {icon}
            </IconContext.Provider>
            {!navbarMinimize && (
              <>
                <span
                  className={`ml-2 ${
                    isActive || dropdownActive === title
                      ? 'font-medium'
                      : 'font-light'
                  }`}
                >
                  {title}
                </span>
                <MdOutlineKeyboardArrowRight
                  size={24}
                  className={`ml-auto duration-200 ${
                    dropdownActive === title && 'rotate-90'
                  }`}
                />
              </>
            )}
          </>
        )}
      </NavLink>
      <div
        className={`relative max-h-0 duration-200 overflow-hidden`}
        style={{
          maxHeight: dropdownActive === title && childrenUrl.length * 3 + 'rem',
        }}
      >
        <div className="h-[calc(100%-2rem)] w-[1px] top-4 absolute left-[2.6rem] bg-white/[.2]"></div>
        {childrenUrl.map(
          (item) =>
            item.allowedRoles && (
              <NavLink
                className={({ isActive }) =>
                  `py-3 block text-white pl-20 relative ${
                    isActive
                      ? ' opacity-100 font-medium bg-primary-400/[.06]'
                      : 'opacity-70'
                  } font-light`
                }
                key={item.title}
                to={url + item.url}
              >
                {({ isActive }) => (
                  <>
                    {!navbarMinimize && (
                      <>
                        {isActive && (
                          <div className="bg-primary-400 top-0 absolute left-0 w-[0.3rem] h-full"></div>
                        )}
                      </>
                    )}
                    {item.title}
                  </>
                )}
              </NavLink>
            )
        )}
      </div>
    </div>
  );
};

export default NavigationDropdownLink;
