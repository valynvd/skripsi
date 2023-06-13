import React from 'react';
import ClipLoader from 'react-spinners/ClipLoader';

const EditButton = ({
  name = 'Edit',
  className,
  icon,
  type = 'button',
  onClick,
  isLoading = false,
  isDisabled = false,
}) => {
  return (
    <button
      disabled={isDisabled || isLoading}
      type={type}
      className={`bg-yellow-400 text-sm hover:bg-yellow-500 duration-200 transition-all flex items-center justify-center px-4 py-1 border border-yellow-400 rounded-full text-white space-x-2 ${className}
      ${
        (isLoading || isDisabled) &&
        '!bg-gray-200 !border-gray-400 !text-gray-500 cursor-not-allowed'
      }`}
      onClick={onClick}
    >
      <p>{name}</p>
      {icon}
      <ClipLoader
        color={'#facc15'}
        loading={isLoading}
        size={14}
        aria-label="Loading Spinner"
        data-testid="loader"
      />
    </button>
  );
};

export default EditButton;
