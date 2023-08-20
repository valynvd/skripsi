import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/publikasikarya/';

const postPublikasiKarya = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePublikasiKarya = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPublikasiKarya = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPublikasiKarya = () => {
  return request({
    url: url,
  });
};

const getPublikasiKaryaBySuratPenugasan = (id) => {
  return request({
    url: `/api-stem/publikasikaryabysuratpenugasan/${id}/`,
  });
};

const getPublikasiKaryaByDosen = (id) => {
  return request({
    url: `/api-stem/publikasikaryabydosen/${id}/`,
  });
};

const getPublikasiKaryaByProdi = (id) => {
  return request({
    url: `/api-stem/publikasikaryabyprodi/${id}/`,
  });
};

const getPublikasiKaryaById = (id) => {
  return request({
    url: `/api-stem/publikasikarya/${id}/`,
  });
};

export const usePublikasiKaryaData = (options) => {
  return useQuery('publikasi-karya', getPublikasiKarya, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePublikasiKaryaByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['dokumen-pembelajaran-by-prodi', prodi],
    () => getPublikasiKaryaByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePublikasiKaryaById = (id, options) => {
  return useQuery(
    ['publikasi-karya-by-id', id],
    () => getPublikasiKaryaById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePublikasiKaryaBySuratPenugasan = (id, options) => {
  return useQuery(
    ['publikasi-karya-by-surat-penugasan', id],
    () => getPublikasiKaryaBySuratPenugasan(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePublikasiKaryaByDosen = (id, options) => {
  return useQuery(
    ['publikasi-karya-by-dosen', id],
    () => getPublikasiKaryaByDosen(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPublikasiKarya = () => {
  return useMutation(patchPublikasiKarya);
};

export const usePostPublikasiKarya = () => {
  return useMutation(postPublikasiKarya);
};

export const useDeletePublikasiKarya = () => {
  return useMutation(deletePublikasiKarya);
};
