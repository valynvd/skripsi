import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/profillulusan/';

const getProfilLulusan = () => {
  return request({
    url: url,
  });
};

const getProfilLulusanById = (id) => {
  return request({
    url: `/api-stem/profillulusan/${id}/`,
  });
};

const getProfilLulusanByProdi = (id) => {
  return request({
    url: `/api-stem/profillulusanbyprodi/${id}/`,
  });
};

const postProfilLulusan = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteProfilLulusan = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchProfilLulusan = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useProfilLulusanData = (options) => {
  // return useQuery('data-master', getProfilLulusan, {
  return useQuery('profil-lulusan', getProfilLulusan, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useProfilLulusanById = (id, options) => {
  return useQuery(
    ['profil-lulusan-by-id', id],
    () => getProfilLulusanById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useProfilLulusanByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['profil-lulusan-by-prodi', prodi],
    () => getProfilLulusanByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePostProfilLulusan = () => {
  return useMutation(postProfilLulusan);
};

export const useDeleteProfilLulusan = () => {
  return useMutation(deleteProfilLulusan);
};

export const usePatchProfilLulusan = () => {
  return useMutation(patchProfilLulusan);
};
