import React, { createContext, useState } from 'react';

const OtherContext = createContext({});

export const OtherProvider = ({ children }) => {
  const [navbarMinimize, setNavbarMinimize] = useState(false);

  return (
    <OtherContext.Provider value={{ navbarMinimize, setNavbarMinimize }}>
      {children}
    </OtherContext.Provider>
  );
};

export default OtherContext;
