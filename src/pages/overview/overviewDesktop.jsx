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
import UserLogs from "../../components/overview/userLog/userLog";
import AnnouncementButton from "../../components/overview/header/announcement";

const OverviewDesktop = ({ can_update }) => {
  return (
    <div className="w-full px-2 mx-auto max-w-[1400px]">
      {/* HEADER DESKTOP */}
      <div className="mb-10">
        {/* WIDE DESKTOP (>=1536px) */}
        <div className="items-center justify-between hidden gap-6 2xl:flex">
          {/* LEFT */}
          <div className="flex-shrink-0">
            <Header />
          </div>

          {/* CENTER */}
          <div className="flex justify-center flex-1 max-w-[650px]">
            <CSAlert variant="desktop" />
          </div>

          {/* RIGHT */}
          <div className="flex items-center flex-shrink-0 gap-3">
            <AnnouncementButton />
            <Notification disabled />
            <MarketingCalendarButton disabled />
          </div>
        </div>

        {/* DEFAULT DESKTOP (<1536px → Tablet Style) */}
        <div className="flex flex-col gap-4 2xl:hidden">
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
            <CSAlert variant="desktop" />
          </div>
        </div>
      </div>

      <MarketingBanner />
      <CircularStat />
      {/* <ActiveSummary /> */}
      {can_update && <ProgramOverviewTable />}
      <NewsSection />
      <UserLogs />
    </div>
  );
};

export default OverviewDesktop;
