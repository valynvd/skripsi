import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = 'http://localhost:5050/seputarlms/';

const getKonsolChatbotSeputarLMS= () => {
    return request({
        url: url,
    });
};

const getKonsolChatbotSeputarLMSById = (id) => {
    return request({
        url: `http://localhost:5050/seputarlms/${id}/`,
    });
};

const postKonsolChatbotSeputarLMS= (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};

const deleteKonsolChatbotSeputarLMS = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchKonsolChatbotSeputarLMS = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};    

export const useKonsolChatbotDataSeputarLMS = (options) => {
    return useQuery('konsol-chatbot-seputarlms', getKonsolChatbotSeputarLMS, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostKonsolChatbotSeputarLMS = () => {
    return useMutation(postKonsolChatbotSeputarLMS);
};

export const useDeleteKonsolChatbotSeputarLMS = () => {
    return useMutation(deleteKonsolChatbotSeputarLMS);
};

export const usePatchKonsolChatbotSeputarLMS = () => {
    return useMutation(patchKonsolChatbotSeputarLMS);
};

export const useKonsolChatbotSeputarLMSById = (id, options) => {
    return useQuery(['konsol-chatbot-seputarlms-by-id', id], () => getKonsolChatbotSeputarLMSById(id), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };