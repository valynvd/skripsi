import { post, get } from './base/index';
import { LOGIN, USERME } from './urls';

export default {
  postLogIn: (body, params) => post(LOGIN, body, params),
  getUserDetail: () => get(USERME),
};
