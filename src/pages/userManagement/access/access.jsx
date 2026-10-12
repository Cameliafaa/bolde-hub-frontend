import React, { useState, useEffect } from "react";
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import AccessEditModal from "../../../components/userManagement/access/editModal";
import { ApiRequest } from "../../../services/apiRequest";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import AddAccessModal from "../../../components/userManagement/access/addAccess";
import InlineSuccess from "../../../components/common/inlineSuccess";
import usePermission from "../../../utils/usePermission";
import { useLocation } from "react-router-dom";
import Pagination from "../../../components/common/pagination";

const Access = () => {
  const [search, setSearch] = useState("");
  const [allAccess, setAllAccess] = useState([]);
  const [access, setAccess] = useState([]);
  const [loading, setLoading] = useState(true);
  const [menuHeaders, setMenuHeaders] = useState([]);

  const [showModal, setShowModal] = useState(false);
  const [selectRole, setSelectRole] = useState(null);
  const [menuPermissions, setMenuPermissions] = useState([]);

  const [showDelete, setShowDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [roleCategories, setRoleCategories] = useState([]);

  // Pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState(null); // "name" | "position"
  const [sortOrder, setSortOrder] = useState("asc"); // asc | desc

  const { can_create, can_delete, can_update } = usePermission();

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "-";

    // ambil langsung dari string, TANPA new Date()
    // contoh input: 2026-01-29T10:31:16Z atau 2026-01-29 10:31:16
    const [datePart, timePart] = dateString
      .replace("T", " ")
      .replace("Z", "")
      .split(" ");

    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart.split(":");

    return `${day}-${month}-${year} ${hour}.${minute}`;
  };

  const fetchRoleCategories = async () => {
    try {
      const res = await ApiRequest({
        url: "/role-categories",
        method: "GET",
      });

      setRoleCategories(res?.data || []);
    } catch (err) {
      console.error("FETCH ROLE CATEGORIES ERROR:", err);
    }
  };

  // ===========================
  // FETCH MENU LIST
  // ===========================
  const fetchAllMenus = async () => {
    try {
      const res = await ApiRequest({
        url: "/menu/access/all",
        method: "GET",
      });

      const menus = res?.data || [];
      let headers = [];

      menus
        .sort((a, b) => a.order_no - b.order_no)
        .forEach((menu) => {
          headers.push({
            key: `menu-${menu.menu_id}`,
            label: menu.name,
            type: "menu",
            menu_id: menu.menu_id,
          });

          if (Array.isArray(menu.sub_menus)) {
            menu.sub_menus.forEach((sm) => {
              headers.push({
                key: `submenu-${sm.sub_menu_id}`,
                label: sm.name,
                type: "submenu",
                menu_id: menu.menu_id,
                sub_menu_id: sm.sub_menu_id,
              });
            });
          }
        });

      setMenuHeaders(headers);
    } catch (e) {
      console.error("MENU ERROR:", e);
    }
  };

  // ===========================
  // FETCH ACCESS LIST
  // ===========================
  const fetchAccess = async () => {
    setLoading(true);

    try {
      const res = await ApiRequest({
        url: `/roles/all`,
        method: "GET",
      });

      const list = res?.data || []; //langsung array
      const meta = res?.meta || {};
      setTotalPages(meta.total_page || 1);

      const detailedRoles = await Promise.all(
        list.map(async (role) => {
          const detail = await ApiRequest({
            url: `/roles/detail/${role.user_role_id}`,
            method: "GET",
          });

          return {
            id: role.user_role_id,
            role: role.name,
            description: role.description,
            roleCategoryId: role.role_category_id,
            roleCategoryName: role.role_category_name || "-",
            createdAt: formatDate(role.created_at),
            updatedAt: formatDate(role.updated_at),
            fullPermissions: detail?.data?.permissions || [],
          };
        }),
      );

      setAllAccess(detailedRoles);
      setAccess(detailedRoles);
    } catch (err) {
      console.error("❌ FETCH ACCESS ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllMenus();
    fetchRoleCategories();
  }, []);

  useEffect(() => {
    fetchAccess();
  }, []);

  //search
  useEffect(() => {
    const source = search ? allAccess : allAccess;

    const filtered = search
      ? source.filter((item) =>
          item.role.toLowerCase().includes(search.toLowerCase()),
        )
      : source;

    setTotalPages(Math.ceil(filtered.length / limit) || 1);

    const start = (page - 1) * limit;
    const end = start + limit;

    setAccess(filtered.slice(start, end));
  }, [search, allAccess, page]);

  // ===========================
  // EDIT ROLE
  // ===========================
  const handleEdit = async (role) => {
    try {
      const res = await ApiRequest({
        url: `/roles/detail/${role.id}`,
        method: "GET",
      });

      const perms = res?.data?.permissions || [];

      const menus = [];

      menuHeaders.forEach((header) => {
        if (header.type === "menu") {
          const perm = perms.find((p) => p.menu_id === header.menu_id);
          menus.push({
            menu_id: header.menu_id,
            sub_menu_id: null,
            name: header.label,
            canView: perm?.can_read ?? false,
            canCreate: perm?.can_create ?? false,
            canEdit: perm?.can_update ?? false,
            canDelete: perm?.can_delete ?? false,
          });
        }

        if (header.type === "submenu") {
          const parent = perms.find((p) => p.menu_id === header.menu_id);
          const sub = parent?.sub_menu?.find(
            (s) => s.sub_menu_id === header.sub_menu_id,
          );
          menus.push({
            menu_id: header.menu_id,
            sub_menu_id: header.sub_menu_id,
            name: `— ${header.label}`,
            canView: sub?.can_read ?? false,
            canCreate: sub?.can_create ?? false,
            canEdit: sub?.can_update ?? false,
            canDelete: sub?.can_delete ?? false,
          });
        }
      });

      setSelectRole(role);
      setMenuPermissions(menus);
      setShowModal(true);
    } catch (e) {
      console.error("EDIT ROLE ERROR:", e);
    }
  };

  // ===========================
  // SAVE PERMISSIONS
  // ===========================
  const handleSavePermissions = async (newPerms) => {
    if (!selectRole) return;

    try {
      const grouped = {};

      newPerms.forEach((p) => {
        if (!grouped[p.menu_id]) {
          grouped[p.menu_id] = {
            menu_id: p.menu_id,
            can_create: p.canCreate,
            can_read: p.canView,
            can_update: p.canEdit,
            can_delete: p.canDelete,
            sub_menu: [],
          };
        }

        if (p.sub_menu_id !== null) {
          grouped[p.menu_id].sub_menu.push({
            sub_menu_id: p.sub_menu_id,
            can_create: p.canCreate,
            can_read: p.canView,
            can_update: p.canEdit,
            can_delete: p.canDelete,
          });
        }
      });

      const payload = {
        name: selectRole.role,
        description: selectRole.description,
        role_category_id: Number(selectRole.roleCategoryId) || null,
        permissions: Object.values(grouped),
      };

      await ApiRequest({
        url: `/roles/update/${selectRole.id}`,
        method: "PUT",
        data: payload,
      });

      setToastMessage("Data berhasil diperbarui");
      setShowModal(false);
      fetchAccess();
    } catch (e) {
      console.error("SAVE PERMISSIONS ERROR:", e);
    }
  };

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

  // ===========================
  // UI
  // ===========================
  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar">
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Access</h1>

      {/* Search */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center w-full px-3 py-2 bg-white border border-gray-200 rounded-xl sm:w-1/2 lg:w-1/3">
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Access Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full text-sm text-gray-700 outline-none"
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 font-medium text-white rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5"
          >
            <Plus size={16} /> Add Access
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* TABLE */}
      <div className="hidden overflow-hidden bg-white border shadow sm:block rounded-2xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#E9EEF6]">
            <tr>
              <th className="px-4 py-3">No</th>
              <th className="px-4 py-3 text-left">Category Role</th>
              <th
                onClick={() => handleSort("role")}
                className="px-6 py-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-1">
                  Role
                  {renderSortIcon("role")}
                </div>
              </th>
              <th className="px-4 py-3 text-left">Created At</th>
              <th className="px-4 py-3 text-left">Updated At</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center">
                  Loading...
                </td>
              </tr>
            ) : access.length > 0 ? (
              [...access]
                .sort((a, b) => {
                  if (!sortBy) return 0;

                  const aVal = sortBy === "role" ? a.role.toLowerCase() : "";

                  const bVal = sortBy === "role" ? b.role.toLowerCase() : "";

                  if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
                  if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
                  return 0;
                })
                .map((role, i) => (
                  <tr
                    key={role.id}
                    className={`${
                      i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                    } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                  >
                    <td className="px-6 py-3 text-center">
                      {(page - 1) * limit + (i + 1)}
                    </td>
                    <td className="px-4 py-3">{role.roleCategoryName}</td>
                    <td className="px-4 py-3 font-medium">{role.role}</td>
                    <td className="px-4 py-3 text-left">{role.createdAt}</td>
                    <td className="px-4 py-3 text-left">{role.updatedAt}</td>
                    <td className="px-4 py-3 text-center">
                      {can_update && (
                        <button onClick={() => handleEdit(role)}>
                          <img
                            src={EditIcon}
                            className="inline-block w-5 h-5 mr-3"
                            alt="edit"
                          />
                        </button>
                      )}
                      {can_delete && (
                        <button
                          onClick={() => {
                            setSelectRole(role);
                            setShowDelete(true);
                          }}
                        >
                          <img
                            src={DeleteIcon}
                            className="inline-block w-5 h-5"
                            alt="delete"
                          />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
            ) : (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  No Access Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARD – MOBILE */}
      <div className="mt-4 space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading...</p>
        ) : access.length ? (
          [...access]
            .sort((a, b) => {
              if (!sortBy) return 0;

              const aVal = sortBy === "role" ? a.role.toLowerCase() : "";

              const bVal = sortBy === "role" ? b.role.toLowerCase() : "";

              if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
              if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
              return 0;
            })
            .map((role, i) => (
              <div
                key={role.id}
                className="p-4 bg-white border shadow-sm rounded-2xl"
              >
                {/* HEADER */}
                <div className="flex items-start justify-between mb-2">
                  <p className="text-xs text-gray-400">
                    #{(page - 1) * limit + i + 1}
                  </p>

                  <p>Category Role: {role.roleCategoryName}</p>

                  <div className="flex gap-3">
                    {can_update && (
                      <button onClick={() => handleEdit(role)}>
                        <img src={EditIcon} className="w-4 h-4" />
                      </button>
                    )}

                    {can_delete && (
                      <button
                        onClick={() => {
                          setSelectRole(role);
                          setShowDelete(true);
                        }}
                      >
                        <img src={DeleteIcon} className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                <p>Category Role: {role.roleCategoryName}</p>

                {/* ROLE NAME */}
                <p className="font-semibold leading-snug text-[#002D62]">
                  {role.role}
                </p>

                {/* META */}
                <div className="mt-2 space-y-1 text-sm text-gray-500">
                  <p>Created: {role.createdAt}</p>
                  <p>Updated: {role.updatedAt}</p>
                </div>
              </div>
            ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No Access Data Found
          </p>
        )}
      </div>

      {/* ADD ROLE */}
      <AddAccessModal
        open={showAddModal}
        roleCategories={roleCategories}
        menus={menuHeaders.map((h) => ({
          menu_id: h.menu_id,
          sub_menu_id: h.sub_menu_id ?? null,
          name: h.label,
          canView: false,
          canCreate: false,
          canEdit: false,
          canDelete: false,
        }))}
        onClose={() => {
          setShowAddModal(false);
          setMenuPermissions([]);
          setSelectRole(null);
        }}
        onSave={async (payload) => {
          try {
            const res = await ApiRequest({
              url: "/roles/create",
              method: "POST",
              data: payload,
            });

            if (res.status === "success") {
              setShowAddModal(false);
              setToastMessage("Data berhasil ditambahkan");
              setPage(1);
              fetchAccess();
            }
          } catch (err) {
            console.error("ADD ROLE ERROR:", err);
          }
        }}
      />

      {/* EDIT */}
      {showModal && (
        <AccessEditModal
          open={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSavePermissions}
          roleName={selectRole?.role}
          menus={menuPermissions}
          roleCategories={roleCategories}
          roleCategoryId={selectRole?.roleCategoryId}
          onChangeRoleCategory={(value) =>
            setSelectRole((prev) => ({
              ...prev,
              roleCategoryId: Number(value),
              roleCategoryName:
                roleCategories.find(
                  (item) => Number(item.role_category_id) === Number(value),
                )?.role_category_name || "-",
            }))
          }
        />
      )}

      {/* DELETE */}
      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/roles/delete/${selectRole.id}`,
              method: "DELETE",
            });
            setShowDelete(false);
            setToastMessage("Data berhasil dihapus");
            setPage(1);
            fetchAccess();
          } catch (e) {
            console.error("DELETE ERROR:", e);
            setToastMessage("Gagal menghapus data");
          }
        }}
      />

      {/* PAGINATION */}
      {!loading && totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          onChange={(newPage) => setPage(newPage)}
        />
      )}
    </div>
  );
};

export default Access;
