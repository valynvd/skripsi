import { request } from '../utils/axios-utils';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const url = '/api-stem/transkripnilai/';
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

const getTranskripNilai = () => {
  return request({
    url: url,
  });
};

const getTranskripNilaiByNIM = (nim) => {
  return request({
    url: `/api-stem/transkripnilaibynim/${nim}/`,
  });
};

const getMonitoringMahasiswaByNIM = (nim) => {
  return request({
    url: `/api-stem/monitoringmahasiswabynim/${nim}/`,
  });
};

const postTranskripNilai = (data) => {
  return request({
    url: url,
    method: 'post',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

const deleteTranskripNilai = (data) => {
  return request({
    url: url + data + '/',
    method: 'delete',
  });
};

const patchTranskripNilai = ({ data, id }) => {
  return request({
    url: url + id + '/',
    method: 'patch',
    data: data,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const useTranskripNilaiData = (options) => {
  return useQuery('transkrip-nilai', getTranskripNilai, {
    // return useQuery('data-master', getTranskripNilai, {
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
    ...options,
  });
};

export const useTranskripNilaiDataByNIM = (nim, options) => {
  return useQuery(
    ['transkrip-nilai-by-nim', nim],
    () => getTranskripNilaiByNIM(nim),
    {
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      staleTime: 0,
      ...options,
    }
  );
};

export const useMonitoringMahasiswaDataByNIM = (nim, options) => {
  return useQuery(
    ['monitoring-mahasiswa-by-nim', nim],
    () => getMonitoringMahasiswaByNIM(nim),
    {
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      staleTime: 0,
      ...options,
    }
  );
};

// export const useTranskripNilaiByProdi = (options) => {
//     const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

//     return useQuery(['data-mahasiswa-by-prodi', prodi], () => getTranskripNilaiByProdi(prodi), {
//         refetchOnWindowFocus: false,
//         ...options,
//     });
// };

export const useTranskripNilaiDataByNIM2 = () => {
  return useMutation(getTranskripNilaiByNIM);
};

export const usePostTranskripNilai = () => {
  const queryClient = useQueryClient();

  return useMutation(postTranskripNilai, {
    onSuccess: () => {
      queryClient.invalidateQueries('transkrip-nilai');
      queryClient.invalidateQueries('validasi-mahasiswa');
      queryClient.invalidateQueries('monitoring-mahasiswa');
      queryClient.invalidateQueries('data-master');
      broadcastDegreeAuditRefresh();
    },
  });
};

export const useDeleteTranskripNilai = () => {
  const queryClient = useQueryClient();

  return useMutation(deleteTranskripNilai, {
    onSuccess: () => {
      queryClient.invalidateQueries('transkrip-nilai');
      queryClient.invalidateQueries('validasi-mahasiswa');
      queryClient.invalidateQueries('monitoring-mahasiswa');
      queryClient.invalidateQueries('data-master');
      broadcastDegreeAuditRefresh();
    },
  });
};

export const usePatchTranskripNilai = () => {
  const queryClient = useQueryClient();

  return useMutation(patchTranskripNilai, {
    onSuccess: () => {
      queryClient.invalidateQueries('transkrip-nilai');
      queryClient.invalidateQueries('validasi-mahasiswa');
      queryClient.invalidateQueries('monitoring-mahasiswa');
      queryClient.invalidateQueries('data-master');
      broadcastDegreeAuditRefresh();
    },
  });
};
