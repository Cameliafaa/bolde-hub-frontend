import React from "react";
import * as XLSX from "xlsx";
import { Download } from "lucide-react";

const formatStatus = (status) => {
  return status?.replaceAll("_", " ") || "-";
};

const formatDate = (value) => {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function ExportTaskExcelButton({
  tasks = [],
  fileName = "task_report.xlsx",
  title = "TASK REPORT",
}) {
  const handleExportExcel = () => {
    const rows = tasks.map((task) => ({
      Category: task.category_name || "-",
      "Nama Program": task.title || "-",
      "Target Objective": task.objective || "-",
      "Target Action": task.target_action || "-",
      Update: task.description || "-",
      Checklist: formatStatus(task.status),
      Keterangan: [
        task.priority ? `Priority: ${task.priority}` : "",
        task.due_date ? `Due: ${formatDate(task.due_date)}` : "",
        task.approval_status
          ? `Approval: ${formatStatus(task.approval_status)}`
          : "",
      ]
        .filter(Boolean)
        .join("\n"),
    }));

    const worksheet = XLSX.utils.aoa_to_sheet([[title]]);

    XLSX.utils.sheet_add_json(worksheet, rows, {
      origin: "A3",
      skipHeader: false,
    });

    worksheet["!merges"] = [
      {
        s: { r: 0, c: 0 },
        e: { r: 0, c: 6 },
      },
    ];

    worksheet["!cols"] = [
      { wch: 18 },
      { wch: 32 },
      { wch: 45 },
      { wch: 45 },
      { wch: 45 },
      { wch: 22 },
      { wch: 45 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Task Report");

    XLSX.writeFile(workbook, fileName);
  };

  return (
    <button
      type="button"
      onClick={handleExportExcel}
      className="inline-flex items-center gap-2 px-5 py-3 text-sm font-bold text-white rounded-2xl bg-[#16A34A]"
    >
      <Download size={17} />
      Export Excel
    </button>
  );
}
