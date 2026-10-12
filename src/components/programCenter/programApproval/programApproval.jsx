import React, { useState, useEffect, useMemo } from "react";
import { ChevronDown } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const ProgramApproval = ({ programId, currentUser, onRefresh }) => {
  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const APPROVERS_ORDER = [112, 9, 10]; // Airlangga -> Wilman -> Haryono

  // === Ambil data approval dari backend ===
  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await ApiRequest({
        url: `/programs/detail/${programId}`,
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      let list = res?.data?.program_approvals || res?.data?.approvals || [];

      // urutkan sesuai urutan tetap [8,9,10]
      list = [...list].sort(
        (a, b) =>
          APPROVERS_ORDER.indexOf(a.user_id) -
          APPROVERS_ORDER.indexOf(b.user_id),
      );

      setApprovals(list);
    } catch (e) {}
  };

  useEffect(() => {
    fetchApprovals();
  }, [programId]);

  // === Tentukan giliran berdasarkan urutan tetap [8,9,10] ===
  const { myApproval, isMyTurn } = useMemo(() => {
    if (!approvals.length) return { myApproval: null, isMyTurn: false };

    // cari approver pending pertama (sesudah disort)
    const nextPending = approvals.find(
      (a) => (a.status || "").toLowerCase() === "pending",
    );

    const myApproval = approvals.find(
      (a) => a.user_id === currentUser?.user_id,
    );

    const isMyTurn = nextPending?.user_id === currentUser?.user_id;

    return { myApproval, isMyTurn };
  }, [approvals, currentUser]);

  // === Aksi Approve / Reject ===
  const handleAction = async (status) => {
    if (!isMyTurn) return;
    if (!myApproval?.program_approval_id) {
      alert("Approval ID tidak ditemukan untuk user ini.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      // Update status approval user ini
      const res = await ApiRequest({
        url: `/programs/user/status/${programId}`,
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        data: {
          status,
          notes:
            status === "approved" ? "Disetujui oleh user" : "Ditolak oleh user",
        },
      });

      if (res.status === "success") {
        const detail = await ApiRequest({
          url: `/programs/detail/${programId}`,
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });

        let updatedApprovals =
          detail?.data?.program_approvals ||
          detail?.data?.approvals ||
          approvals;

        // sort ulang sesuai [8,9,10]
        updatedApprovals = [...updatedApprovals].sort(
          (a, b) =>
            APPROVERS_ORDER.indexOf(a.user_id) -
            APPROVERS_ORDER.indexOf(b.user_id),
        );

        setApprovals(updatedApprovals);

        // cek status keseluruhan
        const allApproved = updatedApprovals.every(
          (a) => (a.status || "").toLowerCase() === "approved",
        );
        const anyRejected = updatedApprovals.some(
          (a) => (a.status || "").toLowerCase() === "rejected",
        );

        // Update status utama program
        if (allApproved) {
          await ApiRequest({
            url: `/programs/user/status/${programId}`,
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            data: { status: "approved" },
          });
        } else if (anyRejected) {
          await ApiRequest({
            url: `/programs/user/status/${programId}`,
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
            data: { status: "rejected" },
          });
        }

        // refresh tampilan detail
        if (typeof onRefresh === "function") onRefresh();

        setOpen(false);
      } else {
        alert(res.message || "Gagal mengirim approval.");
      }
    } catch (err) {
      console.error("Approval error:", err);
      alert(
        err?.response?.data?.message ||
          err?.message ||
          "Terjadi kesalahan saat melakukan approval.",
      );
    } finally {
      setLoading(false);
    }
  };

  // === Tampilan tombol ===
  const currentStatus = (myApproval?.status || "pending").toLowerCase();

  let badgeStyle = "bg-yellow-100 text-yellow-700 border-yellow-300";
  if (currentStatus === "approved")
    badgeStyle = "bg-green-100 text-green-700 border-green-300";
  if (currentStatus === "rejected")
    badgeStyle = "bg-red-100 text-red-700 border-red-300";

  const canInteract = isMyTurn && !loading;

  return (
    <div className="relative">
      <button
        onClick={() => canInteract && setOpen((o) => !o)}
        className={`flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full border transition ${badgeStyle}
          ${canInteract ? "hover:bg-yellow-200" : "opacity-70 cursor-default"}
        `}
      >
        {loading
          ? "Processing..."
          : currentStatus === "approved"
            ? "Approved"
            : currentStatus === "rejected"
              ? "Rejected"
              : "Waiting Approval"}
        {canInteract && <ChevronDown size={14} />}
      </button>

      {open && (
        <div className="absolute right-0 z-10 mt-1 overflow-hidden bg-white border rounded-lg shadow-lg w-44">
          <button
            onClick={() => handleAction("approved")}
            className="w-full px-4 py-2 text-sm text-center text-green-700 hover:bg-green-50"
          >
            Setujui Program
          </button>
          <button
            onClick={() => handleAction("rejected")}
            className="w-full px-4 py-2 text-sm text-center text-red-700 hover:bg-red-50"
          >
            Tolak Program
          </button>
        </div>
      )}
    </div>
  );
};

export default ProgramApproval;
