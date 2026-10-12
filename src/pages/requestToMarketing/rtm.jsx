import React, { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

import DelayedIcon from "../../assets/images/req-delayed.png";
import OnGoing from "../../assets/images/req-ongoing.png";
import Done from "../../assets/images/req-done.png";

import AddRequestModal from "../../components/requestToMarketing/AddRequest/addRequestModal";
import usePermission from "../../utils/usePermission";
import { ApiRequest } from "../../services/apiRequest";
import Pagination from "../../components/common/pagination";

const PRIVILEGED_USER_ID = [47, 9];
const PRIVILEGED_ROLES = [12, 38];
// const SUPER_ADMIN_ROLE_ID = 12;
// const RSM_ROLE_ID = 38;

const RequestToMarketing = () => {
  const navigate = useNavigate();
  const { can_create } = usePermission();

  const [activeTab, setActiveTab] = useState("All Projects");
  const [showAddModal, setShowAddModal] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState([]);

  const [usersMap, setUsersMap] = useState({});
  const [provinceMap, setProvinceMap] = useState({});

  const [currentUser, setCurrentUser] = useState(null);
  const [delegationMap, setDelegationMap] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  const [search, setSearch] = useState("");
  const itemsPerPage = 10;

  const tabs = ["All Projects", "On Going", "Delayed", "Rejected", "Done"];

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  /* ================= INITIAL LOAD ================= */
  useEffect(() => {
    fetchCurrentUser();
    fetchUsers();
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchRequests();
    }
  }, [currentUser]);

  /* ================= FETCH ================= */

  const fetchCurrentUser = async () => {
    const res = await ApiRequest({
      url: "/profile/me",
      method: "GET",
    });
    setCurrentUser(res.data);
  };

  const fetchRequests = async () => {
    setLoading(true);

    try {
      let page = 1;
      const limit = 100;
      let allRequests = [];
      let keepFetching = true;

      while (keepFetching) {
        const res = await ApiRequest({
          url: `/requests/all?page=${page}&limit=${limit}&sort=created_at desc`,
          method: "GET",
        });

        const data = res.data || [];
        allRequests = [...allRequests, ...data];

        if (data.length < limit) {
          keepFetching = false;
        } else {
          page += 1;
        }
      }

      const mapped = allRequests.map((r) => ({
        id: r.request_id,
        name: r.name,
        status: getDisplayStatus(r.status, r.end_date),
        submissionType: r.tag_id ? "New" : "Revision",
        raw: r,
      }));

      setTasks(mapped);
      await fetchDelegations(mapped);
    } catch (err) {
      console.error("Failed fetch requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDelegations = async (requestList) => {
    const map = {};

    for (const req of requestList) {
      try {
        const res = await ApiRequest({
          url: `/requests/detail/${req.id}`,
          method: "GET",
        });

        map[req.id] = (res.data?.employees || []).map((e) => e.user_id);
      } catch (err) {
        console.error("❌ Delegation fetch failed:", req.id, err);
        map[req.id] = [];
      }
    }

    setDelegationMap(map);
  };

  const fetchUsers = async () => {
    const res = await ApiRequest({
      url: "/users/all?page=1&limit=200",
      method: "GET",
    });

    const map = {};
    (res.data || []).forEach((u) => {
      map[u.user_id] = {
        name: u.full_name,
        image:
          u.image_url && u.image_url !== ""
            ? u.image_url
            : `https://ui-avatars.com/api/?name=${encodeURIComponent(
                u.full_name,
              )}`,
      };
    });
    setUsersMap(map);
  };

  const fetchProvinces = async () => {
    const res = await ApiRequest({
      url: "/provinces?page=1&limit=1000",
      method: "GET",
    });

    const map = {};
    (res.data || []).forEach((p) => {
      map[p.province_id] = {
        areaName: p.area?.name || "-",
      };
    });

    setProvinceMap(map);
  };

  /* ================= MERGE DATA ================= */

  const mergedTasks = tasks.map((task) => {
    const assignorId =
      task.raw?.asm_id && usersMap[String(task.raw.asm_id)]
        ? String(task.raw.asm_id)
        : String(task.raw?.created_by);

    const assignor = usersMap[assignorId];
    const province = provinceMap[task.raw?.province_id];

    return {
      ...task,
      assignorName: assignor?.name || "-",
      assignorImage:
        assignor?.image ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          assignor?.name || "Unknown",
        )}`,
      regional: province?.areaName || "-",
    };
  });

  useEffect(() => {
    console.group("🧩 REQUEST ASSIGNOR DEBUG");

    mergedTasks.forEach((t) => {});

    console.groupEnd();
  }, [mergedTasks]);

  /* ================= PERMISSION ================= */

  const isPrivileged =
    currentUser &&
    (PRIVILEGED_USER_ID.includes(currentUser.user_id) ||
      PRIVILEGED_ROLES.includes(currentUser.user_role_id));

  const canSeeRequest = (task) => {
    if (!currentUser) return false;

    // Zerlinda & Super Admin
    if (isPrivileged) return true;

    // Creator
    if (task.raw?.created_by === currentUser.user_id) return true;

    // Delegated user
    const delegatedTo = delegationMap[task.id] || [];
    return delegatedTo.includes(currentUser.user_id);
  };

  /* ================= UTILS ================= */

  const mapStatus = (status) => {
    if (status === "ongoing") return "On Going";
    if (status === "delayed") return "Delayed";
    if (status === "done") return "Done";
    return "On Going";
  };

  const toggleCheck = (id) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  };

  const statusOrder = {
    "On Going": 1,
    "On Process Marketing": 2,
    "On Process Finance": 3,
    "On Process Purchasing": 4,
    Delayed: 5,
    Rejected: 6,
    Done: 7,
  };

  const visibleTasks = mergedTasks
    .filter(canSeeRequest)
    .filter((t) => {
      // FILTER TAB
      if (
        activeTab === "On Going" &&
        ![
          "On Going",
          "On Process Marketing",
          "On Process Finance",
          "On Process Purchasing",
        ].includes(t.status)
      ) {
        return false;
      }
      if (activeTab === "Delayed" && t.status !== "Delayed") return false;
      if (activeTab === "Done" && t.status !== "Done") return false;
      if (activeTab === "Rejected" && t.status !== "Rejected") return false;

      // 🔥 FILTER SEARCH
      const keyword = search.toLowerCase();

      return (
        t.name.toLowerCase().includes(keyword) ||
        t.assignorName.toLowerCase().includes(keyword) ||
        t.regional.toLowerCase().includes(keyword)
      );
    })
    .sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(visibleTasks.length / itemsPerPage);

  const paginatedTasks = visibleTasks.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const getDisplayStatus = (status, endDate) => {
    const today = new Date();

    if (status === "done") return "Done";
    if (status === "rejected") return "Rejected";

    if (status === "on_process_marketing") return "On Process Marketing";
    if (status === "on_process_finance") return "On Process Finance";
    if (status === "on_process_purchasing") return "On Process Purchasing";

    if (endDate) {
      const dueDate = new Date(endDate);
      if (today > dueDate) return "Delayed";
    }

    return "On Going";
  };

  /* ================= RENDER ================= */

  return (
    <div className="relative w-full px-4 mx-auto max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:flex-1">
          <div className="flex w-full p-1 overflow-x-auto rounded-full bg-brand-soft sm:w-fit scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`
        px-4 sm:px-8 py-2.5
        text-xs sm:text-sm
        font-semibold
        rounded-full
        whitespace-nowrap
        transition
        ${
          activeTab === tab
            ? "bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo text-white shadow-md"
            : "text-text-secondary hover:text-brand-secondary"
        }
      `}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* ===== ROW 1 (Mobile & Tablet) : Search + Filter ===== */}
        <div className="flex items-center w-full gap-3 lg:w-auto">
          {/* SEARCH */}
          <div className="flex items-center flex-1 px-4 py-3 border-2 shadow-sm bg-surface-card border-surface-border rounded-xl h-[42px] lg:w-[360px]">
            <Search size={18} className="mr-2 text-text-light" />
            <input
              type="text"
              placeholder="Request Search"
              className="w-full text-sm bg-transparent outline-none text-text-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {can_create && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center self-end gap-2 px-4 py-2 text-sm font-semibold shadow-md sm:self-auto bg-gradient-to-r from-brand-gradientFrom to-brand-gradientTo text-surface-background sm:px-5 rounded-xl"
          >
            {" "}
            <Plus size={18} /> Add
          </button>
        )}
      </div>
      {/* MODAL */}
      <AddRequestModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={() => {
          setShowAddModal(false);
          fetchRequests();
        }}
      />
      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-4 mb-8 sm:grid-cols-4 lg:grid-cols-4 sm:gap-6">
        {" "}
        <SummaryCard
          icon={OnGoing}
          count={
            mergedTasks.filter(
              (t) =>
                [
                  "On Going",
                  "On Process Marketing",
                  "On Process Finance",
                  "On Process Purchasing",
                ].includes(t.status) && canSeeRequest(t),
            ).length
          }
          title="On Going"
          subtitle="Task on process"
          color="text-status-warning"
        />
        <SummaryCard
          icon={DelayedIcon}
          count={
            mergedTasks.filter(
              (t) => t.status === "Delayed" && canSeeRequest(t),
            ).length
          }
          title="Delayed"
          subtitle="Task is delayed"
          color="text-status-danger"
        />
        <SummaryCard
          icon={Done}
          count={
            mergedTasks.filter((t) => t.status === "Done" && canSeeRequest(t))
              .length
          }
          title="Done"
          subtitle="Task Done"
          color="text-status-success"
        />
        <SummaryCard
          icon={DelayedIcon}
          count={
            mergedTasks.filter(
              (t) => t.status === "Rejected" && canSeeRequest(t),
            ).length
          }
          title="Rejected"
          subtitle="Task Rejected"
          color="text-status-danger"
        />
      </div>
      {/* LIST */}
      {loading ? (
        <p className="text-text-secondary">Loading...</p>
      ) : paginatedTasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-lg font-semibold text-text-primary">
            Belum ada request
          </p>
          <p className="mt-2 text-sm text-text-secondary">
            Klik{" "}
            <span className="font-semibold text-brand-secondary">
              Add Request
            </span>{" "}
            untuk mengajukan request
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {paginatedTasks.map((task) => (
            <div
              key={task.id}
              className="flex flex-col gap-4 p-4 border shadow-sm cursor-pointer bg-surface-background rounded-2xl sm:px-6 sm:py-4 hover:shadow-md sm:grid sm:grid-cols-[1.4fr_1fr_1fr_1fr_1.5fr] sm:items-center"
              onClick={() => navigate(`/request/task-detail/${task.id}`)}
            >
              {/* <Info label="Task Name" value={task.name} width="w-1/3" /> */}
              <div className="sm:col-span-1">
                <p className="mb-1 text-xs text-text-secondary">Task Name</p>
                <p
                  title={task.name}
                  className="text-sm font-medium text-brand-secondary"
                >
                  {task.name}
                </p>
              </div>

              <div className="sm:col-span-1">
                <p className="mb-1 text-xs text-text-secondary">
                  Submission Type
                </p>
                <span
                  className={`
      inline-block px-3 py-1 rounded-full text-xs font-semibold
      ${
        task.submissionType === "New"
          ? "bg-status-drag text-brand-gradientTo"
          : "bg-status-type text-status-typebutton"
      }
    `}
                >
                  {task.submissionType}
                </span>
              </div>

              {/* MOBILE ONLY */}
              <div className="flex gap-6 sm:hidden">
                <div>
                  <p className="mb-1 text-xs text-text-secondary">Assignor</p>
                  <img
                    src={task.assignorImage}
                    alt={task.assignorName}
                    className="rounded-full w-7 h-7"
                  />
                </div>

                <div>
                  <p className="mb-1 text-xs text-text-secondary">Regional</p>
                  <span className="text-sm font-medium text-brand-secondary">
                    {task.regional}
                  </span>
                </div>
              </div>

              <div className="hidden sm:block sm:col-span-1">
                <p className="mb-1 text-xs text-text-secondary">Assignor</p>
                <img
                  src={task.assignorImage}
                  alt={task.assignorName}
                  className="rounded-full w-7 h-7"
                />
              </div>

              <div className="hidden sm:block sm:col-span-1">
                <p className="mb-1 text-xs text-text-secondary">Regional</p>
                <span className="text-sm font-medium text-brand-secondary">
                  {task.regional}
                </span>
              </div>

              <div className="flex items-center justify-start sm:justify-end">
                <span
                  className={`
inline-flex items-center justify-center
px-4 py-1.5 text-xs font-semibold rounded-full
whitespace-nowrap min-w-[150px]
max-w-fit
${
  task.status === "Delayed"
    ? "bg-red-100 text-red-600"
    : task.status === "Rejected"
      ? "bg-gray-200 text-gray-700"
      : task.status === "Done"
        ? "bg-green-100 text-green-600"
        : task.status === "On Process Finance"
          ? "bg-orange-100 text-orange-700"
          : task.status === "On Process Purchasing"
            ? "bg-purple-100 text-purple-700"
            : task.status === "On Process Marketing"
              ? "bg-blue-100 text-blue-700"
              : "bg-yellow-100 text-yellow-700"
}
  `}
                >
                  {task.status}
                </span>
                {/* <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleCheck(task.id);
                  }}
                  className={`
  w-7 h-7
  aspect-square
  rounded-full
  border-2
  flex items-center justify-center
  transition
  ${
    checkedIds.includes(task.id)
      ? "border-brand-secondary bg-brand-secondary"
      : "border-text-light hover:border-brand-secondary"
  }
`}
                >
                  {checkedIds.includes(task.id) && (
                    <div className="w-3 h-3 rounded-full bg-surface-background" />
                  )}
                </button> */}
              </div>
            </div>
          ))}
        </div>
      )}
      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={setCurrentPage}
        />
      )}
    </div>
  );
};

/* ================= COMPONENTS ================= */

const SummaryCard = ({ icon, count, title, subtitle, color }) => (
  <div className="py-6 text-center border shadow-sm bg-surface-background rounded-2xl">
    <div className="relative mx-auto mb-2 w-14 h-14">
      <img src={icon} className="object-contain w-full h-full" />
      <span
        className={`absolute inset-0 flex items-center justify-center font-bold text-lg ${color}`}
      >
        {count}
      </span>
    </div>
    <h3 className="text-sm font-semibold sm:text-base">{title}</h3>
    <p className="mt-1 text-xs text-text-secondary">
      {count} {subtitle}
    </p>
  </div>
);

const Info = ({ label, value, width }) => (
  <div className={width}>
    <p className="mb-1 text-xs text-text-secondary">{label}</p>
    <p className="font-medium text-brand-secondary">{value}</p>
  </div>
);

export default RequestToMarketing;
