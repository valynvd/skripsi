import axios from 'axios';

const apiBaseUrl =
  process.env.REACT_APP_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:8000/`;

const client = axios.create({
  // baseURL: 'https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com',
  // baseURL: 'https://api-simantap.prasetiyamulya.ac.id/',
  baseURL: apiBaseUrl,
});

export const request = ({ ...options }) => {
  const userToken = localStorage.getItem('userToken');

  if (userToken) {
    client.defaults.headers.common.Authorization = 'Token ' + userToken;
  }

  return client(options);
};
