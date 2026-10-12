import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import StatsCard from "./statCards";
import ProgramImage from "./programImage";
import Icon1 from "../../../assets/images/iconOverview.png";
import IconActive from "../../../assets/images/icons/icon-active.png";
import IconWarning from "../../../assets/images/icons/icon-exp-7d.png";
import IconAlert from "../../../assets/images/icons/icon-exp-1d.png";
import { useCircularSummary } from "../../../context/circularSummaryContext";
import { computeCircularSummary } from "../../../utils/circularSummary/circularSummary";
import { ApiRequest } from "../../../services/apiRequest";
import { fetchFilteredCircularProgramData } from "../../../services/circular/circularProgramService";

const CircularStat = () => {
  const navigate = useNavigate();
  const { summary, setSummary } = useCircularSummary();

  useEffect(() => {
    const init = async () => {
      // 1️⃣ ambil profile (SAMA kayak CircularLetter)
      const profileRes = await ApiRequest({
        url: "/profile/me",
        method: "GET",
      });

      if (profileRes.status !== "success") return;

      const userContext = {
        areaId: profileRes.data.area_id,
        channelId: profileRes.data.channel_id,
        storeId: profileRes.data.store_id,
      };

      // 2️⃣ fetch DATASET SAMA
      const programs = await fetchFilteredCircularProgramData({
        search: "",
        filterData: null,
        userContext,
      });

      // 3️⃣ HITUNG SUMMARY SAJA
      const summaryResult = computeCircularSummary(programs);
      setSummary(summaryResult);
    };

    init();
  }, [setSummary]);

  if (!summary) return null;

  return (
    <div className="w-full p-6 mt-6 border shadow-sm bg-surface-card border-surface-border rounded-3xl">
      <div className="flex items-center gap-2 mb-4">
        <img src={Icon1} alt="" className="w-8 h-8" />
        <h2 className="text-lg font-semibold md:text-2xl sm:text-2xl text-brand-first">
          Marketing Program
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 lg:grid-cols-3">
        <StatsCard
          title="Program Active"
          value={summary.total_active}
          bgColor="bg-status-active"
          iconBg="bg-status-success/10"
          icon={IconActive}
          onClickViewMore={() => navigate("/circular")}
        />

        <StatsCard
          title="Expired in 7 days"
          value={summary.expiring_7_days}
          bgColor="bg-status-warnexp"
          iconBg="bg-status-warning/10"
          icon={IconWarning}
          onClickViewMore={() => navigate("/circular?filter=7days")}
        />

        <StatsCard
          title="Expired in 1 day"
          value={summary.expiring_1_day}
          bgColor="bg-status-expired"
          iconBg="bg-status-danger/10"
          icon={IconAlert}
          onClickViewMore={() => navigate("/circular?filter=1day")}
        />
      </div>

      <div className="mt-5">
        <ProgramImage />
      </div>
    </div>
  );
};

export default CircularStat;
