import { request } from '../utils/axios-utils';
import { useMutation } from 'react-query';

const url = '/api-stem/password_reset';

const postResetPassword = (data) => {
  return request({
    url: url + '/',
    method: 'post',
    data: data,
  });
};

const postResetPasswordConfirm = (data) => {
  return request({
    url: url + '/confirm/',
    method: 'post',
    data: data,
  });
};

export const usePostResetPassword = () => {
  return useMutation(postResetPassword);
};

export const usePostResetPasswordConfirm = () => {
  return useMutation(postResetPasswordConfirm);
};
