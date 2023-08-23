import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/penugasanpengajaranbyexcel/';

const postPenugasanPengajaranByExcel = (data) => {
  return request({
    url: url,
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data: data,
  });
};

const deletePenugasanPengajaranByExcel  = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchPenugasanPengajaranByExcel = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getPenugasanPengajaranByExcel = () => {
  return request({
    url: url,
  });
};


const getPenugasanPengajaranByExcelById = (id) => {
  return request({
    url: `/api-stem/penugasanpengajaran/${id}/`,
  });
};

export const usePenugasanPengajaranByExcelData = (options) => {
  return useQuery('penugasan-pengajaran', getPenugasanPengajaranByExcel, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePenugasanPengajaranByExcelById = (id, options) => {
  return useQuery(
    ['penugasan-pengajaran-by-id', id],
    () => getPenugasanPengajaranByExcelById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchPenugasanPengajaranByExcel = () => {
  return useMutation(patchPenugasanPengajaranByExcel);
};

export const usePostPenugasanPengajaranByExcel = () => {
  return useMutation(postPenugasanPengajaranByExcel);
};

export const useDeletePenugasanPengajaranByExcel = () => {
  return useMutation(deletePenugasanPengajaranByExcel);
};
