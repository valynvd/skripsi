const CPL_GROUP_ORDER = {
  A: 1, // Sikap (-S)
  B: 2, // Keterampilan Umum (-KU)
  C: 3, // Pengetahuan (-P)
  D: 4, // Keterampilan Khusus (-KK)
};

const parseCplCode = (code) => {
  if (!code || typeof code !== 'string') {
    return null;
  }

  const normalized = code.toUpperCase().trim();
  let match = normalized.match(/-KU(\d+)$/);
  if (match) {
    return { group: 'B', order: CPL_GROUP_ORDER.B, number: Number(match[1]) };
  }

  match = normalized.match(/-KK(\d+)$/);
  if (match) {
    return { group: 'D', order: CPL_GROUP_ORDER.D, number: Number(match[1]) };
  }

  match = normalized.match(/-P(\d+)$/);
  if (match) {
    return { group: 'C', order: CPL_GROUP_ORDER.C, number: Number(match[1]) };
  }

  match = normalized.match(/-S(\d+)$/);
  if (match) {
    return { group: 'A', order: CPL_GROUP_ORDER.A, number: Number(match[1]) };
  }

  return null;
};

export const getCplDisplayCode = (code) => {
  const parsed = parseCplCode(code);
  if (!parsed) {
    return code;
  }

  return `3.${parsed.group}.${parsed.number}`;
};

export const compareCplCodes = (left, right) => {
  const leftParsed = parseCplCode(left);
  const rightParsed = parseCplCode(right);

  if (leftParsed && rightParsed) {
    if (leftParsed.order !== rightParsed.order) {
      return leftParsed.order - rightParsed.order;
    }
    if (leftParsed.number !== rightParsed.number) {
      return leftParsed.number - rightParsed.number;
    }
    return String(left).localeCompare(String(right));
  }

  if (leftParsed && !rightParsed) {
    return -1;
  }
  if (!leftParsed && rightParsed) {
    return 1;
  }

  return String(left).localeCompare(String(right));
};
