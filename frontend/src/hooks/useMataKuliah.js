import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/matakuliah/';

const postMataKuliah = (data) => {
  return request({
    url: url,
    method: 'post',
    // headers: { 'Content-Type': 'multipart/form-data' },
    headers: { 'Content-Type': 'application/json' },
    data: data,
  });
};

const deleteMataKuliah = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchMataKuliah = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getMataKuliah = () => {
  return request({
    url: url,
  });
};

const getMataKuliahById = (id) => {
  return request({
    url: `/api-stem/matakuliah/${id}/`,
  });
};

export const useMataKuliahData = (options) => {
  return useQuery('mata-kuliah', getMataKuliah, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useMataKuliahById = (id, options) => {
  return useQuery(['mata-kuliah-by-id', id], () => getMataKuliahById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchMataKuliah = () => {
  return useMutation(patchMataKuliah);
};

export const usePostMataKuliah = () => {
  return useMutation(postMataKuliah);
};

export const useDeleteMataKuliah = () => {
  return useMutation(deleteMataKuliah);
};

// ======================
// ======================
// IMPLEMENTASI KURIKULUM
const implementasi_kurikulum_url = '/api-stem/implementasikurikulum/';

const postImplementasiKurikulum = (data) => {
  return request({
    url: implementasi_kurikulum_url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deleteImplementasiKurikulum = (data) => {
  return request({
    url: implementasi_kurikulum_url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchImplementasiKurikulum = ({ data, id }) => {
  return request({
    url: implementasi_kurikulum_url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getImplementasiKurikulum = () => {
  return request({
    url: implementasi_kurikulum_url,
  });
};

const getImplementasiKurikulumById = (id) => {
  return request({
    url: `/api-stem/implementasikurikulum/${id}/`,
  });
};

const getImplementasiKurikulumByProdi = (prodiId) => {
  return request({
    url: `/api-stem/implementasikurikulumbyprodi/${prodiId}/`,
  });
};

export const useImplementasiKurikulumByProdi = (prodiId, options) => {
  // const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['implementasi-kurikulum-by-prodi', prodiId],
    () => getImplementasiKurikulumByProdi(prodiId),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useImplementasiKurikulum = (options) => {
  return useQuery('implementasi-kurikulum', getImplementasiKurikulum, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useImplementasiKurikulumById = (id, options) => {
  return useQuery(
    ['implementasi-kurikulum-by-id', id],
    () => getImplementasiKurikulumById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchImplementasiKurikulum = () => {
  return useMutation(patchImplementasiKurikulum);
};

export const usePostImplementasiKurikulum = () => {
  return useMutation(postImplementasiKurikulum);
};

export const useDeleteImplementasiKurikulum = () => {
  return useMutation(deleteImplementasiKurikulum);
};

const getImplementasiKurikulumData = () => {
  return request({
    url: implementasi_kurikulum_url,
    method: 'get',
    headers: { 'Content-Type': 'application/json' },
  });
};

// Hooks for fetching and manipulating MataKuliah data
export const useImplementasiKurikulumData = (options) => {
  return useQuery('implementasi-kurikulum-data', getImplementasiKurikulumData, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

// FORM CREATE
const url_form = '/api-stem/form-create/';

const postFormCreateMataKuliah = (data) => {
  return request({
    url: url_form,
    method: 'post',
    // headers: { 'Content-Type': 'multipart/form-data' },
    headers: { 'Content-Type': 'application/json' },
    data: data,
  });
};

const patchFormCreateMataKuliah = ({ id, data }) => {
  return request({
    url: `/api-stem/form-create/${id}/`,
    method: 'patch',
    headers: { 'Content-Type': 'application/json' },
    data: data,
  });
};

export const usePostFormCreateMataKuliah = () => {
  return useMutation(postFormCreateMataKuliah);
};

export const usePatchFormCreateMataKuliah = () => {
  return useMutation(patchFormCreateMataKuliah);
};
