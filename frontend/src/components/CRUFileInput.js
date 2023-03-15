import React from 'react';

const CRUFileInput = ({
  register,
  name,
  type = 'text',
  required = false,
  errors = false,
  fileLink,
}) => {
  return (
    <div>
      <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p>
      {fileLink ? (
        <p className="text-sm mt-2">
          File Sebelum:{' '}
          <a
            href={fileLink}
            target="_blank"
            rel="noreferrer"
            className="text-primary-400"
          >
            Buka File
          </a>
        </p>
      ) : null}
      <input
        type={type}
        className={`focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
          errors[name] && '!border-primary-400'
        }`}
        placeholder={`${name}...`}
        {...register(name, {
          required: required ? name + ' harus diisi' : false,
        })}
      />
      {errors[name] && (
        <p className="mt-1 text-sm text-primary-400">{errors[name].message}</p>
      )}
    </div>
  );
};

export default CRUFileInput;
