import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/broadcastpesan/';

const getBroadcastPesan = () => {
    return request({
        url: url,
    });
};

const postBroadcastPesan = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteBroadcastPesan = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchBroadcastPesan = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
}; 

export const useBroadcastPesanData = (options) => {
    return useQuery('konsol-chatbot', getBroadcastPesan, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostBroadcastPesan = () => {
    return useMutation(postBroadcastPesan);
};

export const useDeleteBroadcastPesan = () => {
    return useMutation(deleteBroadcastPesan);
};

export const usePatchBroadcastPesan = () => {
    return useMutation(patchBroadcastPesan);
};