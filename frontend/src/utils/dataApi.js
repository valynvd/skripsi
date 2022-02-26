import { get } from './base/index';
import { POINPENILAIAN } from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
};
