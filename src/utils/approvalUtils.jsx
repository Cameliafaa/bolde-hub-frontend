// utils/approvalUtils.js

export function isAdmin(userProfile) {
  const roleName = userProfile?.user_roles?.name?.trim()?.toLowerCase();

  const roleId = Number(userProfile?.user_role_id);

  return roleName === "admin" || roleName === "super admin" || roleId === 4;
}

export const filterProgramsByUser = (programs, userProfile, activeTab) => {
  const me = Number(userProfile?.user_id);
  const admin = isAdmin(userProfile);

  return programs.filter((program) => {
    // ==========================================
    // APPROVAL DATA
    // ==========================================
    const approvals = program.approvals || program.program_approvals || [];

    const uploaderId = Number(
      program.uploader_id ?? program.user_id ?? program.created_by,
    );

    const isUploader = uploaderId === me;

    // ==========================================
    // GLOBAL TAB
    // Filtering Active / Expired dll
    // sudah dilakukan ProgramCenter
    // ==========================================
    if (
      activeTab === "Active" ||
      activeTab === "Expired" ||
      activeTab === "Expired Soon"
    ) {
      return true;
    }

    // ==========================================
    // STATUS APPROVAL
    // ==========================================
    const normalizedApprovals = approvals.map((a) => ({
      ...a,
      user_id: Number(a.user_id),
      status: String(a.status || "")
        .trim()
        .toLowerCase(),
    }));

    const anyPending = normalizedApprovals.some((a) => a.status === "pending");

    const anyRejected = normalizedApprovals.some(
      (a) => a.status === "rejected",
    );

    const allApproved =
      normalizedApprovals.length > 0 &&
      normalizedApprovals.every((a) => a.status === "approved");

    // ==========================================
    // WAITING APPROVE
    // ==========================================
    if (activeTab === "Waiting Approve") {
      /*
       * Program sudah reject
       * jangan ada lagi di Waiting Approve
       */
      if (anyRejected) {
        return false;
      }

      /*
       * Kalau semuanya sudah approved,
       * berarti sudah selesai dan harus pindah Active.
       */
      if (allApproved) {
        return false;
      }

      /*
       * Harus masih ada approval pending.
       */
      if (!anyPending) {
        return false;
      }

      // ======================================
      // ADMIN / SUPER ADMIN
      // ======================================
      // Admin wajib melihat seluruh program
      // yang masih dalam proses approval.
      if (admin) {
        return true;
      }

      // ======================================
      // UPLOADER / PEMBUAT PROGRAM
      // ======================================
      // Pembuat program tetap bisa memonitor
      // sampai proses approval selesai.
      if (isUploader) {
        return true;
      }

      // ======================================
      // APPROVER
      // ======================================
      if (!normalizedApprovals.length) {
        return false;
      }

      const APPROVER_ORDER = [112, 9, 10];

      const sorted = [...normalizedApprovals].sort((a, b) => {
        const idxA = APPROVER_ORDER.indexOf(Number(a.user_id));

        const idxB = APPROVER_ORDER.indexOf(Number(b.user_id));

        const orderA = idxA === -1 ? 999 : idxA;

        const orderB = idxB === -1 ? 999 : idxB;

        return orderA - orderB;
      });

      // Approval milik user yang sedang login
      const myApproval = sorted.find((a) => Number(a.user_id) === me);

      // Bukan approver program ini
      if (!myApproval) {
        return false;
      }

      // ======================================
      // SUDAH APPROVE → CARD HILANG
      // ======================================
      if (myApproval.status === "approved") {
        return false;
      }

      if (myApproval.status === "rejected") {
        return false;
      }

      // ======================================
      // CARI APPROVER YANG SEKARANG GILIRAN
      // ======================================
      const currentApprover = sorted.find((a) => a.status !== "approved");

      if (!currentApprover) {
        return false;
      }

      // Harus status pending
      if (currentApprover.status !== "pending") {
        return false;
      }

      /*
       * HANYA approver yang sekarang mendapat
       * giliran yang boleh melihat card.
       */
      return Number(currentApprover.user_id) === me;
    }

    // ==========================================
    // REJECTED
    // ==========================================
    if (activeTab === "Rejected") {
      // program tidak reject
      if (!anyRejected) {
        return false;
      }

      // Admin melihat semua rejected
      if (admin) {
        return true;
      }

      // Uploader tetap melihat programnya
      if (isUploader) {
        return true;
      }

      /*
       * Kalau kamu ingin approver juga
       * melihat program rejected:
       */
      const isApprover = normalizedApprovals.some(
        (a) => Number(a.user_id) === me,
      );

      return isApprover;
    }

    return false;
  });
};

export const isAllApproved = (approvals = []) =>
  approvals.length > 0 &&
  approvals.every(
    (a) =>
      String(a.status || "")
        .trim()
        .toLowerCase() === "approved",
  );
