import {
  get, post, deleteRequest, patch,
} from './base/index';
import {
  POINPENILAIAN, FOLDERBYMATRIX, FOLDERBYFOLDER, FOLDER, PENUGASANPENGAJARAN, EVALUASIPERKULIAHAN,
} from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
  getEvaluasiPerkuliahan: () => get(EVALUASIPERKULIAHAN),
  getPenugasanPengajaran: () => get(PENUGASANPENGAJARAN),
  getEvaluasiPerkuliahanbyId: (id) => get(`${EVALUASIPERKULIAHAN}${id}/`),
  getFolderbyMatrix: (id) => get(`${FOLDERBYMATRIX}${id}`),
  getFolderbyFolder: (id) => get(`${FOLDERBYFOLDER}${id}`),
  postMatrixPenilaian: (body, params) => post(POINPENILAIAN, body, params),
  postPenugasanPengajaran: (body, params) => post(PENUGASANPENGAJARAN, body, params),
  editEvaluasiPerkuliahan: (id, body, params) => patch(`${EVALUASIPERKULIAHAN}${id}/`, body, params),
  deleteEvaluasiPerkuliahan: (id) => deleteRequest(`${EVALUASIPERKULIAHAN}${id}/`),
  // CRUD for FileFolder
  getCurrentFileFolder: (id) => get(`${FOLDER}${id}/`),
  postFolderFile: (body, params) => post(FOLDER, body, params),
  deleteFileFolder: (id) => deleteRequest(`${FOLDER}${id}/`),
  editFolderFile: (id, body, params) => patch(`${FOLDER}${id}/`, body, params),
};
