import { get } from './base/index';
import { POINPENILAIAN, FOLDERBYMATRIX, FOLDERBYFOLDER } from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
  getFolderbyMatrix: (id) => get(`${FOLDERBYMATRIX}${id}`),
  getFolderbyFolder: (id) => get(`${FOLDERBYFOLDER}${id}`),
};
