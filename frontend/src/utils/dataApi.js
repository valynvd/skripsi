import { get } from './base/index';
import { POINPENILAIAN, FOLDER1BYMATRIX } from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
  getFolder1byMatrix: (id) => get(`${FOLDER1BYMATRIX}${id}`),
};
