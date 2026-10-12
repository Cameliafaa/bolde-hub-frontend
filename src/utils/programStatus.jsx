// utils/programStatus.js

import { isExpired, isExpiredSoon, isActiveDate } from "./dateUtils";

// kelola role admin
export const isAdmin = (userProfile) => {
  const roleName = userProfile?.user_roles?.name?.toLowerCase();
  const roleId = userProfile?.user_role_id;
  return roleName === "admin" || roleName === "super admin" || roleId === 4;
};

export const determineProgramStatus = (program) => {
  const approvals = program.approvals || [];
  const rawStatus = (program.statusRaw || program.status || "").toLowerCase();
  if (rawStatus === "expired") return "Expired";

  const anyRejected = approvals.some(a => (a.status || "").toLowerCase() === "rejected");
  if (anyRejected || rawStatus === "rejected") return "Rejected";

  const anyPending = approvals.some(a => (a.status || "").toLowerCase() === "pending");
  if (anyPending || rawStatus === "pending") return "Waiting Approve";

  const allApproved =
    approvals.length > 0 &&
    approvals.every(a => (a.status || "").toLowerCase() === "approved");

  if (!allApproved) return "Waiting Approve";

  // === CEK STATUS PROGRAM BERDASARKAN TANGGAL ===
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const raw = program.period_end.split("T")[0];
  const [y, m, d] = raw.split("-");
  const end = new Date(y, m - 1, d); // 00:00 lokal, TANPA timezone
  end.setHours(0, 0, 0, 0);

  const diffDays = Math.ceil((end - today) / (1000 * 60 * 60 * 24));

  // ❌ EXPIRED = hanya jika END DATE < TODAY
  if (diffDays < 0) return "Expired";

  // ⚠️ EXPIRED SOON = 1–7 hari lagi
  if (diffDays >= 1 && diffDays <= 7) return "Expired Soon";

  // ✅ ACTIVE = jika hari ini (H0) atau >7 hari
  return "Active";
};
