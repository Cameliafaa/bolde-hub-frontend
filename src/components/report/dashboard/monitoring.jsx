import React, { useMemo, useState } from "react";
import { AlertTriangle, BarChart3, Users } from "lucide-react";

const formatDate = (value) =>
  value ? new Date(value).toLocaleDateString("id-ID") : "-";

function Pagination({ page, totalPage, onPrev, onNext }) {
  if (totalPage <= 1) return null;

  return (
    <div className="flex items-center justify-end gap-2 pt-2">
      <button
        type="button"
        disabled={page === 1}
        onClick={onPrev}
        className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Prev
      </button>

      <span className="text-xs text-slate-400">
        {page} / {totalPage}
      </span>

      <button
        type="button"
        disabled={page === totalPage}
        onClick={onNext}
        className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  );
}

export default function SupervisorMonitoring({ tasks = [], userMap = {} }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [teamPage, setTeamPage] = useState(1);
  const [overduePage, setOverduePage] = useState(1);

  const limit = 3;
  const today = new Date();

  const teamPerformance = useMemo(() => {
    const map = {};

    tasks.forEach((task) => {
      task.participants?.forEach((p) => {
        if (!map[p.user_id]) {
          map[p.user_id] = {
            user_id: p.user_id,
            name: userMap[p.user_id] || `User #${p.user_id}`,
            total: 0,
            done: 0,
            progress: 0,
            overdue: 0,
            tasks: [],
          };
        }

        const isOverdue =
          task.due_date &&
          new Date(task.due_date) < today &&
          task.status !== "done";

        map[p.user_id].total += 1;
        map[p.user_id].done += task.status === "done" ? 1 : 0;
        map[p.user_id].progress += task.progress || 0;
        map[p.user_id].overdue += isOverdue ? 1 : 0;
        map[p.user_id].tasks.push(task);
      });
    });

    return Object.values(map)
      .map((user) => ({
        ...user,
        avgProgress:
          user.total > 0 ? Math.round(user.progress / user.total) : 0,
        workload: Math.min(user.total * 20, 100),
      }))
      .sort((a, b) => b.total - a.total);
  }, [tasks, userMap]);

  const overdueTasks = useMemo(() => {
    return tasks.filter(
      (task) =>
        task.due_date &&
        new Date(task.due_date) < today &&
        task.status !== "done",
    );
  }, [tasks]);

  const totalTeamPage = Math.ceil(teamPerformance.length / limit);
  const totalOverduePage = Math.ceil(overdueTasks.length / limit);

  const paginatedTeam = teamPerformance.slice(
    (teamPage - 1) * limit,
    teamPage * limit,
  );

  const paginatedOverdue = overdueTasks.slice(
    (overduePage - 1) * limit,
    overduePage * limit,
  );

  return (
    <>
      <div className="grid grid-cols-1 gap-5 mb-7 xl:grid-cols-2">
        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <Users size={20} className="text-brand-first" />
            <h2 className="text-xl font-bold text-slate-900">
              Team Performance
            </h2>
          </div>

          <p className="mb-5 text-sm text-slate-500">
            Monitoring performa bawahan bulan ini.
          </p>

          <div className="space-y-3">
            {paginatedTeam.length === 0 ? (
              <div className="p-5 text-sm text-center rounded-2xl bg-slate-50 text-slate-400">
                Tidak ada data team.
              </div>
            ) : (
              paginatedTeam.map((user) => (
                <button
                  key={user.user_id}
                  onClick={() => setSelectedUser(user)}
                  className="flex items-center justify-between w-full p-4 text-left transition border rounded-2xl border-slate-100 hover:bg-slate-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center font-bold rounded-full w-11 h-11 bg-slate-100 text-slate-700">
                      {user.name.charAt(0)}
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {user.name}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {user.total} task • {user.avgProgress}% avg progress
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold text-green-600">
                      {user.done} Done
                    </p>
                    <p className="text-xs text-red-500">
                      {user.overdue} Overdue
                    </p>
                  </div>
                </button>
              ))
            )}

            <Pagination
              page={teamPage}
              totalPage={totalTeamPage}
              onPrev={() => setTeamPage((prev) => prev - 1)}
              onNext={() => setTeamPage((prev) => prev + 1)}
            />
          </div>
        </div>

        <div className="p-6 bg-white border shadow-sm rounded-3xl border-slate-200">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle size={20} className="text-red-500" />
            <h2 className="text-xl font-bold text-slate-900">Overdue Tasks</h2>
          </div>

          <p className="mb-5 text-sm text-slate-500">
            Task yang melewati deadline dan belum selesai.
          </p>

          <div className="space-y-3">
            {paginatedOverdue.length === 0 ? (
              <div className="p-5 text-sm text-center rounded-2xl bg-slate-50 text-slate-400">
                Tidak ada overdue task.
              </div>
            ) : (
              paginatedOverdue.map((task) => (
                <div
                  key={task.task_id}
                  className="p-4 border border-red-100 rounded-2xl bg-red-50"
                >
                  <h3 className="font-semibold text-slate-900">{task.title}</h3>
                  <p className="mt-1 text-xs text-red-600">
                    Deadline: {formatDate(task.due_date)}
                  </p>
                </div>
              ))
            )}

            <Pagination
              page={overduePage}
              totalPage={totalOverduePage}
              onPrev={() => setOverduePage((prev) => prev - 1)}
              onNext={() => setOverduePage((prev) => prev + 1)}
            />
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border shadow-sm mb-7 rounded-3xl border-slate-200">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={20} className="text-brand-first" />
          <h2 className="text-xl font-bold text-slate-900">
            Team Workload Chart
          </h2>
        </div>

        <p className="mb-5 text-sm text-slate-500">
          Perbandingan beban kerja tiap user.
        </p>

        <div className="space-y-5">
          {teamPerformance.length === 0 ? (
            <div className="p-5 text-sm text-center rounded-2xl bg-slate-50 text-slate-400">
              Tidak ada data workload.
            </div>
          ) : (
            teamPerformance.map((user) => (
              <div key={user.user_id}>
                <div className="flex justify-between mb-2 text-sm">
                  <span className="font-semibold text-slate-700">
                    {user.name}
                  </span>
                  <span className="text-slate-400">{user.total} task</span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-first"
                    style={{ width: `${user.workload}%` }}
                  />
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {selectedUser && (
        <div className="fixed inset-0 flex items-center justify-center px-4 z-[9999] bg-black/40">
          <div className="w-full max-w-5xl p-6 bg-white shadow-2xl rounded-3xl">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">
                  {selectedUser.name}
                </h2>
                <p className="text-sm text-slate-500">
                  Detail pekerjaan bulan ini.
                </p>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-100"
              >
                ×
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="py-4 text-left">Task</th>
                    <th className="py-4 text-left">Status</th>
                    <th className="py-4 text-left">Progress</th>
                    <th className="py-4 text-left">Deadline</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedUser.tasks.map((task) => (
                    <tr key={task.task_id} className="border-b">
                      <td className="py-4 font-semibold text-slate-900">
                        {task.title}
                      </td>
                      <td className="py-4 capitalize text-slate-500">
                        {task.status?.replaceAll("_", " ")}
                      </td>
                      <td className="py-4 text-slate-500">
                        {task.progress || 0}%
                      </td>
                      <td className="py-4 text-slate-500">
                        {formatDate(task.due_date)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
