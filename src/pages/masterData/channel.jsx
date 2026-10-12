import React, { useState, useEffect } from "react";
import { Search, Plus } from "lucide-react";
import EditIcon from "../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../assets/images/icons/deleteIcon.png";
import { ApiRequest } from "../../services/apiRequest";
import ChannelAddModal from "../../components/masterData/channel/addChannel";
import ChannelEditModal from "../../components/masterData/channel/editChannel";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import InlineSuccess from "../../components/common/inlineSuccess";
import usePermission from "../../utils/usePermission";
import Pagination from "../../components/common/pagination";

const Channel = () => {
  const [search, setSearch] = useState("");
  const [channels, setChannels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

  const [page, setPage] = useState(1);
  const limit = 10;

  const { can_create, can_delete, can_update } = usePermission();

  // Format: dd-MM-yyyy HH.mm
  const formatDate = (isoString) => {
    if (!isoString || isoString === "0001-01-01T00:00:00Z") return "-";

    // Hilangkan "Z" → supaya Date() treat sebagai LOCAL TIME
    const cleaned = isoString.replace("Z", "");

    const date = new Date(cleaned); // dibaca sebagai WIB, bukan UTC

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}.${minutes}`;
  };

  const fetchChannels = async () => {
    setLoading(true);
    try {
      const res = await ApiRequest({
        url: "/channels/all",
        method: "GET",
      });

      if (res.status === "success" && Array.isArray(res.data)) {
        const formatted = res.data.map((item) => {
          const created = item.created_at;
          const updated = item.updated_at;

          // kalau belum pernah di-update atau sama dengan created_at → tampil "-"
          const isNeverUpdated =
            !updated ||
            updated === "0001-01-01T00:00:00Z" ||
            updated === created;

          return {
            id: item.channel_id,
            channel_code: item.channel_code || "",
            name: item.name,
            description: item.description || "-",
            createdAt: formatDate(created),
            updateAt: isNeverUpdated ? "-" : formatDate(updated),
          };
        });

        setChannels(formatted);
      } else {
        setChannels([]);
      }
    } catch (err) {
      console.error("Gagal memuat data channel:", err.message);
      setChannels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChannels();
  }, [search]);

  const filtered = channels.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const totalPage = Math.ceil(filtered.length / limit);
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + limit);

  return (
    <div
      className="w-full px-4 mx-auto  max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar"
    >
      <h1 className="mb-6 text-2xl font-bold text-[#002D62]">Channel</h1>

      {/* Search & Add */}
      <div
        className="flex flex-col gap-4 mb-6  sm:flex-row sm:justify-between sm:items-center"
      >
        <div
          className="flex items-center w-full px-3 py-3 bg-white border-2 border-gray-200 shadow-sm  rounded-xl sm:w-1/2 lg:w-1/3 h-[42px]"
        >
          <Search size={18} className="mr-2 text-gray-400" />
          <input
            type="text"
            placeholder="Channel Search"
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
            <Plus size={16} /> Add Channel
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
              <th className="px-6 py-3 font-medium text-center">
                Channel Code
              </th>
              <th className="px-6 py-3 font-medium text-center">
                Name Channel
              </th>
              <th className="px-6 py-3 font-medium text-center">Create At</th>
              <th className="px-6 py-3 font-medium text-center">Update At</th>
              <th className="px-6 py-3 font-medium text-center">Action</th>
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
              paginated.map((item, i) => (
                <tr
                  key={item.id}
                  className={`${
                    i % 2 === 0 ? "bg-white" : "bg-[#F9FBFE]"
                  } border-t border-gray-100 hover:bg-[#EEF5FF] transition`}
                >
                  <td className="px-6 py-3 text-center align-middle">
                    {(page - 1) * limit + i + 1}
                  </td>
                  <td className="px-6 py-3 font-medium text-center align-middle">
                    {item.channel_code}
                  </td>
                  <td className="px-6 py-3 font-medium text-center align-middle">
                    {item.name}
                  </td>
                  <td className="px-6 py-3 text-center align-middle">
                    {item.createdAt}
                  </td>
                  <td className="px-6 py-3 text-center align-middle">
                    {item.updateAt}
                  </td>
                  <td className="flex justify-center gap-3 px-6 py-3 text-center align-middle">
                    {can_update && (
                      <button
                        onClick={() => {
                          setSelectedChannel(item);
                          setShowEdit(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <img
                          src={EditIcon}
                          alt="edit"
                          className="object-contain w-5 h-5"
                        />
                      </button>
                    )}
                    {can_delete && (
                      <button
                        onClick={() => {
                          setSelectedChannel(item);
                          setShowDelete(true);
                        }}
                        className="text-red-600 hover:text-red-800"
                      >
                        <img
                          src={DeleteIcon}
                          alt="delete"
                          className="object-contain w-5 h-5"
                        />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-10 text-center text-gray-400">
                  No channel data found.
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
          paginated.map((item, i) => (
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
                        setSelectedChannel(item);
                        setShowEdit(true);
                      }}
                    >
                      <img src={EditIcon} className="w-4 h-4" />
                    </button>
                  )}
                  {can_delete && (
                    <button
                      onClick={() => {
                        setSelectedChannel(item);
                        setShowDelete(true);
                      }}
                    >
                      <img src={DeleteIcon} className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <p className="font-semibold text-[#002D62]">{item.name}</p>

              <p className="mt-1 text-xs text-gray-500">
                Code: {item.channel_code}
              </p>

              <p className="mt-1 text-xs text-gray-400">
                Created: {item.createdAt}
              </p>

              <p className="text-xs text-gray-400">Updated: {item.updateAt}</p>
            </div>
          ))
        ) : (
          <p className="py-10 text-center text-gray-400">
            No channel data found
          </p>
        )}
      </div>

      {/* Add Channel */}
      <ChannelAddModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onSuccess={() => {
          fetchChannels();
          setToastMessage("Data berhasil ditambahkan");
        }}
      />

      {/* Edit Channel */}
      <ChannelEditModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        channel={selectedChannel}
        onSuccess={() => {
          fetchChannels();
          setToastMessage("Data berhasil diupdate");
        }}
      />

      {/* Delete Channel */}
      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => setShowDelete(false)}
        onConfirm={async () => {
          try {
            await ApiRequest({
              url: `/channels/delete/${selectedChannel.id}`,
              method: "DELETE",
            });
            setShowDelete(false);
            await fetchChannels();
            setToastMessage("Data berhasil dihapus");
          } catch (e) {
            console.error(e);
            setToastMessage("Gagal menghapus data");
          }
        }}
      />

      {!loading && totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(p) => setPage(p)}
        />
      )}
    </div>
  );
};

export default Channel;
