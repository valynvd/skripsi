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
    <div className="w-full h-full flex flex-col sm:flex-row">
      <div className="px-10 py-6 sm:p-10 w-full sm:w-1/2 sm:h-full flex flex-col items-center space-y-16 justify-center bg-gradient-to-b from-[#ED1B24] to-[#222222] sm:to-[#222222_80.100%]">
        <img
          className="max-w-4xs sm:max-w-sm flex w-full"
          src={require('../assets/logo/prasmul-logo-white.png')}
          alt="prasmul"
        />
        <img
          className="max-w-xl hidden sm:flex w-full"
          src={require('../assets/login/login-image.png')}
          alt="prasmul"
        />
      </div>
      <div className="w-full sm:w-1/2 p-8 md:p-16 flex flex-1 flex-col justify-center items-center">
        <p className="text-lg text-center max-w-sm">
          <span className="text-primary-400 text-3xl font-semibold">
            SIMANTAP
          </span>
          <br />
          Sistem Managemen Tata Kelola Pendidikan Tinggi
        </p>
        <p className="text-3xl font-semibold mt-5">Lupa Password</p>
        <p className="mt-3 text-center">
          masukkan email Anda dan kami akan mengirimkan link lewat email anda
          untuk mereset password
        </p>
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
