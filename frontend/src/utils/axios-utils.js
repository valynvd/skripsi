import axios from 'axios';

const client = axios.create({
  baseURL: 'https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com',
});

export const request = ({ ...options }) => {
  const userToken = localStorage.getItem('userToken');

  if (userToken) {
    client.defaults.headers.common.Authorization = 'Token ' + userToken;
  }

  return client(options);
};
