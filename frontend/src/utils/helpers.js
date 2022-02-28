import { AUTH } from './naming';

export const setStorageKey = (key, val) => {
  localStorage.setItem(key, JSON.stringify(val));
  return null;
};

export const getStorageKey = (key) => {
  const auth = JSON.parse(localStorage.getItem(key));
  if (auth) {
    return auth;
  }
  return null;
};

export const clearStorage = () => {
  localStorage.removeItem(AUTH);
};

export const getToken = () => {
  const oidc = getStorageKey(AUTH);
  if (oidc) {
    return oidc.auth_token;
  }
  return null;
};
