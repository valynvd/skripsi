import axios from 'axios';
import { getToken } from '../helpers';

export const defaultParams = () => {
  const token = getToken();
  if (token) {
    return ({
      headers: { Authorization: `Token ${getToken()}` },
    });
  }
  return ({});
};

export default axios;
