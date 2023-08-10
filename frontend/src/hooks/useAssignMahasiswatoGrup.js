import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/assignmahasiswatogrupbynamagrup/';

const getAssignMahasiswatoGrup = () => {
    return request({
        url: url,
    });
};

const getAssignMahasiswatoGrupByNamaGrup = (assignMahasiswaGrupName) => {
    return request({
        url: `/api-stem/assignmahasiswatogrupbynamagrup/${assignMahasiswaGrupName}/`,
    });
};

const postAssignMahasiswatoGrup = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteAssignMahasiswatoGrup = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchAssignMahasiswatoGrup = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
}; 

export const useAssignMahasiswatoGrupData = (options) => {
    return useQuery('pengaturan-grup', getAssignMahasiswatoGrup, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const useAssignMahasiswatoGrupByNamaGrup = (assignMahasiswaGrupName, options) => {
    return useQuery(['pengaturan-grup-by-id', assignMahasiswaGrupName], () => getAssignMahasiswatoGrupByNamaGrup(assignMahasiswaGrupName), {
        refetchOnWindowFocus: false,
        ...options,
      });
};

export const usePostAssignMahasiswatoGrup = () => {
    return useMutation(postAssignMahasiswatoGrup);
};

export const useDeleteAssignMahasiswatoGrup = () => {
    return useMutation(deleteAssignMahasiswatoGrup);
};

export const usePatchAssignMahasiswatoGrup = () => {
    return useMutation(patchAssignMahasiswatoGrup);
};