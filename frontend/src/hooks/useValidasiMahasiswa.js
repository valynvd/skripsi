import { useEffect } from 'react';
import { request } from '../utils/axios-utils';
import { useQuery, useMutation, useQueryClient } from 'react-query';

const url = '/api-stem/validasimahasiswa/';
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

// const getValidasiMahasiswa = () => {
//     return request({
//         url: url,
//     });
// };
const getValidasiMahasiswa = () => {
  return request({
      url: url,
  })
  .then(response => {
      console.log("Response dari API:", response); // Tambahkan ini untuk memeriksa respons dari API
      return response;
  })
  .catch(error => {
      console.error("Error:", error);
      throw error;
  });
};


const getValidasiMahasiswaById = (id) => {
    return request({
        url: `/api-stem/validasimahasiswa/${id}/`,
    });
};

const getValidasiMahasiswaByNIM = (nim) => {
    return request({
      url: `/api-stem/validasimahasiswabynim/${nim}/`,
    });
  };

const postValidasiMahasiswa = (data) => {
    return request({
      url: url,
      method: 'post',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
};

const deleteValidasiMahasiswa = (data) => {
    return request({
      url: url + data + '/',
      method: 'delete',
    });
};

const patchValidasiMahasiswa = ({ data, id }) => {
    return request({
      url: url + id + '/',
      method: 'patch',
      data: data,
      headers: { 'Content-Type': 'multipart/form-data' },
    });
}; 

export const useValidasiMahasiswaData = (options) => {
    // return useQuery('data-master', getValidasiMahasiswa, {
      const query = useQuery('validasi-mahasiswa', getValidasiMahasiswa, {
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      staleTime: 0,
      ...options,
    });

    useEffect(() => {
      if (typeof window === 'undefined') {
        return undefined;
      }

      const handleRefresh = () => {
        query.refetch();
      };

      const handleStorageRefresh = (event) => {
        if (event.key === DEGREE_AUDIT_REFRESH_KEY) {
          query.refetch();
        }
      };

      window.addEventListener('storage', handleStorageRefresh);
      window.addEventListener(DEGREE_AUDIT_REFRESH_EVENT, handleRefresh);

      return () => {
        window.removeEventListener('storage', handleStorageRefresh);
        window.removeEventListener(DEGREE_AUDIT_REFRESH_EVENT, handleRefresh);
      };
    }, [query.refetch]);

    return query;
};

export const useValidasiMahasiswaDataByNIM = (nim, options) => {
    return useQuery(['validasi-mahasiswa-by-nim', nim], () => getValidasiMahasiswaByNIM(nim), {
      refetchOnWindowFocus: true,
      refetchOnMount: 'always',
      staleTime: 0,
      ...options,
    });
  };

export const useValidasiMahasiswaById = (id, options) => {
  return useQuery(['validasi-mahasiswa-by-id', id], () => getValidasiMahasiswaById(id), {
    refetchOnWindowFocus: true,
    refetchOnMount: 'always',
    staleTime: 0,
    ...options,
  });
};

// export const useValidasiMahasiswaByProdi = (options) => {
//     const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

//     return useQuery(['data-mahasiswa-by-prodi', prodi], () => getValidasiMahasiswaByProdi(prodi), {
//         refetchOnWindowFocus: false,
//         ...options,
//     });
// };

export const usePostValidasiMahasiswa = () => {
    const queryClient = useQueryClient();

    return useMutation(postValidasiMahasiswa, {
      onSuccess: () => {
        queryClient.invalidateQueries('data-master');
        queryClient.invalidateQueries('validasi-mahasiswa');
        broadcastDegreeAuditRefresh();
      },
    });
};

export const useDeleteValidasiMahasiswa = () => {
    const queryClient = useQueryClient();

    return useMutation(deleteValidasiMahasiswa, {
      onSuccess: () => {
        queryClient.invalidateQueries('data-master');
        queryClient.invalidateQueries('validasi-mahasiswa');
        broadcastDegreeAuditRefresh();
      },
    });
};

export const usePatchValidasiMahasiswa = () => {
    const queryClient = useQueryClient();

    return useMutation(patchValidasiMahasiswa, {
      onSuccess: () => {
        queryClient.invalidateQueries('data-master');
        queryClient.invalidateQueries('validasi-mahasiswa');
        broadcastDegreeAuditRefresh();
      },
    });
};
