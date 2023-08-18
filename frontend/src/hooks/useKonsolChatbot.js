import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = 'https://servermongostem.vercel.app/pertanyaanumum/';

const getKonsolChatbot = () => {
    return request({
        url: url,
    });
};

const postKonsolChatbot = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteKonsolChatbot = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchKonsolChatbot = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};    

export const useKonsolChatbotData = (options) => {
    return useQuery('konsol-chatbot', getKonsolChatbot, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostKonsolChatbot = () => {
    return useMutation(postKonsolChatbot);
};

export const useDeleteKonsolChatbot = () => {
    return useMutation(deleteKonsolChatbot);
};

export const usePatchKonsolChatbot = () => {
    return useMutation(patchKonsolChatbot);
};