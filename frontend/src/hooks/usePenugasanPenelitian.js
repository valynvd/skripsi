import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/penugasanpenelitian/';

const postPenugasanPenelitian = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePenugasanPenelitian = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPenugasanPenelitian = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPenugasanPenelitian = () => {
  return request({
    url: url,
  });
};

const getPenugasanPenelitianBySuratPenugasan = (id) => {
  return request({
    url: `/api-stem/penugasanpenelitianbysuratpenugasan/${id}/`,
  });
};

const getPenugasanPenelitianByDosen = (id) => {
  return request({
    url: `/api-stem/penugasanpenelitianbydosen/${id}/`,
  });
};

const getPenugasanPenelitianByProdi = (id) => {
  return request({
    url: `/api-stem/penugasanpenelitianbyprodi/${id}/`,
  });
};

const getPenugasanPenelitianById = (id) => {
  return request({
    url: `/api-stem/penugasanpenelitian/${id}/`,
  });
};

export const usePenugasanPenelitianData = (options) => {
  return useQuery('penugasan-penelitian', getPenugasanPenelitian, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePenugasanPenelitianByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['dokumen-pembelajaran-by-prodi', prodi],
    () => getPenugasanPenelitianByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPenelitianById = (id, options) => {
  return useQuery(
    ['penugasan-penelitian-by-id', id],
    () => getPenugasanPenelitianById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPenelitianBySuratPenugasan = (id, options) => {
  return useQuery(
    ['penugasan-penelitian-by-surat-penugasan', id],
    () => getPenugasanPenelitianBySuratPenugasan(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPenelitianByDosen = (id, options) => {
  return useQuery(
    ['penugasan-penelitian-by-dosen', id],
    () => getPenugasanPenelitianByDosen(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPenugasanPenelitian = () => {
  return useMutation(patchPenugasanPenelitian);
};

export const usePostPenugasanPenelitian = () => {
  return useMutation(postPenugasanPenelitian);
};

export const useDeletePenugasanPenelitian = () => {
  return useMutation(deletePenugasanPenelitian);
};
