import React, { useEffect, useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Search, CalendarDays } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { reportAutomationApi } from "../../services/reportAutomation/reportApi";
import { fetchAllUsers } from "../../services/users/userService";

const statusLabelMap = {
  pending_approval: "Menunggu Persetujuan",
};

function StatusBadge({ status }) {
  const map = {
    pending_approval: "bg-orange-50 text-orange-700",
  };

  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-bold ${
        map[status] || "bg-slate-100 text-slate-700"
      }`}
    >
      {statusLabelMap[status] || status || "-"}
    </span>
  );
}

export default function ApprovalTaskPage() {
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [userMap, setUserMap] = useState({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [taskData, users] = await Promise.all([
        reportAutomationApi.getMyApprovalTasks(),
        fetchAllUsers(),
      ]);

      const mapped = {};
      users.forEach((user) => {
        mapped[user.user_id] =
          user.full_name || user.username || `User #${user.user_id}`;
      });

      setTasks(taskData || []);
      setUserMap(mapped);
    } catch (err) {
      console.error("FETCH APPROVAL TASK ERROR:", err);
      alert(err?.response?.data?.message || "Gagal mengambil data persetujuan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvalTasks = useMemo(() => {
    const keyword = search.toLowerCase();

    return tasks
      .filter((task) => task.status === "pending_approval")
      .filter((task) => {
        return (
          task.title?.toLowerCase().includes(keyword) ||
          task.objective?.toLowerCase().includes(keyword) ||
          task.description?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }, [tasks, search]);

  return (
    <div className="w-full px-2 mx-auto max-w-[1400px]">
      <button
        onClick={() => navigate("/report-automation")}
        className="inline-flex items-center gap-2 mb-6 text-sm font-bold text-[#0B3A78]"
      >
        <ArrowLeft size={18} />
        Kembali ke Dashboard
      </button>

      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0B3A78]">
            Persetujuan Tugas
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Daftar tugas yang menunggu persetujuan dari kamu.
          </p>
        </div>

        <div className="flex items-center w-full px-4 py-3 bg-white border rounded-2xl border-slate-200 sm:w-[360px]">
          <Search size={18} className="mr-2 text-slate-400" />
          <input
            type="text"
            placeholder="Cari tugas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full text-sm outline-none text-slate-700"
          />
        </div>
      </div>

      <div className="p-6 bg-white border shadow-sm rounded-[32px] border-slate-200">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center text-yellow-600 w-11 h-11 rounded-2xl bg-yellow-50">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Antrian Persetujuan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Total {approvalTasks.length} tugas perlu ditinjau.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center text-slate-400">Memuat data...</div>
        ) : approvalTasks.length === 0 ? (
          <div className="py-20 text-center text-slate-400">
            Tidak ada tugas yang menunggu persetujuan.
          </div>
        ) : (
          <div className="overflow-hidden border rounded-3xl border-slate-200">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 text-left">Nama Tugas</th>
                  <th className="px-5 py-4 text-left">Status</th>
                  <th className="px-5 py-4 text-left">Anggota Tim</th>
                  <th className="px-5 py-4 text-left">Batas Waktu</th>
                  <th className="px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>

              <tbody>
                {approvalTasks.map((task) => (
                  <tr
                    key={task.task_id}
                    className="transition border-t cursor-pointer border-slate-100 hover:bg-slate-50"
                    onClick={() =>
                      navigate(`/report-automation/task-detail/${task.task_id}`)
                    }
                  >
                    <td className="px-5 py-4">
                      <p className="font-bold text-slate-900">{task.title}</p>
                      <p className="mt-1 text-xs text-slate-500 line-clamp-1">
                        {task.objective || task.description || "-"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={task.status} />
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex flex-wrap gap-2">
                        {task.participants?.length > 0 ? (
                          task.participants.map((p) => (
                            <span
                              key={p.participant_id}
                              className="px-3 py-1 text-xs font-semibold bg-white border rounded-full text-slate-600 border-slate-200"
                            >
                              {userMap[p.user_id] || `User #${p.user_id}`}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-400">-</span>
                        )}
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500">
                        <CalendarDays size={14} />
                        {task.due_date
                          ? new Date(task.due_date).toLocaleDateString("id-ID")
                          : "-"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(
                            `/report-automation/task-detail/${task.task_id}`,
                          );
                        }}
                        className="px-4 py-2 text-xs font-bold text-white rounded-xl bg-[#0B3A78]"
                      >
                        Lihat Detail
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
