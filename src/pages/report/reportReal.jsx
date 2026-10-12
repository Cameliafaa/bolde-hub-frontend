import React, { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ArrowRight,
  Activity,
  FileText,
  Download,
  PieChart,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import { reportAutomationApi } from "../../services/reportAutomation/reportApi";
import {
  fetchAllUsers,
  fetchUserDetail,
} from "../../services/users/userService";

const API_FILE_BASE = (
  process.env.REACT_APP_API_BASE_URL || "http://localhost:8081/api/v1"
).replace("/api/v1", "");

const DIVISION_ROLE_GROUPS = {
  event_activation: [35, 46, 51],
  product_marketing: [34, 48, 49],
  digital_marketing: [33, 47, 50],
};

const ADMIN_ROLE_IDS = [8, 9, 11, 12];

const statusLabelMap = {
  pending_approval: "Menunggu Review",
  assigned: "Tugas Baru",
  in_progress: "Sedang Dikerjakan",
  waiting_job_review: "Menunggu Review",
  waiting_final_submission: "Menunggu Hasil Akhir",
  waiting_final_review: "Menunggu Review Akhir",
  rejected_final: "Hasil Akhir Perlu Revisi",
  done: "Selesai",
};

const isReviewStatus = (status) =>
  [
    "pending_approval",
    "waiting_job_review",
    "waiting_final_review",
    "rejected_final",
  ].includes(status);

const isActiveStatus = (status) =>
  ["assigned", "in_progress", "waiting_final_submission"].includes(status);

const isCompletedStatus = (status) => status === "done";

const isDelayedTask = (task) => {
  if (!task?.due_date || task.status === "done") return false;

  const today = new Date();
  const dueDate = new Date(task.due_date);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
};

function getRoleId(user) {
  return Number(
    user?.user_role_id ||
      user?.role_id ||
      user?.user_roles?.user_role_id ||
      user?.user_role?.user_role_id ||
      user?.role?.user_role_id ||
      user?.user_roles?.id ||
      user?.role?.id ||
      0,
  );
}

function getRoleName(user) {
  return String(
    user?.user_roles?.name ||
      user?.user_role?.name ||
      user?.role?.name ||
      user?.role_name ||
      user?.role ||
      "",
  ).toLowerCase();
}

function getRoleCategoryId(user) {
  const roleCategoryId = Number(
    user?.user_roles?.role_category_id ||
      user?.user_role?.role_category_id ||
      user?.role?.role_category_id ||
      user?.role_category_id ||
      user?.roleCategoryId ||
      0,
  );

  if (roleCategoryId) return roleCategoryId;

  const roleName = getRoleName(user);

  if (roleName.includes("manager") || roleName.includes("admin")) return 1;
  if (roleName.includes("spv") || roleName.includes("supervisor")) return 2;
  if (roleName.includes("staff")) return 3;

  return 0;
}

function getCurrentUserId(user) {
  return Number(user?.user_id || user?.id || 0);
}

function getUserDivisionKey(roleId) {
  const numericRoleId = Number(roleId);

  return Object.entries(DIVISION_ROLE_GROUPS).find(([, roleIds]) =>
    roleIds.includes(numericRoleId),
  )?.[0];
}

function isAdministratorRole(user) {
  const roleId = getRoleId(user);
  const roleName = getRoleName(user);

  return (
    ADMIN_ROLE_IDS.includes(roleId) ||
    roleName.includes("admin") ||
    roleName.includes("administrator") ||
    roleName.includes("general marketing") ||
    roleName.includes("super admin")
  );
}

function getTaskRoleIds(task) {
  const roleIds = [];

  if (Array.isArray(task?.user_jobs)) {
    task.user_jobs.forEach((job) => {
      const roleId = Number(
        job.user_role_id ||
          job.role_id ||
          getRoleId(job.user) ||
          getRoleId(job.employee),
      );

      if (roleId) roleIds.push(roleId);
    });
  }

  if (Array.isArray(task?.participants)) {
    task.participants.forEach((participant) => {
      const roleId = Number(
        participant.user_role_id ||
          participant.role_id ||
          getRoleId(participant.user),
      );

      if (roleId) roleIds.push(roleId);
    });
  }

  return [...new Set(roleIds)];
}

function isSameDivisionTask(task, currentUser) {
  if (isAdministratorRole(currentUser)) return true;

  const currentDivisionKey = getUserDivisionKey(getRoleId(currentUser));
  if (!currentDivisionKey) return false;

  const allowedRoleIds = DIVISION_ROLE_GROUPS[currentDivisionKey];

  return getTaskRoleIds(task).some((roleId) =>
    allowedRoleIds.includes(Number(roleId)),
  );
}

function isTaskOwnedByUser(task, userId) {
  if (!userId) return false;

  return (
    Number(task.created_by) === userId ||
    Number(task.user_id) === userId ||
    Number(task.current_approver_id) === userId ||
    task.participants?.some((p) => Number(p.user_id) === userId) ||
    task.user_jobs?.some(
      (job) =>
        Number(job.user_id) === userId ||
        job.approvals?.some(
          (approval) => Number(approval.approver_id) === userId,
        ),
    )
  );
}

function ProgressBar({ value }) {
  const safeValue = Math.min(Number(value || 0), 100);

  return (
    <div className="w-full">
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[#0B3A78] to-[#2E90FA]"
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <div className="mt-2 text-xs font-semibold text-right text-slate-500">
        {Math.round(safeValue)}%
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending_approval: "bg-orange-50 text-orange-700",
    assigned: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-50 text-blue-700",
    waiting_job_review: "bg-indigo-50 text-indigo-700",
    waiting_final_submission: "bg-indigo-50 text-indigo-700",
    waiting_final_review: "bg-purple-50 text-purple-700",
    rejected_final: "bg-red-50 text-red-700",
    done: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        map[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {statusLabelMap[status] || "-"}
    </span>
  );
}

function DonutChart({ data = [] }) {
  const total = data.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const chartItems = data.map((item) => {
    const labelMap = {
      Active: {
        title: "Tugas Aktif",
        desc: "Tugas baru atau sedang dikerjakan",
        color: "#2E90FA",
        text: "text-blue-600",
      },
      Completed: {
        title: "Tugas Selesai",
        desc: "Tugas sudah selesai",
        color: "#22C55E",
        text: "text-green-600",
      },
      "Need Review": {
        title: "Menunggu Review",
        desc: "Menunggu pemeriksaan atau hasil akhir",
        color: "#FACC15",
        text: "text-yellow-600",
      },
      Delayed: {
        title: "Tugas Terlambat",
        desc: "Melewati batas waktu",
        color: "#EF4444",
        text: "text-red-600",
      },
    };

    const config = labelMap[item.label];

    return {
      ...item,
      ...config,
      percent: total ? Math.round((Number(item.value || 0) / total) * 100) : 0,
    };
  });

  let current = 0;

  const segments =
    total > 0
      ? chartItems
          .map((item) => {
            const start = current;
            const end = current + (Number(item.value || 0) / total) * 100;
            current = end;
            return `${item.color} ${start}% ${end}%`;
          })
          .join(", ")
      : "#E5E7EB 0% 100%";

  return (
    <div className="relative p-6 overflow-hidden bg-white border shadow-sm rounded-[32px] border-slate-200">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0B3A78] via-[#2E90FA] to-[#22C55E]" />

      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-11 h-11 rounded-2xl bg-blue-50 text-[#0B3A78]">
          <PieChart size={22} />
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-slate-900">
            Komposisi Status Tugas
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Perbandingan jumlah tugas berdasarkan status pengerjaan.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.15fr] lg:items-center">
        <div className="space-y-4">
          {chartItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-4 p-4 border rounded-2xl border-slate-100 bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: item.color }}
                />

                <div>
                  <p className="text-sm font-extrabold text-slate-800">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-400">{item.desc}</p>
                </div>
              </div>

              <div className="text-right">
                <p className={`text-lg font-extrabold ${item.text}`}>
                  {item.value}
                </p>
                <p className="text-xs font-bold text-slate-400">
                  {item.percent}%
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative flex items-center justify-center min-h-[330px]">
          <div
            className="relative rounded-full shadow-inner w-[300px] h-[300px]"
            style={{ background: `conic-gradient(${segments})` }}
          >
            <div className="absolute flex flex-col items-center justify-center bg-white rounded-full shadow-sm inset-[74px]">
              <p className="text-5xl font-extrabold text-slate-900">{total}</p>
              <p className="mt-1 text-sm font-bold text-slate-400">
                Total Tugas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmployeeTaskChart({ performance = [], userMap = {} }) {
  const max = Math.max(...performance.map((u) => Number(u.total_job || 0)), 1);

  return (
    <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
      <h2 className="text-xl font-extrabold text-slate-900">
        Total Tugas per Karyawan
      </h2>

      <div className="mt-6 space-y-4">
        {performance.length === 0 ? (
          <div className="py-12 text-sm text-center text-slate-400">
            Belum ada data karyawan.
          </div>
        ) : (
          performance.slice(0, 8).map((user) => {
            const name = userMap[user.user_id] || `User #${user.user_id}`;
            const total = Number(user.total_job || 0);

            return (
              <div
                key={user.user_id}
                className="grid gap-3 grid-cols-[120px_1fr]"
              >
                <p className="text-sm font-semibold truncate text-slate-700">
                  {name}
                </p>

                <div className="relative overflow-hidden rounded-lg h-7 bg-slate-100">
                  <div
                    className="flex items-center justify-end h-full pr-2 text-xs font-bold text-white bg-blue-500 rounded-lg"
                    style={{ width: `${(total / max) * 100}%` }}
                  >
                    {total}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function TaskSummaryTable({ performance = [], userMap = {}, summary = {} }) {
  return (
    <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-xl font-extrabold text-slate-900">
          Ringkasan Tugas
        </h2>

        <div className="px-4 py-3 text-sm font-bold text-center text-white bg-[#0B3A78] rounded-2xl">
          HARI INI
          <br />
          {new Date().toLocaleDateString("id-ID")}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 mt-5">
        <div className="p-4 rounded-2xl bg-slate-50">
          <p className="text-xs font-bold text-slate-400">TOTAL TUGAS</p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">
            {summary?.total_task || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-green-50">
          <p className="text-xs font-bold text-green-500">SELESAI</p>
          <p className="mt-1 text-2xl font-extrabold text-green-700">
            {summary?.completed_task || 0}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-yellow-50">
          <p className="text-xs font-bold text-yellow-600">MENUNGGU REVIEW</p>
          <p className="mt-1 text-2xl font-extrabold text-yellow-700">
            {summary?.waiting_review || 0}
          </p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden border rounded-2xl border-slate-200">
        <table className="w-full text-sm">
          <thead className="text-white bg-[#0B3A78]">
            <tr>
              <th className="px-4 py-3 text-left">Nama Karyawan</th>
              <th className="px-4 py-3 text-center">Total</th>
              <th className="px-4 py-3 text-center">Aktif</th>
              <th className="px-4 py-3 text-center">Review</th>
              <th className="px-4 py-3 text-center">Selesai</th>
            </tr>
          </thead>

          <tbody>
            {performance.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-10 text-center text-slate-400"
                >
                  Belum ada data tugas.
                </td>
              </tr>
            ) : (
              performance.slice(0, 6).map((user) => (
                <tr key={user.user_id} className="border-t border-slate-100">
                  <td className="px-4 py-3 font-semibold text-slate-700">
                    {userMap[user.user_id] || `User #${user.user_id}`}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {user.total_job || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-blue-600">
                    {user.active_job || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-yellow-600">
                    {user.waiting_review || 0}
                  </td>
                  <td className="px-4 py-3 text-center text-green-600">
                    {user.completed_job || 0}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MonthlyTaskChart({ tasks = [], selectedYear }) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "Mei",
    "Jun",
    "Jul",
    "Agu",
    "Sep",
    "Okt",
    "Nov",
    "Des",
  ];

  const data = monthNames.map((label, index) => ({
    label,
    value: tasks.filter((task) => {
      const date = new Date(
        task.created_at || task.start_date || task.due_date,
      );

      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === index &&
        String(date.getFullYear()) === String(selectedYear)
      );
    }).length,
  }));

  const max = Math.max(...data.map((item) => item.value), 1);

  return (
    <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
      <h2 className="text-xl font-extrabold text-slate-900">
        Total Tugas per Bulan
      </h2>

      <div className="flex items-end h-64 gap-3 mt-8">
        {data.map((item) => (
          <div
            key={item.label}
            className="flex flex-col items-center flex-1 gap-2"
          >
            <div className="flex items-end w-full h-48 rounded-xl bg-slate-50">
              <div
                className="flex items-start justify-center w-full pt-2 text-xs font-bold text-white bg-blue-500 rounded-xl"
                style={{ height: `${Math.max((item.value / max) * 100, 4)}%` }}
              >
                {item.value > 0 ? item.value : ""}
              </div>
            </div>

            <p className="text-xs font-semibold text-slate-500">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Pagination({ page, totalPages, onChange }) {
  return (
    <div className="flex items-center justify-end gap-2 mt-5">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="px-4 py-2 text-sm font-bold border rounded-xl disabled:opacity-40"
      >
        Prev
      </button>

      <span className="text-sm font-semibold text-slate-500">
        {page} / {totalPages}
      </span>

      <button
        disabled={page === totalPages}
        onClick={() => onChange(page + 1)}
        className="px-4 py-2 text-sm font-bold border rounded-xl disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}

export default function ReportAutomationDashboard() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [outputs, setOutputs] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [yearlyTasks, setYearlyTasks] = useState([]);
  const [taskPage, setTaskPage] = useState(1);
  const [outputPage, setOutputPage] = useState(1);

  const pageSize = 10;

  const now = new Date();

  const [selectedMonth, setSelectedMonth] = useState(
    String(now.getMonth() + 1).padStart(2, "0"),
  );
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  const getUserIdFromToken = () => {
    const token =
      localStorage.getItem("token") ||
      JSON.parse(localStorage.getItem("auth") || "{}")?.token;

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return Number(payload.user_id || payload.id || payload.sub);
    } catch {
      return null;
    }
  };

  const loadDashboard = async () => {
    try {
      setLoading(true);

      const loggedInUserId = getUserIdFromToken();
      const monthParam = `${selectedYear}-${selectedMonth}`;

      const yearlyRequests = Array.from({ length: 12 }).map((_, index) => {
        const month = String(index + 1).padStart(2, "0");

        return reportAutomationApi.getTasks({
          month: `${selectedYear}-${month}`,
        });
      });

      const [taskData, outputData, users, userDetail, yearlyTaskResults] =
        await Promise.all([
          reportAutomationApi.getTasks({ month: monthParam }),
          reportAutomationApi.getDashboardOutputs({ month: monthParam }),
          fetchAllUsers(),
          loggedInUserId
            ? fetchUserDetail(loggedInUserId)
            : Promise.resolve(null),
          Promise.all(yearlyRequests),
        ]);

      const mapped = {};
      users.forEach((user) => {
        mapped[user.user_id] =
          user.full_name || user.username || `User #${user.user_id}`;
      });

      const mergedYearlyTasks = yearlyTaskResults.flat();

      setTasks(taskData || []);
      setYearlyTasks(mergedYearlyTasks || []);
      setOutputs(outputData || []);
      setUserMap(mapped);
      setCurrentUser(userDetail || null);
    } catch (err) {
      console.error("LOAD DASHBOARD ERROR:", err);
      alert(err?.response?.data?.message || "Gagal mengambil dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, [selectedMonth, selectedYear]);

  const roleCategoryId = getRoleCategoryId(currentUser);
  const currentUserId = getCurrentUserId(currentUser);

  const isManager = roleCategoryId === 1;
  const isSpv = roleCategoryId === 2;
  const isStaff = roleCategoryId === 3;
  const isUnknownRole = !roleCategoryId;

  const visibleTasks = useMemo(() => {
    if (isAdministratorRole(currentUser) || isUnknownRole) return tasks;

    if (isManager || isSpv) {
      return tasks.filter((task) => isSameDivisionTask(task, currentUser));
    }

    return tasks.filter((task) => isTaskOwnedByUser(task, currentUserId));
  }, [tasks, currentUser, isManager, isSpv, isUnknownRole, currentUserId]);

  const visibleYearlyTasks = useMemo(() => {
    if (isAdministratorRole(currentUser) || isUnknownRole) return yearlyTasks;

    if (isManager || isSpv) {
      return yearlyTasks.filter((task) =>
        isSameDivisionTask(task, currentUser),
      );
    }

    return yearlyTasks.filter((task) => isTaskOwnedByUser(task, currentUserId));
  }, [
    yearlyTasks,
    currentUser,
    isManager,
    isSpv,
    isUnknownRole,
    currentUserId,
  ]);

  const visibleTaskIds = useMemo(() => {
    return new Set(visibleTasks.map((task) => Number(task.task_id)));
  }, [visibleTasks]);

  const visibleOutputs = useMemo(() => {
    if (isAdministratorRole(currentUser) || isUnknownRole) return outputs;

    return outputs.filter((output) =>
      visibleTaskIds.has(Number(output.task_id)),
    );
  }, [outputs, visibleTaskIds, currentUser, isUnknownRole]);

  const dashboardSummary = useMemo(() => {
    return {
      total_task: visibleTasks.length,
      active_task: visibleTasks.filter((task) => isActiveStatus(task.status))
        .length,
      completed_task: visibleTasks.filter((task) =>
        isCompletedStatus(task.status),
      ).length,
      waiting_review: visibleTasks.filter((task) => isReviewStatus(task.status))
        .length,
      delayed_task: visibleTasks.filter((task) => isDelayedTask(task)).length,
    };
  }, [visibleTasks]);

  const computedPerformance = useMemo(() => {
    const map = {};

    visibleTasks.forEach((task) => {
      const users =
        task.user_jobs?.length > 0
          ? task.user_jobs.map((job) => ({
              user_id: job.user_id,
              status: job.status,
            }))
          : task.participants?.map((p) => ({
              user_id: p.user_id,
              status: task.status,
            })) || [];

      users.forEach((item) => {
        const userId = Number(item.user_id);
        if (!userId) return;

        if (!map[userId]) {
          map[userId] = {
            user_id: userId,
            total_job: 0,
            active_job: 0,
            waiting_review: 0,
            completed_job: 0,
          };
        }

        map[userId].total_job += 1;

        if (
          [
            "pending",
            "assigned",
            "in_progress",
            "waiting_final_submission",
          ].includes(item.status)
        ) {
          map[userId].active_job += 1;
        }

        if (
          ["submitted", "waiting_job_review", "waiting_final_review"].includes(
            item.status,
          )
        ) {
          map[userId].waiting_review += 1;
        }

        if (["approved", "done", "completed"].includes(item.status)) {
          map[userId].completed_job += 1;
        }
      });
    });

    return Object.values(map).sort((a, b) => b.total_job - a.total_job);
  }, [visibleTasks]);

  const chartData = useMemo(() => {
    return [
      {
        label: "Active",
        value: dashboardSummary.active_task,
      },
      {
        label: "Completed",
        value: dashboardSummary.completed_task,
      },
      {
        label: "Need Review",
        value: dashboardSummary.waiting_review,
      },
      {
        label: "Delayed",
        value: dashboardSummary.delayed_task,
      },
    ];
  }, [dashboardSummary]);

  const paginate = (data, page) => {
    const start = (page - 1) * pageSize;
    return data.slice(start, start + pageSize);
  };

  const totalTaskPages = Math.ceil(visibleTasks.length / pageSize) || 1;
  const totalOutputPages = Math.ceil(visibleOutputs.length / pageSize) || 1;

  const paginatedTasks = paginate(
    [...visibleTasks].sort(
      (a, b) => new Date(b.created_at) - new Date(a.created_at),
    ),
    taskPage,
  );

  const paginatedOutputs = paginate(visibleOutputs, outputPage);

  return (
    <div className="w-full px-2 mx-auto max-w-[1400px]">
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
            {isStaff
              ? "Monitoring Tugas dan Hasil Pekerjaan Saya"
              : "Monitoring Kinerja Tim dan Hasil Pekerjaan"}
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-3 text-sm font-semibold bg-white border outline-none rounded-xl border-slate-200 text-slate-700"
          >
            <option value="01">Januari</option>
            <option value="02">Februari</option>
            <option value="03">Maret</option>
            <option value="04">April</option>
            <option value="05">Mei</option>
            <option value="06">Juni</option>
            <option value="07">Juli</option>
            <option value="08">Agustus</option>
            <option value="09">September</option>
            <option value="10">Oktober</option>
            <option value="11">November</option>
            <option value="12">Desember</option>
          </select>

          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="px-4 py-3 text-sm font-semibold bg-white border outline-none rounded-xl border-slate-200 text-slate-700"
          >
            {Array.from({ length: 6 }).map((_, index) => {
              const year = now.getFullYear() - 2 + index;
              return (
                <option key={year} value={String(year)}>
                  {year}
                </option>
              );
            })}
          </select>

          <button
            onClick={() => navigate("/report-automation/tasks")}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-brand-first sm:px-5 sm:py-3 rounded-xl sm:text-base w-fit hover:bg-brand-secondary"
          >
            Buka Ruang Kerja
            <ArrowRight size={18} />
          </button>
        </div>
      </div>

      {(isManager || isSpv || isUnknownRole) && (
        <>
          <div className="mt-8">
            <DonutChart data={chartData} />
          </div>

          <div className="grid grid-cols-1 gap-6 mt-8 xl:grid-cols-2">
            <TaskSummaryTable
              performance={computedPerformance}
              userMap={userMap}
              summary={dashboardSummary}
            />

            <EmployeeTaskChart
              performance={computedPerformance}
              userMap={userMap}
            />
          </div>
        </>
      )}

      <div className="mt-8">
        <MonthlyTaskChart
          tasks={visibleYearlyTasks}
          selectedYear={selectedYear}
        />
      </div>

      <div className="gap-6 mt-8">
        <div className="space-y-6 xl:col-span-2">
          <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-slate-900">
                Aktivitas Tugas Terbaru
              </h2>

              <button
                onClick={() => navigate("/report-automation/tasks")}
                className="px-5 py-3 text-sm font-bold text-white rounded-2xl bg-[#0B3A78]"
              >
                Lihat Semua
              </button>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-400">
                Memuat data...
              </div>
            ) : visibleTasks.length === 0 ? (
              <div className="py-20 text-center text-slate-400">
                Belum ada tugas.
              </div>
            ) : (
              <>
                <div className="overflow-hidden border rounded-2xl border-slate-200">
                  <table className="w-full text-sm">
                    <thead className="text-white bg-[#0B3A78]">
                      <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Tugas</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-center">Progress</th>
                        <th className="px-4 py-3 text-left">Deadline</th>
                        <th className="px-4 py-3 text-left">Prioritas</th>
                      </tr>
                    </thead>

                    <tbody>
                      {paginatedTasks.map((task, index) => (
                        <tr
                          key={task.task_id}
                          onClick={() =>
                            navigate(
                              `/report-automation/task-detail/${task.task_id}`,
                            )
                          }
                          className="border-t cursor-pointer border-slate-100 hover:bg-slate-50"
                        >
                          <td className="px-4 py-3">
                            {(taskPage - 1) * pageSize + index + 1}
                          </td>

                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">
                              {task.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              {task.objective || task.description || "-"}
                            </p>
                          </td>

                          <td className="px-4 py-3">
                            <StatusBadge status={task.status} />
                          </td>

                          <td className="px-4 py-3">
                            <ProgressBar value={task.progress} />
                          </td>

                          <td className="px-4 py-3 text-slate-600">
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString(
                                  "id-ID",
                                )
                              : "-"}
                          </td>

                          <td className="px-4 py-3 font-bold uppercase text-slate-500">
                            {task.priority || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  page={taskPage}
                  totalPages={totalTaskPages}
                  onChange={setTaskPage}
                />
              </>
            )}
          </div>

          <div
            id="output-section"
            className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200"
          >
            <h2 className="mb-6 text-2xl font-extrabold text-slate-900">
              Hasil Pekerjaan
            </h2>

            {visibleOutputs.length === 0 ? (
              <div className="py-12 text-sm text-center text-slate-400">
                Belum ada hasil pekerjaan yang tersedia.
              </div>
            ) : (
              <>
                <div className="space-y-3">
                  {paginatedOutputs.map((item) => (
                    <div
                      key={`${item.final_submission_id}-${item.file_url}`}
                      className="flex items-center justify-between gap-4 p-4 border rounded-2xl border-slate-200 bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <FileText size={18} />

                        <div>
                          <p className="text-sm font-bold text-slate-900">
                            {item.title}
                          </p>
                          <p className="text-xs text-slate-500">
                            {item.file_name}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`${API_FILE_BASE}${item.file_url}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white rounded-xl bg-[#0B3A78]"
                      >
                        <Download size={14} />
                        Unduh
                      </a>
                    </div>
                  ))}
                </div>

                <Pagination
                  page={outputPage}
                  totalPages={totalOutputPages}
                  onChange={setOutputPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
