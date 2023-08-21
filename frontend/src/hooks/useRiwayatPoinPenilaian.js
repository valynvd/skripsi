import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/riwayatpoinpenilaian/';

const postRiwayatPoinPenilaian = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteRiwayatPoinPenilaian = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchRiwayatPoinPenilaian = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getRiwayatPoinPenilaian = () => {
  return request({
    url: url,
  });
};

const getRiwayatPoinPenilaianById = (id) => {
  return request({
    url: `/api-stem/riwayatpoinpenilaian/${id}/`,
  });
};

export const useRiwayatPoinPenilaianData = (options) => {
  return useQuery('riwayat-poin-penilaian', getRiwayatPoinPenilaian, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useRiwayatPoinPenilaianById = (id, options) => {
  return useQuery(
    ['riwayat-poin-penilaian-by-id', id],
    () => getRiwayatPoinPenilaianById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchRiwayatPoinPenilaian = () => {
  return useMutation(patchRiwayatPoinPenilaian);
};

export const usePostRiwayatPoinPenilaian = () => {
  return useMutation(postRiwayatPoinPenilaian);
};

export const useDeleteRiwayatPoinPenilaian = () => {
  return useMutation(deleteRiwayatPoinPenilaian);
};
