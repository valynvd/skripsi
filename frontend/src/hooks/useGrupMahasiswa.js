import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/grupmahasiswa/';

const getGrupMahasiswa = () => {
    return request({
        url: url,
    });
};

const postGrupMahasiswa = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteGrupMahasiswa = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchGrupMahasiswa = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
}; 

export const useGrupMahasiswaData = (options) => {
    return useQuery('grup-mahasiswa', getGrupMahasiswa, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostGrupMahasiswa = () => {
    return useMutation(postGrupMahasiswa);
};

export const useDeleteGrupMahasiswa = () => {
    return useMutation(deleteGrupMahasiswa);
};

export const usePatchGrupMahasiswa = () => {
    return useMutation(patchGrupMahasiswa);
};