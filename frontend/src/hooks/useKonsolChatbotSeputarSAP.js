import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = 'http://localhost:5050/seputarsap/';

const getKonsolChatbotSeputarSAP = () => {
    return request({
        url: url,
    });
};

const getKonsolChatbotSeputarSAPById = (id) => {
    return request({
        url: `http://localhost:5050/seputarsap/${id}/`,
    });
};

const postKonsolChatbotSeputarSAP = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};

const deleteKonsolChatbotSeputarSAP = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchKonsolChatbotSeputarSAP  = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'application/json' },
    });
};    

export const useKonsolChatbotDataSeputarSAP = (options) => {
    return useQuery('konsol-chatbot-seputarsap', getKonsolChatbotSeputarSAP, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const usePostKonsolChatbotSeputarSAP  = () => {
    return useMutation(postKonsolChatbotSeputarSAP );
};

export const useDeleteKonsolChatbotSeputarSAP  = () => {
    return useMutation(deleteKonsolChatbotSeputarSAP);
};

export const usePatchKonsolChatbotSeputarSAP = () => {
    return useMutation(patchKonsolChatbotSeputarSAP);
};

export const useKonsolChatbotSeputarSAPById = (id, options) => {
    return useQuery(['konsol-chatbot-seputarsap-by-id', id], () => getKonsolChatbotSeputarSAPById(id), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };