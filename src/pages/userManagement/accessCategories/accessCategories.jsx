import React, { useEffect, useState } from "react";
import { Search, Plus, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../../services/apiRequest";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import usePermission from "../../../utils/usePermission";
import Pagination from "../../../components/common/pagination";
import AccessCategoryModal from "../../../components/userManagement/accessCategories/accessCategories";

const AccessCategory = () => {
  const [search, setSearch] = useState("");
  const [allCategories, setAllCategories] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const [showDelete, setShowDelete] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const [sortBy, setSortBy] = useState(null);
  const [sortOrder, setSortOrder] = useState("asc");

  const { can_create, can_delete, can_update } = usePermission();

  const formatDate = (dateString) => {
    if (!dateString || dateString === "0001-01-01T00:00:00Z") return "-";

    const [datePart, timePart] = dateString
      .replace("T", " ")
      .replace("Z", "")
      .split(" ");

    const [year, month, day] = datePart.split("-");
    const [hour, minute] = timePart?.split(":") || ["00", "00"];

    return `${day}-${month}-${year} ${hour}.${minute}`;
  };

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await ApiRequest({
        url: "/role-categories",
        method: "GET",
      });

      const list = res?.data || [];

      const mapped = list.map((item) => ({
        id: item.role_category_id,
        name: item.role_category_name,
        createdAt: formatDate(item.created_at),
        updatedAt: formatDate(item.updated_at),
      }));

      setAllCategories(mapped);
      setCategories(mapped.slice(0, limit));
      setTotalPages(Math.ceil(mapped.length / limit) || 1);
    } catch (err) {
      console.error("FETCH ROLE CATEGORY ERROR:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const filtered = search
      ? allCategories.filter((item) =>
          item.name.toLowerCase().includes(search.toLowerCase()),
        )
      : allCategories;

    setTotalPages(Math.ceil(filtered.length / limit) || 1);

    const start = (page - 1) * limit;
    const end = start + limit;

    setCategories(filtered.slice(start, end));
  }, [search, allCategories, page, limit]);

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

  const sortedCategories = [...categories].sort((a, b) => {
    if (!sortBy) return 0;

    const aVal = sortBy === "name" ? a.name.toLowerCase() : "";
    const bVal = sortBy === "name" ? b.name.toLowerCase() : "";

    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const handleSave = async (payload) => {
    try {
      if (selectedCategory) {
        await ApiRequest({
          url: `/role-categories/${selectedCategory.id}`,
          method: "PUT",
          data: payload,
        });

        setToastMessage("Data berhasil diperbarui");
      } else {
        await ApiRequest({
          url: "/role-categories",
          method: "POST",
          data: payload,
        });

        setToastMessage("Data berhasil ditambahkan");
      }

      setShowModal(false);
      setSelectedCategory(null);
      setPage(1);
      fetchCategories();
    } catch (err) {
      console.error("SAVE ROLE CATEGORY ERROR:", err);
      setToastMessage("Gagal menyimpan data");
    }
  };

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px]">
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">
        Access Category
      </h1>

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center w-full px-3 py-2 bg-white border border-gray-200 rounded-xl sm:w-1/2 lg:w-1/3">
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Access Category Search"
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
            onClick={() => {
              setSelectedCategory(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 px-5 font-medium text-white rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5"
          >
            <Plus size={16} /> Add Access Category
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      <div className="hidden overflow-hidden bg-white border shadow sm:block rounded-2xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead className="bg-[#E9EEF6]">
            <tr>
              <th className="px-4 py-3">No</th>
              <th
                onClick={() => handleSort("name")}
                className="px-6 py-3 cursor-pointer select-none"
              >
                <div className="flex items-center gap-1">
                  Category Role
                  {renderSortIcon("name")}
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
            ) : sortedCategories.length > 0 ? (
              sortedCategories.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                  } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                >
                  <td className="px-6 py-3 text-center">
                    {(page - 1) * limit + (i + 1)}
                  </td>
                  <td className="px-4 py-3 font-medium">{item.name}</td>
                  <td className="px-4 py-3 text-left">{item.createdAt}</td>
                  <td className="px-4 py-3 text-left">{item.updatedAt}</td>
                  <td className="px-4 py-3 text-center">
                    {can_update && (
                      <button
                        onClick={() => {
                          setSelectedCategory(item);
                          setShowModal(true);
                        }}
                      >
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
                          setSelectedCategory(item);
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
                  No Access Category Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading...</p>
        ) : sortedCategories.length > 0 ? (
          sortedCategories.map((item, i) => (
            <div
              key={item.id}
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
                        setSelectedCategory(item);
                        setShowModal(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" alt="edit" />
                    </button>
                  )}

                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedCategory(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" alt="delete" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold leading-snug text-[#002D62]">
                {item.name}
              </p>

              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>Created: {item.createdAt}</p>
                <p>Updated: {item.updatedAt}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No Access Category Data Found
          </p>
        )}
      </div>

      <AccessCategoryModal
        open={showModal}
        data={selectedCategory}
        onClose={() => {
          setShowModal(false);
          setSelectedCategory(null);
        }}
        onSave={handleSave}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/role-categories/${selectedCategory.id}`,
              method: "DELETE",
            });

            setShowDelete(false);
            setToastMessage("Data berhasil dihapus");
            setSelectedCategory(null);
            setPage(1);
            fetchCategories();
          } catch (err) {
            console.error("DELETE ROLE CATEGORY ERROR:", err);
            setToastMessage("Gagal menghapus data");
          }
        }}
      />

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

export default AccessCategory;
