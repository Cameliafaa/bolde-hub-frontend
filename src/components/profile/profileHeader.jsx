import React, { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import ProfileDevelopment from "./profileDevelopment";

const ProfileHeader = ({ totalPoint }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
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

    fetchProfile();
  }, []);

  const getInitials = (name = "") => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };


  return (
    <div className="bg-white rounded-2xl p-6 flex items-center justify-between shadow-sm">
      {/* USER INFO */}
      <div className="flex items-center gap-5">
        {profile?.image_url ? (
          <img
            src={profile.image_url}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover"
          />
        ) : (
          <div className="w-24 h-24 rounded-full bg-[#2D9CDB] text-white flex items-center justify-center text-2xl font-semibold">
            {getInitials(profile?.full_name)}
          </div>
        )}
        <div>
          <h2 className="text-xl font-semibold text-gray-900">{profile?.full_name}</h2>
          <p className="text-gray-500 text-sm">
            {profile?.positions?.name}{" "}
          </p>

          {/* TOTAL POINT */}
          <p className="text-xl font-semibold bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] bg-clip-text text-transparent mt-1">
            {totalPoint.toLocaleString()} Point
          </p>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center gap-3 relative">
        {/* Edit Profile */}
        <button
          onClick={() => navigate("/change-password")}
          className="bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition">
          Change Password
        </button>

        {/* Edit Profile */}
        <button
          onClick={() => navigate("/edit-profile")}
          className="bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white text-sm font-semibold px-5 py-2 rounded-lg shadow-md hover:shadow-lg transition">
          Edit Profile
        </button>

        {/* Logout Button with Tooltip */}
        <div
          className="relative flex items-center"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        >
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition relative"
          >
            <LogOut size={20} className="text-gray-700" />
          </button>

          {/* Tooltip bubble */}
          {showTooltip && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-medium rounded-md px-2 py-1 shadow-lg whitespace-nowrap z-10">
              Logout
              <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-2 h-2 bg-black rotate-45"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;
