import { get, post } from './base/index';
import {
  POINPENILAIAN, FOLDERBYMATRIX, FOLDERBYFOLDER, FOLDER,
} from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
  getFolderbyMatrix: (id) => get(`${FOLDERBYMATRIX}${id}`),
  getFolderbyFolder: (id) => get(`${FOLDERBYFOLDER}${id}`),
  postFolderFile: (body, params) => post(FOLDER, body, params),
  postMatrixPenilaian: (body, params) => post(POINPENILAIAN, body, params),
};
