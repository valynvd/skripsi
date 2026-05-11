import React, { useEffect, useMemo, useState } from 'react';
import { BiX } from 'react-icons/bi';
import {
  useLmsAttendanceLatest,
  useLmsAttendanceLatestByProgram,
} from '../../hooks/useLms';

const normalizeProgram = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeStatus = (value) => String(value || '').toLowerCase().trim();
const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const getSessionSearchText = (session) => {
  return normalizeText(
    [
      session?.date || '',
      session?.time || '',
      session?.description || '',
    ].join(' ')
  );
};

const getStudentSearchText = (student) =>
  normalizeText(
    [student?.name || '', student?.nim || '', student?.status || ''].join(' ')
  );

const statusLabel = (value) => {
  const status = normalizeStatus(value);
  if (!status) return '-';
  return status === 'present' ? 'Present' : 'Absent';
};

const statusClassName = (value) => {
  const status = normalizeStatus(value);
  return status === 'present' ? 'text-green-700' : 'text-red-700';
};

const getStatusCounts = (records = []) => {
  return records.reduce(
    (acc, item) => {
      const status = normalizeStatus(item.status);
      if (status === 'present') {
        acc.present += 1;
      } else if (status) {
        acc.absent += 1;
      }
      return acc;
    },
    { present: 0, absent: 0 }
  );
};

const getPrograms = (items = []) => {
  const programMap = new Map();

  items.forEach((item) => {
    const label = String(item?.program || '').trim();
    const key = normalizeProgram(label);
    if (label && !programMap.has(key)) {
      programMap.set(key, label);
    }
  });

  return [
    { key: 'all', label: 'Semua Prodi' },
    ...Array.from(programMap.entries()).map(([key, label]) => ({ key, label })),
  ];
};

