import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import useAuth from './useAuth';

const getEvaluasiPerkuliahan = () => {
  return request({
    url: '/api-stem/evaluasiperkuliahan/',
  });
};

const getEvaluasiPerkuliahanByDosen = (id) => {
  return request({
    url: `/api-stem/evaluasiperkuliahanbydosen/${id}`,
  });
};

export const useEvaluasiPerkuliahanData = () => {
  return useQuery('evaluasi-perkuliahan', getEvaluasiPerkuliahan, {
    refetchOnWindowFocus: false,
  });
};

export const useEvaluasiPerkuliahanByDosen = () => {
  const {
    auth: { id },
  } = useAuth();

  return useQuery(
    'evaluasi-perkuliahan-dosen',
    getEvaluasiPerkuliahanByDosen(id),
    {
      refetchOnWindowFocus: false,
    }
  );
};
