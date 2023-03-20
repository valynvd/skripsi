/* eslint-disable no-unused-vars */
import React from 'react';
import { useForm } from 'react-hook-form';
import LoginInput from './login/components/LoginInput';
import PrimaryButton from '../components/PrimaryButton';
import { AlertError, AlertSuccess } from '../components/Alert';
import { usePostResetPassword } from '../hooks/useResetPassword';

const ForgotPassword = () => {
  const { register, handleSubmit } = useForm();
  const {
    mutate: postResetPassword,
    isError,
    isLoading,
    isSuccess,
  } = usePostResetPassword();

  const onSubmit = (data) => {
    postResetPassword(data);
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      <div className="hidden md:flex items-center justify-center h-full md:w-1/2 bg-gradient-to-b from-[#ED1B24] to-[#222222] md:to-[#222222_80.100%]">
        <div className="px-10 py-6 md:p-10 w-full max-w-xl flex flex-col h-full max-h-[42rem] lg:max-h-[50rem] justify-between">
          <img
            className="flex w-[10rem]"
            src={require('../assets/logo/prasmul-logo-white.png')}
            alt="prasmul"
          />
          <div>
            <h2 className="text-3xl lg:text-4xl text-white font-medium">
              SIMANTAP
            </h2>
            <p className="text-white text-lg lg:text-xl mt-2">
              Sistem Managemen Tata Kelola Pendidikan Tinggi
            </p>
          </div>
          <img
            className="max-w-xl hidden md:flex w-full"
            src={require('../assets/login/login-image.png')}
            alt="prasmul"
          />
        </div>
      </div>
      <img
        className="max-w-[9rem] absolute left-8 top-8 md:hidden"
        src={require('../assets/logo/prasmul-logo-red.png')}
        alt="prasmul"
      />
      <div className="relative w-full md:w-1/2 p-8 md:p-16 mx-auto max-w-lg md:max-w-xl flex flex-1 flex-col justify-center">
        <p className="text-3xl font-semibold mt-5 self-start">Lupa Password </p>
        <span className="text-gray-400 inline-block mt-2">
          masukkan email Anda dan kami akan mengirimkan link untuk mereset
          password.
        </span>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-16 space-y-6 w-full max-w-md"
        >
          {isError && <AlertError>Email anda tidak dapat ditemukan</AlertError>}
          {isSuccess && (
            <AlertSuccess>
              Berhasil, tolong cek email anda untuk mengubah password
            </AlertSuccess>
          )}
          <LoginInput register={register} name="email" type="email" />
          <PrimaryButton
            className="w-full rounded-full py-2"
            isLoading={isLoading}
          >
            Submit
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
