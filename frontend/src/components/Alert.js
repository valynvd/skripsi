import React from 'react';

const Alert = ({ children, className }) => {
  return (
    <div
      className={`bg-red-50 rounded-lg text-sm px-4 py-2 border border-red-300 text-red-500 ${className}`}
    >
      {children}
    </div>
  );
};

export default Alert;
