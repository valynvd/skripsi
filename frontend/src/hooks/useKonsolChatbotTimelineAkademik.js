import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = 'https://servermongostem.vercel.app/timelineakademik/';

const getKonsolChatbotTimeLineAkademik = () => {
    return request({
        url: url,
    });
};

const getKonsolChatbotTimeLineAkademikById = (id) => {
    return request({
        url: `https://servermongostem.vercel.app/timelineakademik/${id}/`,
    });
};

const postKonsolChatbotTimeLineAkademik = (data) => {
    return request({
      url: url,
      method: 'POST',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};

const deleteKonsolChatbotTimeLineAkademik = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchKonsolChatbotTimeLineAkademik = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'PATCH',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};    

export const useKonsolChatbotDataTimeLineAkademik = (options) => {
    return useQuery('konsol-chatbot-timeLineakademik', getKonsolChatbotTimeLineAkademik, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostKonsolChatbotTimeLineAkademik = () => {
    return useMutation(postKonsolChatbotTimeLineAkademik);
};

export const useDeleteKonsolChatbotTimeLineAkademik = () => {
    return useMutation(deleteKonsolChatbotTimeLineAkademik);
};

export const usePatchKonsolChatbotTimeLineAkademik = () => {
    return useMutation(patchKonsolChatbotTimeLineAkademik);
};

export const useKonsolChatbotTimeLineAkademikById = (id, options) => {
    return useQuery(['konsol-chatbot-timelineakademik-by-id', id], () => getKonsolChatbotTimeLineAkademikById(id), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };