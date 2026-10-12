import React, { useEffect, useMemo, useState } from "react";
import { ApiRequest } from "../../../services/apiRequest";
import Pagination from "../../common/pagination";
import DateRangeFilter from "../../common/dateRangeFilter";
import { fetchAllUsers } from "../../../services/users/userService";

const UserLogTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);

  const [users, setUsers] = useState([]);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

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

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, limit]);

  const userMap = useMemo(() => {
    const map = {};

    users.forEach((user) => {
      const key = user.user_id ?? user.id;
      map[key] = user.name || user.full_name || user.username || "-";
    });

    return map;
  }, [users]);

  const fetchUsers = async () => {
    setUserLoading(true);
    try {
      const allUsers = await fetchAllUsers(50);
      setUsers(allUsers);
    } catch (err) {
      console.error("FETCH USERS ERROR:", err);
      setUsers([]);
    } finally {
      setUserLoading(false);
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (startDate) params.append("start_date", startDate);
      if (endDate) params.append("end_date", endDate);
      params.append("page", page);
      params.append("limit", limit);

      const res = await ApiRequest({
        url: `/user-logs?${params.toString()}`,
        method: "GET",
      });

      if (res.status !== "success" || !Array.isArray(res.data)) {
        setRows([]);
        setTotalPage(1);
        return;
      }

      setRows(res.data);
      setTotalPage(res.meta?.total_page || 1);
    } catch (err) {
      console.error("FETCH USER LOG ERROR:", err);
      setRows([]);
      setTotalPage(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchLogs();
  }, [startDate, endDate, page, limit]);

  const formatDateTime = (dateString) => {
    if (!dateString) return "-";

    const date = new Date(dateString);

    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = String(date.getUTCMonth() + 1).padStart(2, "0");
    const year = date.getUTCFullYear();

    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    const seconds = String(date.getUTCSeconds()).padStart(2, "0");

    return `${day}/${month}/${year}, ${hours}.${minutes}.${seconds}`;
  };

  return (
    <div className="w-full p-6 mt-4 border shadow-md bg-surface-card border-surface-border rounded-3xl">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:justify-between lg:items-center lg:mb-8">
        <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl text-brand-first whitespace-nowrap">
          User Activity Logs
        </h2>

        <div className="w-full sm:w-auto">
          <DateRangeFilter
            onApply={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
            onReset={() => {
              setStartDate("");
              setEndDate("");
            }}
          />
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-surface-background text-brand-first">
            <tr className="border-t">
              <th className="px-4 py-3 font-semibold text-left">User</th>
              {/* <th className="px-4 py-3 font-semibold text-left">Action</th> */}
              <th className="px-4 py-3 font-semibold text-left">Description</th>
              <th className="px-4 py-3 font-semibold text-left">Date</th>
            </tr>
          </thead>

          <tbody>
            {loading || userLoading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  Loading logs...
                </td>
              </tr>
            ) : rows.length > 0 ? (
              rows.map((row) => (
                <tr
                  key={row.user_log_id}
                  className="border-t hover:bg-surface-background"
                >
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {userMap[row.user_id] || `User #${row.user_id}`}
                  </td>

                  {/* <td className="px-4 py-3 text-gray-600">{row.action}</td> */}

                  <td className="px-4 py-3 text-gray-600 max-w-[400px]">
                    {row.description || "-"}
                  </td>

                  <td className="px-4 py-3 text-gray-600">
                    {formatDateTime(row.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-text-light">
                  No logs found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(newPage) => {
            setPage(newPage);
          }}
        />
      )}
    </div>
  );
};

export default UserLogTable;
