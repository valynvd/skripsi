import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/cycle/';

const postCycle = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteCycle = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchCycle = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getCycle = () => {
  return request({
    url: url,
  });
};

const getCycleById = (id) => {
  return request({
    url: `/api-stem/cycle/${id}/`,
  });
};

export const useCycleData = (options) => {
  return useQuery('cycle', getCycle, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCycleById = (id, options) => {
  return useQuery(['cycle-by-id', id], () => getCycleById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchCycle = () => {
  return useMutation(patchCycle);
};

export const usePostCycle = () => {
  return useMutation(postCycle);
};

export const useDeleteCycle = () => {
  return useMutation(deleteCycle);
};
