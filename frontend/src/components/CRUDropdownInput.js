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
  type = 'text',
  required = false,
  errors = false,
}) => {
  return (
    <div>
      <p className="mb-1">{name}</p>
      <Controller
        control={control}
        name={registeredName}
        render={({ field, value, name, ref }) => (
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
                  state.isFocused ? '!border-primary-400' : '!border-gray-200'
                }`,
            }}
            inputRef={ref}
            options={options}
            defaultValue={defaultValue}
            value={options.find((c) => c.value === value)}
            onChange={(val) => field.onChange(val.value)}
          />
        )}
      />
    </div>
  );
};

export default CRUDropdownInput;
