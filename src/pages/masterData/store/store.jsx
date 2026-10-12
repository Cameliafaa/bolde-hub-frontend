import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";

import { ApiRequest } from "../../../services/apiRequest";
import Pagination from "../../../components/common/pagination";
import InlineSuccess from "../../../components/common/inlineSuccess";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import usePermission from "../../../utils/usePermission";
import AddStore from "../../../components/masterData/store/addStore";
import EditStore from "../../../components/masterData/store/editStore";
// import EditStore from "../../../components/masterData/store/editStore";

const Store = () => {
  const { can_create, can_update, can_delete } = usePermission();

  const [search, setSearch] = useState("");
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;
  const [totalPages, setTotalPages] = useState(1);

  /* ================= FORMAT DATE ================= */
  const formatDate = (isoString) => {
    if (!isoString || isoString === "0001-01-01T00:00:00Z") return "-";
    const date = new Date(isoString);
    const d = String(date.getDate()).padStart(2, "0");
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const y = date.getFullYear();
    const h = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    return `${d}-${m}-${y} ${h}.${min}`;
  };

  /* ================= FETCH STORE ================= */
  const fetchStores = async (pageParam = page, searchParam = search) => {
    setLoading(true);
    try {
      const res = await ApiRequest({
        url: `/stores?page=${pageParam}&limit=${limit}&search=${searchParam}`,
        method: "GET",
      });

      if (res?.status === "success") {
        setStores(res.data || []);
        setTotalPages(res.meta?.total_page || 1);
      } else {
        setStores([]);
        setTotalPages(1);
      }
    } catch (e) {
      console.error("FETCH STORE ERROR:", e);
      setStores([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores(page, search);
  }, [page, search]);

  /* ================= UI ================= */
  return (
    <div
      className="w-full px-4 mx-auto  max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar"
    >
      {/* ===== TITLE ===== */}
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Store</h1>

      {/* ===== SEARCH + ADD ===== */}
      <div
        className="flex flex-col gap-4 mb-6  sm:flex-row sm:justify-between sm:items-center"
      >
        <div
          className="flex items-center w-full px-3 py-2 bg-white border border-gray-200  rounded-xl sm:w-1/2 lg:w-1/3"
        >
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Search Store"
            className="w-full text-sm outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 font-medium text-white rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5"
          >
            <Plus size={16} /> Add Store
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* ===== TABLE ===== */}
      <div className="hidden overflow-hidden bg-white border shadow sm:block rounded-2xl">
        <table className="min-w-full text-sm">
          <thead className="text-gray-600 bg-[#E9EEF6]">
            <tr>
              <th className="px-6 py-3 text-left w-[60px]">No</th>
              <th className="px-6 py-3 text-left">Store Code</th>
              <th className="px-6 py-3 text-left">Store Name</th>
              <th className="px-6 py-3 text-left w-[180px]">Created At</th>
              <th className="px-6 py-3 text-left w-[180px]">Updated At</th>
              <th className="px-6 py-3 text-center w-[120px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            ) : stores.length ? (
              stores.map((item, i) => (
                <tr
                  key={item.store_id}
                  className={`border-t ${
                    i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                  }`}
                >
                  <td className="px-6 py-3">{(page - 1) * limit + i + 1}</td>
                  <td className="px-6 py-3 font-medium">{item.store_code}</td>
                  <td className="px-6 py-3">{item.store_name}</td>
                  <td className="px-6 py-3 text-gray-500">
                    {formatDate(item.created_at)}
                  </td>
                  <td className="px-6 py-3 text-gray-500">
                    {formatDate(item.updated_at)}
                  </td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      {can_update && (
                        <button
                          onClick={() => {
                            setSelectedStore(item);
                            setShowEdit(true);
                          }}
                        >
                          <img src={EditIcon} className="w-5 h-5" />
                        </button>
                      )}
                      {can_delete && (
                        <button
                          onClick={() => {
                            setSelectedStore(item);
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
                <td
                  colSpan={6}
                  className="py-8 italic text-center text-gray-400"
                >
                  No store data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading data...</p>
        ) : stores.length ? (
          stores.map((item, i) => (
            <div
              key={item.store_id}
              className="p-4 bg-white border shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + i + 1}
                </p>

                <div className="flex gap-3">
                  {can_update && (
                    <button
                      onClick={() => {
                        setSelectedStore(item);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}
                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedStore(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold leading-snug text-[#002D62]">
                {item.store_name}
              </p>

              <p className="mt-1 text-sm text-gray-500">
                Code: {item.store_code}
              </p>

              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>Created: {formatDate(item.created_at)}</p>
                <p>Updated: {formatDate(item.updated_at)}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">No store data found</p>
        )}
      </div>

      {/* ===== PAGINATION ===== */}
      {!loading && totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          onChange={(p) => setPage(p)}
        />
      )}

      {/* ===== MODALS ===== */}
      <AddStore
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchStores();
          setToastMessage("Store berhasil ditambahkan");
        }}
      />

      <EditStore
        open={showEdit}
        onClose={() => setShowEdit(false)}
        data={selectedStore}
        onSuccess={() => {
          fetchStores();
          setToastMessage("Data berhasil diupdate");
        }}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => {
          setShowDelete(false);
          setSelectedStore(null);
        }}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/stores/${selectedStore.store_id}`,
              method: "DELETE",
            });
            setShowDelete(false);
            setSelectedStore(null);
            fetchStores();
            setToastMessage("Store berhasil dihapus");
          } catch (e) {
            console.error(e);
            setToastMessage("Gagal menghapus store");
          }
        }}
      />
    </div>
  );
};

export default Store;
