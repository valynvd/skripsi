import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/bahankajian/';

const getBahanKajian = () => {
  return request({
    url: url,
  });
};

const getBahanKajianById = (id) => {
  return request({
    url: `/api-stem/bahankajian/${id}/`,
  });
};

const getBahanKajianByProdi = (id) => {
  return request({
    url: `/api-stem/bahankajianbyprodi/${id}/`,
  });
};

const postBahanKajian = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteBahanKajian = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchBahanKajian = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useBahanKajianData = (options) => {
  return useQuery('bahan-kajian', getBahanKajian, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useBahanKajianById = (id, options) => {
  return useQuery(['bahan-kajian-by-id', id], () => getBahanKajianById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useBahanKajianByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['bahan-kajian-by-prodi', prodi],
    () => getBahanKajianByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePostBahanKajian = () => {
  return useMutation(postBahanKajian);
};

export const useDeleteBahanKajian = () => {
  return useMutation(deleteBahanKajian);
};

export const usePatchBahanKajian = () => {
  return useMutation(patchBahanKajian);
};

export const useBahanKajianDataViews = (options) => {
  return useQuery('bahan-kajians', getBahanKajian, {
    refetchOnWindowFocus: false,
    select: (response) => {
      return response.data.map(({ id, kode, deskripsi }) => ({
        value: id,
        label: `${kode} - ${deskripsi}`,
      }));
    },
    ...options,
  });
};
