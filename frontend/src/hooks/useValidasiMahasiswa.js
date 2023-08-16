import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/validasimahasiswa/';

const getValidasiMahasiswa = () => {
    return request({
        url: url,
    });
};

// const getValidasiMahasiswaById = (id) => {
//     return request({
//         url: `/api-stem/datamahasiswa/${id}/`,
//     });
// };

const getValidasiMahasiswaByNIM = (nim) => {
    return request({
      url: `/api-stem/monitoringmahasiswabynim/${nim}/`,
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
    return useQuery('data-master', getValidasiMahasiswa, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const useValidasiMahasiswaDataByNIM = (nim, options) => {
    return useQuery(['validasi-mahasiswa-by-nim', nim], () => getValidasiMahasiswaByNIM(nim), {
      refetchOnWindowFocus: false,
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
    return useMutation(postValidasiMahasiswa);
};

export const useDeleteValidasiMahasiswa = () => {
    return useMutation(deleteValidasiMahasiswa);
};

export const usePatchValidasiMahasiswa = () => {
    return useMutation(patchValidasiMahasiswa);
};