import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';

const getMatriksPenilaianByProdi = (id) => {
  return request({
    url: `/api-stem/matrikspenilaianbyprodi/${id}/`,
  });
};

export const useMatriksPenilaianByProdi = (id, options) => {
  return useQuery(
    ['matriks-penilaian-by-id', id],
    () => getMatriksPenilaianByProdi(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};
