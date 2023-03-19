import React from 'react';

export const AlertError = ({ children, className }) => {
  return (
    <div
      className={`bg-red-50 rounded-lg text-sm px-4 py-2 border border-red-300 text-red-500 ${className}`}
    >
      {children}
    </div>
  );
};

export const AlertSuccess = ({ children, className }) => {
  return (
    <div
      className={`bg-green-50 rounded-lg text-sm px-4 py-2 border border-green-300 text-green-500 ${className}`}
    >
      {children}
    </div>
  );
};
