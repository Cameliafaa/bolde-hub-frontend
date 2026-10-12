import React, { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Edit3,
  Filter,
  Loader2,
  PlayCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import CreateTaskModal from "../../components/report/createTask";
import { reportAutomationApi } from "../../services/reportAutomation/reportApi";
import ExportTaskExcelButton from "../../components/report/exportdata/exportData";
import { fetchAllUsers } from "../../services/users/userService";

const initialForm = {
  category_id: 1,
  title: "",
  objective: "",
  target_action: "",
  description: "",
  pic: [],
  user_jobs: [],
  priority: "",
  start_date: "",
  due_date: "",
};

const DIVISION_ROLE_GROUPS = {
  event_activation: [35, 46, 51],
  product_marketing: [34, 48, 49],
  digital_marketing: [33, 47, 50],
};

const ADMIN_ROLE_IDS = [8, 9, 11, 12];

const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem("userData") || "{}");
  const roleName = String(
    user?.user_roles?.name || user?.role?.name || user?.role_name || "",
  ).toLowerCase();

  const roleId = Number(
    user?.user_role_id ||
      user?.role_id ||
      user?.user_roles?.user_role_id ||
      user?.role?.user_role_id ||
      user?.user_roles?.id ||
      user?.role?.id ||
      0,
  );

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
    roleId,
    roleName,
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

const toDateInput = (value) => {
  if (!value) return "";
  return String(value).slice(0, 10);
};

const getUserLabel = (user, fallbackId) => {
  return (
    user?.full_name ||
    user?.username ||
    user?.name ||
    user?.user?.full_name ||
    user?.user?.username ||
    `User #${fallbackId || user?.user_id || user?.id || "-"}`
  );
};

const priorityLabelMap = {
  low: "Rendah",
  medium: "Sedang",
  high: "Tinggi",
  urgent: "Mendesak",
};

const statusLabelMap = {
  assigned: "Tugas Baru",
  in_progress: "Sedang Dikerjakan",
  pending_approval: "Menunggu Persetujuan",
  waiting_job_review: "Menunggu Review",
  waiting_final_submission: "Menunggu Hasil Akhir",
  waiting_final_review: "Menunggu Review Akhir",
  rejected_final: "Perlu Revisi",
  rejected: "Ditolak",
  done: "Selesai",
  delayed: "Terlambat",
};

function getUserDivisionKey(roleId) {
  const numericRoleId = Number(roleId);

  return Object.entries(DIVISION_ROLE_GROUPS).find(([, roleIds]) =>
    roleIds.includes(numericRoleId),
  )?.[0];
}

function isAdministratorRole(currentUser) {
  const roleName = String(currentUser?.roleName || "").toLowerCase();

  return (
    ADMIN_ROLE_IDS.includes(Number(currentUser?.roleId)) ||
    roleName.includes("admin") ||
    roleName.includes("administrator") ||
    roleName.includes("general marketing") ||
    roleName.includes("super admin")
  );
}

function getRoleIdFromUser(user) {
  return Number(
    user?.user_role_id ||
      user?.role_id ||
      user?.user_roles?.user_role_id ||
      user?.role?.user_role_id ||
      user?.user_roles?.id ||
      user?.role?.id ||
      0,
  );
}

function getTaskRoleIds(task, userRoleMap = {}) {
  const roleIds = [];

  if (Array.isArray(task?.user_jobs)) {
    task.user_jobs.forEach((job) => {
      const userId = Number(job.user_id || job.user?.user_id || 0);

      const roleId = Number(
        job.user_role_id ||
          job.role_id ||
          getRoleIdFromUser(job.user) ||
          getRoleIdFromUser(job.employee) ||
          userRoleMap[userId] ||
          0,
      );

      if (roleId) roleIds.push(roleId);
    });
  }

  if (Array.isArray(task?.participants)) {
    task.participants.forEach((participant) => {
      const userId = Number(
        participant.user_id || participant.user?.user_id || 0,
      );

      const roleId = Number(
        participant.user_role_id ||
          participant.role_id ||
          getRoleIdFromUser(participant.user) ||
          userRoleMap[userId] ||
          0,
      );

      if (roleId) roleIds.push(roleId);
    });
  }

  return [...new Set(roleIds)];
}

function isSameDivisionTask(task, currentUser, userRoleMap = {}) {
  if (isAdministratorRole(currentUser)) return true;

  const currentDivisionKey = getUserDivisionKey(currentUser?.roleId);
  if (!currentDivisionKey) return false;

  const allowedRoleIds = DIVISION_ROLE_GROUPS[currentDivisionKey];

  return getTaskRoleIds(task, userRoleMap).some((roleId) =>
    allowedRoleIds.includes(Number(roleId)),
  );
}

