import React from 'react';

const LoginInput = ({ register, name, type = 'text' }) => {
  return (
    <div>
      <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p>
      <input
        type={type}
        className="focus:outline-none w-full mt-2 rounded-full px-5 py-2 focus:border-primary-400 border-[1px]"
        placeholder={`Enter your ${name}...`}
        {...register(name)}
      />
    </div>
  );
};

export default LoginInput;
