import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/kriteria/';

const postKriteria = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteKriteria = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchKriteria = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getKriteria = () => {
  return request({
    url: url,
  });
};

const getKriteriaByDokumenAkreditasi = (id) => {
  return request({
    url: `/api-stem/kriteriabydokumenakreditasi/${id}/`,
  });
};

const getKriteriaById = (id) => {
  return request({
    url: `/api-stem/kriteria/${id}/`,
  });
};

export const useKriteriaData = (options) => {
  return useQuery('kriteria', getKriteria, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useKriteriaByDokumenAkreditasi = (id, options) => {
  return useQuery(
    ['kriteria-by-dokumen-akreditasi', id],
    () => getKriteriaByDokumenAkreditasi(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useKriteriaById = (id, options) => {
  return useQuery(['kriteria-by-id', id], () => getKriteriaById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchKriteria = () => {
  return useMutation(patchKriteria);
};

export const usePostKriteria = () => {
  return useMutation(postKriteria);
};

export const useDeleteKriteria = () => {
  return useMutation(deleteKriteria);
};
