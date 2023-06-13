import React from 'react';
import { Controller } from 'react-hook-form';

const CRUFileInput = ({
  registeredName,
  name,
  required = false,
  errors = false,
  fileLink,
  control,
  note,
  hidden = false,
  isDisabled = false,
  nameRef = null,
}) => {
  return (
    <div>
      <p ref={nameRef}>{name}</p>
      {fileLink ? (
        <div className="flex flex-row text-sm mt-2 space-x-1 whitespace-nowrap">
          {hidden ? null : <p>File Sebelum:</p>}
          <a
            href={fileLink}
            target="_blank"
            rel="noreferrer"
            className="inline-block text-primary-400 max-w-sm overflow-ellipsis overflow-hidden focus:outline-none"
          >
            {fileLink}
          </a>
        </div>
      ) : null}
      <Controller
        control={control}
        name={registeredName}
        render={({ field, value, name, ref }) => (
          <>
            <input
              name={name}
              disabled={isDisabled}
              type="file"
              className={`${
                isDisabled && 'bg-grayDisabled-400'
              } focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
                errors[name] && '!border-primary-400'
              } ${hidden && 'hidden'}`}
              placeholder={`${name}...`}
              onChange={(e) => {
                field.onChange(e.target.files[0]);
              }}
            />
            {note && (
              <p className="text-xs mt-2 text-yellow-500">Catatan: {note}</p>
            )}
          </>
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
