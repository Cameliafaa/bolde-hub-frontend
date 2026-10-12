import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Send,
  Upload,
  XCircle,
  FileText,
  Download,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { reportAutomationApi } from "../../services/reportAutomation/reportApi";
import { fetchAllUsers } from "../../services/users/userService";

const API_FILE_BASE = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api/v1"
).replace("/api/v1", "");

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");

  const roleName = String(
    user?.user_roles?.name || user?.role?.name || "",
  ).toLowerCase();

  let roleCategoryId = Number(
    user?.user_roles?.role_category_id ||
      user?.role?.role_category_id ||
      user?.role_category_id ||
      0,
  );

  if (!roleCategoryId) {
    if (roleName.includes("manager") || roleName.includes("admin")) {
      roleCategoryId = 1;
    } else if (roleName.includes("spv") || roleName.includes("supervisor")) {
      roleCategoryId = 2;
    } else {
      roleCategoryId = 3;
    }
  }

  return {
    id: user?.user_id || user?.id,
    name: user?.full_name || user?.username || "User",
    roleCategoryId,
    roleCategory:
      roleCategoryId === 1 ? "manager" : roleCategoryId === 2 ? "spv" : "staff",
  };
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const statusLabelMap = {
  pending: "Belum Dimulai",
  pending_approval: "Menunggu Persetujuan",
  assigned: "Tugas Baru",
  in_progress: "Sedang Dikerjakan",
  submitted: "Menunggu Review",
  approved: "Disetujui",
  rejected: "Perlu Perbaikan",
  waiting_job_review: "Menunggu Review",
  waiting_final_submission: "Menunggu Hasil Akhir",
  waiting_final_review: "Menunggu Review Akhir",
  rejected_final: "Hasil Akhir Perlu Revisi",
  done: "Selesai",
};

