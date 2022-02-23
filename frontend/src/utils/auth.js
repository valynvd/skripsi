import { post } from './base/index';
import { LOGIN } from './urls';

export default {
  postLogIn: (body, params) => post(LOGIN, body, params),
};
