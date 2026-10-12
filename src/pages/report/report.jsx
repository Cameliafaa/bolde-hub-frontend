import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import SummaryCards from "../../components/report/summaryReport";
import ActivityChart from "../../components/report/activityCharts";
import ReportTable from "../../components/report/tableReport";
import PerformanceSummaryChart from "../../components/report/performaChart";
import { fetchAllUsers } from "../../services/users/userService";

const monthOptions = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

const getCurrentMonthName = () => monthOptions[new Date().getMonth()];

const ReportAutomationDashboard = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [rangeType, setRangeType] = useState("daily");

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [appliedMonth, setAppliedMonth] = useState(getCurrentMonthName());
  const [appliedYear, setAppliedYear] = useState(new Date().getFullYear());

  const [profile, setProfile] = useState(null);
  const [users, setUsers] = useState([]);
  const [monthlyReports, setMonthlyReports] = useState([]);
  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [performanceSummary, setPerformanceSummary] = useState(null);

  const token = localStorage.getItem("token");
  const baseUrl = process.env.REACT_APP_API_BASE_URL;

  const authHeaders = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };

  useEffect(() => {
    fetchAllData();
  }, [appliedMonth, appliedYear]);

  useEffect(() => {
    fetchChartData();
  }, [rangeType]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError("");

      const [profileRes, reportsRes, summaryRes, performanceRes, usersData] =
        await Promise.all([
          fetch(`${baseUrl}/profile/me`, {
            headers: authHeaders,
          }),
          fetch(
            `${baseUrl}/monthly-reports?month=${appliedMonth}&year=${appliedYear}&limit=100`,
            {
              headers: authHeaders,
            },
          ),
          fetch(`${baseUrl}/report-automation/summary`, {
            headers: authHeaders,
          }),
          fetch(`${baseUrl}/report-automation/performance-summary`, {
            headers: authHeaders,
          }),
          fetchAllUsers(),
        ]);

      if (!profileRes.ok) throw new Error("Gagal mengambil profile");
      if (!reportsRes.ok) throw new Error("Gagal mengambil monthly reports");
      if (!summaryRes.ok) throw new Error("Gagal mengambil dashboard summary");
      if (!performanceRes.ok)
        throw new Error("Gagal mengambil performance summary");

      const profileResult = await profileRes.json();
      const reportsResult = await reportsRes.json();
      const summaryResult = await summaryRes.json();
      const performanceResult = await performanceRes.json();

      setProfile(profileResult?.data || null);
      setMonthlyReports(reportsResult?.data || []);
      setDashboardSummary(summaryResult?.data || null);
      setPerformanceSummary(performanceResult?.data || null);
      setUsers(usersData || []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      const res = await fetch(
        `${baseUrl}/report-automation/activity-chart?range=${rangeType}`,
        {
          headers: authHeaders,
        },
      );

      if (!res.ok) throw new Error("Gagal mengambil activity chart");

      const result = await res.json();
      setChartData(result?.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateReport = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");

      const pickedMonth = monthOptions[selectedDate.getMonth()];
      const pickedYear = selectedDate.getFullYear();

      const res = await fetch(`${baseUrl}/monthly-reports/generate`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          month: pickedMonth,
          year: Number(pickedYear),
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Gagal mengambil report");
      }

      setAppliedMonth(pickedMonth);
      setAppliedYear(pickedYear);

      setSuccessMsg(`Report ${pickedMonth} ${pickedYear} berhasil diperbarui`);
      await fetchChartData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal mengambil report");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSubmitReport = async () => {
    try {
      setActionLoading(true);
      setError("");
      setSuccessMsg("");

      const res = await fetch(`${baseUrl}/monthly-reports/submit`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify({
          month: appliedMonth,
          year: Number(appliedYear),
          note: `Monthly report ${appliedMonth} ${appliedYear}`,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result?.message || "Gagal submit monthly report");
      }

      setSuccessMsg("Monthly report berhasil dikirim ke SPV");
      await fetchAllData();
    } catch (err) {
      console.error(err);
      setError(err.message || "Gagal submit monthly report");
    } finally {
      setActionLoading(false);
    }
  };

  const summary = {
    totalTask: dashboardSummary?.total_report || 0,
    manualReport: dashboardSummary?.total_manual_report || 0,
    autoReport: dashboardSummary?.total_auto_report || 0,
  };

  const reportTableRows = useMemo(() => {
    return monthlyReports.map((item) => ({
      id: item.monthly_report_id,
      title: item.task,
      description: item.objective,
      category_name: item.category,
      priority: item.status,
      due_date: item.deadline,
      report_source: item.source,
      pic: item.pic,
      task_date: item.task_date,
      status: item.status,
    }));
  }, [monthlyReports]);

  const hasPendingOrApproved = monthlyReports.some((item) =>
    ["submitted", "approved"].includes(String(item.status || "").toLowerCase()),
  );

  const canSubmitToSPV =
    monthlyReports.length > 0 && !hasPendingOrApproved && !actionLoading;

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] sm:px-1 lg:px-1 xl:px-1 2xl:px-1">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex flex-col gap-4 mb-8 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
              Report Automation
            </h1>

            <p className="mt-1 text-sm text-text-light">
              Hello, {profile?.full_name || "User"} 👋
            </p>

            <p className="mt-1 text-xs text-text-light">
              Data aktif: {appliedMonth} {appliedYear}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <DatePicker
              selected={selectedDate}
              onChange={(date) => setSelectedDate(date)}
              dateFormat="MMMM yyyy"
              showMonthYearPicker
              disabled={actionLoading}
              className="px-5 py-3 text-sm bg-white border outline-none rounded-xl border-surface-border text-brand-first"
            />

            <button
              onClick={handleGenerateReport}
              disabled={actionLoading}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm text-white transition bg-brand-secondary rounded-xl hover:bg-brand-first disabled:opacity-60"
            >
              {actionLoading ? "Processing..." : "Search"}
            </button>

            <button
              onClick={handleSubmitReport}
              disabled={!canSubmitToSPV}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm text-white transition bg-brand-first rounded-xl hover:bg-brand-secondary disabled:opacity-60"
            >
              Submit
            </button>

            <button
              onClick={() => navigate("/report-automation/approval")}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm text-white transition bg-brand-first rounded-xl hover:bg-brand-secondary"
            >
              Inbox
            </button>

            <button
              onClick={() => navigate("/report-automation/task-board")}
              className="inline-flex items-center gap-2 px-5 py-3 text-sm text-white transition bg-brand-first rounded-xl hover:bg-brand-secondary"
            >
              Task Board
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="p-4 mb-5 text-sm text-green-700 border border-green-200 rounded-2xl bg-green-50">
            {successMsg}
          </div>
        )}

        {error && (
          <div className="p-4 mb-5 text-sm text-red-700 border border-red-200 rounded-2xl bg-red-50">
            {error}
          </div>
        )}

        {loading ? (
          <div className="p-5 bg-white border shadow-sm rounded-2xl border-surface-border">
            <p className="text-sm text-text-light">Loading data...</p>
          </div>
        ) : (
          <>
            <SummaryCards summary={summary} />

            <div className="grid gap-5 lg:grid-cols-4">
              <div className="lg:col-span-2">
                <ActivityChart
                  chartData={chartData}
                  rangeType={rangeType}
                  setRangeType={setRangeType}
                />
              </div>

              <div className="lg:col-span-2">
                <PerformanceSummaryChart
                  onProgress={performanceSummary?.on_progress || 0}
                  onHold={performanceSummary?.on_hold || 0}
                  done={performanceSummary?.done || 0}
                />
              </div>

              <div className="lg:col-span-4">
                <ReportTable tasks={monthlyReports} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReportAutomationDashboard;
