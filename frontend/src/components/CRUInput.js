import React from 'react';

const CRUInput = ({
  register,
  registeredName,
  name,
  type = 'text',
  required = false,
  errors = false,
  isDisabled = false,
  className = '',
  note = false,
  hideLabel = false,
}) => {
  return (
    <div>
      {/* <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p> */}
      {!hideLabel && <p>{name.charAt(0).toUpperCase() + name.slice(1)}</p>}
      {/* <input
        type={type}
        disabled={isDisabled}
        className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
          errors[registeredName] && '!border-primary-400'
        } ${isDisabled && 'bg-grayDisabled-400'} ${
          type === 'checkbox' && 'scale-125 !w-auto mt-2 ml-1'
        } ${className}`}
        placeholder={`${name}...`}
        {...register(registeredName, {
          required: required ? name + ' harus diisi' : false,
        })}
      /> */}
      {type === 'textarea' ? (
        <textarea
          disabled={isDisabled}
          className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
            errors[registeredName] && '!border-primary-400'
          } ${isDisabled && 'bg-grayDisabled-400'} ${className}`}
          placeholder={`${name}...`}
          {...register(registeredName, {
            required: required ? name + ' harus diisi' : false,
          })}
        />
      ) : (
        <input
          type={type}
          disabled={isDisabled}
          className={`accent-primary-400 focus:outline-none w-full mt-1 rounded-lg px-3 py-2 focus:border-primary-400 border-[1px] ${
            errors[registeredName] && '!border-primary-400'
          } ${isDisabled && 'bg-grayDisabled-400'} ${
            type === 'checkbox' && 'scale-125 !w-auto mt-2 ml-1'
          } ${className}`}
          placeholder={`${name}...`}
          {...register(registeredName, {
            required: required ? name + ' harus diisi' : false,
          })}
        />
      )}
      {note && <p className="text-sm mt-2 text-yellow-500">{note}</p>}
      {errors[registeredName] && (
        <p className="mt-1 text-sm text-primary-400">
          {errors[registeredName].message}
        </p>
      )}
    </div>
  );
};

export default CRUInput;
