import { useMutation, useQuery } from 'react-query';

import { request } from '../utils/axios-utils';

const url = '/penjadwalan/ruangan/';

const getRuangan = () => {
  return request({
    url,
    method: 'get',
  });
};

const getRuanganById = (id) => {
  return request({
    url: `${url}${id}/`,
    method: 'get',
  });
};

const postRuangan = (data) => {
  return request({
    url,
    method: 'post',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
};

const patchRuangan = ({ id, data }) => {
  return request({
    url: `${url}${id}/`,
    method: 'patch',
    headers: { 'Content-Type': 'application/json' },
    data,
  });
};

const deleteRuangan = (id) => {
  return request({
    url: `${url}${id}/`,
    method: 'delete',
  });
};

export const useRuanganData = (options) => {
  return useQuery('ruangan', getRuangan, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useRuanganById = (id, options) => {
  return useQuery(['ruangan-by-id', id], () => getRuanganById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePostRuangan = () => {
  return useMutation(postRuangan);
};

export const usePatchRuangan = () => {
  return useMutation(patchRuangan);
};

export const useDeleteRuangan = () => {
  return useMutation(deleteRuangan);
};
