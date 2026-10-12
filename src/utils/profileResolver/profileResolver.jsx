export const resolveValue = ({
  obj,
  id,
  objKey = "name",
  master = [],
  masterIdKey = "id",
}) => {
  // 1. kalau object valid → pakai object
  if (obj && obj[objKey]) return obj[objKey];

  // 2. fallback ke master data via id
  if (id && master.length) {
    const found = master.find((m) => m[masterIdKey] === id);
    if (found) return found[objKey];
  }

  // 3. fallback terakhir
  return "-";
};
