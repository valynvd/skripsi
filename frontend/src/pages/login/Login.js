import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../../components/PrimaryButton';
import LoginInput from './components/LoginInput';
import { useLogin } from '../../hooks/useLogin';
import { AlertError } from '../../components/Alert';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { BounceLoader } from 'react-spinners';

const Login = () => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const { setAuth } = useAuth();

  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (userToken) {
      setAuth({
        userToken: userToken,
        userData: userData,
      });
      navigate(from, { replace: true });
    } else {
      setLoading(false);
    }
  }, [from, navigate, setAuth]);

  const { register, handleSubmit } = useForm();
  const { mutate: loginUser, isError, isLoading } = useLogin();

  const onSubmit = (data) => {
    loginUser(data);
  };

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <BounceLoader
          color={'#ED1B24'}
          loading={loading}
          className="ml-2"
          size={120}
          aria-label="Loading Spinner"
          data-testid="loader"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row">
      <div className="hidden md:flex items-center justify-center h-full md:w-1/2 bg-gradient-to-b from-[#ED1B24] to-[#222222] md:to-[#222222_80.100%]">
        <div className="px-10 py-6 md:p-10 w-full max-w-xl flex flex-col h-full max-h-[42rem] lg:max-h-[50rem] justify-between">
          <img
            className="flex w-[10rem]"
            src={require('../../assets/logo/prasmul-logo-white.png')}
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
            src={require('../../assets/login/login-image.png')}
            alt="prasmul"
          />
        </div>
      </div>
      <img
        className="max-w-[9rem] absolute left-8 top-8 md:hidden"
        src={require('../../assets/logo/prasmul-logo-red.png')}
        alt="prasmul"
      />
      <div className="relative w-full md:w-1/2 p-8 md:p-16 mx-auto max-w-lg md:max-w-xl flex flex-1 flex-col justify-center">
        <p className="text-3xl font-semibold mt-5 self-start">
          Login{' '}
          <span className="text-primary-400 inline md:hidden">SIMANTAP</span>
        </p>
        <span className="text-gray-400 inline-block mt-2 md:hidden text-lg">
          Sistem Managemen Tata Kelola Pendidikan Tinggi
        </span>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-16 space-y-6 w-full"
        >
          {isError && <AlertError>Email atau password anda salah</AlertError>}
          <LoginInput register={register} name="email" type="email" />
          <LoginInput register={register} name="password" type="password" />
          <div className="flex justify-end !mt-2">
            <Link
              to="/forgot-password"
              className="font-medium hover:text-primary-400 duration-150"
            >
              Lupa password ?
            </Link>
          </div>
          <PrimaryButton
            className="w-full rounded-full py-2"
            isLoading={isLoading}
          >
            Login
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
};

export default Login;
