import React from "react";

const ProfileTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-[#EAF2FF] flex items-center rounded-full p-1 w-fit shadow-inner mb-10">
      {/* General */}
      <button
        onClick={() => setActiveTab("general")}
        className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
          activeTab === "general"
            ? "bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white shadow-sm"
            : "text-[#0F4C81] hover:text-[#2D9CDB]"
        }`}
      >
        General
      </button>

      {/* Development */}
      <button
        onClick={() => setActiveTab("development")}
        className={`px-6 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${
          activeTab === "development"
            ? "bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white shadow-sm"
            : "text-[#0F4C81] hover:text-[#2D9CDB]"
        }`}
      >
        Development
      </button>
    </div>
  );
};

export default ProfileTabs;
