import React, { createContext, useEffect, useState } from 'react';

const OtherContext = createContext({});

export const OtherProvider = ({ children }) => {
  const { innerWidth: width } = window;
  const [navbarMinimize, setNavbarMinimize] = useState(false);

  useEffect(() => {
    const checkNavbarMinimize = JSON.parse(
      localStorage.getItem('navbarMinimize')
    );
    setNavbarMinimize(checkNavbarMinimize);
  }, []);

  const setNavAndUpdStr = (value) => {
    localStorage.setItem('navbarMinimize', value);
    setNavbarMinimize(value);
  };

  useEffect(() => {
    if (width <= 768) {
      setNavbarMinimize(true);
    }
  }, [width]);

  return (
    <OtherContext.Provider value={{ navbarMinimize, setNavAndUpdStr }}>
      {children}
    </OtherContext.Provider>
  );
};

export default OtherContext;
