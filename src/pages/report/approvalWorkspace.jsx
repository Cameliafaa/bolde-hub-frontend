import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Search,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { reportAutomationApi } from "../../services/reportAutomation/reportApi";

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

function WorkspaceTab({ active, currentUser }) {
  const navigate = useNavigate();

  return (
    <div className="inline-flex p-1 mt-6 rounded-3xl bg-blue-50">
      <button
        type="button"
        onClick={() => navigate("/report-automation/tasks")}
        className={`px-6 py-3 text-sm font-bold rounded-2xl transition ${
          active === "workspace"
            ? "bg-[#0B3A78] text-white shadow"
            : "text-[#0B3A78] hover:bg-white/70"
        }`}
      >
        Ruang Kerja Saya
      </button>

      {currentUser.roleCategory !== "staff" && (
        <>
          <button
            type="button"
            onClick={() => navigate("/report-automation/team")}
            className={`px-6 py-3 text-sm font-bold rounded-2xl transition ${
              active === "team"
                ? "bg-[#0B3A78] text-white shadow"
                : "text-[#0B3A78] hover:bg-white/70"
            }`}
          >
            Ruang Kerja Tim
          </button>

          <button
            type="button"
            onClick={() => navigate("/report-automation/approvals")}
            className={`px-6 py-3 text-sm font-bold rounded-2xl transition ${
              active === "approval"
                ? "bg-[#0B3A78] text-white shadow"
                : "text-[#0B3A78] hover:bg-white/70"
            }`}
          >
            Ruang Approval
          </button>
        </>
      )}
    </div>
  );
}
function hasPendingJobApproval(task, currentUserId) {
  return task.user_jobs?.some(
    (job) =>
      job.status === "submitted" &&
      job.approvals?.some(
        (approval) =>
          Number(approval.approver_id) === Number(currentUserId) &&
          approval.status === "pending",
      ),
  );
}

function getPendingJobCount(task, currentUserId) {
  return (
    task.user_jobs?.filter(
      (job) =>
        job.status === "submitted" &&
        job.approvals?.some(
          (approval) =>
            Number(approval.approver_id) === Number(currentUserId) &&
            approval.status === "pending",
        ),
    ).length || 0
  );
}

function isFinalApprovalTask(task, currentUser) {
  const isManager = currentUser.roleCategory === "manager";
  if (!isManager) return false;

  return [
    "waiting_final_submission",
    "rejected_final",
    "waiting_final_review",
  ].includes(task.status);
}

function ApprovalCard({ task, currentUserId, onClick }) {
  const pendingJobCount = getPendingJobCount(task, currentUserId);

  return (
    <div
      onClick={() => onClick(task)}
      className="p-5 transition bg-white border shadow-sm cursor-pointer rounded-3xl border-slate-200 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="inline-flex items-center gap-2 px-3 py-1 text-xs font-bold text-indigo-700 rounded-full bg-indigo-50">
          <Clock3 size={14} />
          Menunggu Approval
        </span>

        <span className="text-xs font-bold text-slate-400">
          Deadline: {formatDate(task.due_date)}
        </span>
      </div>

      <h3 className="mt-4 text-lg font-extrabold text-slate-900">
        {task.title}
      </h3>

      <p className="mt-2 text-sm leading-6 line-clamp-2 text-slate-500">
        {task.description || task.objective || "-"}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5">
        <div className="p-4 rounded-2xl bg-slate-50">
          <p className="text-xs font-bold text-slate-400">Job Review</p>
          <p className="mt-1 text-xl font-extrabold text-slate-900">
            {pendingJobCount}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50">
          <p className="text-xs font-bold text-slate-400">Status Task</p>
          <p className="mt-1 text-sm font-bold text-[#0B3A78]">{task.status}</p>
        </div>
      </div>

      <button
        type="button"
        className="inline-flex items-center justify-center w-full gap-2 px-4 py-3 mt-5 text-sm font-bold text-white rounded-2xl bg-[#0B3A78]"
      >
        <FileCheck2 size={16} />
        Lihat Detail
      </button>
    </div>
  );
}

export default function ApprovalWorkspace() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const currentUserId = Number(currentUser.id || 0);

  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await reportAutomationApi.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengambil data approval");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvalTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks.filter((task) => {
      const matchSearch = `${task.title} ${task.description} ${task.objective}`
        .toLowerCase()
        .includes(keyword);

      const needJobApproval = hasPendingJobApproval(task, currentUserId);

      return matchSearch && needJobApproval;
    });
  }, [tasks, search, currentUserId]);

  const handleOpenDetail = (task) => {
    navigate(`/report-automation/task-detail/${task.task_id}`);
  };

  return (
    <div className="w-full px-2 mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-[#0B3A78]"
          onClick={() => navigate("/report-automation")}
        />

        <p className="text-sm font-semibold text-[#0B3A78]">
          Kembali ke Dashboard
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
            Ruang Approval
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pantau pekerjaan bawahan dan hasil akhir yang perlu kamu review.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-indigo-700 rounded-2xl bg-indigo-50 w-fit">
          <CheckCircle2 size={17} />
          {approvalTasks.length} Menunggu Approval
        </div>
      </div>

      <WorkspaceTab active="approval" currentUser={currentUser} />

      <div className="p-6 mt-8 bg-white border shadow-sm rounded-[32px] border-slate-200">
        <div className="relative w-full max-w-md">
          <Search
            size={18}
            className="absolute -translate-y-1/2 text-slate-400 left-4 top-1/2"
          />

          <input
            type="text"
            placeholder="Cari tugas approval..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full py-3 pr-4 text-sm border outline-none h-14 bg-slate-50 pl-11 rounded-2xl border-slate-200 focus:border-[#2E90FA]"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-24 mt-8 text-center bg-white border shadow-sm rounded-3xl border-slate-200 text-slate-400">
          Memuat data approval...
        </div>
      ) : approvalTasks.length === 0 ? (
        <div className="py-24 mt-8 text-center bg-white border shadow-sm rounded-3xl border-slate-200 text-slate-400">
          Belum ada approval yang perlu diproses.
        </div>
      ) : (
        <div className="grid gap-5 mt-8 md:grid-cols-2 xl:grid-cols-3">
          {approvalTasks.map((task) => (
            <ApprovalCard
              key={task.task_id}
              task={task}
              currentUserId={currentUserId}
              onClick={handleOpenDetail}
            />
          ))}
        </div>
      )}
    </div>
  );
}