function isMyWorkspaceTask(task, currentUserId) {
  return task.user_jobs?.some(
    (job) => Number(job.user_id) === Number(currentUserId),
  );
}

function isMyApprovalLineTask(task, currentUserId) {
  return task.user_jobs?.some((job) =>
    job.approvals?.some(
      (approval) => Number(approval.approver_id) === Number(currentUserId),
    ),
  );
}

function isTeamWorkspaceTask(task, currentUser, userRoleMap = {}) {
  const currentUserId = Number(currentUser.id || 0);

  if (isAdministratorRole(currentUser)) return true;

  if (!isSameDivisionTask(task, currentUser, userRoleMap)) return false;

  if (currentUser.roleCategory === "manager") return true;

  if (currentUser.roleCategory === "spv") return true;

  return isMyWorkspaceTask(task, currentUserId);
}

function isTaskDelayed(task) {
  if (!task?.due_date) return false;
  if (task.status === "done") return false;

  const today = new Date();
  const dueDate = new Date(task.due_date);

  today.setHours(0, 0, 0, 0);
  dueDate.setHours(0, 0, 0, 0);

  return dueDate < today;
}

function getFriendlyStatus(task) {
  if (isTaskDelayed(task)) return "delayed";
  if (task.status === "done") return "done";
  if (task.status === "in_progress") return "in_progress";

  if (
    [
      "submitted",
      "waiting_job_review",
      "waiting_final_review",
      "waiting_final_submission",
      "pending_approval",
    ].includes(task.status)
  ) {
    return "waiting_job_review";
  }

  return "assigned";
}

