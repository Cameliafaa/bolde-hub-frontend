import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  XCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { reportAutomationApi } from "../../services/reportAutomation/reportApi";

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getStatusClass = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "approved") return "bg-green-50 text-green-700";
  if (s === "rejected") return "bg-red-50 text-red-700";
  return "bg-yellow-50 text-yellow-700";
};

export default function ReportApprovalInbox() {
  const navigate = useNavigate();

  const [approvals, setApprovals] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadApprovals = async () => {
    try {
      setLoading(true);
      const data = await reportAutomationApi.getApprovals();
      setApprovals(data || []);
    } catch (err) {
      console.error(err);
      alert("Gagal mengambil approval inbox");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApprovals();
  }, []);

  return (
    <div className="w-full px-2 mx-auto max-w-[1500px]">
      <div className="flex flex-wrap items-center gap-2 mb-5">
        <ArrowLeft
          size={18}
          className="cursor-pointer text-[#0B3A78]"
          onClick={() => navigate("/report-automation/tasks")}
        />

        <p
          onClick={() => navigate("/report-automation/tasks")}
          className="text-sm font-semibold cursor-pointer text-[#0B3A78]"
        >
          Back to Task Workspace
        </p>
      </div>

      <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
        <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">
              Approval Inbox
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Task yang membutuhkan approval atau sudah pernah diproses.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold rounded-2xl bg-slate-100 text-slate-700">
            <FileText size={17} />
            {approvals.length} approval
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-slate-400">
            <Loader2 size={18} className="animate-spin" />
            Loading approval...
          </div>
        ) : approvals.length === 0 ? (
          <div className="py-20 text-center border border-dashed rounded-3xl border-slate-200 bg-slate-50">
            <p className="font-bold text-slate-700">Belum ada approval</p>
            <p className="mt-1 text-sm text-slate-400">
              Task approval akan muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {approvals.map((item) => {
              const task = item.task || item.tasks || item;
              const taskId = item.task_id || task.task_id;

              return (
                <div
                  key={item.approval_id || taskId}
                  onClick={() =>
                    taskId &&
                    navigate(`/report-automation/task-detail/${taskId}`)
                  }
                  className="p-6 transition bg-white border cursor-pointer rounded-3xl border-slate-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusClass(
                        item.status || item.approval_status,
                      )}`}
                    >
                      {item.status || item.approval_status || "pending"}
                    </span>

                    <span className="text-xs font-bold text-slate-400">
                      Level {item.approval_level || item.level || 1}
                    </span>
                  </div>

                  <h2 className="mt-5 text-lg font-extrabold text-slate-900">
                    {task.title || "-"}
                  </h2>

                  <p className="mt-2 text-sm leading-6 line-clamp-2 text-slate-500">
                    {task.objective || task.description || "-"}
                  </p>

                  <div className="pt-4 mt-5 space-y-2 text-sm border-t border-slate-100 text-slate-500">
                    <p>
                      Created by:{" "}
                      <b>
                        {task.created_by_name || `User #${task.created_by}`}
                      </b>
                    </p>

                    <p>
                      Deadline: <b>{formatDate(task.due_date)}</b>
                    </p>

                    <p>
                      Priority:{" "}
                      <b className="capitalize">{task.priority || "-"}</b>
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-4 mt-5">
                    <div className="text-xs text-slate-400">
                      {item.updated_at
                        ? `Diproses ${formatDate(item.updated_at)}`
                        : "Klik untuk lihat detail"}
                    </div>

                    {(item.status || item.approval_status) === "approved" ? (
                      <CheckCircle2 size={18} className="text-green-600" />
                    ) : (item.status || item.approval_status) === "rejected" ? (
                      <XCircle size={18} className="text-red-600" />
                    ) : (
                      <Clock3 size={18} className="text-yellow-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
