import React, { useState, useEffect } from "react";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../../services/apiRequest";
import PositionAddModal from "../../../components/masterData/position/addPosition";
import PositionEditModal from "../../../components/masterData/position/editPosition";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../../components/common/inlineSuccess";
import usePermission from "../../../utils/usePermission";
import Pagination from "../../../components/common/pagination";
import { fetchAllPositions } from "../../../services/position/positionServices";

const Position = () => {
  const [search, setSearch] = useState("");
  const [positions, setPositions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  const { can_create, can_delete, can_update } = usePermission();

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

  const fetchPositions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllPositions();

      if (Array.isArray(data)) {
        const formatted = data.map((item) => ({
          id: item.position_id,
          name: item.name,
          description: item.description || "-",
          createdAt: formatDate(item.created_at),
          updateAt: formatDate(item.updated_at),
        }));

        setPositions(formatted);
      } else {
        setPositions([]);
      }
    } catch (err) {
      console.error("Gagal memuat data posisi:", err.message);
      setPositions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const filtered = positions.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  useEffect(() => {
    setTotalPages(Math.ceil(filtered.length / limit) || 1);

    // reset ke page 1 kalau search berubah
    setPage(1);
  }, [search, filtered.length, limit]);

  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filtered.slice(startIndex, endIndex);

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar">
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Position</h1>

      <div className="flex flex-col gap-4 mb-6 sm:flex-row sm:justify-between sm:items-center">
        <div className="flex items-center w-full px-3 py-3 bg-white border-2 border-gray-200 shadow-sm rounded-xl sm:w-1/2 lg:w-1/3 h-[42px]">
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Position Search"
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
            <Plus size={16} /> Add Position
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
          <thead>
            <tr className="text-gray-600 bg-[#E9EEF6]">
              <th className="px-6 py-3 font-medium text-left w-[80px]">No</th>
              <th className="px-6 py-3 font-medium text-left">Name Position</th>
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
            ) : filtered.length > 0 ? (
              paginatedData.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                  } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                >
                  <td className="px-6 py-3">{(page - 1) * limit + (i + 1)}</td>
                  <td className="px-6 py-3 font-medium text-[#1E293B]">
                    {item.name}
                  </td>
                  <td className="px-6 py-3 text-gray-500">{item.createAt}</td>
                  <td className="px-6 py-3 text-gray-500">{item.updateAt}</td>
                  <td className="px-6 py-3 text-center">
                    <div className="flex justify-center gap-4">
                      {can_update && (
                        <button
                          onClick={() => {
                            setSelectedPosition(item);
                            setShowEdit(true);
                          }}
                          className="transition text-[#0F4C81] hover:text-[#002D62]"
                        >
                          <img
                            src={EditIcon}
                            alt="edit"
                            className="object-contain w-5 h-5"
                          />
                        </button>
                      )}
                      {can_update && (
                        <button
                          onClick={() => {
                            setSelectedPosition(item);
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
                  colSpan="5"
                  className="py-6 italic text-center text-gray-400"
                >
                  No position data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="space-y-4 sm:hidden">
        {loading ? (
          <p className="py-10 text-center text-gray-400">Loading data...</p>
        ) : filtered.length ? (
          paginatedData.map((item, index) => (
            <div
              key={item.id}
              className="p-4 bg-white border shadow-sm rounded-2xl"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="text-xs text-gray-400">
                  #{(page - 1) * limit + index + 1}
                </p>

                <div className="flex gap-3">
                  {can_update && (
                    <button
                      onClick={() => {
                        setSelectedPosition(item);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}
                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedPosition(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="mb-1 font-semibold text-[#002D62]">{item.name}</p>

              <p className="text-xs text-gray-500">Created: {item.createdAt}</p>
              <p className="text-xs text-gray-500">Updated: {item.updateAt}</p>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No position data found
          </p>
        )}
      </div>

      <PositionAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchPositions();
          setToastMessage("Data berhasil ditambahkan");
        }}
      />

      <PositionEditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        position={selectedPosition}
        onSuccess={() => {
          fetchPositions();
          setToastMessage("Data berhasil diupdate");
        }}
      />

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/positions/delete/${selectedPosition.id}`,
              method: "DELETE",
            });
            setShowDelete(false);
            fetchPositions();
            setToastMessage("Data berhasil dihapus");
          } catch (e) {
            console.error(e);
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

export default Position;
