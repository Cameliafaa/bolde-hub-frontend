import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";

import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";

import { ApiRequest } from "../../../services/apiRequest";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import Pagination from "../../../components/common/pagination";

import usePermission from "../../../utils/usePermission";
import DevelopmentCategoryAddModal from "../../../components/masterData/devCategory/addDevCategory";
import DevelopmentCategoryEditModal from "../../../components/masterData/devCategory/editDevCategory";

const DevelopmentCategory = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { can_create, can_delete, can_update } = usePermission();

  // =========================
  // FORMAT DATE
  // =========================
  const formatDate = (isoString) => {
    if (!isoString || isoString === "0001-01-01T00:00:00Z") {
      return "-";
    }

    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}.${minutes}`;
  };

  // =========================
  // FETCH DEVELOPMENT CATEGORY
  // =========================
  const fetchDevelopmentCategories = async () => {
    setLoading(true);

    try {
      const response = await ApiRequest({
        url: "/development-categories/all",
        method: "GET",
      });

      /*
        Support beberapa bentuk ApiRequest:

        1. response.data = [...]
        2. response.data.data = [...]
        3. response = { data: [...] }
      */

      let data = [];

      if (Array.isArray(response)) {
        data = response;
      } else if (Array.isArray(response?.data)) {
        data = response.data;
      } else if (Array.isArray(response?.data?.data)) {
        data = response.data.data;
      }

      const formatted = data.map((item) => ({
        id: item.development_category_id,
        name: item.name || "-",
        description: item.description || "-",

        createdAt: formatDate(item.created_at),
        updatedAt: formatDate(item.updated_at),

        createdBy: item.created_by,
        updatedBy: item.updated_by,

        // simpan original kalau dibutuhkan ketika edit
        original: item,
      }));

      setCategories(formatted);
    } catch (error) {
      console.error(
        "Gagal memuat development category:",
        error?.message || error,
      );

      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================
  useEffect(() => {
    fetchDevelopmentCategories();
  }, []);

  // =========================
  // SEARCH
  // =========================
  const filtered = categories.filter((item) => {
    const keyword = search.toLowerCase();

    return (
      item.name?.toLowerCase().includes(keyword) ||
      item.description?.toLowerCase().includes(keyword)
    );
  });

  // =========================
  // PAGINATION
  // =========================
  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / limit) || 1);
    setPage(1);
  }, [search, categories.length, limit]);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;

  const paginatedData = filtered.slice(startIndex, endIndex);

  // =========================
  // DELETE
  // =========================
  const handleDelete = async () => {
    if (!selectedCategory?.id) return;

    try {
      await ApiRequest({
        url: `/development-categories/delete/${selectedCategory.id}`,
        method: "DELETE",
      });

      setShowDelete(false);
      setSelectedCategory(null);

      await fetchDevelopmentCategories();

      setToastMessage("Development category berhasil dihapus");
    } catch (error) {
      console.error(
        "Gagal menghapus development category:",
        error?.message || error,
      );

      setToastMessage("Gagal menghapus development category");
    }
  };

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] sm:px-4 lg:px-4 xl:px-4 2xl:px-4">
      {/* TITLE */}
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">
        Development Category
      </h1>

      {/* SEARCH + ADD BUTTON */}
      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center w-full px-3 py-3 bg-white border-2 border-gray-200 shadow-sm rounded-xl sm:w-1/2 lg:w-1/3 h-[42px]">
          <Search size={18} className="mr-2 text-gray-400" />

          <input
            type="text"
            placeholder="Development Category Search"
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
            <Plus size={16} />
            Add Category
          </button>
        )}
      </div>

      {/* SUCCESS / ERROR MESSAGE */}
      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* ========================= */}
      {/* DESKTOP / TABLET TABLE */}
      {/* ========================= */}

      <div className="hidden overflow-hidden bg-white border border-gray-100 shadow-md sm:block rounded-3xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="text-gray-600 bg-[#E9EEF6]">
              <th className="px-6 py-3 font-medium text-left w-[80px]">No</th>

              <th className="px-6 py-3 font-medium text-left">
                Development Category
              </th>

              <th className="px-6 py-3 font-medium text-left">Description</th>

              <th className="px-6 py-3 font-medium text-left w-[180px]">
                Create At
              </th>

              <th className="px-6 py-3 font-medium text-left w-[180px]">
                Update At
              </th>

              <th className="px-6 py-3 font-medium text-center w-[120px]">
                Action
              </th>
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
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, index) => (
                <tr
                  key={item.id}
                  className={`${
                    index % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                  } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                >
                  {/* NUMBER */}
                  <td className="px-6 py-3">
                    {(page - 1) * limit + index + 1}
                  </td>

                  {/* NAME */}
                  <td className="px-6 py-3 font-medium text-[#1E293B]">
                    {item.name}
                  </td>

                  {/* DESCRIPTION */}
                  <td className="px-6 py-3 text-gray-500">
                    {item.description}
                  </td>

                  {/* CREATED */}
                  <td className="px-6 py-3 text-gray-500">{item.createdAt}</td>

                  {/* UPDATED */}
                  <td className="px-6 py-3 text-gray-500">{item.updatedAt}</td>

                  {/* ACTION */}
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      {/* EDIT */}
                      {can_update && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(item);
                            setShowEdit(true);
                          }}
                          className="transition hover:opacity-70"
                        >
                          <img
                            src={EditIcon}
                            alt="edit"
                            className="object-contain w-5 h-5"
                          />
                        </button>
                      )}

                      {/* DELETE */}
                      {can_delete && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategory(item);
                            setShowDelete(true);
                          }}
                          className="transition hover:opacity-70"
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
                  className="py-8 italic text-center text-gray-400"
                >
                  No development category data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ========================= */}
      {/* MOBILE CARD */}
      {/* ========================= */}

      <div className="space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400 animate-pulse">
            Loading data...
          </p>
        ) : paginatedData.length > 0 ? (
          paginatedData.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-white border border-gray-100 shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + index + 1}
                </p>

                <div className="flex gap-3">
                  {/* EDIT */}
                  {can_update && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(item);
                        setShowEdit(true);
                      }}
                    >
                      <img
                        src={EditIcon}
                        alt="edit"
                        className="object-contain w-4 h-4"
                      />
                    </button>
                  )}

                  {/* DELETE */}
                  {can_delete && (
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCategory(item);
                        setShowDelete(true);
                      }}
                    >
                      <img
                        src={DeleteIcon}
                        alt="delete"
                        className="object-contain w-4 h-4"
                      />
                    </button>
                  )}
                </div>
              </div>

              {/* NAME */}
              <p className="mb-1 font-semibold text-[#002D62]">{item.name}</p>

              {/* DESCRIPTION */}
              <p className="mb-3 text-sm text-gray-500">{item.description}</p>

              {/* DATE */}
              <div className="pt-3 space-y-1 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Created: {item.createdAt}
                </p>

                <p className="text-xs text-gray-500">
                  Updated: {item.updatedAt}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No development category data found
          </p>
        )}
      </div>

      {/* ========================= */}
      {/* ADD MODAL */}
      {/* ========================= */}

      <DevelopmentCategoryAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchDevelopmentCategories();
          setToastMessage("Data berhasil ditambahkan");
        }}
      />

      {/* ========================= */}
      {/* EDIT MODAL */}
      {/* ========================= */}

      <DevelopmentCategoryEditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        category={selectedCategory}
        onSuccess={() => {
          fetchDevelopmentCategories();
          setToastMessage("Data berhasil diupdate");
        }}
      />
      {/* ========================= */}
      {/* DELETE MODAL */}
      {/* ========================= */}

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => {
          setShowDelete(false);
          setSelectedCategory(null);
        }}
        onConfirm={handleDelete}
      />

      {/* ========================= */}
      {/* PAGINATION */}
      {/* ========================= */}

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

export default DevelopmentCategory;
