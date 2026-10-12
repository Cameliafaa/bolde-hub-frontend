import React, { useState, useEffect } from "react";
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import DetailIcon from "../../../assets/images/icons/detailIcon.png";
import { ApiRequest } from "../../../services/apiRequest";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import AddEmployeeModal from "../../../components/userManagement/employee/addEmployee";
import EditEmployeeModal from "../../../components/userManagement/employee/editEmployee";
import DetailEmployeeModal from "../../../components/userManagement/employee/detailEmployee";
import usePermission from "../../../utils/usePermission";
import { fetchAllStores } from "../../../services/store/storeServices";
import Pagination from "../../../components/common/pagination";
import { fetchAllUsers } from "../../../services/users/userService";
import { fetchAllPositions } from "../../../services/position/positionServices";
import * as XLSX from "xlsx";

const Employee = () => {
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [detailEmployee, setDetailEmployee] = useState(null);

  const [toastMessage, setToastMessage] = useState("");
  const [allEmployees, setAllEmployees] = useState([]);

  const [areas, setAreas] = useState([]);
  const [users, setUsers] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [stores, setStores] = useState([]);
  const [channels, setChannels] = useState([]);
  const [positions, setPositions] = useState([]);

  // PAGINATION
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  // SORT
  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const { can_create, can_delete, can_update } = usePermission();

  // ============================
  // FORMAT DATE
  // ============================
  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "-";

    try {
      const clean = dateString.replace("T", " ").replace("Z", "");
      const [datePart, timePart = "00:00:00"] = clean.split(" ");

      const [year, month, day] = datePart.split("-");
      const [hour, minute] = timePart.split(":");

      return `${day}-${month}-${year} ${hour}.${minute}`;
    } catch {
      return "-";
    }
  };

  // ============================
  // BUILD POSITION MAP
  // ============================
  const buildPositionMap = (positionList = []) => {
    const map = {};

    positionList.forEach((p) => {
      const id = Number(p.position_id ?? p.id);

      if (!Number.isNaN(id)) {
        map[id] = p.name || "-";
      }
    });

    return map;
  };

  // ============================
  // MAP USERS
  // ============================
  const mapUsersWithDetails = async (userList, positionList) => {
    const positionMap = buildPositionMap(positionList);

    const mapped = await Promise.all(
      userList.map(async (u) => {
        try {
          const detail = await ApiRequest({
            url: `/users/detail/${u.user_id}`,
            method: "GET",
          });

          const detailData = detail?.data || {};

          return {
            id: u.user_id,
            full_name: u.full_name || "-",

            positionName:
              positionMap[Number(detailData.position_id)] ||
              u.position_name ||
              u.positions?.name ||
              "-",

            createdAt: formatDate(u.created_at),
            updatedAt: formatDate(detailData.updated_at || u.updated_at),
          };
        } catch (err) {
          console.error(`Failed load detail user ${u.user_id}:`, err);

          return {
            id: u.user_id,
            full_name: u.full_name || "-",
            positionName: u.position_name || u.positions?.name || "-",
            createdAt: formatDate(u.created_at),
            updatedAt: formatDate(u.updated_at),
          };
        }
      }),
    );

    return mapped.filter(Boolean);
  };

  // ============================
  // LOAD USERS + ALL POSITIONS
  // ============================
  const loadUsers = async () => {
    setLoading(true);

    try {
      const [allUsers, allPositions] = await Promise.all([
        fetchAllUsers(200),
        fetchAllPositions(),
      ]);

      const safeUsers = Array.isArray(allUsers) ? allUsers : [];

      const safePositions = Array.isArray(allPositions)
        ? allPositions
        : Array.isArray(allPositions?.data)
          ? allPositions.data
          : [];

      setPositions(safePositions);

      const mapped = await mapUsersWithDetails(safeUsers, safePositions);

      setAllEmployees(mapped);
    } catch (err) {
      console.error("Failed load users:", err);
      setAllEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ============================
  // LOAD MASTER DATA
  // ============================
  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const [allPositionRes, area, usr, channel, prov, allStoreRes] =
          await Promise.all([
            fetchAllPositions(),

            ApiRequest({
              url: "/areas/all",
              method: "GET",
            }),

            ApiRequest({
              url: "/users/all",
              method: "GET",
            }),

            ApiRequest({
              url: "/channels/all",
              method: "GET",
            }),

            ApiRequest({
              url: "/provinces?limit=100",
              method: "GET",
            }),

            fetchAllStores(),
          ]);

        const safePositions = Array.isArray(allPositionRes)
          ? allPositionRes
          : Array.isArray(allPositionRes?.data)
            ? allPositionRes.data
            : [];

        setPositions(safePositions);
        setAreas(area?.data || []);
        setUsers(usr?.data || []);
        setProvinces(prov?.data || []);
        setStores(Array.isArray(allStoreRes) ? allStoreRes : []);
        setChannels(channel?.data || []);
      } catch (err) {
        console.error("Failed load master data:", err);
      }
    };

    fetchMaster();
  }, []);

  // ============================
  // EDIT
  // ============================
  const handleEdit = async (userId) => {
    try {
      const res = await ApiRequest({
        url: `/users/detail/${userId}`,
        method: "GET",
      });

      setSelectedEmployee(res.data);
      setShowEdit(true);
    } catch (err) {
      console.error("Gagal fetch detail user:", err);
    }
  };

  // ============================
  // DETAIL
  // ============================
  const handleDetail = async (userId) => {
    try {
      const res = await ApiRequest({
        url: `/users/detail/${userId}`,
        method: "GET",
      });

      setDetailEmployee(res.data);
      setShowDetail(true);
    } catch (err) {
      console.error("Failed fetch details:", err);
    }
  };

  // ============================
  // SEARCH
  // ============================
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // ============================
  // SORT
  // ============================
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const renderSortIcon = (field) => {
    if (sortBy !== field) {
      return <ArrowUpDown size={14} className="ml-1 text-gray-400" />;
    }

    return sortOrder === "asc" ? (
      <ArrowUp size={14} className="ml-1 text-[#002D62]" />
    ) : (
      <ArrowDown size={14} className="ml-1 text-[#002D62]" />
    );
  };

  // ============================
  // FILTER + SORT
  // ============================
  const filteredEmployees = allEmployees
    .filter((e) => {
      const keyword = search.toLowerCase();

      return (
        String(e.full_name || "")
          .toLowerCase()
          .includes(keyword) ||
        String(e.positionName || "")
          .toLowerCase()
          .includes(keyword)
      );
    })
    .sort((a, b) => {
      if (!sortBy) return 0;

      const aVal =
        sortBy === "name"
          ? String(a.full_name || "").toLowerCase()
          : String(a.positionName || "").toLowerCase();

      const bVal =
        sortBy === "name"
          ? String(b.full_name || "").toLowerCase()
          : String(b.positionName || "").toLowerCase();

      return sortOrder === "asc"
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    });

  // ============================
  // PAGINATION FRONTEND
  // ============================
  const totalPages = Math.max(1, Math.ceil(filteredEmployees.length / limit));

  const pagedEmployees = filteredEmployees.slice(
    (page - 1) * limit,
    page * limit,
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  // ============================
  // RELOAD USERS
  // ============================
  const reloadUsers = async () => {
    setLoading(true);

    try {
      const [allUsers, allPositionRes] = await Promise.all([
        fetchAllUsers(200),
        fetchAllPositions(),
      ]);

      const safeUsers = Array.isArray(allUsers) ? allUsers : [];

      const safePositions = Array.isArray(allPositionRes)
        ? allPositionRes
        : Array.isArray(allPositionRes?.data)
          ? allPositionRes.data
          : [];

      setPositions(safePositions);

      const mapped = await mapUsersWithDetails(safeUsers, safePositions);

      setAllEmployees(mapped);
    } catch (err) {
      console.error("Failed reload users:", err);
    } finally {
      setLoading(false);
    }
  };

  // ============================
  // DOWNLOAD EXCEL
  // ============================
  const handleDownloadExcel = async () => {
    try {
      const [allUsers, allPositionRes] = await Promise.all([
        fetchAllUsers(),
        fetchAllPositions(),
      ]);

      const safeUsers = Array.isArray(allUsers) ? allUsers : [];

      const safePositions = Array.isArray(allPositionRes)
        ? allPositionRes
        : Array.isArray(allPositionRes?.data)
          ? allPositionRes.data
          : [];

      const positionMap = buildPositionMap(safePositions);

      const excelData = safeUsers.map((user, index) => ({
        No: index + 1,
        "User ID": user.user_id,

        Name: user.full_name || "-",

        Username: user.username || "-",

        Email: user.email || "-",

        Phone: user.phone || "-",

        Position:
          user.position_name ||
          user.positions?.name ||
          positionMap[Number(user.position_id)] ||
          "-",

        Role: user.role_name || user.user_roles?.name || "-",

        Area: user.area_name || user.areas?.name || "-",

        Province: user.province_name || user.provinces?.name || "-",

        Channel: user.channel_name || user.channels?.name || "-",

        Store: user.store_name || user.stores?.store_name || "-",

        "Approval Line": user.approval_line_name || "-",

        "Created At": user.created_at
          ? new Date(user.created_at).toLocaleString("id-ID")
          : "-",

        "Updated At": user.updated_at
          ? new Date(user.updated_at).toLocaleString("id-ID")
          : "-",
      }));

      const worksheet = XLSX.utils.json_to_sheet(excelData);

      const workbook = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(workbook, worksheet, "Users");

      XLSX.writeFile(workbook, "list-users.xlsx");
    } catch (err) {
      console.error("Download Excel failed:", err);
    }
  };

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] sm:px-4 lg:px-4 xl:px-4 2xl:px-4">
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Users</h1>

      {/* SEARCH + ACTION */}
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center w-full px-4 py-3 bg-white border border-gray-200 shadow-sm rounded-2xl lg:max-w-md">
          <Search size={18} className="mr-3 text-gray-400" />

          <input
            type="text"
            placeholder="Search user..."
            className="w-full text-sm text-gray-700 bg-transparent outline-none placeholder:text-gray-400"
            value={search}
            onChange={handleSearchChange}
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-sm rounded-xl bg-emerald-600 hover:bg-emerald-700 hover:shadow-md"
          >
            Download Excel
          </button>

          {can_create && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white transition-all duration-200 shadow-sm rounded-xl bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] hover:shadow-md hover:scale-[1.01]"
            >
              <Plus size={16} />
              Add User
            </button>
          )}
        </div>
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* TABLE */}
      <div className="hidden overflow-hidden bg-white border shadow sm:block rounded-2xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="text-gray-600 bg-[#E9EEF6]">
              <th className="px-6 py-3 text-center w-[80px]">No</th>

              <th
                onClick={() => handleSort("name")}
                className="px-6 py-3 text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-1">
                  Name
                  {renderSortIcon("name")}
                </div>
              </th>

              <th
                onClick={() => handleSort("position")}
                className="px-6 py-3 text-left cursor-pointer select-none"
              >
                <div className="flex items-center gap-1">
                  Position
                  {renderSortIcon("position")}
                </div>
              </th>

              <th className="px-6 py-3 text-left w-[180px]">Created At</th>

              <th className="px-6 py-3 text-left w-[180px]">Updated At</th>

              <th className="px-6 py-3 text-center w-[120px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={6}
                  className="py-10 text-center text-gray-400 animate-pulse"
                >
                  Loading data...
                </td>
              </tr>
            ) : pagedEmployees.length > 0 ? (
              pagedEmployees.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                  } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                >
                  <td className="px-6 py-3 text-center">
                    {(page - 1) * limit + i + 1}
                  </td>

                  <td className="px-6 py-3 font-medium text-[#1E293B]">
                    {item.full_name}
                  </td>

                  <td className="px-6 py-3 text-gray-700">
                    {item.positionName}
                  </td>

                  <td className="px-6 py-3 text-gray-500">{item.createdAt}</td>

                  <td className="px-6 py-3 text-gray-500">{item.updatedAt}</td>

                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      <button
                        onClick={() => handleDetail(item.id)}
                        className="transition text-[#0F4C81] hover:text-[#002D62]"
                      >
                        <img
                          src={DetailIcon}
                          alt="detail"
                          className="object-contain w-5 h-5"
                        />
                      </button>

                      {can_update && (
                        <button
                          onClick={() => handleEdit(item.id)}
                          className="transition text-[#0F4C81] hover:text-[#002D62]"
                        >
                          <img
                            src={EditIcon}
                            alt="edit"
                            className="object-contain w-5 h-5"
                          />
                        </button>
                      )}

                      {can_delete && (
                        <button
                          onClick={() => {
                            setSelectedEmployee(item);
                            setShowDelete(true);
                          }}
                          className="transition text-[#D32F2F] hover:text-[#B71C1C]"
                        >
                          <img
                            src={DeleteIcon}
                            alt="delete"
                            className="object-contain w-5 h-5"
                          />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-6 italic text-center text-gray-400"
                >
                  No User data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MOBILE */}
      <div className="mt-4 space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading...</p>
        ) : pagedEmployees.length ? (
          pagedEmployees.map((item, i) => (
            <div
              key={item.id}
              className="p-4 bg-white border shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + i + 1}
                </p>

                <div className="flex gap-3">
                  <button onClick={() => handleDetail(item.id)}>
                    <img src={DetailIcon} alt="detail" className="w-4 h-4" />
                  </button>

                  {can_update && (
                    <button onClick={() => handleEdit(item.id)}>
                      <img src={EditIcon} alt="edit" className="w-4 h-4" />
                    </button>
                  )}

                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedEmployee(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} alt="delete" className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold leading-snug text-[#002D62]">
                {item.full_name}
              </p>

              <p className="mt-1 text-sm text-gray-600">
                Position: {item.positionName}
              </p>

              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>Created: {item.createdAt}</p>
                <p>Updated: {item.updatedAt}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">No User data found</p>
        )}
      </div>

      {/* MODALS */}
      <DetailEmployeeModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        data={detailEmployee}
        positions={positions}
        areas={areas}
        users={users}
        channels={channels}
        provinces={provinces}
        stores={stores}
      />

      <AddEmployeeModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={async () => {
          await reloadUsers();
          setToastMessage("Data berhasil ditambahkan");
        }}
      />

      <EditEmployeeModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        data={selectedEmployee}
        onSuccess={async () => {
          await reloadUsers();
          setToastMessage("Data berhasil diupdate");
        }}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/users/delete/${selectedEmployee.id}`,
              method: "DELETE",
            });

            await reloadUsers();

            setShowDelete(false);
            setToastMessage("Data berhasil dihapus");
          } catch (e) {
            console.error(e);
            setToastMessage("Gagal menghapus data");
          }
        }}
      />

      <Pagination current={page} total={totalPages} onChange={setPage} />
    </div>
  );
};

export default Employee;
