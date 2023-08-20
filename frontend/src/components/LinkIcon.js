import React from 'react';
import {
  RiErrorWarningFill,
  RiCheckboxCircleFill,
  RiCloseCircleFill,
} from 'react-icons/ri';
import { SiCodereview } from 'react-icons/si';

export const LinkIconWarning = ({ href = null, className, onClick }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-yellow-400 ${
        onClick ? 'hover:text-yellow-500 cursor-pointer' : ''
      } ${className} duration-200`}
      onClick={onClick}
    >
      <RiErrorWarningFill size={28} />
    </a>
  );
};

export const LinkIconReview = ({ href = null, className, onClick }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-blue-400 ${
        (href || onClick) && 'hover:text-blue-500 cursor-pointer'
      } duration-200 ${className}`}
      onClick={onClick}
    >
      <SiCodereview size={24} />
    </a>
  );
};

export const LinkIconAccepted = ({ href = null, className, onClick }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-green-400 ${
        (href || onClick) && 'hover:text-green-500 cursor-pointer'
      } duration-200 ${className}`}
      onClick={onClick}
    >
      <RiCheckboxCircleFill size={28} />
    </a>
  );
};

export const LinkIconRejected = ({ href = null, className, onClick }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className={`text-red-400 ${
        (href || onClick) && 'hover:text-red-500 cursor-pointer'
      } duration-200 ${className}`}
      onClick={onClick}
    >
      <RiCloseCircleFill size={28} />
    </a>
  );
};
