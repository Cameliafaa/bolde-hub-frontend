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

const OverviewTablet = ({ can_update }) => {
  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* HEADER TABLET */}
      <div className="flex flex-col gap-4 mb-8">
        {/* ROW 1 */}
        <div className="flex items-center justify-between">
          <Header />

          <div className="flex items-center gap-3">
            <AnnouncementButton />
            <Notification disabled />
            <MarketingCalendarButton disabled />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="flex justify-center">
          <CSAlert variant="tablet" />
        </div>
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

export default OverviewTablet;
