export const computeCircularSummary = (programs) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let active = 0;
  let exp7 = 0;
  let exp1 = 0;

  programs.forEach((p) => {
    const endDate = new Date(p.period_end);
    endDate.setHours(0, 0, 0, 0);

    const diff = Math.ceil((endDate - today) / 86400000);

    if (diff >= 0) active++;
    if (diff >= 2 && diff <= 7) exp7++;
    if (diff >= 0 && diff <= 1) exp1++;
  });

  return {
    total_active: active,
    expiring_7_days: exp7,
    expiring_1_day: exp1,
  };
};
