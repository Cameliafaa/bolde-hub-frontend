import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Cell,
} from "recharts";

const SpvReportCharts = ({ submissions = [] }) => {
  const normalizeReportStatus = (report) => {
    if (report.source === "user_log") return "done";

    const status = String(report.status || "").toLowerCase();

    if (status === "done") return "done";
    if (status === "in progress") return "progress";
    if (status === "on progress") return "progress";
    if (status === "on hold") return "hold";
    if (status === "task") return "hold";

    return "hold";
  };

  const allReports = submissions.flatMap((item) => item.reports || []);

  const totalTask = allReports.length;

  const doneTask = allReports.filter(
    (report) => normalizeReportStatus(report) === "done",
  ).length;

  const progressTask = allReports.filter(
    (report) => normalizeReportStatus(report) === "progress",
  ).length;

  const holdTask = allReports.filter(
    (report) => normalizeReportStatus(report) === "hold",
  ).length;

  const summaryData = [
    {
      name: "DONE",
      value: totalTask ? Math.round((doneTask / totalTask) * 100) : 0,
      label: doneTask,
    },
    {
      name: "ON PROGRESS",
      value: totalTask ? Math.round((progressTask / totalTask) * 100) : 0,
      label: progressTask,
    },
    {
      name: "ON HOLD",
      value: totalTask ? Math.round((holdTask / totalTask) * 100) : 0,
      label: holdTask,
    },
  ];

  const summaryColors = ["#22C55E", "#3B82F6", "#F59E0B"];

  const employeeMap = {};

  submissions.forEach((item) => {
    const name = item.user?.full_name || "-";
    const reports = item.reports || [];

    if (!employeeMap[name]) {
      employeeMap[name] = {
        name,
        total_task: 0,
        on_hold: 0,
      };
    }

    employeeMap[name].total_task += reports.length;
    employeeMap[name].on_hold += reports.filter(
      (report) => normalizeReportStatus(report) === "hold",
    ).length;
  });

  const employeeData = Object.values(employeeMap);

  const monthOrder = [
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

  const monthMap = {};

  monthOrder.forEach((month) => {
    monthMap[month] = {
      month,
      total_task: 0,
    };
  });

  submissions.forEach((item) => {
    const month = item.month || "-";
    const reports = item.reports || [];

    if (monthMap[month]) {
      monthMap[month].total_task += reports.length;
    }
  });

  const monthlyData = monthOrder.map((month) => monthMap[month]);
  const monthColors = ["#3B82F6", "#8B5CF6", "#06B6D4", "#10B981"];

  return (
    <div className="flex flex-col gap-5 mb-6">
      {/* TOP */}
      <div className="grid gap-5 lg:grid-cols-2">
        {/* STATUS */}
        <div className="p-5 bg-white border shadow-sm rounded-2xl">
          <h3 className="mb-4 text-lg font-bold text-brand-first">
            Status Task
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={summaryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tickFormatter={(value) => `${value}%`} />
              <Tooltip />

              <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                {summaryData.map((entry, index) => (
                  <Cell
                    key={`summary-${index}`}
                    fill={summaryColors[index % summaryColors.length]}
                  />
                ))}

                <LabelList
                  dataKey="label"
                  position="insideTop"
                  fill="#fff"
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* EMPLOYEE */}
        <div className="p-5 bg-white border shadow-sm rounded-2xl">
          <h3 className="mb-4 text-lg font-bold text-brand-first">
            Total Task and On Hold
          </h3>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={employeeData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={110} />
              <Tooltip />
              <Legend />

              <Bar
                dataKey="total_task"
                name="Total Task"
                fill="#2563EB"
                radius={[0, 8, 8, 0]}
              >
                <LabelList
                  dataKey="total_task"
                  position="insideRight"
                  fill="#fff"
                  fontWeight={700}
                />
              </Bar>

              <Bar
                dataKey="on_hold"
                name="On Hold"
                fill="#F59E0B"
                radius={[0, 8, 8, 0]}
              >
                <LabelList
                  dataKey="on_hold"
                  position="right"
                  fill="#F59E0B"
                  fontWeight={700}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BOTTOM */}
      <div className="p-5 bg-white border shadow-sm rounded-2xl">
        <h3 className="mb-4 text-lg font-bold text-brand-first">
          Total Task / Month
        </h3>

        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="month" tick={{ fontSize: 11 }} />

            <YAxis />

            <Tooltip />

            <Bar dataKey="total_task" name="Total Task" radius={[8, 8, 0, 0]}>
              {monthlyData.map((entry, index) => (
                <Cell
                  key={`month-${index}`}
                  fill={monthColors[index % monthColors.length]}
                />
              ))}

              <LabelList dataKey="total_task" position="top" fontWeight={700} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SpvReportCharts;
