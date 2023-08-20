import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/penugasanpengabdian/';

const postPenugasanPengabdian = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePenugasanPengabdian = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPenugasanPengabdian = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPenugasanPengabdian = () => {
  return request({
    url: url,
  });
};

const getPenugasanPengabdianBySuratPenugasan = (id) => {
  return request({
    url: `/api-stem/penugasanpengabdianbysuratpenugasan/${id}/`,
  });
};

const getPenugasanPengabdianById = (id) => {
  return request({
    url: `/api-stem/penugasanpengabdian/${id}/`,
  });
};

export const usePenugasanPengabdianData = (options) => {
  return useQuery('penugasan-pengabdian', getPenugasanPengabdian, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

const getPenugasanPengabdianByDosen = (id) => {
  return request({
    url: `/api-stem/penugasanpengabdianbydosen/${id}/`,
  });
};

const getPenugasanPengabdianByProdi = (id) => {
  return request({
    url: `/api-stem/penugasanpengabdianbyprodi/${id}/`,
  });
};

export const usePenugasanPengabdianById = (id, options) => {
  return useQuery(
    ['penugasan-pengabdian-by-id', id],
    () => getPenugasanPengabdianById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPengabdianBySuratPenugasan = (id, options) => {
  return useQuery(
    ['penugasan-pengabdian-by-surat-penugasan', id],
    () => getPenugasanPengabdianBySuratPenugasan(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPengabdianByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['dokumen-pembelajaran-by-prodi', prodi],
    () => getPenugasanPengabdianByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPengabdianByDosen = (id, options) => {
  return useQuery(
    ['penugasan-pengabdian-by-dosen', id],
    () => getPenugasanPengabdianByDosen(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPenugasanPengabdian = () => {
  return useMutation(patchPenugasanPengabdian);
};

export const usePostPenugasanPengabdian = () => {
  return useMutation(postPenugasanPengabdian);
};

export const useDeletePenugasanPengabdian = () => {
  return useMutation(deletePenugasanPengabdian);
};
