import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const PrimaryButton = ({
  children,
  className,
  isLoading = false,
  isDisabled = false,
  icon,
}) => {
  return (
    <button
      disabled={isLoading || isDisabled}
      className={`bg-primary-400 hover:bg-primary-500 duration-200 transition-all flex items-center justify-center px-6 py-1 border border-primary-400 font-medium rounded-full text-white space-x-2 ${className} ${
        (isLoading || isDisabled) &&
        '!bg-gray-200 !border-gray-400 !text-gray-500 cursor-not-allowed'
      }`}
    >
      <p>{children}</p>
      {icon}
      <ClipLoader
        color={'#ED1B24'}
        loading={isLoading}
        size={14}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </button>
  );
};

export default PrimaryButton;
