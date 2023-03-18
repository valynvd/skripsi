import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/programstudi/';

const postProgramStudi = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteProgramStudi = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchProgramStudi = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getProgramStudi = () => {
  return request({
    url: url,
  });
};

export const useProgramStudiData = (options) => {
  return useQuery('programStudi', getProgramStudi, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchProgramStudi = () => {
  return useMutation(patchProgramStudi);
};

export const usePostProgramStudi = () => {
  return useMutation(postProgramStudi);
};

export const useDeleteProgramStudi = () => {
  return useMutation(deleteProgramStudi);
};
