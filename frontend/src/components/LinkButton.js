import React from 'react';

const LinkButton = ({ href, children, className }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-sm bg-primary-400 hover:bg-primary-500 duration-200 transition-all flex items-center justify-center px-4 py-1 border border-primary-400 font-medium rounded-full text-white space-x-2 ${className}`}
    >
      {children}
    </a>
  );
};

export default LinkButton;
