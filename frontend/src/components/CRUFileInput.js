import React from 'react';
import { Controller } from 'react-hook-form';

const CRUFileInput = ({
  registeredName,
  name,
  required = false,
  errors = false,
  fileLink,
  control,
}) => {
  return (
    <div>
      <p>{name}</p>
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
      <Controller
        control={control}
        name={registeredName}
        render={({ field, value, name, ref }) => (
          <input
            name={name}
            type="file"
            className={`focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
              errors[name] && '!border-primary-400'
            }`}
            placeholder={`${name}...`}
            onChange={(e) => {
              field.onChange(e.target.files[0]);
            }}
          />
        )}
      />

      {errors[registeredName] && (
        <p className="mt-1 text-sm text-primary-400">
          {errors[registeredName].message}
        </p>
      )}
    </div>
  );
};

export default CRUFileInput;
