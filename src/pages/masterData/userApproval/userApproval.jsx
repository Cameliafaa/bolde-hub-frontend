import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DetailIcon from "../../../assets/images/icons/detailIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../../services/apiRequest";
import ApprovalEditModal from "../../../components/masterData/userApproval/editUserApproval";
import InlineSuccess from "../../../components/common/inlineSuccess";
import ApprovalDetailModal from "../../../components/masterData/userApproval/detailUserApproval";
import AddApprovalMenu from "../../../components/masterData/userApproval/addUserApproval";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import usePermission from "../../../utils/usePermission";

const UserApproval = () => {
  const [search, setSearch] = useState("");
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showDetail, setShowDetail] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { can_create, can_delete, can_update } = usePermission();

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await ApiRequest({
        url: "/approval/menu/all",
        method: "GET",
      });

      if (res.status === "success" && Array.isArray(res.data)) {
        const formatted = res.data.map((item) => ({
          id: item.approval_menu_id,
          name: item.name,
          code: item.code,
          url_path: item.url_path,
        }));
        setMenus(formatted);
      } else setMenus([]);
    } catch (err) {
      console.error("Gagal memuat menu approval:", err);
      setMenus([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  const filtered = menus.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase()),
  );

  const refreshTable = () => {
    fetchMenus();
    setToastMessage("Approval flow updated!");
  };

  const confirmDeleteMenu = async () => {
    if (!deleteTarget) return;

    try {
      const res = await ApiRequest({
        url: `/approval/menu/delete/${deleteTarget.id}`,
        method: "DELETE",
      });

      if (res.status === "success") {
        setToastMessage("Approval menu deleted!");
        fetchMenus();
      } else {
        alert("Failed to delete.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Error deleting menu.");
    } finally {
      setShowDelete(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div
      className="w-full px-4 mx-auto  max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar"
    >
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">User Approval</h1>

      <div
        className="flex flex-col gap-4 mb-6  sm:flex-row sm:justify-between sm:items-center"
      >
        <div
          className="flex items-center w-full px-3 py-3 bg-white border-2 border-gray-200 shadow-sm  rounded-xl sm:w-1/2 lg:w-1/3 h-[42px]"
        >
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="User Approval Search"
            className="w-full text-sm text-gray-700 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 font-medium text-white transition rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5 hover:shadow-md"
          >
            <Plus size={16} /> Add User Approval
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* Table */}
      <div className="hidden overflow-hidden bg-white border border-gray-100 shadow-md sm:block rounded-3xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="text-gray-600 bg-[#E9EEF6]">
            <tr>
              <th className="px-6 py-3 font-medium text-center">No</th>
              <th className="px-6 py-3 font-medium text-center">Menu Name</th>
              <th className="px-6 py-3 font-medium text-center">Code</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="py-10 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            ) : filtered.length > 0 ? (
              filtered.map((m, i) => (
                <tr
                  key={m.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"} border-t`}
                >
                  <td className="px-6 py-3 text-center">{i + 1}</td>
                  <td className="px-6 py-3 font-medium text-center">
                    {m.name}
                  </td>
                  <td className="px-6 py-3 text-center">{m.code}</td>
                  <td className="flex justify-center gap-3 px-6 py-3 text-center">
                    <button
                      onClick={() => {
                        setSelectedMenu(m);
                        setShowDetail(true);
                      }}
                    >
                      <img src={DetailIcon} className="w-5 h-5" alt="detail" />
                    </button>
                    {can_update && (
                      <button
                        onClick={() => {
                          setSelectedMenu(m);
                          setShowEdit(true);
                        }}
                      >
                        <img src={EditIcon} className="w-5 h-5" alt="edit" />
                      </button>
                    )}
                    {can_delete && (
                      <button
                        onClick={() => {
                          setDeleteTarget(m);
                          setShowDelete(true);
                        }}
                      >
                        <img
                          src={DeleteIcon}
                          className="w-5 h-5"
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
                  No data found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading data...</p>
        ) : filtered.length ? (
          filtered.map((m, i) => (
            <div
              key={m.id}
              className="p-4 bg-white border shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400">#{i + 1}</p>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSelectedMenu(m);
                      setShowDetail(true);
                    }}
                  >
                    <img src={DetailIcon} className="w-4 h-4" />
                  </button>

                  {can_update && (
                    <button
                      onClick={() => {
                        setSelectedMenu(m);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}

                  {can_delete && (
                    <button
                      onClick={() => {
                        setDeleteTarget(m);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold text-[#002D62]">{m.name}</p>

              <p className="mt-1 text-sm text-gray-500">Code: {m.code}</p>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">No data found.</p>
        )}
      </div>

      {/* Modal Edit Approval Flow */}
      <AddApprovalMenu
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={refreshTable}
      />

      <ApprovalEditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        menu={selectedMenu}
        onSuccess={refreshTable}
      />

      <ApprovalDetailModal
        open={showDetail}
        onClose={() => setShowDetail(false)}
        menu={selectedMenu}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onConfirm={confirmDeleteMenu}
        title={`Are you sure you want to delete "${deleteTarget?.name}"?`}
      />
    </div>
  );
};

export default UserApproval;
