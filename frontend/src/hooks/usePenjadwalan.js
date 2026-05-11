import { useMutation, useQuery } from 'react-query';

import { request } from '../utils/axios-utils';

const batchListUrl = '/penjadwalan/batches/';

const getBatches = () => {
  return request({
    url: batchListUrl,
    method: 'get',
  });
};

const getBatchDetail = (id) => {
  return request({
    url: `/penjadwalan/batches/${id}/`,
    method: 'get',
  });
};

const uploadExcelBatch = (data) => {
  return request({
    url: '/penjadwalan/batches/upload-excel/',
    method: 'post',
    headers: { 'Content-Type': 'multipart/form-data' },
    data,
  });
};

const regenerateBatch = (id) => {
  return request({
    url: `/penjadwalan/batches/${id}/regenerate/`,
    method: 'post',
  });
};

const updateJadwal = ({ id, data }) => {
  return request({
    url: `/penjadwalan/jadwal/${id}/`,
    method: 'patch',
    data,
  });
};

export const usePenjadwalanBatches = (options) => {
  return useQuery('penjadwalan-batches', getBatches, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePenjadwalanBatchDetail = (id, options) => {
  return useQuery(['penjadwalan-batch-detail', id], () => getBatchDetail(id), {
    enabled: !!id,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useUploadPenjadwalanExcel = () => {
  return useMutation(uploadExcelBatch);
};

export const useRegeneratePenjadwalanBatch = () => {
  return useMutation(regenerateBatch);
};

export const useUpdatePenjadwalanJadwal = () => {
  return useMutation(updateJadwal);
};
