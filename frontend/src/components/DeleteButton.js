import React from 'react';

const DeleteButton = ({ className, icon, type = 'button', onClick }) => {
  return (
    <button
      type={type}
      className={`bg-primary-400 text-sm hover:bg-primary-500 duration-200 transition-all flex items-center justify-center px-4 py-1 border border-primary-400 rounded-full text-white space-x-2 ${className}
      }`}
      onClick={onClick}
    >
      <p>Hapus</p>
      {icon}
    </button>
  );
};

export default DeleteButton;
