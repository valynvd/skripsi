import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/evaluasiperkuliahan/';

const getEvaluasiPerkuliahan = () => {
  return request({
    url: url,
  });
};

const postEvaluasiPerkuliahan = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteEvaluasiPerkuliahan = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchEvaluasiPerkuliahan = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getEvaluasiPerkuliahanByDosen = (id) => {
  return request({
    url: `/api-stem/evaluasiperkuliahanbydosen/67b4176d-ff41-4d75-b0fd-e313f24a544f/`,
  });
};

export const useEvaluasiPerkuliahanData = (options) => {
  return useQuery('evaluasi-perkuliahan', getEvaluasiPerkuliahan, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useEvaluasiPerkuliahanByDosen = (options) => {
  const {
    auth: {
      userData: { id },
    },
  } = useAuth();

  return useQuery(
    ['evaluasi-perkuliahan-dosen', id],
    () => getEvaluasiPerkuliahanByDosen(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchEvaluasiPerkuliahan = () => {
  return useMutation(patchEvaluasiPerkuliahan);
};

export const usePostEvaluasiPerkuliahan = () => {
  return useMutation(postEvaluasiPerkuliahan);
};

export const useDeleteEvaluasiPerkuliahan = () => {
  return useMutation(deleteEvaluasiPerkuliahan);
};
