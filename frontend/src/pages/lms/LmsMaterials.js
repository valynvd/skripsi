import React, { useEffect, useMemo, useState } from 'react';
import {
  useLmsMaterialsLatest,
  useLmsMaterialsLatestByProgram,
} from '../../hooks/useLms';

const normalizeProgram = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ');

const normalizeText = (value) =>
  String(value || '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');

const getCourseSearchText = (course) =>
  normalizeText([course?.title || '', course?.program || ''].join(' '));

const getSectionSearchText = (section) =>
  normalizeText([section?.title || '', ...(section?.items || [])].join(' '));

const getItemSearchText = (item) => normalizeText(String(item || ''));

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

const uniqueValues = (values = []) => [...new Set(values.filter(Boolean))];

const LmsMaterials = () => {
  const { data, isLoading, error } = useLmsMaterialsLatest();
  const allItems = data?.data?.items;
  const programs = useMemo(() => getPrograms(allItems ?? []), [allItems]);
  const [selectedProgram, setSelectedProgram] = useState('all');
  const [searchValue, setSearchValue] = useState('');

  useEffect(() => {
    if (programs.length > 0 && !programs.some((program) => program.key === selectedProgram)) {
      setSelectedProgram('all');
    }
  }, [programs, selectedProgram]);

  const { data: selectedResponse, isLoading: isLoadingSelected } =
    useLmsMaterialsLatestByProgram(selectedProgram);
  const selectedItems = selectedResponse?.data?.items;
  const filteredItems = useMemo(() => {
    return (selectedItems ?? []).map((course) => ({
      ...course,
      sections: Array.isArray(course.sections) ? course.sections : [],
    }));
  }, [selectedItems]);

  const selectedProgramLabel =
    programs.find((program) => program.key === selectedProgram)?.label || 'Semua Prodi';

  const filteredBySearchItems = useMemo(() => {
    const keyword = normalizeText(searchValue);

    if (!keyword) {
      return filteredItems;
    }

    return filteredItems
      .map((course) => {
        const courseMatches = getCourseSearchText(course).includes(keyword);

        const matchingSections = (course.sections || [])
          .map((section) => {
            const sectionTextMatches = getSectionSearchText(section).includes(keyword);
            const matchingItems = uniqueValues(section.items || []).filter((item) =>
              getItemSearchText(item).includes(keyword)
            );

            if (sectionTextMatches || matchingItems.length > 0) {
              return {
                ...section,
                items: sectionTextMatches ? uniqueValues(section.items || []) : matchingItems,
              };
            }

            return null;
          })
          .filter(Boolean);

        if (courseMatches) {
          return {
            ...course,
            sections: (course.sections || []).map((section) => ({
              ...section,
              items: uniqueValues(section.items || []),
            })),
          };
        }

        if (matchingSections.length === 0) {
          return null;
        }

        return {
          ...course,
          sections: matchingSections,
        };
      })
      .filter(Boolean);
  }, [filteredItems, searchValue]);

  return (
    <section className="section-container space-y-6" id="lms-materials">
      <div className="flex flex-col gap-2">
        <p className="text-lg font-semibold text-gray-900">LMS Materi</p>
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
          placeholder="Course"
        />
      </div>

      {(isLoading || isLoadingSelected) && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          Memuat data materi...
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          Gagal mengambil data materi.
        </div>
      )}

      {!isLoadingSelected && filteredBySearchItems.length === 0 && (
        <div className="rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
          {searchValue.trim()
            ? `Tidak ada data materi yang cocok dengan pencarian "${searchValue}".`
            : `Tidak ada data materi untuk ${selectedProgramLabel}.`}
        </div>
      )}

      <div className="space-y-4">
        {filteredBySearchItems.map((course) => (
          <details
            key={`${course.program}-${course.title}`}
            className="rounded-2xl border border-gray-200 bg-white overflow-hidden"
          >
            <summary className="cursor-pointer list-none px-5 py-4">
              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900">{course.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {course.program || '-'}
                  </p>
                </div>
                <p className="text-sm text-gray-500">
                  {course.sections?.length || 0} section
                </p>
              </div>
            </summary>

            <div className="border-t border-gray-100">
              {course.sections?.length ? (
                course.sections.map((section, index) => {
                  const items = uniqueValues(section.items || []);
                  return (
                    <details
                      key={`${course.title}-${section.title}-${index}`}
                      className="border-b border-gray-100 last:border-b-0"
                    >
                      <summary className="cursor-pointer list-none px-5 py-4">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-gray-900">
                            {section.title || `Section ${index + 1}`}
                          </p>
                          <p className="text-sm text-gray-500">
                            {items.length} materi
                          </p>
                        </div>
                      </summary>
                      <div className="px-5 pb-5">
                        {items.length ? (
                          <ul className="space-y-2">
                            {items.map((item, itemIndex) => (
                              <li
                                key={`${course.title}-${section.title}-${itemIndex}`}
                                className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700"
                              >
                                {item}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500">
                            Section ini kosong.
                          </p>
                        )}
                      </div>
                    </details>
                  );
                })
              ) : (
                <div className="px-5 py-4 text-sm text-gray-500">
                  Tidak ada materi pada matakuliah ini.
                </div>
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
};

export default LmsMaterials;
