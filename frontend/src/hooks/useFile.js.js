import { request } from '../utils/axios-utils';
import { useQuery } from 'react-query';
import { useMutation } from 'react-query';

const url = '/api-stem/file/';

const postFile = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteFile = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchFile = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const getFileById = (id) => {
  return request({
    url: `/api-stem/file/${id}/`,
  });
};

const getFile = () => {
  return request({
    url: url,
  });
};

export const useFileById = (id, options) => {
  return useQuery(['file-by-id', id], () => getFileById(id), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useFileData = (options) => {
  return useQuery('file', getFile, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const usePatchFile = () => {
  return useMutation(patchFile);
};

export const usePostFile = () => {
  return useMutation(postFile);
};

export const useDeleteFile = () => {
  return useMutation(deleteFile);
};
