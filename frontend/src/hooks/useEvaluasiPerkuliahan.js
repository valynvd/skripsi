import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';

const getEvaluasiPerkuliahan = () => {
  return request({
    url: '/api-stem/evaluasiperkulian/',
  });
};

export const useEvaluasiPerkuliahanData = (onSuccess, onError) => {
  return useQuery('evaluasi-perkuliahan', getEvaluasiPerkuliahan, {
    onSuccess,
    onError,
  });
};
