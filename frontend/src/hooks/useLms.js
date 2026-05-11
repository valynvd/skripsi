import { useQuery } from 'react-query';
import { request } from '../utils/axios-utils';

const getLmsAttendanceLatest = () =>
  request({
    url: '/api-stem/lms/attendance/latest/',
  });

const getLmsAttendanceLatestByProgram = (program) =>
  request({
    url: '/api-stem/lms/attendance/latest/',
    params: program && program !== 'all' ? { program } : undefined,
  });

const getLmsMaterialsLatest = () =>
  request({
    url: '/api-stem/lms/materials/latest/',
  });

const getLmsMaterialsLatestByProgram = (program) =>
  request({
    url: '/api-stem/lms/materials/latest/',
    params: program && program !== 'all' ? { program } : undefined,
  });

export const useLmsAttendanceLatest = (options) => {
  return useQuery(['lms-attendance-latest'], getLmsAttendanceLatest, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useLmsAttendanceLatestByProgram = (program, options) => {
  return useQuery(
    ['lms-attendance-latest', program || 'all'],
    () => getLmsAttendanceLatestByProgram(program),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};

export const useLmsMaterialsLatest = (options) => {
  return useQuery(['lms-materials-latest'], getLmsMaterialsLatest, {
    refetchOnWindowFocus: false,
    ...options,
  });
};

export const useLmsMaterialsLatestByProgram = (program, options) => {
  return useQuery(
    ['lms-materials-latest', program || 'all'],
    () => getLmsMaterialsLatestByProgram(program),
    {
      refetchOnWindowFocus: false,
      ...options,
    }
  );
};
