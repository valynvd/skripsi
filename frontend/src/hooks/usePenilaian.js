import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/penilaian/';

const postPenilaian = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePenilaian = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPenilaian = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPenilaian = () => {
  return request({
    url: url,
  });
};

const getPenilaianById = (id) => {
  return request({
    url: `/api-stem/penilaian/${id}/`,
  });
};

const getPenilaianByMataKuliahId = (mataKuliahId) => {
  return request({
    url: `/api-stem/matakuliah/${mataKuliahId}/penilaians/`,
  });
};

export const usePenilaianData = (options) => {
  return useQuery('penilaian', getPenilaian, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePenilaianById = (id, options) => {
  return useQuery(['penilaian-by-id', id], () => getPenilaianById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePenilaianByMataKuliah = (mataKuliahId, options) => {
  return useQuery(
    ['penilaian-by-matakuliah', mataKuliahId],
    () => getPenilaianByMataKuliahId(mataKuliahId),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPenilaian = () => {
  return useMutation(patchPenilaian);
};

export const usePostPenilaian = () => {
  return useMutation(postPenilaian);
};

export const useDeletePenilaian = () => {
  return useMutation(deletePenilaian);
};
