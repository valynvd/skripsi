import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import PrimaryButton from '../../components/PrimaryButton';
import LoginInput from './components/LoginInput';
import { useLogin } from '../../hooks/useLogin';
import Alert from '../../components/Alert';
import { useNavigate, useLocation } from 'react-router-dom';
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
    <div className="w-full h-full flex flex-col sm:flex-row">
      <div className="px-10 py-6 sm:p-10 w-full sm:w-1/2 sm:h-full flex flex-col items-center space-y-16 justify-center bg-gradient-to-b from-[#ED1B24] to-[#222222] sm:to-[#222222_80.100%]">
        <img
          className="max-w-4xs sm:max-w-sm flex w-full"
          src={require('../../assets/logo/prasmul-logo-white.png')}
          alt="prasmul"
        />
        <img
          className="max-w-xl hidden sm:flex w-full"
          src={require('../../assets/login/login-image.png')}
          alt="prasmul"
        />
      </div>
      <div className="w-full sm:w-1/2 p-8 md:p-16 flex flex-1 flex-col justify-center items-center">
        <p className="text-xl text-center max-w-sm">
          <span className="text-primary-400">SIMANTAP</span> Sistem Managemen
          Tata Kelola Pendidikan Tinggi
        </p>
        <p className="text-3xl font-semibold mt-5">Login</p>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-16 space-y-6 w-full max-w-md"
        >
          {isError && <Alert>Email atau password anda salah</Alert>}
          <LoginInput register={register} name="email" type="email" />
          <LoginInput register={register} name="password" type="password" />
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
