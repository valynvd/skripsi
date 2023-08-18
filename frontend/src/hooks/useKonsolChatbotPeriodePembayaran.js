import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = 'https://servermongostem.vercel.app/periodepembayaran/';

const getKonsolChatbotPeriodePembayaran = () => {
    return request({
        url: url,
    });
};

const getKonsolChatbotPeriodePembayaranById = (id) => {
    return request({
        url: `https://servermongostem.vercel.app/periodepembayaran/${id}/`,
    });
};

const postKonsolChatbotPeriodePembayaran  = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};

const deleteKonsolChatbotPeriodePembayaran  = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchKonsolChatbotPeriodePembayaran  = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};    

export const useKonsolChatbotDataPeriodePembayaran = (options) => {
    return useQuery('konsol-chatbot-periodepembayaran', getKonsolChatbotPeriodePembayaran, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostKonsolChatbotPeriodePembayaran  = () => {
    return useMutation(postKonsolChatbotPeriodePembayaran );
};

export const useDeleteKonsolChatbotPeriodePembayaran  = () => {
    return useMutation(deleteKonsolChatbotPeriodePembayaran );
};

export const usePatchKonsolChatbotPeriodePembayaran  = () => {
    return useMutation(patchKonsolChatbotPeriodePembayaran );
};

export const useKonsolChatbotPeriodePembayaranById = (id, options) => {
    return useQuery(['konsol-chatbot-periodepembayaran-by-id', id], () => getKonsolChatbotPeriodePembayaranById(id), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };