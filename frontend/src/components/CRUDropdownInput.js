import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import { primary400 } from '../utils/colors';

const CRUDropdownInput = ({
  options,
  control,
  registeredName,
  name,
  defaultValue,
  required = false,
}) => {
  return (
    <div>
      <p className="mb-1">{name}</p>
      <Controller
        rules={{ required: required ? `${name} harus diisi` : false }}
        control={control}
        name={registeredName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Select
              placeholder="pilih..."
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: primary400,
                  primary25: '#fde3e4',
                  primary50: '#fbd0d2',
                },
              })}
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  boxShadow: 'none',
                }),
              }}
              classNames={{
                control: (state) =>
                  `!px-0.5 !text-red-400 !py-0.5 ${
                    error ? '!border-primary-400' : ''
                  } ${
                    state.isFocused ? '!border-primary-400' : '!border-gray-200'
                  }`,
              }}
              inputRef={field.ref}
              options={options}
              defaultValue={defaultValue}
              value={options.find((c) => c.value === field.value)}
              onChange={(val) => field.onChange(val.value)}
            />
            {error && (
              <p className="mt-2 text-sm text-primary-400">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default CRUDropdownInput;
