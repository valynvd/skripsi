import {
  get, post, deleteRequest, patch,
} from './base/index';
import {
  POINPENILAIAN, FOLDERBYMATRIX, FOLDERBYFOLDER, FOLDER,
} from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
  getFolderbyMatrix: (id) => get(`${FOLDERBYMATRIX}${id}`),
  getFolderbyFolder: (id) => get(`${FOLDERBYFOLDER}${id}`),
  postMatrixPenilaian: (body, params) => post(POINPENILAIAN, body, params),
  // CRUD for FileFolder
  getCurrentFileFolder: (id) => get(`${FOLDER}${id}/`),
  postFolderFile: (body, params) => post(FOLDER, body, params),
  deleteFileFolder: (id) => deleteRequest(`${FOLDER}${id}/`),
  editFolderFile: (id, body, params) => patch(`${FOLDER}${id}/`, body, params),
};
