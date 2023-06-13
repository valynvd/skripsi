import React from 'react';

const PageButton = ({ children, onClick, active }) => {
  return (
    <button
      onClick={onClick}
      className={`duration-200 border  hover:text-primary-400 hover:border-red-400  rounded-xl py-2 px-4 w-full bg-white ${
        active
          ? 'border-red-400 text-primary-400 font-semibold'
          : 'border-gray-300 text-gray-500'
      }`}
    >
      {children}
    </button>
  );
};

export default PageButton;
