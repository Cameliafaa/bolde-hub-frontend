import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import usePermission from "../../../utils/usePermission";
import Pagination from "../../../components/common/pagination";
import InlineSuccess from "../../../components/common/inlineSuccess";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import SurveyAddModal from "../../../components/masterData/survey/add/addSurvey";
import SurveyEditModal from "../../../components/masterData/survey/edit/editSurvey";
import { useNavigate } from "react-router-dom";
import StatusDropdown from "../../../components/common/statusDropdown";

const Survey = () => {
  const navigate = useNavigate();
  const { can_create, can_update, can_delete } = usePermission();

  const [search, setSearch] = useState("");
  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const limit = 10;

  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  /* ================= FETCH ================= */

  const fetchSurveys = async () => {
    setLoading(true);
    try {
      const res = await ApiRequest({
        url: "/surveys",
        method: "GET",
      });

      setSurveys(res.data || []);
    } catch (err) {
      console.error("Fetch surveys error:", err);
      setSurveys([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSurveys();
  }, []);

  const handleStatusChange = async (surveyId, newStatus) => {
    try {
      await ApiRequest({
        url: `/surveys/${surveyId}`,
        method: "PUT",
        data: {
          status: newStatus,
        },
      });

      setToastMessage("Status berhasil diperbarui");
      fetchSurveys(); // refresh list
    } catch (err) {
      console.error("Update status failed:", err);
      setToastMessage("Gagal mengubah status");
    }
  };

  /* ================= FILTER & PAGINATION ================= */

  const filtered = surveys.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPage = Math.ceil(filtered.length / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  /* ================= UTILS ================= */

  const renderStatus = (status) => {
    const map = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-600",
      closed: "bg-red-100 text-red-600",
    };

    return (
      <span
        className={`px-4 py-1.5 rounded-full text-xs font-semibold ${map[status] || "bg-gray-100 text-gray-600"
          }`}
      >
        {status}
      </span>
    );
  };

  const formatDate = (date) => {
    if (!date) return "-";
    return new Date(date).toLocaleString("id-ID");
  };

  /* ================= RENDER ================= */

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
      <h1 className="text-2xl font-bold text-brand-first mb-6">
        Survey Management
      </h1>

      {/* SEARCH + ADD */}
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
    bg-surface-background border border-surafce-border rounded-xl
    px-3 py-2
    w-full
    sm:w-1/2
    lg:w-1/3
  "
        >
          <Search size={18} className="text-text-light mr-2" />
          <input
            placeholder="Search survey title"
            className="outline-none w-full text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {can_create && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 bg-gradient-to-r
            from-brand-gradientFrom to-brand-gradientTo
            text-white font-medium px-5 py-2.5 rounded-lg shadow"
          >
            <Plus size={16} /> Add Survey
          </button>
        )}
      </div>

      <InlineSuccess
        message={toastMessage}
        onClose={() => setToastMessage("")}
      />

      {/* TABLE */}
      <div className="hidden sm:block bg-white rounded-2xl shadow border overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-[#E9EEF6]">
            <tr>
              <th className="px-6 py-3 text-center">No</th>
              <th className="px-6 py-3 text-center">Title</th>
              <th className="px-6 py-3 text-center">Responses</th>
              <th className="px-6 py-3 text-center">Last Update</th>
              <th className="px-6 py-3 text-center">Status</th>
              <th className="px-6 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  Loading data...
                </td>
              </tr>
            ) : paginated.length ? (
              paginated.map((item, i) => (
                <tr
                  key={item.survey_id}
                  className="border-t hover:bg-[#F9FBFF]"
                >
                  <td className="px-6 py-3 text-center">
                    {(page - 1) * limit + i + 1}
                  </td>

                  <td
                    className="px-6 py-3 text-center font-medium text-[#0F4C81] cursor-pointer hover:underline"
                    onClick={() =>
                      navigate(`/survey/${item.survey_id}/responses`)
                    }
                  >
                    {item.title}
                  </td>

                  <td className="px-6 py-3 text-center">
                    {item.responses}
                  </td>

                  <td className="px-6 py-3 text-center text-gray-500 text-sm">
                    {formatDate(item.updated_at)}
                  </td>

                  <td className="px-6 py-3 text-center">
                    <StatusDropdown
                      value={item.status}
                      onChange={(newStatus) =>
                        handleStatusChange(item.survey_id, newStatus)
                      }
                    />
                  </td>

                  <td className="px-6 py-3 flex justify-center gap-3">
                    {can_update && (
                      <button
                        onClick={() => {
                          setSelectedSurvey(item);
                          setShowEdit(true);
                        }}
                        className="text-blue-600 hover:underline"
                      >
                        <img src={EditIcon} className="w-4 h-4" />
                      </button>
                    )}

                    {can_delete && (
                      <button
                        onClick={() => {
                          setSelectedSurvey(item);
                          setShowDelete(true);
                        }}
                        className="text-red-600 hover:underline"
                      >
                        <img src={DeleteIcon} className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-10 text-gray-400">
                  No survey data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CARD – MOBILE */}
      <div className="sm:hidden space-y-4 mt-4">
        {loading ? (
          <p className="text-center py-10 text-gray-400">Loading data...</p>
        ) : paginated.length ? (
          paginated.map((item, i) => (
            <div
              key={item.survey_id}
              className="bg-white rounded-2xl border shadow-sm p-4"
            >
              {/* HEADER */}
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + i + 1}
                </p>

                <div className="flex gap-3">
                  {can_update && (
                    <button
                      onClick={() => {
                        setSelectedSurvey(item);
                        setShowEdit(true);
                      }}
                      className="text-blue-600 text-xs font-semibold"
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}

                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedSurvey(item);
                        setShowDelete(true);
                      }}
                      className="text-red-600 text-xs font-semibold"
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* TITLE */}
              <p
                className="font-semibold text-[#0F4C81] leading-snug cursor-pointer"
                onClick={() =>
                  navigate(`/survey/${item.survey_id}/responses`)
                }
              >
                {item.title}
              </p>

              {/* META */}
              <div className="mt-2 space-y-1 text-sm text-gray-500">
                <p>Responses: {item.responses}</p>
                <p>Updated: {formatDate(item.updated_at)}</p>
              </div>

              {/* STATUS */}
              <td className="px-6 py-3 text-center">
                <StatusDropdown
                  value={item.status}
                  onChange={(newStatus) =>
                    handleStatusChange(item.survey_id, newStatus)
                  }
                />
              </td>
            </div>
          ))
        ) : (
          <p className="text-center py-10 text-gray-400">
            No survey data found
          </p>
        )}
      </div>


      {!loading && totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={setPage}
        />
      )}

      {/* MODALS */}
      <SurveyAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchSurveys();
          setToastMessage("Survey berhasil ditambahkan");
        }}
      />

      <SurveyEditModal
        open={showEdit}
        surveyId={selectedSurvey?.survey_id}
        onClose={() => setShowEdit(false)}
        onSuccess={() => {
          fetchSurveys();
          setToastMessage("Survey berhasil diperbarui");
        }}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/surveys/${selectedSurvey.survey_id}`,
              method: "DELETE",
            });

            setShowDelete(false);
            fetchSurveys();
            setToastMessage("Survey berhasil dihapus");
          } catch (err) {
            console.error(err);
            setToastMessage("Gagal menghapus survey");
          }
        }}
      />
    </div>
  );
};

export default Survey;
