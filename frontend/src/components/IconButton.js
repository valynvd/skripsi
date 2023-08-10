import React from 'react';
import { MdEdit, MdDelete, MdViewList } from 'react-icons/md';

export const EditIcon = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-yellow-400 rounded-full w-8 h-8 p-1.5 text-white hover:bg-yellow-500 duration-200"
    >
      <MdEdit size="100%" />
    </button>
  );
};

export const DeleteIcon = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-primary-400 rounded-full w-8 h-8 p-1.5 text-white hover:bg-primary-500 duration-200"
    >
      <MdDelete size="100%" />
    </button>
  );
};

export const ViewIcon = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-800 rounded-full w-8 h-8 p-1.5 text-white hover:bg-blue-500 duration-200"
    >
      <MdViewList size="100%" />
    </button>
  );
};
