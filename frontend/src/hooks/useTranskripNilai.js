import { request } from '../utils/axios-utils';
import { useQuery, useMutation } from 'react-query';

const url = '/api-stem/transkripnilai/';

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

const fetchData = async (nim) => {
  // Fetch data logic here
  const response = await fetch(`/api/transkrip/${nim}`);
  const data = await response.json();
  return data;
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
    return useQuery('data-master', getTranskripNilai, {
      refetchOnWindowFocus: false,
      ...options,
    });
};

export const useTranskripNilaiDataByNIM = (nim, options) => {
    return useQuery(['transkrip-nilai-by-nim', nim], () => getTranskripNilaiByNIM(nim), {
      refetchOnWindowFocus: false,
      ...options,
    });
  };

export const useTranskripNilaiDataByNIM2 = (nim) => {
  return useMutation(['transkrip-nilai-by-nim', nim], () => fetchData(nim), {
  });
};

export const useMonitoringMahasiswaDataByNIM = (nim, options) => {
  return useQuery(['monitoring-mahasiswa-by-nim', nim], () => getMonitoringMahasiswaByNIM(nim), {
    refetchOnWindowFocus: false,
    ...options,
  });
};

// export const useTranskripNilaiByProdi = (options) => {
//     const prodi = useAuth().auth.userData?.dosen_detail?.prodi;

//     return useQuery(['data-mahasiswa-by-prodi', prodi], () => getTranskripNilaiByProdi(prodi), {
//         refetchOnWindowFocus: false,
//         ...options,
//     });
// };

export const usePostTranskripNilai = () => {
    return useMutation(postTranskripNilai);
};

export const useDeleteTranskripNilai = () => {
    return useMutation(deleteTranskripNilai);
};

export const usePatchTranskripNilai = () => {
    return useMutation(patchTranskripNilai);
};