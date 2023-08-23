import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/simulasimatriks/';

const postSimulasiMatriks = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteSimulasiMatriks = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const getSimulasiMatriksById = (id) => {
  return request({
    url: `/api-stem/simulasimatriks/${id}/`,
  });
};

const patchSimulasiMatriks = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getSimulasiMatriks = () => {
  return request({
    url: url,
  });
};

export const useSimulasiMatriksById = (id, options) => {
  return useQuery(
    ['dokumen-akreditasi-by-id', id],
    () => getSimulasiMatriksById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useSimulasiMatriksData = (options) => {
  return useQuery('dokumen-akreditasi', getSimulasiMatriks, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchSimulasiMatriks = () => {
  return useMutation(patchSimulasiMatriks);
};

export const usePostSimulasiMatriks = () => {
  return useMutation(postSimulasiMatriks);
};

export const useDeleteSimulasiMatriks = () => {
  return useMutation(deleteSimulasiMatriks);
};
