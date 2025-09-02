import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/cpmk/';

const getCpmk = () => {
  return request({
    url: url,
  });
};

const getCpmkById = (id) => {
  return request({
    url: `/api-stem/cpmk/${id}/`,
  });
};

const getCpmkByProdi = (id) => {
  return request({
    url: `/api-stem/cpmkbyprodi/${id}/`,
  });
};

const postCpmk = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteCpmk = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchCpmk = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useCpmkData = (options) => {
  return useQuery('cpmk', getCpmk, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCpmkById = (id, options) => {
  return useQuery(['cpmk-by-id', id], () => getCpmkById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCpmkByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(['cpmk-by-prodi', prodi], () => getCpmkByProdi(prodi), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePostCpmk = () => {
  return useMutation(postCpmk);
};

export const useDeleteCpmk = () => {
  return useMutation(deleteCpmk);
};

export const usePatchCpmk = () => {
  return useMutation(patchCpmk);
};
