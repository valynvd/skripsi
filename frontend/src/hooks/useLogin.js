import { useMutation } from 'react-query';
import useAuth from './useAuth';
import { request } from '../utils/axios-utils';
import { useNavigate, useLocation } from 'react-router-dom';

const login = (userData) => {
  return request({
    url: '/auth-stem/token/login',
    method: 'post',
    data: userData,
  });
};

export const getUserData = (userToken) => {
  return request({
    url: '/auth-stem/users/me/',
    method: 'get',
    headers: { Authorization: 'Token ' + userToken },
  });
};

export const useLogin = () => {
  const { setAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  return useMutation(login, {
    onSuccess: (response) => {
      const userToken = response.data.auth_token;
      localStorage.setItem('userToken', userToken);

      getUserData(userToken)
        .then((response2) => {
          localStorage.setItem('userData', JSON.stringify(response2.data));

          setAuth({
            userToken: userToken,
            userData: response2.data,
          });
          navigate(from, { replace: true });
          return response2;
        })
        .catch((error) => {
          return error;
        });
    },
    onError: (error) => {
      return error;
    },
  });
};
