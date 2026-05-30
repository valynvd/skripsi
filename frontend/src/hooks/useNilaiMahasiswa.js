import { request } from '../utils/axios-utils';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const url = '/api-stem/nilaimahasiswa/';
const DEGREE_AUDIT_REFRESH_KEY = 'simantap-degree-audit-refresh';

const broadcastDegreeAuditRefresh = () => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(DEGREE_AUDIT_REFRESH_KEY, Date.now().toString());
  } catch (error) {
    console.warn('Gagal broadcast refresh degree audit:', error);
  }
};

const getNilaiMahasiswa = () => {
  return request({
    url: url,
  });
};

const getNilaiMahasiswaByNIM = (nim) => {
  return request({
    url: `/api-stem/nilaimahasiswabynim/${nim}/`,
  });
};

const getNilaiMahasiswaByKodeMataKuliah = (kodematkul) => {
  return request({
    url: `/api-stem/nilaimahasiswabymatakuliah/${kodematkul}/`,
  });
};

// const getNilaiMahasiswaByNoGraded = () => {
//   return request({
//     url: `/api-stem/nilaimahasiswabynograded/`,
//   });
// };

// const getNilaiMahasiswaByNoGradedKodeMataKuliah = (kodematkul) => {
//   return request({
//     url: `/api-stem/nilaimahasiswabynogradedkodematakuliah/${kodematkul}/`,
//   });
// };

const postNilaiMahasiswa = ({ data, signal }) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
    signal,
  });
};

const deleteNilaiMahasiswa = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchNilaiMahasiswa = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useNilaiMahasiswaData = (options) => {
  return useQuery('nilai-mahasiswa', getNilaiMahasiswa, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

// export const useNilaiMahasiswaDataByNoGraded = (options) => {
//   return useQuery('nilai-mahasiswa-by-nograded', getNilaiMahasiswaByNoGraded, {
//     refetchOnWindowFocus: false,
//     ...options,
//   });
// };

export const useNilaiMahasiswaDataByNIM = (nim, options) => {
  return useQuery(
    ['nilai-mahasiswa-by-nim', nim],
    () => getNilaiMahasiswaByNIM(nim),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useNilaiMahasiswaDataByKodeMataKuliah = (kodematkul, options) => {
  return useQuery(
    ['nilai-mahasiswa-by-kodematkul', kodematkul],
    () => getNilaiMahasiswaByKodeMataKuliah(kodematkul),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

// export const useMonitoringMahasiswaDataByNoGradedKodeMataKuliah = (kodematkul, options) => {
//   return useQuery(['nilai-mahasiswa-by-nograded-kodematkul', kodematkul], () => getNilaiMahasiswaByNoGradedKodeMataKuliah(kodematkul), {
//     refetchOnWindowFocus: false,
//     ...options,
//   });
// };

// export const useMonitoringMahasiswaByProdi = (options) => {
//     const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

//     return useQuery(['data-mahasiswa-by-prodi', prodi], () => getNilaiMahasiswaByProdi(prodi), {
//         refetchOnWindowFocus: false,
//         ...options,
//     });
// };

export const useNilaiMahasiswaDataByNIM2 = () => {
  return useMutation(getNilaiMahasiswaByNIM);
};

export const usePostNilaiMahasiswa = () => {
  const queryClient = useQueryClient();

  return useMutation(postNilaiMahasiswa, {
    onSuccess: () => {
      queryClient.invalidateQueries('data-master');
      queryClient.invalidateQueries('nilai-mahasiswa');
      queryClient.invalidateQueries('transkrip-nilai');
      queryClient.invalidateQueries('monitoring-mahasiswa');
      queryClient.invalidateQueries('validasi-mahasiswa');
      broadcastDegreeAuditRefresh();
    },
  });
};

export const useDeleteNilaiMahasiswa = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteNilaiMahasiswa, {
    onSuccess: () => {
      queryClient.invalidateQueries('data-master');
      queryClient.invalidateQueries('nilai-mahasiswa');
      queryClient.invalidateQueries('transkrip-nilai');
      queryClient.invalidateQueries('monitoring-mahasiswa');
      queryClient.invalidateQueries('validasi-mahasiswa');
      broadcastDegreeAuditRefresh();
    },
  });
};

export const usePatchNilaiMahasiswa = () => {
  const queryClient = useQueryClient();

  return useMutation(patchNilaiMahasiswa, {
    onSuccess: () => {
      queryClient.invalidateQueries('data-master');
      queryClient.invalidateQueries('nilai-mahasiswa');
      queryClient.invalidateQueries('transkrip-nilai');
      queryClient.invalidateQueries('monitoring-mahasiswa');
      queryClient.invalidateQueries('validasi-mahasiswa');
      broadcastDegreeAuditRefresh();
    },
  });
};
