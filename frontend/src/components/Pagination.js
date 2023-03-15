/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from 'react-icons/md';

const Pagination = ({
  initialPagesArray,
  goToPage,
  pageIndex,
  nextPage,
  previousPage,
  canNextPage,
  canPreviousPage,
}) => {
  const [pagesArray, setPagesArray] = useState(initialPagesArray);

  useEffect(() => {
    if (initialPagesArray.length < 7) {
      setPagesArray(initialPagesArray);
      return;
    }
    let tempPagesArray = [...initialPagesArray];

    if (pageIndex + 1 <= 3) {
      tempPagesArray = [0, 1, 2, 3, '...', initialPagesArray.length - 1];
    } else if (pageIndex + 1 === 4) {
      const sliced = initialPagesArray.slice(0, 5);
      tempPagesArray = [...sliced, '...', initialPagesArray.length - 1];
    } else if (
      pageIndex + 1 > 4 &&
      pageIndex + 1 < initialPagesArray.length - 2
    ) {
      const sliced1 = initialPagesArray.slice(pageIndex + 1 - 2, pageIndex + 1);
      const sliced2 = initialPagesArray.slice(pageIndex + 1, pageIndex + 1 + 1);
      tempPagesArray = [
        0,
        '...',
        ...sliced1,
        ...sliced2,
        '...',
        initialPagesArray.length - 1,
      ];
    } else if (pageIndex + 1 > initialPagesArray.length - 3) {
      const sliced = initialPagesArray.slice(initialPagesArray.length - 4);
      tempPagesArray = [0, '...', ...sliced];
    }

    setPagesArray(tempPagesArray);
  }, [pageIndex, initialPagesArray]);

  return (
    <>
      <div className="flex flex-row mt-5 items-center">
        <button
          onClick={() => {
            previousPage();
          }}
          className={`h-8 w-8 flex items-center justify-center rounded-l-lg bg-primary-400 ${
            !canPreviousPage && '!bg-gray-200 cursor-not-allowed'
          }`}
        >
          <MdOutlineArrowBackIos
            size={14}
            color={canPreviousPage ? 'white' : 'Gray'}
          />
        </button>
        {pagesArray.map((pages, index) => (
          <button
            key={index}
            onClick={() => pages !== '...' && goToPage(pages)}
            className={`flex items-center justify-center h-8 w-8 border border-gray-300 ${
              pageIndex + 1 === pages + 1 && '!border-primary-400'
            } ${pages === '...' && 'cursor-not-allowed bg-gray-200'}`}
          >
            {pages !== '...' ? pages + 1 : '...'}
          </button>
        ))}
        <button
          onClick={() => {
            nextPage();
          }}
          className={`h-8 w-8 flex items-center justify-center rounded-r-lg bg-primary-400 ${
            !canNextPage && '!bg-gray-200 cursor-not-allowed'
          }`}
        >
          <MdOutlineArrowForwardIos
            size={14}
            color={canNextPage ? 'white' : 'Gray'}
          />
        </button>
      </div>
    </>
  );
};

export default Pagination;
