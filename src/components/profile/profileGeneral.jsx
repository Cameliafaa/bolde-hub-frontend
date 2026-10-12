import React, { useState, useEffect } from "react";
import { ApiRequest } from "../../services/apiRequest";
import { resolveValue } from "../../utils/profileResolver/profileResolver";


const ProfileGeneral = () => {
  const [profile, setProfile] = useState(null);
  const [channelsMaster, setChannelsMaster] = useState([]);
  const [storesMaster, setStoresMaster] = useState([]);

  useEffect(() => {
    ApiRequest({ url: "/channels/all", method: "GET" })
      .then((res) => setChannelsMaster(res?.data || []));

    ApiRequest({ url: "/stores", method: "GET" })
      .then((res) => setStoresMaster(res?.data || []));
  }, []);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const res = await ApiRequest({
        url: "profile/me",
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === "success") {
        setProfile(res.data);
      }
    } catch (err) {
      console.error("Gagal ambil profile:", err);
    }
  };

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="space-y-5 px-2">

      {/* PERSONAL INFORMATION */}
      <Section title="Personal Information">
        <Row label="Username" value={profile.username} />
        <Row label="Full Name" value={profile.full_name} />
        <Row label="Email" value={profile.email} />
        <Row label="Phone" value={profile.phone} />
        <Row label="Birth Date" value={formatDate(profile.user_details?.birth_date)} />
        <Row label="Gender" value={profile.user_details?.gender} />
        <Row label="Address" value={profile.user_details?.address} />
        <Row label="City" value={profile.user_details?.city} />
        <Row label="Province" value={profile.user_details?.province} />
        <Row label="Country" value={profile.user_details?.country} />
        <Row label="Postal Code" value={profile.user_details?.postal_code} />
      </Section>

      {/* JOB INFORMATION */}
      <Section title="Job Information">
        <Row label="User Code" value={profile.user_code} />
        <Row label="Role" value={profile.user_roles?.name} />
        <Row label="Area" value={profile.areas?.name} />
        <Row
          label="Province"
          value={resolveValue({
            obj: profile.provinces?.name
              ? profile.provinces
              : { name: profile.user_details?.province },
          })}
        />
        <Row label="Position" value={profile.positions?.name} />
        <Row
          label="Channel"
          value={resolveValue({
            obj: profile.channels,
            id: profile.channel_id,
            master: channelsMaster,
          })}
        />

        <Row
          label="Store"
          value={resolveValue({
            obj: profile.stores,
            id: profile.store_id,
            master: storesMaster,
            objKey: "store_name",
          })}
        />
        {/* <Row label="Approval Line ID" value={profile.approval_line_id} /> */}
        <Row
          label="Status"
          value={profile.is_active ? "Active" : "Inactive"}
        />
      </Section>

      {/* SYSTEM INFORMATION */}
      {/* <Section title="System Information">
        <Row label="Created At" value={formatDate(profile.created_at)} />
        <Row label="Updated At" value={formatDate(profile.updated_at)} />
      </Section> */}

    </div>
  );
};

const Section = ({ title, children }) => (
  <div className="bg-white rounded-xl p-4 shadow-lg">
    <h3 className="font-semibold text-gray-800 mb-4">{title}</h3>
    <div className="space-y-3">{children}</div>
  </div>
);

const Row = ({ label, value, isLink }) => (
  <div className="flex justify-between border-b border-gray-100 pb-2">
    <span className="text-gray-500">{label}</span>

    {isLink ? (
      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 underline"
      >
        {value || "-"}
      </a>
    ) : (
      <span className="font-medium text-right">{value || "-"}</span>
    )}
  </div>
);

const formatDate = (date) => {
  if (!date || date === "0001-01-01T00:00:00Z") return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });


};



export default ProfileGeneral;
