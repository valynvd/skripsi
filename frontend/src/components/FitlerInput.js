import React from 'react';
import { Controller } from 'react-hook-form';
import Select from 'react-select';
import { primary400 } from '../utils/colors';

const FilterInput = ({
  options,
  control,
  registeredName,
  name,
  defaultValue,
  required = false,
  isDisabled = false,
  className,
  isClearable = false,
  clearFunc,
  placeholder = '',
}) => {
  return (
    <div>
      <Controller
        rules={{ required: required ? `${name} harus diisi` : false }}
        control={control}
        name={registeredName}
        render={({ field, fieldState: { error } }) => (
          <>
            <Select
              isClearable={isClearable}
              isDisabled={isDisabled}
              placeholder={placeholder}
              theme={(theme) => ({
                ...theme,
                colors: {
                  ...theme.colors,
                  primary: primary400,
                  primary25: '#fde3e4',
                  primary50: '#fbd0d2',
                  neutral50: 'black',
                },
              })}
              classNamePrefix="react-select"
              styles={{
                control: (base) => ({
                  ...base,
                  boxShadow: 'none',
                  placeholderColor: 'black',
                }),
              }}
              classNames={{
                control: (state) => {
                  return `!px-0.5 !text-red-400 !py-0.5 ${
                    state.hasValue ? '!border-primary-400' : ''
                  } ${
                    state.isFocused ? '!border-primary-400' : '!border-gray-200'
                  } ${isDisabled && '!bg-grayDisabled-400'} ${className}`;
                },
              }}
              inputRef={field.ref}
              options={options}
              defaultValue={defaultValue}
              value={options.find((c) => c.value === field.value)}
              onChange={(val, triggeredAction) => {
                if (triggeredAction.action === 'clear') {
                  clearFunc();
                } else {
                  field.onChange(val.value);
                }
              }}
            />
            {error && (
              <p className="mt-1 text-sm text-primary-400">{error.message}</p>
            )}
          </>
        )}
      />
    </div>
  );
};

export default FilterInput;