const LmsAttendance = () => {
  const { data: allResponse, isLoading: isLoadingAll } = useLmsAttendanceLatest();
  const allItems = allResponse?.data?.items;
  const programs = useMemo(() => getPrograms(allItems ?? []), [allItems]);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [selectedDetail, setSelectedDetail] = useState(null);

  useEffect(() => {
    if (
      programs.length > 0 &&
      !programs.some((program) => program.key === selectedProgram)
    ) {
      setSelectedProgram('all');
    }
  }, [programs, selectedProgram]);

  const { data: selectedResponse, isLoading: isLoadingSelected, error } =
    useLmsAttendanceLatestByProgram(selectedProgram);
  const selectedItems = selectedResponse?.data?.items;
  const [searchValue, setSearchValue] = useState('');
  const selectedProgramLabel =
    programs.find((program) => program.key === selectedProgram)?.label ||
    'Semua Prodi';

  const courses = useMemo(() => {
    return (selectedItems ?? []).map((course) => ({
      ...course,
      attendance: Array.isArray(course.attendance) ? course.attendance : [],
    }));
  }, [selectedItems]);

  useEffect(() => {
    setSelectedDetail(null);
  }, [selectedProgram, searchValue]);

  const courseMatchesSearch = (course, keyword) =>
    normalizeText(
      [
        course.title || '',
        course.program || '',
        ...(Array.isArray(course.teachers) ? course.teachers : []),
      ].join(' ')
    ).includes(keyword);

  const sessionMatchesSearch = (session, keyword) =>
    getSessionSearchText(session).includes(keyword);

  const studentMatchesSearch = (student, keyword) =>
    getStudentSearchText(student).includes(keyword);

  const filteredCourses = useMemo(() => {
    const keyword = normalizeText(searchValue);

    if (!keyword) {
      return courses;
    }

    return courses
      .map((course) => {
        const matchesCourse = courseMatchesSearch(course, keyword);
        const matchingAttendance = course.attendance
          .map((session) => {
            const matchesSession = sessionMatchesSearch(session, keyword);
            const matchingStudents = Array.isArray(session.absensi)
              ? session.absensi.filter((student) =>
                  studentMatchesSearch(student, keyword)
                )
              : [];

            if (!matchesSession && matchingStudents.length === 0) {
              return null;
            }

            return {
              ...session,
              absensi: matchesSession ? session.absensi || [] : matchingStudents,
            };
          })
          .filter(Boolean);

        if (!matchesCourse && matchingAttendance.length === 0) {
          return null;
        }

        return {
          ...course,
          attendance: matchesCourse
            ? course.attendance.map((session) => ({
                ...session,
              }))
            : matchingAttendance,
        };
      })
      .filter(Boolean);
  }, [courses, searchValue]);

  const filteredWeekCount = useMemo(() => {
    return filteredCourses.reduce(
      (max, course) => Math.max(max, course.attendance.length),
      0
    );
  }, [filteredCourses]);
  const normalizedSearchValue = normalizeText(searchValue);
  const hasSearch = normalizedSearchValue.length > 0;

  return (
    <section className="section-container space-y-6" id="lms-attendance">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold text-gray-900">LMS Attendance</p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Pilih Prodi
        </label>
        <select
          className="w-full md:w-80 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary-400"
          value={selectedProgram}
          onChange={(event) => setSelectedProgram(event.target.value)}
        >
          {programs.map((program) => (
            <option key={program.key} value={program.key}>
              {program.label}
            </option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Search
        </label>
        <input
          className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:border-primary-400"
          value={searchValue}
          onChange={(event) => setSearchValue(event.target.value)}
          placeholder="Course, Teacher, Date, Student"
        />
      </div>

      {(isLoadingAll || isLoadingSelected) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Memuat data attendance...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal mengambil data attendance.
        </div>
      )}

      {!isLoadingSelected && filteredCourses.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          {hasSearch
            ? `Tidak ada data attendance yang cocok dengan pencarian "${searchValue}".`
            : `Tidak ada data attendance untuk ${selectedProgramLabel}.`}
        </div>
      )}

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[80rem]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Week
                </th>
                {filteredCourses.map((course) => (
                  <th
                    key={`${course.program}-${course.title}`}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 min-w-[18rem]"
                  >
                    <div className="font-semibold text-gray-900">{course.title}</div>
                    <div className="mt-1 whitespace-pre-line text-xs text-gray-500">
                      Teacher:
                      {'\n'}
                      {(Array.isArray(course.teachers) && course.teachers.length > 0
                        ? course.teachers.join('\n')
                        : '-') || '-'}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: filteredWeekCount }).map((_, weekIndex) => (
                <tr key={`week-${weekIndex}`} className="border-t border-gray-100 align-top">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900 whitespace-nowrap">
                    Week {weekIndex + 1}
                  </td>
                  {filteredCourses.map((course) => {
                    const session = course.attendance[weekIndex];
                    const counts = getStatusCounts(session?.absensi || []);
                    return (
                      <td
                      key={`${course.program}-${course.title}-week-${weekIndex}`}
                      className="px-4 py-3 text-sm text-gray-700 align-top"
                    >
                        {session ? (
                          <div>
                            <div className="font-semibold text-gray-900">
                              {session.date || '-'}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {session.time || '-'}
                            </div>
                            <div className="mt-3 space-y-1 text-xs">
                              <div className="text-green-700">Present: {counts.present}</div>
                              <div className="text-red-700">Absent: {counts.absent}</div>
                            </div>
                            <button
                              type="button"
                              className="mt-3 text-primary-400 font-medium"
                              onClick={() =>
                                setSelectedDetail({
                                  course,
                                  session,
                                  weekIndex,
                                })
                              }
                            >
                              Lihat detail
                            </button>
                          </div>
                        ) : (
                          <div className="text-gray-400">-</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Detail Presensi
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {selectedDetail.course.title} - Week {selectedDetail.weekIndex + 1}
                </p>
              <p className="text-sm text-gray-500">
                  {selectedDetail.session.date || '-'} |{' '}
                  {selectedDetail.session.time || '-'}
                </p>
              </div>
              <button
                type="button"
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setSelectedDetail(null)}
                aria-label="Tutup"
              >
                <BiX size={22} />
              </button>
            </div>

            <div className="overflow-auto p-5">
              <table className="w-full min-w-[34rem]">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Nama
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      NIM
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {selectedDetail.session.absensi?.length ? (
                    selectedDetail.session.absensi.map((student, studentIndex) => (
                      <tr
                        key={`${student.nim || student.name}-${studentIndex}`}
                        className="border-t border-gray-100"
                      >
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.name || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {student.nim || '-'}
                        </td>
                        <td
                          className={`px-4 py-3 text-sm font-medium ${statusClassName(
                            student.status
                          )}`}
                        >
                          {statusLabel(student.status)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-4 py-5 text-sm text-gray-500"
                      >
                        Tidak ada data mahasiswa.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default LmsAttendance;
