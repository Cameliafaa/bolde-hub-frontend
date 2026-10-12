import React, { useEffect, useMemo, useState } from "react";
import Pagination from "../common/pagination";

const ReportTable = ({ tasks = [], logs = [], users = [] }) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setLimit(5);
      } else if (width < 1024) {
        setLimit(8);
      } else {
        setLimit(10);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getUserFullName = (userId) => {
    const user = users.find((item) => {
      const id = item.user_id ?? item.id ?? item.user_detail_id;

      return Number(id) === Number(userId);
    });

    return user?.full_name || user?.name || `User ${userId || "-"}`;
  };

  const mergedData = useMemo(() => {
    return tasks.map((item) => ({
      id: item.monthly_report_id,

      task_date: formatDateOnly(item.task_date),

      deadline_project: formatDateOnly(item.deadline),

      month: item.month || "-",

      pic: item.pic || "-",

      category: item.category || "-",

      tasks: item.task || "-",

      description: item.objective || "-",

      status: item.status || "-",

      time: item.created_at || null,
    }));
  }, [tasks]);

  useEffect(() => {
    setPage(1);
  }, [limit]);

  const totalPage = Math.ceil(mergedData.length / limit);
  const startIndex = (page - 1) * limit;
  const paginatedRows = mergedData.slice(startIndex, startIndex + limit);

  return (
    <div className="w-full p-6 mt-4 border shadow-md bg-surface-card border-surface-border rounded-3xl">
      <div className="flex flex-col gap-2 mb-6 lg:mb-8">
        <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl text-brand-first">
          Task Activity
        </h2>
        <p className="text-sm text-text-light">
          Data gabungan dari task dan user log
        </p>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[1200px]">
          <thead className="bg-surface-background text-brand-first">
            <tr className="text-center transition-colors border-t hover:bg-surface-background">
              <th className="px-4 py-3 font-semibold">No</th>
              <th className="px-4 py-3 font-semibold">Task Date</th>
              <th className="px-4 py-3 font-semibold">Deadline</th>
              <th className="px-4 py-3 font-semibold">Month</th>
              <th className="px-4 py-3 font-semibold">PIC</th>
              <th className="px-4 py-3 font-semibold">Category</th>
              <th className="px-4 py-3 font-semibold">Tasks</th>
              <th className="px-4 py-3 font-semibold">Detail</th>
              <th className="px-4 py-3 font-semibold">Status</th>
            </tr>
          </thead>

          <tbody>
            {paginatedRows.length > 0 ? (
              paginatedRows.map((item, index) => (
                <tr
                  key={item.id}
                  className="transition-colors border-t hover:bg-surface-background"
                >
                  <td className="px-4 py-3 text-gray-700">
                    {startIndex + index + 1}
                  </td>

                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.task_date || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.deadline_project || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                    {item.month || "-"}
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold text-gray-700">
                      {item.pic || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3">
                    <span className="inline-flex px-3 py-1 text-xs font-semibold text-gray-700">
                      {item.category || "-"}
                    </span>
                  </td>

                  <td className="px-4 py-3 font-medium text-gray-800 min-w-[240px]">
                    {item.tasks || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-600 min-w-[320px]">
                    {item.description || "-"}
                  </td>

                  <td className="px-4 py-3 text-center whitespace-nowrap">
                    <span className={getStatusBadge(item.status)}>
                      {item.status || "-"}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={9} className="py-6 text-center text-text-light">
                  No task activity found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!mergedData.length ? null : totalPage > 1 ? (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(newPage) => {
            setPage(newPage);
          }}
        />
      ) : null}
    </div>
  );
};

const formatDateOnly = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getMonthName = (dateValue) => {
  if (!dateValue) return "-";
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("id-ID", { month: "long" });
};

const getCategoryBadge = (category) => {
  const value = String(category || "").toLowerCase();

  if (value === "collaboration") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full";
  }

  if (value === "internal") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full";
  }

  if (value === "npd") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full";
  }

  if (value === "survey") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-indigo-700 bg-indigo-100 rounded-full";
  }

  if (value === "branding") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-amber-700 bg-amber-100 rounded-full";
  }

  if (value === "user log") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-sky-700 bg-sky-100 rounded-full";
  }

  return "inline-flex px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full";
};

const getStatusBadge = (status) => {
  const value = String(status || "").toLowerCase();

  if (value === "done") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full";
  }

  if (value === "in progress") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-yellow-700 bg-yellow-100 rounded-full";
  }

  if (value === "pending") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full";
  }

  if (value === "todo") {
    return "inline-flex px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 rounded-full";
  }

  return "inline-flex px-3 py-1 text-xs font-semibold text-slate-700 bg-slate-100 rounded-full";
};

export default ReportTable;
