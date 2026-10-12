import { ChevronDown } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../../components/common/pagination";

const ReportApprovalDetail = () => {
  const navigate = useNavigate();
  const { submissionId } = useParams();

  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [approvalNote, setApprovalNote] = useState("");
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectNote, setRejectNote] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchDetail();
  }, [submissionId]);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const res = await fetch(
        `${baseUrl}/monthly-report-submissions/${submissionId}`,
        { headers: authHeaders },
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result?.message || "Gagal mengambil detail");

      setSubmission(result?.data || null);
      setApprovalNote(result?.data?.approval_note || "");
    } catch (err) {
      console.error("Detail submission error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (type, note = "") => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");

      const res = await fetch(
        `${baseUrl}/monthly-report-submissions/${submissionId}/${type}`,
        {
          method: "PUT",
          headers: authHeaders,
          body: JSON.stringify({
            approval_note: type === "approve" ? "" : note,
          }),
        },
      );

      const result = await res.json();

      if (!res.ok) throw new Error(result?.message || `Gagal ${type}`);

      setSuccessMsg(
        type === "approve"
          ? "Report berhasil di-approve"
          : "Report berhasil di-reject",
      );

      setShowRejectModal(false);
      setRejectNote("");
      await fetchDetail();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const downloadCSV = () => {
    const reports = submission?.reports || [];

    const headers = [
      "Task",
      "Objective",
      "Category",
      "Status",
      "Deadline",
      "Source",
      "PIC",
      "Task Date",
    ];

    const rows = reports.map((item) => [
      item.task || "",
      item.objective || "",
      item.category || "",
      item.status || "",
      item.deadline || "",
      item.source || "",
      item.pic || "",
      item.task_date || "",
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvContent], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `monthly-report-${submission?.user?.full_name || "user"}-${submission?.month}-${submission?.year}.csv`;
    link.click();

    URL.revokeObjectURL(url);
  };

  if (loading) return <p className="text-sm text-text-light">Loading...</p>;

  const reports = submission?.reports || [];
  const isSubmitted = submission?.status === "submitted";

  const displayStatus =
    String(submission?.status || "")
      .charAt(0)
      .toUpperCase() + String(submission?.status || "").slice(1);

  const totalPages = Math.ceil(reports.length / itemsPerPage);

  const paginatedReports = reports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px]">
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-3 text-sm text-brand-secondary"
          >
            ← Back
          </button>

          <h1 className="text-2xl font-semibold text-brand-first">
            Detail Report
          </h1>

          <p className="mt-1 text-sm text-text-light">
            {submission?.user?.full_name || "-"} — {submission?.month}{" "}
            {submission?.year}
          </p>
        </div>

        <button
          onClick={downloadCSV}
          disabled={reports.length === 0}
          className="px-5 py-3 text-sm text-white rounded-xl bg-brand-first disabled:opacity-60"
        >
          Download CSV
        </button>
      </div>
      {successMsg && (
        <div className="p-4 mb-5 text-sm text-green-700 border border-green-200 rounded-2xl bg-green-50">
          {successMsg}
        </div>
      )}
      {error && (
        <div className="p-4 mb-5 text-sm text-red-700 border border-red-200 rounded-2xl bg-red-50">
          {error}
        </div>
      )}
      <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
        <div className="grid gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-text-light">User</p>
            <p className="font-semibold">
              {submission?.user?.full_name || "-"}
            </p>
          </div>

          <div>
            <p className="text-text-light">Status</p>
            <p className="font-semibold capitalize">{submission?.status}</p>
          </div>

          <div>
            <p className="text-text-light">Month</p>
            <p className="font-semibold">{submission?.month}</p>
          </div>

          <div>
            <p className="text-text-light">Year</p>
            <p className="font-semibold">{submission?.year}</p>
          </div>
        </div>
      </div>
      <div className="p-5 mb-5 bg-white border shadow-sm rounded-2xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center w-full gap-4">
            <p className="text-sm font-semibold text-brand-first whitespace-nowrap">
              Approval Status
            </p>

            <div className="relative inline-block ml-auto">
              <button
                onClick={() =>
                  isSubmitted && setShowActionMenu((prev) => !prev)
                }
                disabled={!isSubmitted || actionLoading}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-full disabled:cursor-default ${
                  displayStatus === "Approved"
                    ? "bg-green-100 text-status-success"
                    : displayStatus === "Rejected"
                      ? "bg-red-100 text-status-danger"
                      : "bg-yellow-100 text-yellow-700"
                }`}
              >
                {displayStatus === "Submitted"
                  ? "Waiting Approval"
                  : displayStatus}

                {isSubmitted && (
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${showActionMenu ? "rotate-180" : ""}`}
                  />
                )}
              </button>

              {showActionMenu && isSubmitted && (
                <div className="absolute left-0 z-30 mt-2 overflow-hidden bg-white border shadow-xl w-44 rounded-2xl border-surface-border">
                  <button
                    onClick={() => {
                      setShowActionMenu(false);
                      handleAction("approve", "");
                    }}
                    className="w-full px-4 py-3 text-sm font-semibold text-left text-status-success hover:bg-green-50"
                  >
                    Setujui Report
                  </button>

                  <button
                    onClick={() => {
                      setShowActionMenu(false);
                      setShowRejectModal(true);
                    }}
                    className="w-full px-4 py-3 text-sm font-semibold text-left text-status-danger hover:bg-red-50"
                  >
                    Tolak Report
                  </button>
                </div>
              )}
            </div>

            {submission?.approval_note && (
              <p className="mt-3 text-sm text-text-secondary">
                <span className="font-semibold text-brand-first">
                  Reject Note:
                </span>{" "}
                {submission.approval_note}
              </p>
            )}
          </div>{" "}
        </div>
      </div>
      <div className="overflow-x-auto bg-white border shadow-sm rounded-2xl">
        <table className="w-full text-sm">
          <thead className="text-left bg-gray-50">
            <tr>
              <th className="px-5 py-4">No</th>
              <th className="px-5 py-4">Task</th>
              <th className="px-5 py-4">Objective</th>
              <th className="px-5 py-4">Category</th>
              <th className="px-5 py-4">Status</th>
              <th className="px-5 py-4">Deadline</th>
              <th className="px-5 py-4">Source</th>
              <th className="px-5 py-4">PIC</th>
            </tr>
          </thead>

          <tbody>
            {paginatedReports.map((item, index) => (
              <tr key={item.monthly_report_id || index} className="border-t">
                <td className="px-5 py-4">
                  {(currentPage - 1) * itemsPerPage + index + 1}
                </td>
                <td className="px-5 py-4 font-semibold">{item.task || "-"}</td>
                <td className="px-5 py-4">{item.objective || "-"}</td>
                <td className="px-5 py-4">{item.category || "-"}</td>
                <td className="px-5 py-4 capitalize">{item.status || "-"}</td>
                <td className="px-5 py-4">{item.deadline || "-"}</td>
                <td className="px-5 py-4">{item.source || "-"}</td>
                <td className="px-5 py-4">{item.pic || "-"}</td>
              </tr>
            ))}

            {reports.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-5 py-8 text-center text-text-light"
                >
                  Tidak ada report
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {totalPages > 1 && (
          <div className="px-5 pb-5">
            <Pagination
              current={currentPage}
              total={totalPages}
              onChange={setCurrentPage}
            />
          </div>
        )}
      </div>
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
            <h3 className="mb-2 text-lg font-semibold text-brand-first">
              Tolak Report
            </h3>

            <p className="mb-4 text-sm text-text-secondary">
              Masukkan alasan penolakan agar user bisa memperbaiki report.
            </p>

            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Contoh: Report belum lengkap..."
              className="w-full p-3 text-sm border rounded-xl min-h-28"
            />

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setRejectNote("");
                }}
                disabled={actionLoading}
                className="px-5 py-3 text-sm font-semibold border rounded-xl"
              >
                Batal
              </button>

              <button
                onClick={() => {
                  if (!rejectNote.trim()) {
                    setError("Approval note wajib diisi jika reject report");
                    return;
                  }

                  handleAction("reject", rejectNote);
                }}
                disabled={actionLoading}
                className="px-5 py-3 text-sm font-semibold text-white bg-red-500 rounded-xl disabled:opacity-60"
              >
                {actionLoading ? "Processing..." : "Tolak Report"}
              </button>
            </div>
          </div>
        </div>
      )}{" "}
    </div>
  );
};

export default ReportApprovalDetail;
