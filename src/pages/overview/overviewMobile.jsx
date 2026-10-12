import React from "react";
import Header from "../../components/overview/header/header";
import Notification from "../../components/overview/header/notification";
import MarketingCalendarButton from "../../components/overview/header/calender";
import MarketingBanner from "../../components/overview/banner/banner";
import CircularStat from "../../components/overview/circularStat/circularStat";
import ActiveSummary from "../../components/overview/summary/summaryActiveProgram";
import ProgramOverviewTable from "../../components/overview/programOverview/programOverview";
import NewsSection from "../../components/overview/news/news";
import CSAlert from "../../components/overview/header/csAlert";
import UserLogTable from "../../components/overview/userLog/userLog";
import AnnouncementButton from "../../components/overview/header/announcement";

const OverviewMobile = ({ can_update }) => {
  return (
    <div className="w-full px-4">
      {/* HEADER MOBILE */}
      <div className="flex flex-col gap-4 mb-6">
        {/* ROW 1 - HEADER + NOTIFICATION */}
        <div className="flex items-center justify-between">
          <Header />

          <div className="flex items-center gap-3">
            <AnnouncementButton />
            <Notification disabled />
            <MarketingCalendarButton disabled />
          </div>
        </div>

        {/* ROW 3 - CS ALERT */}
        <CSAlert variant="mobile" />
      </div>

      <MarketingBanner />
      <CircularStat />
      {/* <ActiveSummary /> */}

      {can_update && <ProgramOverviewTable />}

      <NewsSection />
      <UserLogTable />
    </div>
  );
};

export default OverviewMobile;
