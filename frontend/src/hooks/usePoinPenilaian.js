import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/poinpenilaian/';

const postPoinPenilaian = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePoinPenilaian = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPoinPenilaian = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPoinPenilaian = () => {
  return request({
    url: url,
  });
};

const getPoinPenilaianById = (id) => {
  return request({
    url: `/api-stem/poinpenilaian/${id}/`,
  });
};

export const usePoinPenilaianData = (options) => {
  return useQuery('poin-penilaian', getPoinPenilaian, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePoinPenilaianById = (id, options) => {
  return useQuery(
    ['poin-penilaian-by-id', id],
    () => getPoinPenilaianById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPoinPenilaian = () => {
  return useMutation(patchPoinPenilaian);
};

export const usePostPoinPenilaian = () => {
  return useMutation(postPoinPenilaian);
};

export const useDeletePoinPenilaian = () => {
  return useMutation(deletePoinPenilaian);
};
