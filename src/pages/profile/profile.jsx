import React, { useState } from "react";
import ProfileHeader from "../../components/profile/profileHeader";
import ProfileTabs from "../../components/profile/profileTabs";
import ProfileGeneral from "../../components/profile/profileGeneral";
import ProfileDevelopment from "../../components/profile/profileDevelopment";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("general");
  const [totalPoint, setTotalPoint] = useState(0);

  return (
    <div className="bg-[#F6FAFF]">
      <div className="w-full max-w-6xl mx-auto">

        {/* HEADER */}
        <ProfileHeader totalPoint={totalPoint} />

        {/* CONTENT */}
        <div className="mt-3 bg-white rounded-2xl shadow-sm min-h-[70vh]">
          <div className="p-6">
            <ProfileTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            {/* ALWAYS MOUNT (hidden) */}
            <div className={activeTab === "development" ? "block" : "hidden"}>
              <ProfileDevelopment setTotalPoint={setTotalPoint} />
            </div>

            {/* GENERAL */}
            {activeTab === "general" && <ProfileGeneral />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
