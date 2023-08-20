import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/patenhki/';

const postPatenHKI = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePatenHKI = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPatenHKI = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPatenHKI = () => {
  return request({
    url: url,
  });
};

const getPatenHKIByDosen = (id) => {
  return request({
    url: `/api-stem/patenhkibydosen/${id}/`,
  });
};

const getPatenHKIByProdi = (id) => {
  return request({
    url: `/api-stem/patenhkibyprodi/${id}/`,
  });
};

const getPatenHKIById = (id) => {
  return request({
    url: `/api-stem/patenhki/${id}/`,
  });
};

export const usePatenHKIData = (options) => {
  return useQuery('paten-hki', getPatenHKI, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatenHKIByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['dokumen-pembelajaran-by-prodi', prodi],
    () => getPatenHKIByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatenHKIById = (id, options) => {
  return useQuery(['paten-hki-by-id', id], () => getPatenHKIById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatenHKIByDosen = (id, options) => {
  return useQuery(['paten-hki-by-dosen', id], () => getPatenHKIByDosen(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchPatenHKI = () => {
  return useMutation(patchPatenHKI);
};

export const usePostPatenHKI = () => {
  return useMutation(postPatenHKI);
};

export const useDeletePatenHKI = () => {
  return useMutation(deletePatenHKI);
};
