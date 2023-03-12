import React from 'react';

const Alert = ({ children }) => {
  return (
    <div className="bg-red-50 rounded-lg text-sm px-4 py-2 border border-red-300 text-red-500">
      {children}
    </div>
  );
};

export default Alert;
