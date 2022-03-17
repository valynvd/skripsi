const MODE = 'HTTPS'; // choose HTTP or HTTPS
export const HTTP_MODE = 'http://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/';
export const HTTPS_MODE = 'https://ec2-13-250-45-157.ap-southeast-1.compute.amazonaws.com/';
let BASE_URL;
if (MODE === 'HTTPS') {
  BASE_URL = HTTPS_MODE;
} else {
  BASE_URL = HTTP_MODE;
}
export const API = `${BASE_URL}api-stem`;
export const AUTH = `${BASE_URL}auth-stem`;
// AUTH
export const LOGIN = `${AUTH}/token/login/`;
export const LOGOUT = `${AUTH}/token/logout/`;
export const USERME = `${AUTH}/users/me/`;

// PRODI
export const KURIKULUM = `${API}/kurikulum/`;
export const MATAKULIAH = `${API}/matakuliah/`;
export const PROGRAMSTUDI = `${API}/programstudi/`;
export const DOSEN = `${API}/dosen/`;
export const SURATPENUGASAN = `${API}/suratpenugasan/`;
export const PENUGASANPENGAJARAN = `${API}/penugasanpengajaran/`;
export const EVALUASIPERKULIAHAN = `${API}/evaluasiperkulian/`;
export const PORTOFOLIOPERKULIAHAN = `${API}/portofolioperkuliahan/`;
// AKREDITASI
export const POINPENILAIAN = `${API}/poinpenilaian/`;
export const FOLDER = `${API}/filefolder/`;
export const FOLDERBYMATRIX = `${API}/folderbymatrix/`;
export const FOLDERBYFOLDER = `${API}/folderbyfolder/`;
export const FOLDERBYKRITERIA = `${API}/folderbykriteria/`;
export const KRITERIA = `${API}/kriteria/`;
