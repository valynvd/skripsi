import React from 'react';
// import ClipLoader from 'react-spinners/ClipLoader';

const CancelButton = ({ className, icon, type = 'button', onClick }) => {
  return (
    <button
      type={type}
      className={`bg-gray-200 border-gray-400 text-gray-500 hover:bg-gray-300 duration-200 transition-all flex items-center justify-center px-4 py-1 border rounded-full space-x-2 ${className}
      `}
      onClick={onClick}
    >
      <p>Cancel</p>
      {icon}
      {/* <ClipLoader
        color={'#facc15'}
        loading={isLoading}
        size={14}
        aria-label="Loading Spinner"
        data-testid="loader"
      /> */}
    </button>
  );
};

export default CancelButton;
