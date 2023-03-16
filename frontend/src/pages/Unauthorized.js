import React from 'react';
import PrimaryButton from '../components/PrimaryButton';

const Unauthorized = () => {
  return (
    <div className="w-full h-full flex items-center flex-col justify-center">
      <p className="text-xl">Unauthorized</p>
      <PrimaryButton className="mt-3" link="/">
        Back to Home
      </PrimaryButton>
    </div>
  );
};

export default Unauthorized;
