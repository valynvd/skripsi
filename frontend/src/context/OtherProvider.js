import React, { createContext, useEffect, useState } from 'react';

const OtherContext = createContext({});

export const OtherProvider = ({ children }) => {
  const { innerWidth: width } = window;
  const [navbarMinimize, setNavbarMinimize] = useState(false);

  useEffect(() => {
    if (width <= 768) {
      setNavbarMinimize(true);
    }
  }, [width]);

  return (
    <OtherContext.Provider value={{ navbarMinimize, setNavbarMinimize }}>
      {children}
    </OtherContext.Provider>
  );
};

export default OtherContext;
