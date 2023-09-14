import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/monitoringmahasiswa/';

const getMonitoringMahasiswa = () => {
    return request({
        url: url,
    });
};

const getMonitoringMahasiswaByNIM = (nim) => {
  return request({
    url: `/api-stem/monitoringmahasiswabynim/${nim}/`,
  });
};

const getMonitoringMahasiswaByKodeMataKuliah = (kodematkul) => {
  return request({
    url: `/api-stem/monitoringmahasiswabymatakuliah/${kodematkul}/`,
  });
};

const getMonitoringMahasiswaByNoGraded = () => {
  return request({
    url: `/api-stem/monitoringmahasiswabynograded/`,
  });
};

const getMonitoringMahasiswaByNoGradedKodeMataKuliah = (kodematkul) => {
  return request({
    url: `/api-stem/monitoringmahasiswabynogradedkodematakuliah/${kodematkul}/`,
  });
};

const postMonitoringMahasiswa = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteMonitoringMahasiswa = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchMonitoringMahasiswa = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
}; 

export const useMonitoringMahasiswaData = (options) => {
    return useQuery('monitoring-mahasiswa', getMonitoringMahasiswa, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const useMonitoringMahasiswaDataByNoGraded = (options) => {
  return useQuery('monitoring-mahasiswa-by-nograded', getMonitoringMahasiswaByNoGraded, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useMonitoringMahasiswaDataByNIM = (nim, options) => {
  return useQuery(['monitoring-mahasiswa-by-nim', nim], () => getMonitoringMahasiswaByNIM(nim), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

  export const useMonitoringMahasiswaDataByKodeMataKuliah = (kodematkul, options) => {
    return useQuery(['monitoring-mahasiswa-by-kodematkul', kodematkul], () => getMonitoringMahasiswaByKodeMataKuliah(kodematkul), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };

  export const useMonitoringMahasiswaDataByNoGradedKodeMataKuliah = (kodematkul, options) => {
    return useQuery(['monitoring-mahasiswa-by-nograded-kodematkul', kodematkul], () => getMonitoringMahasiswaByNoGradedKodeMataKuliah(kodematkul), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };

// export const useMonitoringMahasiswaByProdi = (options) => {
//     const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

//     return useQuery(['data-mahasiswa-by-prodi', prodi], () => getMonitoringMahasiswaByProdi(prodi), {
//         refetchOnWindowFocus: false,
//         ...options,
//     });
// };

export const useMonitoringMahasiswaDataByNIM2 = () => {
  return useMutation(getMonitoringMahasiswaByNIM);
};

export const usePostMonitoringMahasiswa = () => {
    return useMutation(postMonitoringMahasiswa);
};

export const useDeleteMonitoringMahasiswa = () => {
    return useMutation(deleteMonitoringMahasiswa);
};

export const usePatchMonitoringMahasiswa = () => {
    return useMutation(patchMonitoringMahasiswa);
};