import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/portofolioperkuliahan/';

const postPortofolioPerkuliahan = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePortofolioPerkuliahan = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPortofolioPerkuliahan = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPortofolioPerkuliahan = () => {
  return request({
    url: url,
  });
};

const getPortofolioPerkuliahanByDosen = (id) => {
  return request({
    url: `/api-stem/portofolioperkuliahanbydosen/${id}/`,
  });
};

export const usePortofolioPerkuliahanData = (options) => {
  return useQuery('portofolio-perkuliahan', getPortofolioPerkuliahan, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePortofolioPerkuliahanByDosenData = (id, options) => {
  return useQuery(
    ['portofolio-perkuliahan-by-dosen', id],
    () => getPortofolioPerkuliahanByDosen(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPortofolioPerkuliahan = () => {
  return useMutation(patchPortofolioPerkuliahan);
};

export const usePostPortofolioPerkuliahan = () => {
  return useMutation(postPortofolioPerkuliahan);
};

export const useDeletePortofolioPerkuliahan = () => {
  return useMutation(deletePortofolioPerkuliahan);
};
