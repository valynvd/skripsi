import React from 'react';
import { useNavigate } from 'react-router-dom';
import ClipLoader from 'react-spinners/ClipLoader';
import { BiExport } from 'react-icons/bi';

export const PrimaryButton = ({
  children,
  className,
  isLoading = false,
  isDisabled = false,
  refresh = false,
  icon,
  type = 'submit',
  link,
  onClick,
}) => {
  const navigate = useNavigate();

  return (
    <button
      type={type}
      disabled={isLoading || isDisabled}
      className={`bg-primary-400 whitespace-nowrap hover:bg-primary-500 duration-200 transition-all flex items-center justify-center px-6 py-1 border border-primary-400 font-medium rounded-full text-white space-x-2 ${className} ${
        (isLoading || isDisabled) &&
        '!bg-gray-200 !border-gray-400 !text-gray-500 cursor-not-allowed'
      }`}
      onClick={() => {
        if (onClick) {
          onClick();
        }
        if (link) {
          navigate(link);
          if (refresh) {
            navigate(0);
          }
        }
      }}
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

export const ExportPrimaryButton = (options) => {
  return (
    <PrimaryButton
      type="button"
      {...options}
      className="bg-green-500 border-green-500 hover:bg-green-600"
      icon={<BiExport size={20} />}
    >
      Export
    </PrimaryButton>
  );
};
