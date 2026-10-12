import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../../services/apiRequest";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import usePermission from "../../../utils/usePermission";
import NewsAddModal from "../../../components/masterData/news/addNews";
import NewsEditModal from "../../../components/masterData/news/editNews";
import Pagination from "../../../components/common/pagination";

const News = () => {
  const [search, setSearch] = useState("");
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedNews, setSelectedNews] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPage, setTotalPage] = useState(1);

  const { can_create, can_update, can_delete } = usePermission();

  const formatDate = (isoString) => {
    if (!isoString || isoString === "0001-01-01T00:00:00Z") return "-";

    const date = new Date(isoString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}.${minutes}`;
  };

  const fetchNews = async () => {
    setLoading(true);

    try {
      const res = await ApiRequest({
        url: `/calendars/all?limit=1000&search=${search}`,
        method: "GET",
      });

      if (res.status === "success" && Array.isArray(res.data)) {
        const sorted = [...res.data].sort(
          (a, b) =>
            new Date(b.created_at || b.updated_at) -
            new Date(a.created_at || a.updated_at)
        );

        const formatted = sorted.map((item) => ({
          id: item.calendar_id,
          title: item.title,
          createdAt: formatDate(item.created_at),
          updatedAt: formatDate(item.updated_at),
        }));

        setNewsList(formatted);

        // 🔥 pagination FULL di frontend
        setTotalPage(Math.ceil(formatted.length / limit));
      } else {
        setNewsList([]);
      }
    } catch (err) {
      console.error("API ERROR:", err);
      setNewsList([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, [search]);


  useEffect(() => {
    setPage(1);
    fetchNews(1);
  }, [search]);

  const filtered = newsList.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  const paginatedNews = filtered.slice(
    (page - 1) * limit,
    page * limit
  );


  return (
    <div
      className="
    w-full
    max-w-[1400px]
    mx-auto
    px-4
    sm:px-4
    lg:px-4
  "
    >
      <h1 className="text-2xl font-bold text-[#002D62] mb-6">
        News
      </h1>

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
    bg-white border-2 border-gray-200 rounded-xl shadow-sm
    px-3 py-3
    w-full
    sm:w-1/2
    lg:w-1/3
    h-[42px]
  "
        >
          <Search size={18} className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search Title"
            className="outline-none w-full text-sm text-gray-700"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white font-medium px-5 py-2.5 rounded-lg shadow hover:shadow-md transition"
          >
            <Plus size={16} /> Add News
          </button>
        )}
      </div>

      <InlineSuccess message={toastMessage} onClose={() => setToastMessage("")} />

      <div className="hidden sm:block bg-white rounded-3xl shadow-md overflow-hidden border border-gray-100">
        <table className="min-w-full text-sm text-gray-700">
          <thead>
            <tr className="bg-[#E9EEF6] text-gray-600">
              <th className="px-6 py-3 font-medium text-left w-[60px]">No</th>
              <th className="px-6 py-3 font-medium text-left">Title</th>
              <th className="px-6 py-3 font-medium text-left">Created At</th>
              <th className="px-6 py-3 font-medium text-left">Updated At</th>
              <th className="px-6 py-3 font-medium text-center w-[120px]">
                Action
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-gray-400">
                  Loading...
                </td>
              </tr>
            ) : paginatedNews.length > 0 ? (
              paginatedNews.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                    } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                >
                  <td className="px-6 py-3">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="px-6 py-3 font-medium">{item.title}</td>
                  <td className="px-6 py-3 text-gray-500">{item.createdAt}</td>
                  <td className="px-6 py-3 text-gray-500">{item.updatedAt}</td>

                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      {can_update && (
                        <button
                          onClick={() => {
                            setSelectedNews(item);
                            setShowEdit(true);
                          }}
                        >
                          <img
                            src={EditIcon}
                            alt="edit"
                            className="w-5 h-5 object-contain"
                          />
                        </button>
                      )}

                      {can_delete && (
                        <button
                          onClick={() => {
                            setSelectedNews(item);
                            setShowDelete(true);
                          }}
                        >
                          <img
                            src={DeleteIcon}
                            alt="delete"
                            className="w-5 h-5 object-contain"
                          />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-6 text-gray-400 italic">
                  No news data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sm:hidden space-y-4 mt-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400">
            Loading...
          </p>
        ) : paginatedNews.length ? (
          paginatedNews.map((item, i) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="px-6 py-3">
                  #{(page - 1) * limit + i + 1}
                </p>
                <div className="flex gap-3">
                  {can_update && (
                    <button
                      onClick={() => {
                        setSelectedNews(item);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}

                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedNews(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold text-[#002D62] leading-snug">
                {item.title}
              </p>

              <div className="mt-2 text-sm text-gray-500 space-y-1">
                <p>Created: {item.createdAt}</p>
                <p>Updated: {item.updatedAt}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-gray-400">
            No news data found
          </p>
        )}
      </div>


      {/* Add */}
      <NewsAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchNews(page);
          setToastMessage("News berhasil ditambahkan");
        }}
      />

      {/* Edit */}
      <NewsEditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        news={selectedNews}
        onSuccess={() => {
          fetchNews();
          setToastMessage("News berhasil diupdate");
        }}
      />

      {/* Delete */}
      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/calendars/delete/${selectedNews.id}`,
              method: "DELETE",
            });

            setShowDelete(false);
            fetchNews();
            setToastMessage("News berhasil dihapus");
          } catch (e) {
            console.error(e);
            setToastMessage("Gagal menghapus data");
          }
        }}
      />

      <Pagination
        current={page}
        total={totalPage}
        onChange={(p) => setPage(p)}
      />

    </div>
  );
};

export default News;
