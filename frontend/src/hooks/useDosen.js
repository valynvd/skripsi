import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/dosen/';

const postDosen = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteDosen = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchDosen = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getDosen = () => {
  return request({
    url: url,
  });
};

export const useDosenData = (options) => {
  return useQuery('dosen', getDosen, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchDosen = () => {
  return useMutation(patchDosen);
};

export const usePostDosen = () => {
  return useMutation(postDosen);
};

export const useDeleteDosen = () => {
  return useMutation(deleteDosen);
};
