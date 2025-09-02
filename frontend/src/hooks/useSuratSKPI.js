import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/suratketeranganpendampingijazah/';

const getSKPI = () => {
  return request({
    url: url,
  });
};

const getSKPIByNIM = (nim) => {
  return request({
    url: `/api-stem/suratketeranganpendampingijazahbynim/${nim}/`,
  });
};

const createSuratKeterangan = (data) => {
  return request({
    url: `${url}create_if_not_exists/`,
    method: 'post',
    data: data,
  });
};

// const postSKPI = (data) => {
//   return request({
//     url: url,
//     method: 'post',
//     data: data,
//     headers: { 'Content-Type': 'multipart/form-data' },
//   });
// };

const patchSKPI = ({ data, nim }) => {
  return request({
    url: `/api-stem/suratketeranganpendampingijazah/update_by_nim/${nim}/`,
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useSKPIData = (options) => {
  return useQuery('skpi', getSKPI, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useSKPIDataByNIM = (nim, options) => {
  return useQuery(['skpi-by-nim', nim], () => getSKPIByNIM(nim), {
    // enabled: !!nim,
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCreateSuratKeterangan = () => {
  return useMutation(createSuratKeterangan);
};

export const useSKPIDataByNIM2 = () => {
  return useMutation(getSKPIByNIM);
};

// export const usePostSKPI = () => {
//   return useMutation(postSKPI);
// };

export const usePatchSKPI = () => {
  return useMutation(patchSKPI);
};
