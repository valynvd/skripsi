import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/suratpenugasan/';

const postSuratPenugasan = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteSuratPenugasan = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchSuratPenugasan = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getSuratPenugasan = () => {
  return request({
    url: url,
  });
};

export const useSuratPenugasanData = (options) => {
  return useQuery('surat-penugasan', getSuratPenugasan, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchSuratPenugasan = () => {
  return useMutation(patchSuratPenugasan);
};

export const usePostSuratPenugasan = () => {
  return useMutation(postSuratPenugasan);
};

export const useDeleteSuratPenugasan = () => {
  return useMutation(deleteSuratPenugasan);
};
