import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/dokumenpembelajaran/';
const urlRiwayatDokumenPembelajaran = '/api-stem/riwayatdokumenpembelajaran/';

const getDokumenPembelajaran = () => {
  return request({
    url: url,
  });
};

const postDokumenPembelajaran = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteDokumenPembelajaran = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchDokumenPembelajaran = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const postRiwayatDokumenPembelajaran = (data) => {
  return request({
    url: urlRiwayatDokumenPembelajaran,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteRiwayatDokumenPembelajaran = (data) => {
  return request({
    url: urlRiwayatDokumenPembelajaran + data + '/',
    method: 'delete',
  });
};

const patchRiwayatDokumenPembelajaran = ({ data, id }) => {
  return request({
    url: urlRiwayatDokumenPembelajaran + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getDokumenPembelajaranByDosen = (id) => {
  return request({
    url: `/api-stem/dokumenpembelajaranbydosen/${id}/`,
  });
};

const getDokumenPembelajaranById = (id) => {
  return request({
    url: `/api-stem/dokumenpembelajaran/${id}/`,
  });
};

const getDokumenPembelajaranByProdi = (id) => {
  return request({
    url: `/api-stem/dokumenpembelajaranbyprodi/${id}/`,
  });
};

const getRiwayatDokumenPembelajaranByDokumenPembelajaran = (id) => {
  return request({
    url: `/api-stem/riwayatdokumenpembelajaranbydokumenpembelajaran/${id}/`,
  });
};

export const useDokumenPembelajaranData = (options) => {
  return useQuery('dokumen-pembelajaran', getDokumenPembelajaran, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useDokumenPembelajaranByDosen = (options) => {
  const {
    auth: {
      userData: { id },
    },
  } = useAuth();

  return useQuery(
    ['dokumen-pembelajaran-by-dosen', id],
    () => getDokumenPembelajaranByDosen(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useDokumenPembelajaranById = (id, options) => {
  return useQuery(
    ['dokumen-pembelajaran-by-id', id],
    () => getDokumenPembelajaranById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useDokumenPembelajaranByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['dokumen-pembelajaran-by-prodi', prodi],
    () => getDokumenPembelajaranByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useRiwayatDokumenPembelajaranByDokumenPembelajaran = (
  id,
  options
) => {
  return useQuery(
    ['penugasan-pengajaran-by-surat-penugasan', id],
    () => getRiwayatDokumenPembelajaranByDokumenPembelajaran(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchDokumenPembelajaran = () => {
  return useMutation(patchDokumenPembelajaran);
};

export const usePostDokumenPembelajaran = () => {
  return useMutation(postDokumenPembelajaran);
};

export const useDeleteDokumenPembelajaran = () => {
  return useMutation(deleteDokumenPembelajaran);
};

export const usePatchRiwayatDokumenPembelajaran = () => {
  return useMutation(patchRiwayatDokumenPembelajaran);
};

export const usePostRiwayatDokumenPembelajaran = () => {
  return useMutation(postRiwayatDokumenPembelajaran);
};

export const useDeleteRiwayatDokumenPembelajaran = () => {
  return useMutation(deleteRiwayatDokumenPembelajaran);
};