function StatusBadge({ status }) {
  const map = {
    pending: "bg-slate-100 text-slate-700",
    pending_approval: "bg-orange-50 text-orange-700",
    assigned: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-50 text-blue-700",
    submitted: "bg-indigo-50 text-indigo-700",
    approved: "bg-green-50 text-green-700",
    rejected: "bg-red-50 text-red-700",
    waiting_job_review: "bg-indigo-50 text-indigo-700",
    waiting_final_submission: "bg-indigo-50 text-indigo-700",
    waiting_final_review: "bg-purple-50 text-purple-700",
    rejected_final: "bg-red-50 text-red-700",
    done: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`px-3 py-1 text-xs font-bold rounded-full ${
        map[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {statusLabelMap[status] || "-"}
    </span>
  );
}

function ProgressBar({ value }) {
  const safeValue = Math.min(Number(value || 0), 100);

  const label =
    safeValue === 0
      ? "Belum dimulai"
      : safeValue < 80
        ? "Dalam proses"
        : safeValue < 100
          ? "Hampir selesai"
          : "Selesai";

  return (
    <div>
      <div className="flex justify-between mb-2 text-xs font-semibold text-slate-400">
        <span>{label}</span>
        <span>{safeValue}%</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B3A78] to-[#2E90FA]"
          style={{ width: `${safeValue}%` }}
        />
      </div>
    </div>
  );
}

export default function TaskReportDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = getCurrentUser();
  const currentUserId = Number(currentUser.id || 0);

  const [task, setTask] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [loading, setLoading] = useState(true);

  const [jobMessages, setJobMessages] = useState({});
  const [jobFiles, setJobFiles] = useState({});
  const [submitLoadingJobId, setSubmitLoadingJobId] = useState(null);
  const [reviewLoadingJobId, setReviewLoadingJobId] = useState(null);

  const [finalTitle, setFinalTitle] = useState("");
  const [finalDescription, setFinalDescription] = useState("");
  const [finalFile, setFinalFile] = useState(null);
  const [finalLoading, setFinalLoading] = useState(false);
  const [finalReviewLoading, setFinalReviewLoading] = useState(false);

  const isManager = ["manager", "admin"].includes(currentUser.roleCategory);
  const isDone = task?.status === "done";
  const isPendingApproval = task?.status === "pending_approval";
  const showWorkSection = !isPendingApproval;

  const [reviewModal, setReviewModal] = useState({
    open: false,
    type: "",
    job: null,
    note: "",
  });

  const latestFinalSubmission = useMemo(() => {
    const list = task?.final_submissions || [];
    return [...list].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    )[0];
  }, [task]);

  const canSubmitFinal =
    isManager &&
    task &&
    !isDone &&
    ["waiting_final_submission", "rejected_final"].includes(task.status);

  const canReviewTaskApproval =
    task?.status === "pending_approval" &&
    Number(task?.current_approver_id) === currentUserId;

  const canReviewThisJob = (job) => {
    if (isDone || job.status !== "submitted") return false;

    return job.approvals?.some(
      (approval) =>
        Number(approval.approver_id) === currentUserId &&
        approval.status === "pending",
    );
  };

  const reviewHistories = useMemo(() => {
    const histories = [];

    jobs.forEach((job) => {
      job.approvals?.forEach((approval) => {
        if (!["approved", "rejected"].includes(approval.status)) return;

        histories.push({
          id: `job-${approval.job_approval_id || approval.approval_id}`,
          type: "Review Pekerjaan",
          title: job.title,
          status: approval.status,
          note: approval.note,
          userId: approval.approver_id,
          createdAt: approval.created_at,
        });
      });
    });

    task?.final_submissions?.forEach((submission) => {
      submission.approvals?.forEach((approval) => {
        if (!["approved", "rejected"].includes(approval.status)) return;

        histories.push({
          id: `final-${
            approval.final_approval_id ||
            approval.final_submission_approval_id ||
            approval.approval_id
          }`,
          type: "Review Hasil Akhir",
          title: submission.output_title || task.title,
          status: approval.status,
          note: approval.note,
          userId: approval.approver_id,
          createdAt: approval.created_at,
        });
      });
    });

    return histories.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );
  }, [jobs, task]);

  const getUserName = (userId) => {
    return userMap[userId] || `User #${userId}`;
  };

  const getAvatarLabel = (userId) => {
    const name = getUserName(userId) || "";
    const words = name.trim().split(/\s+/).filter(Boolean);

    if (words.length >= 2) {
      return `${words[0][0]}${words[1][0]}`.toUpperCase();
    }

    return words[0]?.substring(0, 2).toUpperCase() || "U";
  };

  const loadAll = async () => {
    try {
      setLoading(true);

      const [detail, users] = await Promise.all([
        reportAutomationApi.getTaskDetail(id),
        fetchAllUsers(),
      ]);

      setTask(detail);
      setJobs(detail?.user_jobs || []);

      const mapped = {};
      users.forEach((user) => {
        mapped[user.user_id] =
          user.full_name || user.username || `User #${user.user_id}`;
      });

      setUserMap(mapped);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengambil detail tugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [id]);

  const handleReviewTaskApproval = async (status) => {
    let note = "OK";

    if (status === "rejected") {
      note = window.prompt("Alasan menolak tugas?");
      if (!note) return;
    }

    try {
      setFinalReviewLoading(true);

      await reportAutomationApi.reviewTask(id, {
        status,
        note,
      });

      await loadAll();
    } catch (err) {
      alert(
        err?.response?.data?.message || "Gagal memproses persetujuan tugas",
      );
    } finally {
      setFinalReviewLoading(false);
    }
  };

  const handleStartJob = async (job) => {
    try {
      await reportAutomationApi.startJob(id, job.job_id);
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal mulai pekerjaan");
    }
  };

  const handleSubmitJob = async (job) => {
    const note = jobMessages[job.job_id];
    const file = jobFiles[job.job_id];

    if (!note?.trim()) {
      alert("Isi catatan hasil pekerjaan terlebih dahulu");
      return;
    }

    if (!file) {
      alert("Upload bukti pekerjaan terlebih dahulu");
      return;
    }

    try {
      setSubmitLoadingJobId(job.job_id);

      const formData = new FormData();
      formData.append("file", file);

      await reportAutomationApi.uploadJobEvidence(id, job.job_id, formData);
      await reportAutomationApi.submitJob(id, job.job_id, { note });

      setJobMessages((prev) => ({ ...prev, [job.job_id]: "" }));
      setJobFiles((prev) => ({ ...prev, [job.job_id]: null }));

      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal submit pekerjaan");
    } finally {
      setSubmitLoadingJobId(null);
    }
  };

  const handleReviewJob = async (job, status, note = "OK") => {
    try {
      setReviewLoadingJobId(job.job_id);

      await reportAutomationApi.reviewJob(id, job.job_id, {
        status,
        note,
      });

      setReviewModal({ open: false, type: "", job: null, note: "" });
      await loadAll();
    } catch (err) {
      alert(err?.response?.data?.message || "Gagal review pekerjaan");
    } finally {
      setReviewLoadingJobId(null);
    }
  };

  const handleSubmitFinal = async () => {
    if (!isManager) {
      alert("Hanya manager yang dapat mengirim hasil akhir");
      return;
    }

    if (!finalDescription.trim()) {
      alert("Isi hasil akhir tugas terlebih dahulu");
      return;
    }

    if (!finalFile) {
      alert("Upload file hasil akhir terlebih dahulu");
      return;
    }

    try {
      setFinalLoading(true);

      const formData = new FormData();
      formData.append("output_title", finalTitle || task.title);
      formData.append("output_description", finalDescription);
      formData.append("file", finalFile);

      await reportAutomationApi.submitFinalTask(id, formData);

      await reportAutomationApi.reviewFinalTask(id, {
        status: "approved",
        note: "Auto approved by manager",
      });

      setFinalTitle("");
      setFinalDescription("");
      setFinalFile(null);

      await loadAll();
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          "Gagal mengirim dan menyelesaikan hasil akhir",
      );
    } finally {
      setFinalLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center text-slate-400">Memuat data...</div>
    );
  }

  if (!task) {
    return (
      <div className="py-24 text-center text-slate-400">
        Tugas tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="w-full px-2 mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-[#0B3A78]"
          onClick={() => navigate(-1)}
        />

        <p className="text-sm font-semibold text-[#0B3A78]">
          Kembali ke Ruang Kerja
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
            Detail Tugas
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Lihat informasi tugas, laporan pekerjaan, dan catatan review.
          </p>
        </div>

        <StatusBadge status={task.status} />
      </div>

      <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900">
              {task.title}
            </h2>

            <p className="max-w-3xl mt-3 text-sm leading-7 text-slate-500">
              {task.description || task.objective || "-"}
            </p>
          </div>

          <div className="w-full p-5 border lg:w-[360px] rounded-3xl bg-slate-50 border-slate-200">
            <ProgressBar value={task.progress} />

            <div className="grid grid-cols-2 gap-4 mt-5">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Checklist
                </p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">
                  {task.checklist_done || 0}/
                  {task.checklist_total || jobs.length}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">Deadline</p>
                <p className="mt-1 text-lg font-extrabold text-slate-900">
                  {formatDate(task.due_date)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {canReviewTaskApproval && (
        <div className="p-5 mt-5 bg-white border shadow-sm rounded-[28px] border-slate-200">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">
                Persetujuan Tugas
              </h2>
              <p className="mt-1 text-sm leading-6 text-slate-500">
                Tugas ini sedang menunggu persetujuan. Silakan setujui atau
                tolak tugas berdasarkan informasi yang tersedia.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:min-w-[360px]">
              <button
                type="button"
                disabled={finalReviewLoading}
                onClick={() => handleReviewTaskApproval("rejected")}
                className="inline-flex items-center justify-center flex-1 gap-2 px-5 py-3 text-sm font-bold text-red-700 rounded-2xl bg-red-50 hover:bg-red-100 disabled:opacity-50"
              >
                <XCircle size={16} />
                Tolak Tugas
              </button>

              <button
                type="button"
                disabled={finalReviewLoading}
                onClick={() => handleReviewTaskApproval("approved")}
                className="inline-flex items-center justify-center flex-1 gap-2 px-5 py-3 text-sm font-bold text-white bg-green-600 rounded-2xl hover:bg-green-700 disabled:opacity-50"
              >
                <CheckCircle2 size={16} />
                Setujui Tugas
              </button>
            </div>
          </div>
        </div>
      )}

      <div
        className={`grid grid-cols-1 gap-6 mt-8 ${
          showWorkSection ? "xl:grid-cols-3" : ""
        }`}
      >
        <div className={showWorkSection ? "space-y-6 xl:col-span-2" : ""}>
          <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
            <h2 className="text-2xl font-extrabold text-slate-900">
              Informasi Tugas
            </h2>

            <div className="grid gap-4 mt-5 md:grid-cols-2">
              <div className="p-5 border rounded-3xl border-slate-200 bg-slate-50">
                <p className="text-sm font-bold text-slate-800">Tujuan Tugas</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {task.objective || "-"}
                </p>
              </div>

              <div className="p-5 border rounded-3xl border-slate-200 bg-slate-50">
                <p className="text-sm font-bold text-slate-800">
                  Target Pekerjaan
                </p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {task.target_action || "-"}
                </p>
              </div>

              <div className="p-5 border md:col-span-2 rounded-3xl border-slate-200 bg-slate-50">
                <p className="text-sm font-bold text-slate-800">Anggota Tim</p>

                <div className="flex flex-wrap gap-3 mt-3">
                  {task.participants?.map((item) => (
                    <div
                      key={item.participant_id}
                      className="flex items-center gap-2 px-3 py-2 bg-white border rounded-full border-slate-200"
                    >
                      <div className="flex items-center justify-center w-8 h-8 text-xs font-bold text-white rounded-full bg-[#2DAAE1]">
                        {getAvatarLabel(item.user_id)}
                      </div>

                      <span className="text-sm font-medium text-slate-700">
                        {getUserName(item.user_id)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {showWorkSection && (
            <>
              <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Laporan Pekerjaan Anggota Tim
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Setiap anggota dapat mulai mengerjakan, mengirim bukti, dan
                  memperbaiki pekerjaan jika ditolak.
                </p>

                <div className="grid gap-5 mt-6 md:grid-cols-2">
                  {jobs.map((job) => {
                    const isMyJob =
                      Number(job.user_id) === Number(currentUser.id);

                    const canStartJob =
                      !isDone && isMyJob && job.status === "pending";

                    const canSubmitJob =
                      !isDone &&
                      isMyJob &&
                      ["in_progress", "rejected"].includes(job.status);

                    const canReviewJob = canReviewThisJob(job);

                    return (
                      <div
                        key={job.job_id}
                        className="p-5 border rounded-3xl border-slate-200 bg-slate-50"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-slate-400">
                              {getUserName(job.user_id)}
                            </p>

                            <h3 className="mt-1 font-extrabold text-slate-900">
                              {job.title}
                            </h3>
                          </div>

                          <StatusBadge status={job.status} />
                        </div>

                        <p className="mt-3 text-sm leading-6 text-slate-500">
                          {job.description || "-"}
                        </p>

                        <div className="mt-4">
                          <ProgressBar value={job.progress} />
                        </div>

                        {job.status === "rejected" && (
                          <div className="p-4 mt-4 text-sm leading-6 text-red-700 border border-red-100 rounded-2xl bg-red-50">
                            Pekerjaan ini perlu diperbaiki. Lihat catatan review
                            di bagian kanan sebagai panduan revisi.
                          </div>
                        )}

                        {job.attachments?.length > 0 && (
                          <div className="pt-4 mt-4 border-t border-slate-200">
                            <p className="mb-2 text-xs font-bold uppercase text-slate-400">
                              Bukti Pekerjaan
                            </p>

                            <div className="space-y-2">
                              {job.attachments.map((file) => (
                                <a
                                  key={file.attachment_id}
                                  href={`${API_FILE_BASE}${file.file_url}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="flex items-center gap-2 px-3 py-2 text-xs font-bold bg-white border rounded-xl text-[#0B3A78] border-slate-200"
                                >
                                  <FileText size={14} />
                                  {file.file_name || "File Bukti"}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}

                        {canStartJob && (
                          <button
                            type="button"
                            onClick={() => handleStartJob(job)}
                            className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-bold text-blue-700 rounded-2xl bg-blue-50 hover:bg-blue-100"
                          >
                            <Clock3 size={16} />
                            Mulai Pekerjaan
                          </button>
                        )}

                        {canSubmitJob && (
                          <div className="pt-4 mt-4 border-t border-slate-200">
                            <textarea
                              value={jobMessages[job.job_id] || ""}
                              onChange={(e) =>
                                setJobMessages((prev) => ({
                                  ...prev,
                                  [job.job_id]: e.target.value,
                                }))
                              }
                              rows={3}
                              placeholder="Tulis hasil pekerjaan atau perbaikan kamu..."
                              className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-2xl border-slate-200"
                            />

                            <input
                              type="file"
                              className="block w-full mt-3 text-xs text-slate-500"
                              onChange={(e) =>
                                setJobFiles((prev) => ({
                                  ...prev,
                                  [job.job_id]: e.target.files?.[0] || null,
                                }))
                              }
                            />

                            <button
                              disabled={submitLoadingJobId === job.job_id}
                              onClick={() => handleSubmitJob(job)}
                              className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 mt-4 text-sm font-bold text-white rounded-2xl bg-[#0B3A78] disabled:opacity-50"
                            >
                              <Upload size={16} />
                              {submitLoadingJobId === job.job_id
                                ? "Mengirim..."
                                : job.status === "rejected"
                                  ? "Kirim Perbaikan"
                                  : "Submit Pekerjaan"}
                            </button>
                          </div>
                        )}

                        {canReviewJob && (
                          <div className="grid grid-cols-2 gap-3 pt-4 mt-4 border-t border-slate-200">
                            <button
                              type="button"
                              disabled={reviewLoadingJobId === job.job_id}
                              onClick={() =>
                                setReviewModal({
                                  open: true,
                                  type: "rejected",
                                  job,
                                  note: "",
                                })
                              }
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-700 rounded-2xl bg-red-50 disabled:opacity-50"
                            >
                              <XCircle size={16} />
                              Tolak
                            </button>

                            <button
                              type="button"
                              disabled={reviewLoadingJobId === job.job_id}
                              onClick={() => handleReviewJob(job, "approved")}
                              className="inline-flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-white bg-green-600 rounded-2xl disabled:opacity-50"
                            >
                              <CheckCircle2 size={16} />
                              Setujui
                            </button>
                          </div>
                        )}

                        {!isMyJob && (
                          <div className="px-4 py-3 mt-4 text-xs font-semibold bg-white rounded-2xl text-slate-400">
                            Pekerjaan ini ditugaskan kepada{" "}
                            {getUserName(job.user_id)}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {canSubmitFinal && (
                <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    Pengumpulan Hasil Akhir
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Kirim hasil akhir setelah semua pekerjaan anggota disetujui.
                  </p>

                  <div className="grid gap-4 mt-5">
                    <input
                      value={finalTitle}
                      onChange={(e) => setFinalTitle(e.target.value)}
                      placeholder="Judul hasil akhir"
                      className="w-full px-4 py-3 text-sm border outline-none rounded-2xl border-slate-200"
                    />

                    <textarea
                      value={finalDescription}
                      onChange={(e) => setFinalDescription(e.target.value)}
                      rows={4}
                      placeholder="Tuliskan hasil akhir pekerjaan..."
                      className="w-full px-4 py-3 text-sm border outline-none resize-none rounded-2xl border-slate-200"
                    />

                    <input
                      type="file"
                      className="block w-full text-xs text-slate-500"
                      onChange={(e) =>
                        setFinalFile(e.target.files?.[0] || null)
                      }
                    />

                    <button
                      disabled={finalLoading}
                      onClick={handleSubmitFinal}
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-bold text-white rounded-2xl bg-[#0B3A78] disabled:opacity-50"
                    >
                      <Send size={16} />
                      {finalLoading
                        ? "Mengirim & menyelesaikan..."
                        : "Kirim Hasil Akhir"}
                    </button>
                  </div>
                </div>
              )}

              {latestFinalSubmission && (
                <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-extrabold text-slate-900">
                        Hasil Akhir Terbaru
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Dikirim oleh{" "}
                        {getUserName(latestFinalSubmission.submitted_by)}
                      </p>
                    </div>

                    <StatusBadge
                      status={
                        task.status === "done"
                          ? "done"
                          : latestFinalSubmission.status
                      }
                    />
                  </div>

                  <div className="p-5 mt-5 border rounded-3xl border-slate-200 bg-slate-50">
                    <h3 className="font-bold text-slate-900">
                      {latestFinalSubmission.output_title || "Hasil Akhir"}
                    </h3>

                    <p className="mt-3 text-sm leading-7 whitespace-pre-line text-slate-600">
                      {latestFinalSubmission.output_description}
                    </p>

                    {latestFinalSubmission.attachments?.length > 0 && (
                      <div className="mt-4 space-y-2">
                        {latestFinalSubmission.attachments.map((file) => (
                          <a
                            key={file.final_attachment_id}
                            href={`${API_FILE_BASE}${file.file_url}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl bg-[#0B3A78]"
                          >
                            <Download size={14} />
                            {file.file_name || "File Hasil Akhir"}
                          </a>
                        ))}
                      </div>
                    )}

                    {latestFinalSubmission.review_note && (
                      <div className="p-4 mt-4 text-sm bg-white border rounded-2xl border-slate-200 text-slate-600">
                        <b>Catatan Review:</b>{" "}
                        {latestFinalSubmission.review_note}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {showWorkSection && (
          <div className="space-y-6">
            <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle size={18} className="text-[#0B3A78]" />
                <h2 className="text-xl font-extrabold text-slate-900">
                  Catatan Review
                </h2>
              </div>

              <p className="mb-5 text-sm leading-6 text-slate-500">
                Catatan ini berisi hasil review pekerjaan. Jika pekerjaan
                ditolak, gunakan catatan ini untuk memperbaiki pekerjaan sebelum
                submit ulang.
              </p>

              <div className="pr-2 space-y-4 overflow-y-auto max-h-[520px]">
                {reviewHistories.length > 0 ? (
                  reviewHistories.map((item) => {
                    const isRejected = item.status === "rejected";

                    return (
                      <div
                        key={item.id}
                        className={`p-4 border rounded-3xl ${
                          isRejected
                            ? "bg-red-50 border-red-100"
                            : "bg-green-50 border-green-100"
                        }`}
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase text-slate-400">
                              {item.type}
                            </p>

                            <h3 className="mt-1 text-sm font-extrabold text-slate-900">
                              {item.title}
                            </h3>
                          </div>

                          <span
                            className={`px-3 py-1 text-xs font-bold rounded-full ${
                              isRejected
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}
                          >
                            {isRejected ? "Ditolak" : "Disetujui"}
                          </span>
                        </div>

                        <div className="p-4 mt-4 bg-white border rounded-2xl border-slate-200">
                          <p className="text-xs font-bold text-slate-400">
                            Catatan
                          </p>

                          <p className="mt-2 text-sm leading-6 whitespace-pre-line text-slate-700">
                            {item.note || "Tidak ada catatan."}
                          </p>
                        </div>

                        <p className="mt-3 text-xs text-slate-400">
                          Direview oleh {getUserName(item.userId)} •{" "}
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleString("id-ID")
                            : "-"}
                        </p>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-12 text-sm text-center text-slate-400">
                    Belum ada catatan review.
                  </div>
                )}
              </div>

              {isDone && (
                <div className="p-4 mt-5 text-sm font-semibold text-center text-green-700 rounded-2xl bg-green-50">
                  Tugas telah selesai.
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {reviewModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-3xl">
            <h2 className="text-xl font-extrabold text-slate-900">
              Tolak Pekerjaan
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Tuliskan alasan penolakan agar anggota tim tahu apa yang harus
              diperbaiki.
            </p>

            <textarea
              rows={4}
              value={reviewModal.note}
              onChange={(e) =>
                setReviewModal((prev) => ({ ...prev, note: e.target.value }))
              }
              placeholder="Contoh: File belum sesuai brief, mohon revisi bagian..."
              className="w-full px-4 py-3 mt-5 text-sm border outline-none resize-none rounded-2xl border-slate-200 focus:border-[#0B3A78]"
            />

            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                type="button"
                onClick={() =>
                  setReviewModal({ open: false, type: "", job: null, note: "" })
                }
                className="px-4 py-3 text-sm font-bold border rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                type="button"
                disabled={!reviewModal.note.trim() || reviewLoadingJobId}
                onClick={() =>
                  handleReviewJob(reviewModal.job, "rejected", reviewModal.note)
                }
                className="px-4 py-3 text-sm font-bold text-white bg-red-600 rounded-2xl hover:bg-red-700 disabled:opacity-50"
              >
                Kirim Penolakan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
