import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/kurikulum/';

const postKurikulum = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteKurikulum = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchKurikulum = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getKurikulumById = (id) => {
  return request({
    url: `/api-stem/kurikulum/${id}/`,
  });
};

const getKurikulum = () => {
  return request({
    url: url,
  });
};

export const useKurikulumById = (id, options) => {
  return useQuery(['kurikulum-by-id', id], () => getKurikulumById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useKurikulumData = (options) => {
  return useQuery('kurikulum', getKurikulum, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchKurikulum = () => {
  return useMutation(patchKurikulum);
};

export const usePostKurikulum = () => {
  return useMutation(postKurikulum);
};

export const useDeleteKurikulum = () => {
  return useMutation(deleteKurikulum);
};
