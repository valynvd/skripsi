import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/dokumenakreditasi/';

const postDokumenAkreditasi = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteDokumenAkreditasi = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const getDokumenAkreditasiById = (id) => {
  return request({
    url: `/api-stem/dokumenakreditasi/${id}/`,
  });
};

const patchDokumenAkreditasi = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getDokumenAkreditasi = () => {
  return request({
    url: url,
  });
};

export const useDokumenAkreditasiById = (id, options) => {
  return useQuery(
    ['dokumen-akreditasi-by-id', id],
    () => getDokumenAkreditasiById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useDokumenAkreditasiData = (options) => {
  return useQuery('dokumen-akreditasi', getDokumenAkreditasi, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchDokumenAkreditasi = () => {
  return useMutation(patchDokumenAkreditasi);
};

export const usePostDokumenAkreditasi = () => {
  return useMutation(postDokumenAkreditasi);
};

export const useDeleteDokumenAkreditasi = () => {
  return useMutation(deleteDokumenAkreditasi);
};
