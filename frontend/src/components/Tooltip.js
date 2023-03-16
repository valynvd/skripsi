import React from 'react';
import { RiErrorWarningFill, RiCheckboxCircleFill } from 'react-icons/ri';
import { green400, yellow400 } from '../utils/colors';

export const TooltipAccept = ({ children }) => {
  return (
    <div className="group relative">
      <div className="hidden bg-green-400 absolute bottom-9 whitespace-nowrap px-5 py-1 rounded-lg group-hover:block">
        <p>{children}</p>
      </div>
      <RiCheckboxCircleFill size={28} color={green400} />
    </div>
  );
};

export const TooltipWarning = ({ children, status }) => {
  return (
    <div className="group relative">
      <div className="hidden bg-yellow-400 absolute bottom-9 whitespace-nowrap px-5 py-1 rounded-lg group-hover:block">
        <p>{children}</p>
      </div>
      <RiErrorWarningFill size={28} color={yellow400} />
    </div>
  );
};
