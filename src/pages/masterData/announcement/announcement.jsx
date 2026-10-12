import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, Eye } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import InlineSuccess from "../../../components/common/inlineSuccess";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import Pagination from "../../../components/common/pagination";
import usePermission from "../../../utils/usePermission";

import {
  getAnnouncements,
  removeAnnouncement,
} from "../../../services/announcement/announcementService";
import AddAnnouncementModal from "../../../components/masterData/announcement/addAnnouncement";
import EditAnnouncementModal from "../../../components/masterData/announcement/editAnnouncement";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  return url.replace(/\\/g, "/");
};

const formatDate = (iso) => {
  if (!iso || iso === "0001-01-01T00:00:00Z") return "-";
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}-${String(
    d.getMonth() + 1,
  ).padStart(2, "0")}-${d.getFullYear()} ${String(d.getHours()).padStart(
    2,
    "0",
  )}.${String(d.getMinutes()).padStart(2, "0")}`;
};

const Announcement = () => {
  const [search, setSearch] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { can_create, can_update, can_delete } = usePermission();

  const fetchAnnouncementData = async () => {
    setLoading(true);
    try {
      const res = await getAnnouncements({
        page: 1,
        limit: 100,
        search: "",
      });

      const rows = Array.isArray(res)
        ? res
        : Array.isArray(res?.data)
          ? res.data
          : Array.isArray(res?.data?.data)
            ? res.data.data
            : [];

      const formatted = rows.map((item) => ({
        id: item.announcement_id,
        title: item.title,
        description: item.description,
        image: normalizeImageUrl(item.image_url),
        type: item.type,
        createdAt: formatDate(item.created_at),
        updatedAt: formatDate(item.updated_at),
      }));

      setAnnouncements(formatted);
    } catch (err) {
      console.error("Failed to load announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementData();
  }, []);

  const filtered = useMemo(() => {
    return announcements.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.type.toLowerCase().includes(search.toLowerCase()),
    );
  }, [announcements, search]);

  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / limit) || 1);
    setPage(1);
  }, [filtered.length, limit, search]);

  const startIndex = (page - 1) * limit;
  const paginatedData = filtered.slice(startIndex, startIndex + limit);

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] sm:px-4 lg:px-4">
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Announcement</h1>

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center w-full px-3 py-2 bg-white border border-gray-200 rounded-xl sm:w-1/2 lg:w-1/3">
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Announcement Search"
            className="w-full text-sm text-gray-700 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-5 font-medium text-white rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5"
          >
            <Plus size={16} /> Add Announcement
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      <div className="hidden overflow-hidden bg-white border shadow-md sm:block rounded-3xl">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="text-gray-600 bg-[#E9EEF6]">
              <th className="px-6 py-3 text-left w-[80px]">No</th>
              <th className="px-6 py-3 text-left">Announcement Title</th>
              <th className="px-6 py-3 text-left">Image</th>
              <th className="px-6 py-3 text-left">Type</th>
              <th className="px-6 py-3 text-left w-[180px]">Create At</th>
              <th className="px-6 py-3 text-left w-[180px]">Update At</th>
              <th className="px-6 py-3 text-center w-[120px]">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-gray-400">
                  Loading data...
                </td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"} border-t hover:bg-[#EEF5FF]`}
                >
                  <td className="px-6 py-3">{(page - 1) * limit + (i + 1)}</td>

                  <td className="px-6 py-3 font-medium text-[#1E293B]">
                    <div>
                      <p className="font-semibold text-[#002D62]">
                        {item.title}
                      </p>
                      <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                  </td>

                  <td className="px-6 py-3">
                    {item.image ? (
                      <div className="relative w-16 h-10 group">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="object-cover w-full h-full rounded-md"
                        />
                        <button
                          onClick={() => setPreviewImage(item.image)}
                          className="absolute inset-0 flex items-center justify-center transition rounded-md opacity-0 bg-black/40 group-hover:opacity-100"
                        >
                          <Eye size={20} className="text-white" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs italic text-gray-400">
                        No Image
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-3">
                    <span className="px-3 py-1 text-xs font-semibold capitalize rounded-full bg-[#EAF6EA] text-[#1D8F3A]">
                      {item.type}
                    </span>
                  </td>

                  <td className="px-6 py-3 text-gray-500">{item.createdAt}</td>
                  <td className="px-6 py-3 text-gray-500">{item.updatedAt}</td>

                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      {can_update && (
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(item);
                            setShowEdit(true);
                          }}
                        >
                          <img src={EditIcon} className="w-5 h-5" alt="edit" />
                        </button>
                      )}

                      {can_delete && (
                        <button
                          onClick={() => {
                            setSelectedAnnouncement(item);
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
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="py-6 italic text-center text-gray-400"
                >
                  No announcement data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading...</p>
        ) : paginatedData.length ? (
          paginatedData.map((item, i) => (
            <div
              key={item.id}
              className="p-4 bg-white border shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-3">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + i + 1}
                </p>

                <div className="flex gap-3">
                  {can_update && (
                    <button
                      onClick={() => {
                        setSelectedAnnouncement(item);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" alt="edit" />
                    </button>
                  )}

                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedAnnouncement(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" alt="delete" />
                    </button>
                  )}
                </div>
              </div>

              {item.image && (
                <div className="relative mb-3">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="object-cover w-full h-32 rounded-xl"
                  />

                  <button
                    onClick={() => setPreviewImage(item.image)}
                    className="absolute inset-0 flex items-center justify-center text-white transition opacity-0 bg-black/40 hover:opacity-100 rounded-xl"
                  >
                    <Eye size={20} />
                  </button>
                </div>
              )}

              <p className="font-semibold text-[#002D62]">{item.title}</p>
              <p className="mt-1 text-xs text-gray-500 line-clamp-2">
                {item.description}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                Created: {item.createdAt}
              </p>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No announcement data found
          </p>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <Pagination
          current={page}
          total={totalPages}
          onChange={(p) => setPage(p)}
        />
      )}

      <AddAnnouncementModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchAnnouncementData();
          setToastMessage("Announcement berhasil ditambahkan");
        }}
      />

      <EditAnnouncementModal
        open={showEdit}
        announcement={selectedAnnouncement}
        onClose={() => setShowEdit(false)}
        onSuccess={() => {
          fetchAnnouncementData();
          setToastMessage("Announcement berhasil diupdate");
        }}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await removeAnnouncement(selectedAnnouncement.id);
            setShowDelete(false);
            fetchAnnouncementData();
            setToastMessage("Announcement berhasil dihapus");
          } catch {
            setToastMessage("Gagal menghapus announcement");
          }
        }}
      />

      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative max-w-3xl p-4 bg-white shadow-lg rounded-2xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute p-2 bg-white rounded-full shadow -top-3 -right-3 hover:bg-gray-100"
            >
              ✕
            </button>

            <img
              src={previewImage}
              alt="Announcement Preview"
              className="object-contain max-w-full max-h-[80vh] rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Announcement;
