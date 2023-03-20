import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import LoginInput from './login/components/LoginInput';
import PrimaryButton from '../components/PrimaryButton';
import { AlertError } from '../components/Alert';
import { usePostResetPasswordConfirm } from '../hooks/useResetPassword';
import { useParams } from 'react-router-dom';
import Modal from '../components/Modal';

const ResetPassword = () => {
  const { register, handleSubmit } = useForm();
  const [openModal, setOpenModal] = useState(false);
  const { token } = useParams();
  const {
    mutate: postResetPasswordConfirm,
    isError,
    isLoading,
  } = usePostResetPasswordConfirm();

  const onSubmit = (data) => {
    postResetPasswordConfirm(
      { ...data, token: token },
      {
        onSuccess: () => {
          setOpenModal(true);
        },
      }
    );
  };

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      <Modal
        title="Berhasil!"
        description="Email berhasil diubah, silahkan login"
        isOpen={openModal}
        setIsOpen={setOpenModal}
        link="/login"
      />
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
        <p className="text-3xl font-semibold mt-5 self-start">Ubah Password </p>
        <span className="text-gray-400 inline-block mt-2">
          Masukkan password baru anda.
        </span>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-16 space-y-6 w-full max-w-md"
        >
          {isError && (
            <AlertError>
              Password harus memiliki lebih dari 8 karakter dan gunakan password
              yang umum tidak dipakai.
            </AlertError>
          )}
          <LoginInput register={register} name="password" type="password" />
          <PrimaryButton
            className="w-full rounded-full py-2"
            isLoading={isLoading}
          >
            Submit
          </PrimaryButton>
        </form>
      </div>
    </div>
    // <div className="w-full h-full flex flex-col sm:flex-row">
    //   <Modal
    //     title="Berhasil!"
    //     description="Email berhasil diubah, silahkan login"
    //     isOpen={openModal}
    //     setIsOpen={setOpenModal}
    //     link="/login"
    //   />
    //   <div className="px-10 py-6 sm:p-10 w-full sm:w-1/2 sm:h-full flex flex-col items-center space-y-16 justify-center bg-gradient-to-b from-[#ED1B24] to-[#222222] sm:to-[#222222_80.100%]">
    //     <img
    //       className="max-w-4xs sm:max-w-sm flex w-full"
    //       src={require('../assets/logo/prasmul-logo-white.png')}
    //       alt="prasmul"
    //     />
    //     <img
    //       className="max-w-xl hidden sm:flex w-full"
    //       src={require('../assets/login/login-image.png')}
    //       alt="prasmul"
    //     />
    //   </div>
    //   <div className="w-full sm:w-1/2 p-8 md:p-16 flex flex-1 flex-col justify-center items-center">
    //     <p className="text-lg text-center max-w-sm">
    //       <span className="text-primary-400 text-3xl font-semibold">
    //         SIMANTAP
    //       </span>
    //       <br />
    //       Sistem Managemen Tata Kelola Pendidikan Tinggi
    //     </p>
    //     <p className="text-3xl font-semibold mt-5">Ubah Password</p>
    //     <p className="mt-3 text-center">Masukkan password baru</p>
    //     <form
    //       onSubmit={handleSubmit(onSubmit)}
    //       className="mt-16 space-y-6 w-full max-w-md"
    //     >
    //       {isError && (
    //         <AlertError>
    //           Password harus memiliki lebih dari 8 karakter dan gunakan password
    //           yang umum tidak dipakai.
    //         </AlertError>
    //       )}
    //       <LoginInput register={register} name="password" type="password" />
    //       <PrimaryButton
    //         className="w-full rounded-full py-2"
    //         isLoading={isLoading}
    //       >
    //         Submit
    //       </PrimaryButton>
    //     </form>
    //   </div>
    // </div>
  );
};

export default ResetPassword;
