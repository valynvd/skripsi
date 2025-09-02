import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/suratpenugasansekre/';

const getSuratPenugasanSekre = () => {
  return request({
    url: url,
  });
};

const getSuratPenugasanSekreById = (id) => {
  return request({
    url: `/api-stem/suratpenugasansekre/${id}/`,
  });
};

const postSuratPenugasanSekre = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteSuratPenugasanSekre = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchSuratPenugasanSekre = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useSuratPenugasanSekreData = (options) => {
  return useQuery('data-master', getSuratPenugasanSekre, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useSuratPenugasanSekreById = (id, options) => {
  return useQuery(
    ['surat-penugasan-by-id', id],
    () => getSuratPenugasanSekreById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePostSuratPenugasanSekre = () => {
  return useMutation(postSuratPenugasanSekre);
};

export const useDeleteSuratPenugasanSekre = () => {
  return useMutation(deleteSuratPenugasanSekre);
};

export const usePatchSuratPenugasanSekre = () => {
  return useMutation(patchSuratPenugasanSekre);
};
