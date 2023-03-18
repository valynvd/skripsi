import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/auth-stem/users/';

const postUser = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteUser = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchUser = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getUser = () => {
  return request({
    url: url,
  });
};

export const useUserData = (options) => {
  return useQuery('user', getUser, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchUser = () => {
  return useMutation(patchUser);
};

export const usePostUser = () => {
  return useMutation(postUser);
};

export const useDeleteUser = () => {
  return useMutation(deleteUser);
};
