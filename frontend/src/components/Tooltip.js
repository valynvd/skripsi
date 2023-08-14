import React from 'react';
import {
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiInformationFill,
} from 'react-icons/ri';
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

export const TooltipInfo = ({ children, status }) => {
  return (
    <div className="group relative">
      <div className="hidden w-[40rem] bg-red-50 border border-primary-400 absolute px-5 py-3 rounded-lg group-hover:block right-10 top-1/2 -translate-y-1/2">
        <p>{children}</p>
      </div>
      <RiInformationFill size={28} color={'#4a4a4a'} />
    </div>
  );
};
