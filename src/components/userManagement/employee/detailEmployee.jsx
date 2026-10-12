import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const DetailEmployeeModal = ({
  open,
  onClose,
  data,
  positions,
  areas,
  users,
  provinces,
  stores,
  channels,
}) => {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    setDetail(data);
  }, [data]);

  if (!open || !detail) return null;

  const user = detail.data || detail;

  const getPositionName = (id) => {
    return positions.find((p) => p.position_id === id)?.name || "-";
  };

  const getAreaName = (id) => {
    return areas.find((a) => a.area_id === id)?.name || "-";
  };

  const getApprovalName = (id) => {
    return users.find((u) => u.user_id === id)?.full_name || "-";
  };

  const getProvinceName = (id) => {
    return provinces.find((p) => p.province_id === id)?.name || "-";
  };

  const getChannelName = (id) => {
    return channels.find((c) => c.channel_id === id)?.name || "-";
  };

  const getStoreName = () => {
    // 1️⃣ kalau backend kirim relasi stores
    if (user?.stores?.store_name) {
      return user.stores.store_name;
    }

    // 2️⃣ fallback ke master stores
    const storeId = user?.store_id;
    return stores.find((s) => s.store_id === storeId)?.store_name || "-";
  };

  const d = user || {};
  const info = d.user_details || {};
  const role = d.user_roles || {};

  const formatDate = (iso) => {
    if (!iso) return "-";
    const date = new Date(iso);
    return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl sm:max-w-xl md:max-w-2xl lg:max-w-3xl rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute text-gray-400 right-6 top-6 hover:text-gray-600"
        >
          <X size={22} />
        </button>

        {/* HEADER */}
        <div className="flex flex-col items-center gap-4 mb-6 text-center sm:flex-row sm:text-left">
          <img
            src={
              d.image_url || "https://ui-avatars.com/api/?name=" + d.full_name
            }
            alt="profile"
            className="object-cover w-20 h-20 border rounded-full shadow"
          />

          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              {d.full_name}
            </h2>
            <p className="text-gray-500">{d.username}</p>
            <p className="mt-1 font-medium text-gray-600">{role.name || "-"}</p>
          </div>
        </div>

        {/* BODY SPLIT TO 2 COLUMNS */}
        <div className="grid flex-1 grid-cols-1 gap-4 pb-6 overflow-y-auto md:grid-cols-2 sm:gap-6">
          {/* LEFT COLUMN - PERSONAL INFO */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-700">
              Personal Information
            </h3>
            <div className="p-4 space-y-2 border bg-gray-50 rounded-xl">
              <Row label="Email" value={d.email} />
              <Row label="Phone" value={d.phone} />
              <Row label="Gender" value={info.gender} />
              <Row label="Birth Date" value={formatDate(info.birth_date)} />
              <Row label="Address" value={info.address} />
              <Row label="City" value={info.city} />
              <Row label="Province" value={info.province} />
              <Row label="Country" value={info.country} />
              <Row label="Postal Code" value={info.postal_code} />
            </div>
          </div>

          {/* RIGHT COLUMN - JOB INFO */}
          <div>
            <h3 className="mb-3 text-lg font-semibold text-gray-700">
              Job Information
            </h3>
            <div className="p-4 space-y-2 border bg-gray-50 rounded-xl">
              <Row label="User Code" value={d.user_code} />
              <Row label="Role" value={role.name} />
              <Row label="Position" value={getPositionName(data.position_id)} />
              <Row label="Area" value={getAreaName(data.area_id)} />
              <Row label="Province" value={getProvinceName(user.province_id)} />
              <Row label="Channel" value={getChannelName(user.channel_id)} />
              <Row label="Store" value={getStoreName()} />
              <Row
                label="Approval Line"
                value={getApprovalName(data.approval_line_id)}
              />
              <Row label="Created At" value={formatDate(d.created_at)} />
              <Row label="Updated At" value={formatDate(d.updated_at)} />
            </div>
          </div>
        </div>

        {/* FOOTER */}
        {/* <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="px-6 py-3 text-white bg-[#002D62] rounded-xl hover:opacity-90"
          >
            Close
          </button>
        </div> */}
      </div>
    </div>
  );
};

// REUSABLE ROW COMPONENT
const Row = ({ label, value }) => (
  <div className="flex justify-between py-1 border-b border-gray-200">
    <span className="font-medium text-gray-600">{label}</span>
    <span className="text-gray-800">{value || "-"}</span>
  </div>
);

export default DetailEmployeeModal;
