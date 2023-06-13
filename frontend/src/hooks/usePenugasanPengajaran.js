import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/penugasanpengajaran/';

const postPenugasanPengajaran = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePenugasanPengajaran = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPenugasanPengajaran = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPenugasanPengajaran = () => {
  return request({
    url: url,
  });
};

const getPenugasanPengajaranBySuratPenugasan = (id) => {
  return request({
    url: `/api-stem/penugasanpengajaranbysuratpenugasan/${id}/`,
  });
};

const getPenugasanPengajaranById = (id) => {
  return request({
    url: `/api-stem/penugasanpengajaran/${id}/`,
  });
};

export const usePenugasanPengajaranData = (options) => {
  return useQuery('penugasan-pengajaran', getPenugasanPengajaran, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePenugasanPengajaranById = (id, options) => {
  return useQuery(
    ['penugasan-pengajaran-by-id', id],
    () => getPenugasanPengajaranById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePenugasanPengajaranBySuratPenugasan = (id, options) => {
  return useQuery(
    ['penugasan-pengajaran-by-surat-penugasan', id],
    () => getPenugasanPengajaranBySuratPenugasan(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPenugasanPengajaran = () => {
  return useMutation(patchPenugasanPengajaran);
};

export const usePostPenugasanPengajaran = () => {
  return useMutation(postPenugasanPengajaran);
};

export const useDeletePenugasanPengajaran = () => {
  return useMutation(deletePenugasanPengajaran);
};
