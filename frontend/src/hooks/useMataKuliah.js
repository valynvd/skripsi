import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/matakuliah/';

const postMataKuliah = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteMataKuliah = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchMataKuliah = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getMataKuliah = () => {
  return request({
    url: url,
  });
};

export const useMataKuliahData = (options) => {
  return useQuery('mata-kuliah', getMataKuliah, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchMataKuliah = () => {
  return useMutation(patchMataKuliah);
};

export const usePostMataKuliah = () => {
  return useMutation(postMataKuliah);
};

export const useDeleteMataKuliah = () => {
  return useMutation(deleteMataKuliah);
};