function StatusBadge({ status }) {
  const map = {
    assigned: "bg-slate-100 text-slate-700",
    in_progress: "bg-blue-50 text-blue-700",
    pending_approval: "bg-orange-50 text-orange-700",
    waiting_job_review: "bg-indigo-50 text-indigo-700",
    waiting_final_submission: "bg-indigo-50 text-indigo-700",
    waiting_final_review: "bg-purple-50 text-purple-700",
    rejected_final: "bg-rose-50 text-rose-700",
    rejected: "bg-rose-50 text-rose-700",
    delayed: "bg-red-50 text-red-700",
    done: "bg-green-50 text-green-700",
  };

  return (
    <span
      className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
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

function StatCard({ title, value, icon, color }) {
  return (
    <div className="p-5 bg-white border shadow-sm rounded-3xl border-slate-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <h3 className="mt-3 text-3xl font-extrabold text-slate-900">
            {value}
          </h3>
        </div>

        <div
          className={`flex items-center justify-center w-12 h-12 text-white rounded-2xl ${color}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

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

function TaskCard({
  task,
  onClick,
  onEdit,
  onDelete,
  canEditTask,
  canDeleteTask,
}) {
  const friendlyStatus = getFriendlyStatus(task);

  return (
    <div
      onClick={() => onClick(task)}
      className="p-5 transition bg-white border shadow-sm cursor-pointer rounded-3xl border-slate-200 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-3 mb-4">
        <StatusBadge status={friendlyStatus} />

        {(canEditTask || canDeleteTask) && (
          <div className="flex items-center gap-2">
            {canEditTask && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(task);
                }}
                className="flex items-center justify-center transition w-9 h-9 rounded-xl bg-slate-100 hover:bg-blue-50 text-slate-500 hover:text-[#0B3A78]"
                title="Edit Tugas"
              >
                <Edit3 size={16} />
              </button>
            )}

            {canDeleteTask && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(task.task_id);
                }}
                className="flex items-center justify-center text-red-600 transition w-9 h-9 rounded-xl bg-red-50 hover:bg-red-100"
                title="Hapus Tugas"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>
        )}
      </div>

      <h3 className="text-lg font-extrabold leading-snug text-slate-900">
        {task.title}
      </h3>

      <p className="mt-2 text-sm leading-6 line-clamp-2 text-slate-500">
        {task.description || task.objective || "-"}
      </p>

      <div className="mt-5">
        <ProgressBar value={task.progress} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 mt-4 border-t border-slate-100">
        <div className="text-xs font-semibold text-slate-500">
          Batas waktu: {formatDate(task.due_date)}
        </div>

        <div className="text-xs font-bold text-slate-500">
          Prioritas: {priorityLabelMap[task.priority] || task.priority || "-"}
        </div>
      </div>
    </div>
  );
}

function Column({
  title,
  description,
  icon,
  items,
  onCardClick,
  onEdit,
  onDelete,
  canEditTask,
  canDeleteTask,
}) {
  return (
    <div className="p-4 shadow-sm min-w-[330px] max-w-[330px] rounded-[28px] bg-gradient-to-b from-[#0B3A78] to-[#1357B7]">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-2 px-4 py-2 text-sm font-extrabold bg-white rounded-full text-[#0B3A78]">
            {icon}
            {title}
          </div>

          <span className="text-sm font-bold text-white">{items.length}</span>
        </div>

        <p className="mt-3 text-xs leading-5 text-white/75">{description}</p>
      </div>

      <div className="flex flex-col gap-4">
        {items.length > 0 ? (
          items.map((task) => (
            <TaskCard
              key={task.task_id}
              task={task}
              onClick={onCardClick}
              onEdit={onEdit}
              onDelete={onDelete}
              canEditTask={canEditTask}
              canDeleteTask={canDeleteTask}
            />
          ))
        ) : (
          <div className="flex items-center justify-center p-5 text-sm font-medium text-center text-white border border-dashed min-h-[140px] border-white/30 rounded-3xl bg-white/10">
            Belum ada tugas di bagian ini
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamWorkspace() {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();

  const [tasks, setTasks] = useState([]);
  const [userRoleMap, setUserRoleMap] = useState({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [deleteTaskId, setDeleteTaskId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const canEditTask =
    currentUser.roleCategory === "manager" || isAdministratorRole(currentUser);

  const canDeleteTask =
    currentUser.roleCategory === "manager" || isAdministratorRole(currentUser);

  const resetFormState = () => {
    setForm(initialForm);
    setEditTaskId(null);
    setShowEditModal(false);
  };

  const buildPayload = () => {
    return {
      title: form.title,
      category_id: Number(form.category_id || 1),
      objective: form.objective,
      target_action: form.target_action,
      description: form.description,
      priority: String(form.priority || "").toLowerCase(),
      start_date: form.start_date,
      due_date: form.due_date,
      user_jobs: (form.user_jobs || []).map((job) => ({
        job_id: job.job_id ? Number(job.job_id) : undefined,
        user_id: Number(job.user_id || job.id || job.user?.user_id),
        title: job.title,
        description: job.description,
        start_date: job.start_date || form.start_date,
        due_date: job.due_date || form.due_date,
      })),
    };
  };

  const validateForm = () => {
    if (
      !form.title ||
      !form.priority ||
      !form.start_date ||
      !form.due_date ||
      !Array.isArray(form.user_jobs) ||
      form.user_jobs.length === 0
    ) {
      alert("Mohon lengkapi field utama dan pekerjaan anggota terlebih dahulu");
      return false;
    }

    const invalidJob = form.user_jobs.some(
      (job) => !job.user_id || !job.title || !job.description,
    );

    if (invalidJob) {
      alert("Nama pekerjaan dan deskripsi pekerjaan setiap user wajib diisi");
      return false;
    }

    return true;
  };

  const mapTaskToForm = (task) => {
    const userJobs = Array.isArray(task?.user_jobs) ? task.user_jobs : [];

    return {
      category_id: task?.category_id || 1,
      title: task?.title || "",
      objective: task?.objective || "",
      target_action: task?.target_action || "",
      description: task?.description || "",
      priority: task?.priority || "",
      start_date: toDateInput(task?.start_date),
      due_date: toDateInput(task?.due_date),
      pic: userJobs.map((job) => ({
        id: job.user_id,
        user_id: job.user_id,
        name: getUserLabel(job.user, job.user_id),
        role:
          job.user?.role?.name ||
          job.user?.user_roles?.name ||
          job.role?.name ||
          "-",
        image: job.user?.image_url || job.user?.image,
      })),
      user_jobs: userJobs.map((job) => ({
        job_id: job.job_id,
        user_id: job.user_id,
        title: job.title || "",
        description: job.description || "",
        start_date: toDateInput(job.start_date || task?.start_date),
        due_date: toDateInput(job.due_date || task?.due_date),
      })),
    };
  };

  const loadData = async () => {
    try {
      setLoading(true);

      const [taskData, users] = await Promise.all([
        reportAutomationApi.getTasks(),
        fetchAllUsers(),
      ]);

      const roleMap = {};

      (users || []).forEach((user) => {
        roleMap[Number(user.user_id)] = Number(
          user.user_role_id ||
            user.role_id ||
            user.user_roles?.user_role_id ||
            user.role?.user_role_id ||
            user.user_roles?.id ||
            user.role?.id ||
            0,
        );
      });

      setUserRoleMap(roleMap);
      setTasks(taskData || []);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal mengambil data tugas tim");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const teamTasks = useMemo(() => {
    return tasks.filter((task) =>
      isTeamWorkspaceTask(task, currentUser, userRoleMap),
    );
  }, [tasks, currentUser, userRoleMap]);

  const filteredTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return teamTasks.filter((task) => {
      const friendlyStatus = getFriendlyStatus(task);

      const matchSearch =
        `${task.title} ${task.objective} ${task.description} ${task.priority}`
          .toLowerCase()
          .includes(keyword);

      const matchStatus =
        statusFilter === "all" ? true : friendlyStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [teamTasks, search, statusFilter]);

  const columns = useMemo(() => {
    return {
      assigned: filteredTasks.filter(
        (task) => getFriendlyStatus(task) === "assigned",
      ),
      inProgress: filteredTasks.filter(
        (task) => getFriendlyStatus(task) === "in_progress",
      ),
      review: filteredTasks.filter(
        (task) => getFriendlyStatus(task) === "waiting_job_review",
      ),
      delayed: filteredTasks.filter(
        (task) => getFriendlyStatus(task) === "delayed",
      ),
      done: filteredTasks.filter((task) => getFriendlyStatus(task) === "done"),
    };
  }, [filteredTasks]);

  const summary = useMemo(() => {
    return {
      total: teamTasks.length,
      active: teamTasks.filter((task) =>
        ["assigned", "in_progress"].includes(getFriendlyStatus(task)),
      ).length,
      review: teamTasks.filter(
        (task) => getFriendlyStatus(task) === "waiting_job_review",
      ).length,
      delayed: teamTasks.filter((task) => getFriendlyStatus(task) === "delayed")
        .length,
      done: teamTasks.filter((task) => getFriendlyStatus(task) === "done")
        .length,
    };
  }, [teamTasks]);

  const handleOpenDetail = (task) => {
    navigate(`/report-automation/task-detail/${task.task_id}`);
  };

  const handleOpenEdit = (task) => {
    if (!canEditTask) return;

    setEditTaskId(task.task_id);
    setForm(mapTaskToForm(task));
    setShowEditModal(true);
  };

  const handleUpdateTask = async () => {
    if (!canEditTask) {
      alert("Hanya manager yang dapat mengubah tugas");
      return;
    }

    if (!editTaskId) return;
    if (!validateForm()) return;

    try {
      setSaving(true);
      await reportAutomationApi.updateTask(editTaskId, buildPayload());

      resetFormState();
      await loadData();

      setSuccessMessage("Tugas berhasil diperbarui");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal memperbarui tugas");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTask = async () => {
    if (!deleteTaskId) return;

    try {
      setDeleteLoading(true);
      await reportAutomationApi.deleteTask(deleteTaskId);
      await loadData();

      setSuccessMessage("Tugas berhasil dihapus");
      setDeleteTaskId(null);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.message || "Gagal menghapus tugas");
    } finally {
      setDeleteLoading(false);
    }
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
            Ruang Kerja Tim
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Pantau progress pekerjaan tim dan bawahan kamu.
          </p>
        </div>
      </div>

      <WorkspaceTab active="team" currentUser={currentUser} />

      <div className="grid grid-cols-1 gap-5 mt-8 md:grid-cols-2 xl:grid-cols-5">
        <StatCard
          title="Total Tugas"
          value={summary.total}
          icon={<Activity size={22} />}
          color="bg-gradient-to-br from-[#0B3A78] to-[#2E90FA]"
        />
        <StatCard
          title="Tugas Aktif"
          value={summary.active}
          icon={<Loader2 size={22} />}
          color="bg-gradient-to-br from-[#7C3AED] to-[#A78BFA]"
        />
        <StatCard
          title="Menunggu Review"
          value={summary.review}
          icon={<Clock3 size={22} />}
          color="bg-gradient-to-br from-[#EAB308] to-[#FACC15]"
        />
        <StatCard
          title="Terlambat"
          value={summary.delayed}
          icon={<AlertTriangle size={22} />}
          color="bg-gradient-to-br from-[#DC2626] to-[#F87171]"
        />
        <StatCard
          title="Selesai"
          value={summary.done}
          icon={<CheckCircle2 size={22} />}
          color="bg-gradient-to-br from-[#16A34A] to-[#4ADE80]"
        />
      </div>

      <div className="p-6 mt-8 bg-white border shadow-sm rounded-[32px] border-slate-200">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative w-full xl:max-w-md">
            <Search
              size={18}
              className="absolute -translate-y-1/2 text-slate-400 left-4 top-1/2"
            />
            <input
              type="text"
              placeholder="Cari nama tugas, tujuan, atau prioritas..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 pr-4 text-sm border outline-none h-14 bg-slate-50 pl-11 rounded-2xl border-slate-200 focus:border-[#2E90FA]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-5 py-3 text-sm bg-white border rounded-2xl text-[#0B3A78] border-slate-200">
              <Filter size={17} />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="font-semibold bg-transparent outline-none"
              >
                <option value="all">Semua Tugas</option>
                <option value="assigned">Tugas Baru</option>
                <option value="in_progress">Sedang Dikerjakan</option>
                <option value="waiting_job_review">Menunggu Review</option>
                <option value="delayed">Terlambat</option>
                <option value="done">Selesai</option>
              </select>
            </div>

            <ExportTaskExcelButton
              tasks={filteredTasks}
              title="LAPORAN TUGAS TIM"
              fileName="laporan_tugas_tim.xlsx"
            />
          </div>
        </div>
      </div>

      {successMessage && (
        <div className="flex items-center gap-3 px-5 py-4 mt-6 text-sm font-semibold text-green-700 border border-green-200 rounded-2xl bg-green-50">
          <CheckCircle2 size={18} />
          {successMessage}
        </div>
      )}

      {loading ? (
        <div className="py-24 mt-8 text-center bg-white border shadow-sm rounded-3xl border-slate-200 text-slate-400">
          Memuat data tugas tim...
        </div>
      ) : (
        <div className="flex items-start gap-5 pb-6 mt-8 overflow-x-auto">
          <Column
            title="Tugas Baru"
            description="Tugas yang sudah dibuat dan belum mulai dikerjakan."
            icon={<Clock3 size={15} />}
            items={columns.assigned}
            onCardClick={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTaskId}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
          />
          <Column
            title="Sedang Dikerjakan"
            description="Tugas yang sedang dikerjakan oleh anggota tim."
            icon={<PlayCircle size={15} />}
            items={columns.inProgress}
            onCardClick={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTaskId}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
          />
          <Column
            title="Menunggu Review"
            description="Tugas yang sudah dikirim dan menunggu pemeriksaan."
            icon={<Clock3 size={15} />}
            items={columns.review}
            onCardClick={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTaskId}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
          />
          <Column
            title="Terlambat"
            description="Tugas yang melewati batas waktu dan belum selesai."
            icon={<AlertTriangle size={15} />}
            items={columns.delayed}
            onCardClick={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTaskId}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
          />
          <Column
            title="Selesai"
            description="Tugas yang sudah selesai dikerjakan dan disetujui."
            icon={<CheckCircle2 size={15} />}
            items={columns.done}
            onCardClick={handleOpenDetail}
            onEdit={handleOpenEdit}
            onDelete={setDeleteTaskId}
            canEditTask={canEditTask}
            canDeleteTask={canDeleteTask}
          />
        </div>
      )}

      {canEditTask && showEditModal && (
        <CreateTaskModal
          form={form}
          setForm={setForm}
          onClose={resetFormState}
          onSubmit={saving ? undefined : handleUpdateTask}
          currentRole={currentUser.roleCategory}
          mode="edit"
        />
      )}

      {deleteTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-center w-16 h-16 mx-auto mb-5 bg-red-100 rounded-full">
              <Trash2 size={28} className="text-red-600" />
            </div>

            <h2 className="text-2xl font-bold text-center text-slate-900">
              Hapus Tugas?
            </h2>

            <p className="mt-3 text-sm leading-6 text-center text-slate-500">
              Tugas yang dihapus tidak dapat dikembalikan kembali.
            </p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <button
                onClick={() => setDeleteTaskId(null)}
                className="px-4 py-3 text-sm font-semibold transition border rounded-2xl border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                Batal
              </button>

              <button
                onClick={handleDeleteTask}
                disabled={deleteLoading}
                className="px-4 py-3 text-sm font-semibold text-white transition bg-red-600 rounded-2xl hover:bg-red-700 disabled:opacity-50"
              >
                {deleteLoading ? "Menghapus..." : "Ya, Hapus"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
