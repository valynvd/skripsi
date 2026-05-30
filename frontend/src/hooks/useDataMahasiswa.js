import { useEffect } from 'react';
import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/datamahasiswa/';
const DEGREE_AUDIT_REFRESH_KEY = 'simantap-degree-audit-refresh';

const getDataMahasiswa = () => {
    return request({
        url: url,
    });
};

const getDataMahasiswaById = (id) => {
    return request({
        url: `/api-stem/datamahasiswa/${id}/`,
    });
};

const getDataMahasiswaByProdi = (id) => {
    return request({
      url: `/api-stem/datamahasiswabyprodi/${id}/`,
    });
  };

const postDataMahasiswa = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteDataMahasiswa = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchDataMahasiswa = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
}; 

export const useDataMahasiswaData = (options) => {
    const query = useQuery('data-master', getDataMahasiswa, {
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      staleTime: 0,
      ...options,
    });

    useEffect(() => {
      const handleStorageChange = (event) => {
        if (event.key === DEGREE_AUDIT_REFRESH_KEY) {
          query.refetch();
        }
      };

      window.addEventListener('storage', handleStorageChange);
      return () => window.removeEventListener('storage', handleStorageChange);
    }, [query]);

    return query;
};

export const useDataMahasiswaById = (id, options) => {
    return useQuery(['data-mahasiswa-by-id', id], () => getDataMahasiswaById(id), {
      refetchOnWindowFocus: true,
      ...options,
    });
  };

export const useDataMahasiswaByProdi = (options) => {
    const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

    return useQuery(['data-mahasiswa-by-prodi', prodi], () => getDataMahasiswaByProdi(prodi), {
        refetchOnWindowFocus: true,
        ...options,
    });
};

export const usePostDataMahasiswa = () => {
    return useMutation(postDataMahasiswa);
};

export const useDeleteDataMahasiswa = () => {
    return useMutation(deleteDataMahasiswa);
};

export const usePatchDataMahasiswa = () => {
    return useMutation(patchDataMahasiswa);
};
