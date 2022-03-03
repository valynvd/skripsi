import {
  get, post, deleteRequest, patch,
} from './base/index';
import {
  POINPENILAIAN,
  FOLDERBYMATRIX,
  FOLDERBYFOLDER,
  FOLDER,
  PENUGASANPENGAJARAN,
  EVALUASIPERKULIAHAN,
  PORTOFOLIOPERKULIAHAN,
} from './urls';

export default {
  getMatrixPenilaian: () => get(POINPENILAIAN),
  getEvaluasiPerkuliahan: () => get(EVALUASIPERKULIAHAN),
  getPenugasanPengajaran: () => get(PENUGASANPENGAJARAN),
  getPortofolioPerkuliahan: () => get(PORTOFOLIOPERKULIAHAN),
  getEvaluasiPerkuliahanbyId: (id) => get(`${EVALUASIPERKULIAHAN}${id}/`),
  getPortofolioPerkuliahanbyId: (id) => get(`${PORTOFOLIOPERKULIAHAN}${id}/`),
  getFolderbyMatrix: (id) => get(`${FOLDERBYMATRIX}${id}`),
  getFolderbyFolder: (id) => get(`${FOLDERBYFOLDER}${id}`),
  postMatrixPenilaian: (body, params) => post(POINPENILAIAN, body, params),
  postPenugasanPengajaran: (body, params) => post(PENUGASANPENGAJARAN, body, params),
  editPenugasanPengajaran: (id, body, params) => patch(`${PENUGASANPENGAJARAN}${id}/`, body, params),
  editEvaluasiPerkuliahan: (id, body, params) => patch(`${EVALUASIPERKULIAHAN}${id}/`, body, params),
  editPortofolioPerkuliahan: (id, body, params) => patch(`${PORTOFOLIOPERKULIAHAN}${id}/`, body, params),
  deletePenugasanPengajaran: (id) => deleteRequest(`${PENUGASANPENGAJARAN}${id}/`),
  deleteEvaluasiPerkuliahan: (id) => deleteRequest(`${EVALUASIPERKULIAHAN}${id}/`),
  deletePortofolioPerkuliahan: (id) => deleteRequest(`${PORTOFOLIOPERKULIAHAN}${id}/`),
  // CRUD for FileFolder
  getCurrentFileFolder: (id) => get(`${FOLDER}${id}/`),
  postFolderFile: (body, params) => post(FOLDER, body, params),
  deleteFileFolder: (id) => deleteRequest(`${FOLDER}${id}/`),
  editFolderFile: (id, body, params) => patch(`${FOLDER}${id}/`, body, params),
};
