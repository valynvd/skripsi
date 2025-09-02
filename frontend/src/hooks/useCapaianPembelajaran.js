import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';
import useAuth from './useAuth';

const url = '/api-stem/capaianpembelajaran/';

const getCapaianPembelajaran = () => {
  return request({
    url: url,
  });
};

const getCapaianPembelajaranById = (id) => {
  return request({
    url: `/api-stem/capaianpembelajaran/${id}/`,
  });
};

const getCapaianPembelajaranByProdi = (id) => {
  return request({
    url: `/api-stem/capaianpembelajaranbyprodi/${id}/`,
  });
};

const postCapaianPembelajaran = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteCapaianPembelajaran = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchCapaianPembelajaran = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useCapaianPembelajaranData = (options) => {
  return useQuery('capaian-pembelajaran', getCapaianPembelajaran, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useCapaianPembelajaranById = (id, options) => {
  return useQuery(
    ['capaian-pembelajaran-by-id', id],
    () => getCapaianPembelajaranById(id),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useCapaianPembelajaranByProdi = (options) => {
  const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

  return useQuery(
    ['capaian-pembelajaran-by-prodi', prodi],
    () => getCapaianPembelajaranByProdi(prodi),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const usePostCapaianPembelajaran = () => {
  return useMutation(postCapaianPembelajaran);
};

export const useDeleteCapaianPembelajaran = () => {
  return useMutation(deleteCapaianPembelajaran);
};

export const usePatchCapaianPembelajaran = () => {
  return useMutation(patchCapaianPembelajaran);
};

export const useCapaianPembelajaranDataViews = (options) => {
  return useQuery('capaian-pembelajarans', getCapaianPembelajaran, {
    refetchOnWindowFocus: false,
    select: (response) => {
      return response.data.map(({ id, kode, deskripsi }) => ({
        value: id,
        label: `${kode} - ${deskripsi}`,
      }));
    },
    ...options,
  });
};
