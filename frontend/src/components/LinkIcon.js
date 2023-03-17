import React from 'react';
import { RiErrorWarningFill, RiCheckboxCircleFill } from 'react-icons/ri';

export const LinkIconWarning = ({ href, className }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-yellow-400 ${className}`}
    >
      <RiErrorWarningFill size={28} />
    </a>
  );
};

export const LinkIconAccepted = ({ href, className }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-green-400 hover:text-green-500 duration-200 ${className}`}
    >
      <RiCheckboxCircleFill size={28} />
    </a>
  );
};
