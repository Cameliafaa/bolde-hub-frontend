// ===== DATE HELPERS =====

export const getDaysDiffFromToday = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);

  return Math.floor((target - today) / (1000 * 60 * 60 * 24)); 
};

export const isExpired = (dateStr) => {
  const diff = getDaysDiffFromToday(dateStr);
  return diff <= 0; // expired kalau H0 atau lewat
};

export const isExpiredSoon = (dateStr) => {
  const diff = getDaysDiffFromToday(dateStr);
  return diff >= 1 && diff <= 7;
};

export const isActiveDate = (dateStr) => {
  const diff = getDaysDiffFromToday(dateStr);
  return diff > 7;
};
