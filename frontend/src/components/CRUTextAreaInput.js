import React from 'react';

const CRUTextAreaInput = ({
  register,
  registeredName,
  name,
  type = 'text',
  required = false,
  errors = false,
}) => {
  return (
    <div>
      <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p>
      <textarea
        type={type}
        className={`focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
          errors[registeredName] && '!border-primary-400'
        }`}
        placeholder={`${name}...`}
        {...register(registeredName, {
          required: required ? name + ' harus diisi' : false,
        })}
      />
      {errors[registeredName] && (
        <p className="text-sm text-primary-400">
          {errors[registeredName].message}
        </p>
      )}
    </div>
  );
};

export default CRUTextAreaInput;
