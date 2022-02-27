import axios from 'axios';
import { getToken } from '../helpers';

export const defaultParams = () => ({
  headers: { Authorization: `Token ${getToken()}` },
});

export default axios;
