import { request } from '../utils/axios-utils';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const url = '/api-stem/monitoringmahasiswa/';
const DEGREE_AUDIT_REFRESH_KEY = 'simantap-degree-audit-refresh';
const DEGREE_AUDIT_REFRESH_EVENT = 'simantap-degree-audit-refresh-event';

const broadcastDegreeAuditRefresh = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEGREE_AUDIT_REFRESH_KEY, Date.now().toString());
    window.dispatchEvent(new Event(DEGREE_AUDIT_REFRESH_EVENT));
  } catch (error) {
    console.warn('Gagal broadcast refresh degree audit:', error);
  }
};

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
    const queryClient = useQueryClient();

    return useMutation(postMonitoringMahasiswa, {
      onSuccess: () => {
        queryClient.invalidateQueries('monitoring-mahasiswa');
        queryClient.invalidateQueries('validasi-mahasiswa');
        queryClient.invalidateQueries('transkrip-nilai');
        queryClient.invalidateQueries('data-master');
        broadcastDegreeAuditRefresh();
      },
    });
};

export const useDeleteMonitoringMahasiswa = () => {
    const queryClient = useQueryClient();

    return useMutation(deleteMonitoringMahasiswa, {
      onSuccess: () => {
        queryClient.invalidateQueries('monitoring-mahasiswa');
        queryClient.invalidateQueries('validasi-mahasiswa');
        queryClient.invalidateQueries('transkrip-nilai');
        queryClient.invalidateQueries('data-master');
        broadcastDegreeAuditRefresh();
      },
    });
};

export const usePatchMonitoringMahasiswa = () => {
    const queryClient = useQueryClient();

    return useMutation(patchMonitoringMahasiswa, {
      onSuccess: () => {
        queryClient.invalidateQueries('monitoring-mahasiswa');
        queryClient.invalidateQueries('validasi-mahasiswa');
        queryClient.invalidateQueries('transkrip-nilai');
        queryClient.invalidateQueries('data-master');
        broadcastDegreeAuditRefresh();
      },
    });
};
