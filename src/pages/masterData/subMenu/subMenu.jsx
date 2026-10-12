import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../../services/apiRequest";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import usePermission from "../../../utils/usePermission";
import AddSubMenuModal from "../../../components/masterData/subMenu/addSubMenu";
import EditSubMenuModal from "../../../components/masterData/subMenu/editSubMenu";
import Pagination from "../../../components/common/pagination";

/* =========================
   CONSTANT
========================= */
const ALLOWED_MENU_IDS = [4, 6, 7]; // Sales Tools KIT, Master Data, User Management

/* =========================
   TABS COMPONENT
========================= */
const Tabs = ({ tabs, active, onChange }) => {
  return (
    <div className="flex overflow-x-auto sm:inline-flex bg-[#EEF4FB] rounded-full p-1 mb-4">
      {tabs.map((tab) => {
        const isActive = active === tab.key;

        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`
              shrink-0
              px-4 py-2
              text-xs sm:text-sm
              font-semibold
              rounded-2xl
              transition-all
              whitespace-nowrap

              ${isActive
                ? "bg-gradient-to-r from-[#5DA9E9] to-[#1E5FA3] text-white shadow"
                : "text-[#1E5FA3] hover:bg-white/60"
              }
            `}          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
};

const SubMenus = () => {
  const [search, setSearch] = useState("");
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [menus, setMenus] = useState([]);

  const [activeMenuId, setActiveMenuId] = useState(null);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selected, setSelected] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  const { can_create, can_update, can_delete } = usePermission();

  /* =========================
     Helpers
  ========================= */
  const formatDate = (iso) => {
    if (!iso || iso === "0001-01-01T00:00:00Z") return "-";
    const d = new Date(iso);
    return `${String(d.getDate()).padStart(2, "0")}-${String(
      d.getMonth() + 1
    ).padStart(2, "0")}-${d.getFullYear()} ${String(
      d.getHours()
    ).padStart(2, "0")}.${String(d.getMinutes()).padStart(2, "0")}`;
  };

  const getMenuNameById = (menuId) => {
    const menu = menus.find((m) => m.menu_id === menuId);
    return menu ? menu.name : "-";
  };

  /* =========================
     Fetch API
  ========================= */
  const fetchMenus = async () => {
    const res = await ApiRequest({
      url: "/menu/access/all",
      method: "GET",
    });
    if (res.status === "success") {
      setMenus(res.data);
    }
  };

  const fetchSubMenus = async () => {
    setLoading(true);
    try {
      const res = await ApiRequest({
        url: "/sub-menus?limit=100",
        method: "GET",
      });

      if (res.status === "success") {
        const formatted = res.data.map((item) => ({
          id: item.sub_menu_id,
          menuId: item.menu_id,
          name: item.name,
          url: item.url,
          orderNo: item.order_no,
          isActive: item.is_active,
          icon: item.icon,
          createdAt: formatDate(item.created_at),
          updatedAt: formatDate(item.updated_at),
        }));

        setList(formatted);
      }
    } catch (err) {
      console.error(err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
    fetchSubMenus();
  }, []);

  /* =========================
     Tabs Data (from API)
  ========================= */
  const tabs = menus
    .filter((m) => ALLOWED_MENU_IDS.includes(m.menu_id))
    .map((m) => ({
      key: m.menu_id,
      label: m.name,
    }));

  useEffect(() => {
    if (!activeMenuId && tabs.length) {
      setActiveMenuId(tabs[0].key); // default tab pertama
    }
  }, [tabs]);

  /* =========================
     Filter & Sort
  ========================= */
  const filtered = list
    .filter((item) => {
      const matchSearch = item.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchMenu = item.menuId === activeMenuId;

      return matchSearch && matchMenu;
    })
    .sort((a, b) => a.orderNo - b.orderNo);

  const [page, setPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(1);
  }, [activeMenuId, search]);

  const totalPage = Math.ceil(filtered.length / PAGE_SIZE);

  const paginatedData = filtered.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  /* =========================
     Render
  ========================= */
  return (
    <div
      className="
      w-full
      max-w-[1400px]
      mx-auto

      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
    >
      <h1 className="text-2xl font-bold text-[#002D62] mb-6">
        Sub Menu
      </h1>

      {/* Search + Add */}
      <div
        className="
    flex flex-col gap-4
    sm:flex-row sm:justify-between sm:items-center
    mb-6
  "
      >
        <div
          className="
    flex items-center
    bg-white border-2 border-gray-200 rounded-xl
    px-3 py-3
    w-full
    sm:w-1/2
    lg:w-1/3
    h-[42px]
  "
        >
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            placeholder="Search Sub Menu"
            className="outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white font-medium px-5 py-2.5 rounded-lg shadow hover:shadow-md transition"
          >
            <Plus size={16} /> Add Sub Menu
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* TABS */}
      <Tabs
        tabs={tabs}
        active={activeMenuId}
        onChange={(key) => setActiveMenuId(key)}
      />

      {/* Table */}
      <div className="hidden sm:block bg-white rounded-3xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-[#E9EEF6] text-gray-600">
              <th className="px-6 py-3 w-[60px]">No</th>
              {/* <th className="px-6 py-3 text-left">Menu</th> */}
              <th className="px-6 py-3 text-left">Name</th>
              {/* <th className="px-6 py-3 text-left">URL</th> */}
              {/* <th className="px-6 py-3 text-left">Order</th> */}
              {/* <th className="px-6 py-3 text-left">Status</th> */}
              <th className="px-6 py-3 text-left">Created At</th>
              <th className="px-6 py-3 text-center w-[120px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : paginatedData.length ? (
              paginatedData.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${i % 2 ? "bg-[#F9FBFE]" : "bg-white"
                    } hover:bg-[#EEF5FF]`}
                >
                  <td className="px-6 py-3">
                    {(page - 1) * PAGE_SIZE + i + 1}
                  </td>
                  {/* <td className="px-6 py-3 font-medium">
                    {getMenuNameById(item.menuId)}
                  </td> */}
                  <td className="px-6 py-3 font-medium">{item.name}</td>
                  {/* <td className="px-6 py-3 text-gray-500">{item.url}</td> */}
                  {/* <td className="px-6 py-3">{item.orderNo}</td> */}
                  {/* <td className="px-6 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        item.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td> */}
                  <td className="px-6 py-3">{item.createdAt}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      {can_update && (
                        <button
                          onClick={() => {
                            setSelected(item);
                            setShowEdit(true);
                          }}
                        >
                          <img src={EditIcon} className="w-5 h-5" />
                        </button>
                      )}
                      {can_delete && (
                        <button
                          onClick={() => {
                            setSelected(item);
                            setShowDelete(true);
                          }}
                        >
                          <img src={DeleteIcon} className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-6 italic text-gray-400">
                  No sub menu data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-4 mt-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading...</p>
        ) : paginatedData.length ? (
          paginatedData.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <td className="px-6 py-3">
                  #{(page - 1) * PAGE_SIZE + i + 1}
                </td>

                <div className="flex gap-3">
                  {can_update && (
                    <button
                      onClick={() => {
                        setSelected(item);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}
                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelected(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold text-[#002D62] leading-snug">
                {item.name}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                Created: {item.createdAt}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-gray-400">
            No sub menu data found
          </p>
        )}
      </div>


      {/* DELETE */}
      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            // =========================
            // 1. KHUSUS SALES TOOLS KIT
            // =========================
            const menu = menus.find(m => m.menu_id === selected.menuId);
            const isSalesTools =
              menu?.name?.toLowerCase() === "sales tools kit";

            if (isSalesTools) {
              const match = selected.url?.match(/\/sales-tools\/(\d+)/);
              const itemCategoryId = match?.[1];

              if (itemCategoryId) {
                await ApiRequest({
                  url: `/item-categories/delete/${itemCategoryId}`,
                  method: "DELETE",
                });
              }
            }

            // =========================
            // 2. DELETE SUB MENU (FIXED)
            // =========================
            await ApiRequest({
              url: `/sub-menus/${selected.id}`, // ✅ FIX
              method: "DELETE",
            });

            setShowDelete(false);
            setSelected(null);
            fetchSubMenus();
            setToastMessage("Sub menu berhasil dihapus");

          } catch (err) {
            console.error("DELETE SUB MENU ERROR:", err);
            alert("Gagal menghapus Sub Menu");
          }
        }}
      />
      <AddSubMenuModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={fetchSubMenus}
        menus={menus}
      />

      <EditSubMenuModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSuccess={fetchSubMenus}
        menus={menus}
        data={selected}
      />

      {totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(p) => setPage(p)}
        />
      )}


    </div>
  );
};

export default SubMenus;
