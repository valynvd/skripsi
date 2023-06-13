import React from 'react';
import { MdOutlineArrowForwardIos } from 'react-icons/md';
import { Link } from 'react-router-dom';

const BreadCrumbs = ({ links }) => {
  return (
    <div className="flex flex-row mb-4 space-x-2 !font-normal">
      {links.map((item, index) => (
        <div className="flex flex-row items-center space-x-2" key={index}>
          <Link
            className={`${
              index + 1 === links.length
                ? 'pointer-events-none'
                : 'text-primary-400'
            }`}
            to={item.link}
          >
            {item.name}
          </Link>
          {!(index + 1 === links.length) && (
            <MdOutlineArrowForwardIos size={17} color="gray" />
          )}
        </div>
      ))}
    </div>
  );
};

export default BreadCrumbs;
