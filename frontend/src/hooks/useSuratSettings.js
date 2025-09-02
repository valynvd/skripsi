import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/settings-surat/';

const postSuratSettings = (data) => {
  return request({
    url: url,
    method: 'post',
    // headers: { 'Content-Type': 'multipart/form-data' },
    headers: { 'Content-Type': 'application/json' },
    data: data,
  });
};

const deleteSuratSettings = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
    data: data,
  });
};

const patchSuratSettings = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
  });
};

const getSuratSettingsById = (id) => {
  return request({
    url: `/api-stem/settings-surat/${id}/`,
  });
};

const getSuratSettings = () => {
  return request({
    url: url,
  });
};

export const useSuratSettingsData = (options) => {
  return useQuery('surat-settings', getSuratSettings, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useSuratSettingsById = (id, options) => {
  return useQuery(
    ['surat-settings-by-id', id],
    () => getSuratSettingsById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

const getLatestSuratKeputusanAkreditasiProdi = (prodi) => {
  return request({
    url: `/api-stem/settings-surat/latest/?prodi=${prodi}`,
  });
};

export const useLatestSuratKeputusanAkreditasiProdi = (prodi, options) => {
  return useQuery(
    ['latest-surat-keputusan-akreditasi-prodi', prodi],
    () => getLatestSuratKeputusanAkreditasiProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePatchSuratSettings = () => {
  return useMutation(patchSuratSettings);
};

export const usePostSuratSettings = () => {
  return useMutation(postSuratSettings);
};

export const useDeleteSuratSettings = () => {
  return useMutation(deleteSuratSettings);
};
