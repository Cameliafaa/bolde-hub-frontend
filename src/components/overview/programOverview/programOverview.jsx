import React, { useEffect, useState } from "react";
import { ApiRequest } from "../../../services/apiRequest";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import DateRangeFilter from "../../common/dateRangeFilter";
import Pagination from "../../common/pagination";
import { determineProgramStatus } from "../../../utils/programStatus";
import { fetchAllPrograms } from "../../../services/program/programService";

const ProgramOverviewTable = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [filterStart, setFilterStart] = useState("");
  const [filterEnd, setFilterEnd] = useState("");
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [exportType, setExportType] = useState("all");
  const [exportMonth, setExportMonth] = useState("");
  const [categories, setCategories] = useState([]);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const totalPage = Math.ceil(rows.length / limit);

  const startIndex = (page - 1) * limit;
  const paginatedRows = rows.slice(startIndex, startIndex + limit);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setLimit(2); // mobile
      } else if (width < 1024) {
        setLimit(5); // tablet
      } else {
        setLimit(10); // desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate, limit]);

  const getCategories = async () => {
    const res = await ApiRequest({
      url: "/categories?page=1&limit=100",
      method: "GET",
    });

    setCategories(res?.data || []);
  };

  useEffect(() => {
    getCategories();
  }, []);

  const getCategoryName = (categoryId) => {
    const found = categories.find((c) => c.category_id === categoryId);
    return found?.category_name || "Uncategorized";
  };

  const isProgramInDateRange = (
    periodStart,
    periodEnd,
    filterStart,
    filterEnd,
  ) => {
    if (!periodStart || !periodEnd) return false;

    // kalau filter kosong, tampil semua
    if (!filterStart && !filterEnd) return true;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const rangeStart = filterStart
      ? new Date(`${filterStart}T00:00:00`)
      : new Date("1900-01-01T00:00:00");

    const rangeEnd = filterEnd
      ? new Date(`${filterEnd}T23:59:59.999`)
      : new Date("2999-12-31T23:59:59.999");

    return start <= rangeEnd && end >= rangeStart;
  };
  /* ================= FETCH ================= */

  const fetchPrograms = async () => {
    setLoading(true);

    try {
      const data = await fetchAllPrograms({
        filters: {},
      });

      if (!Array.isArray(data)) {
        setRows([]);
        return;
      }

      // hanya program approved
      const approvedPrograms = data.filter((p) => {
        const approvals = p.approvals || [];

        return (
          approvals.length > 0 &&
          approvals.every((a) => (a.status || "").toLowerCase() === "approved")
        );
      });

      // Active tab = Active + Expired Soon
      const visiblePrograms = approvedPrograms.filter((p) => {
        const status = (p.status || "").toLowerCase();

        return status === "active" || status === "expired";
      });

      const filteredPrograms = visiblePrograms.filter((p) =>
        isProgramInDateRange(p.period_start, p.period_end, startDate, endDate),
      );

      // ambil detail per program
      const formatted = await Promise.all(
        filteredPrograms.map(async (p) => {
          const detailRes = await ApiRequest({
            url: `/programs/detail/${p.program_id}`,
            method: "GET",
          });

          const detail = detailRes?.data;
          const items = detail?.program_items || [];

          return {
            id: p.program_id,
            name: p.name,
            program_code: p.program_code,
            period_start: p.period_start,
            period_end: p.period_end,
            skus: items.map((i) => i.sku_name),
            terms: items[0]?.description || p.description || "-",
          };
        }),
      );

      setRows(formatted);
    } catch (err) {
      console.error("FETCH OVERVIEW ERROR:", err);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPrograms();
  }, [startDate, endDate]);

  useEffect(() => {
    setPage(1);
  }, [startDate, endDate]);

  const getApprovedPrograms = async () => {
    const data = await fetchAllPrograms({
      filters: {},
    });

    if (!Array.isArray(data)) return [];

    return data.filter((p) => {
      const approvals = p.approvals || [];
      return (
        approvals.length > 0 &&
        approvals.every((a) => (a.status || "").toLowerCase() === "approved")
      );
    });
  };

  const formatProgramsWithDetail = async (programs) => {
    return await Promise.all(
      programs.map(async (p) => {
        const detailRes = await ApiRequest({
          url: `/programs/detail/${p.program_id}`,
          method: "GET",
        });

        const detail = detailRes?.data;
        const items = detail?.program_items || [];

        // 🔥 ambil category dari item (bisa lebih dari 1)
        const categoriesFromItems = [
          ...new Set(items.map((i) => i.category_id)),
        ];

        return {
          id: p.program_id,
          name: p.name,
          program_code: p.program_code,
          period_start: p.period_start,
          period_end: p.period_end,

          // 🔥 ambil category pertama (atau bisa multiple nanti)
          category: getCategoryName(categoriesFromItems[0]),

          items: items.map((i) => ({
            sku_name: i.sku_name || "-",
            terms: i.description || "-",
            category_id: i.category_id,
          })),
        };
      }),
    );
  };

  // const handleExportAllData = async () => {
  //   setExportLoading(true);
  //   try {
  //     const approvedPrograms = await getApprovedPrograms();

  //     const exportPrograms = approvedPrograms.filter((p) => {
  //       const statusFE = determineProgramStatus({
  //         ...p,
  //         statusRaw: p.status,
  //       });

  //       return (
  //         statusFE === "Active" ||
  //         statusFE === "Expired Soon" ||
  //         statusFE === "Expired"
  //       );
  //     });

  //     const formatted = await formatProgramsWithDetail(exportPrograms);

  //     exportToExcel(formatted, "Program_Overview_All_Data.xlsx");
  //     setShowExportModal(false);
  //   } catch (err) {
  //     console.error("EXPORT ALL ERROR:", err);
  //   } finally {
  //     setExportLoading(false);
  //   }
  // };

  // const handleExportActiveOnly = async () => {
  //   setExportLoading(true);
  //   try {
  //     const approvedPrograms = await getApprovedPrograms();

  //     const activePrograms = approvedPrograms.filter((p) => {
  //       const statusFE = determineProgramStatus({
  //         ...p,
  //         statusRaw: p.status,
  //       });

  //       return statusFE === "Active" || statusFE === "Expired Soon";
  //     });

  //     const formatted = await formatProgramsWithDetail(activePrograms);

  //     exportToExcel(formatted, "Program_Overview_Active_Only.xlsx");
  //     setShowExportModal(false);
  //   } catch (err) {
  //     console.error("EXPORT ACTIVE ERROR:", err);
  //   } finally {
  //     setExportLoading(false);
  //   }
  // };

  const formatDate = (dateString) => {
    if (!dateString) return "-";

    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const isProgramInMonth = (periodStart, periodEnd, selectedMonth) => {
    if (!periodStart || !periodEnd || !selectedMonth) return false;

    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    const monthStart = new Date(`${selectedMonth}-01T00:00:00`);
    const monthEnd = new Date(
      monthStart.getFullYear(),
      monthStart.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    return start <= monthEnd && end >= monthStart;
  };

  const handleExportData = async () => {
    setExportLoading(true);

    try {
      const approvedPrograms = await getApprovedPrograms();

      const exportProgramsBase = approvedPrograms.filter((p) => {
        const status = (p.status || "").toLowerCase();

        return status === "active" || status === "expired";
      });

      let exportPrograms = exportProgramsBase;

      if (exportType === "month") {
        exportPrograms = exportProgramsBase.filter((p) =>
          isProgramInMonth(p.period_start, p.period_end, exportMonth),
        );
      }

      const formatted = await formatProgramsWithDetail(exportPrograms);

      exportToPdf(formatted, exportType, exportMonth);

      setShowExportModal(false);
      setExportType("all");
      setExportMonth("");
    } catch (err) {
      console.error("EXPORT ERROR:", err);
    } finally {
      setExportLoading(false);
    }
  };

  const formatMonthLabel = (monthValue) => {
    if (!monthValue) return "";

    const [year, month] = monthValue.split("-");
    const date = new Date(Number(year), Number(month) - 1, 1);

    return date.toLocaleDateString("id-ID", {
      month: "long",
      year: "numeric",
    });
  };

  const groupByCategory = (data) => {
    const result = {};

    data.forEach((program) => {
      program.items.forEach((item) => {
        const categoryName = getCategoryName(item.category_id);

        if (!result[categoryName]) {
          result[categoryName] = [];
        }

        result[categoryName].push({
          program_name: program.name,
          sku_name: item.sku_name,
          terms: item.terms,
        });
      });
    });

    return result;
  };

  const exportToPdf = (data, exportType, exportMonth) => {
    const doc = new jsPDF("p", "mm", "a4");
    const grouped = groupByCategory(data);
    const totalPrograms = new Set(data.map((d) => d.id)).size;

    let currentY = 15;

    const pageWidth = doc.internal.pageSize.getWidth();

    // ✅ TITLE (lebih besar & center)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(0, 102, 204);

    doc.text("Program SKU BOLDe", pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.setTextColor(0, 102, 204);

    const periodText =
      exportType === "month" && exportMonth
        ? `Periode ${formatMonthLabel(exportMonth)}`
        : "All Periode";

    doc.text(periodText, pageWidth / 2, currentY, {
      align: "center",
    });

    currentY += 10;

    Object.entries(grouped).forEach(([category, rows], index) => {
      if (currentY > 250) {
        doc.addPage();
        currentY = 15;
      }

      doc.setFontSize(9);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(220, 53, 69);
      doc.text(category, 14, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Program Name", "SKU Name", "Terms & Conditions"]],
        body: rows.map((row) => [row.program_name, row.sku_name, row.terms]),
        theme: "grid",
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "top",
          lineColor: [235, 235, 235],
          lineWidth: 0.2,
          textColor: [40, 40, 40],
          fillColor: [245, 245, 245], // warna default body
        },
        headStyles: {
          fillColor: [88, 88, 88], // abu gelap header
          textColor: [255, 255, 255],
          fontStyle: "bold",
          lineColor: [235, 235, 235],
          lineWidth: 0.2,
        },
        bodyStyles: {
          fillColor: [245, 245, 245], // warna body semua kolom
          textColor: [40, 40, 40],
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245], // samakan biar tidak zebra
        },
        columnStyles: {
          0: { cellWidth: 45, fillColor: [245, 245, 245] },
          1: { cellWidth: 55, fillColor: [245, 245, 245] },
          2: { cellWidth: 76, fillColor: [245, 245, 245] },
        },
        margin: { left: 14, right: 14 },
      });
      currentY = doc.lastAutoTable.finalY + 8;
    });

    if (currentY > 260) {
      doc.addPage();
      currentY = 15;
    }

    currentY += 5;

    // doc.setFontSize(9);
    // doc.setFont("helvetica", "bold");

    // doc.text(`Total All Program : ${totalPrograms}`, 14, currentY);

    const fileName =
      exportType === "month" && exportMonth
        ? `Program-SKU-BOLDe-${exportMonth}.pdf`
        : "Program-SKU-BOLDe-All-Data.pdf";

    doc.save(fileName);
  };

  /* ================= RENDER ================= */

  return (
    <div className="w-full p-6 mt-4 border shadow-md bg-surface-card border-surface-border rounded-3xl">
      <div className="flex flex-col gap-4 mb-6 lg:flex-row lg:justify-between lg:items-center lg:mb-8">
        <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl text-brand-first whitespace-nowrap">
          Program Overview
        </h2>

        {/* FILTER + EXPORT */}
        <div className="flex flex-col w-full gap-3 lg:flex-row lg:items-center lg:justify-end">
          <div className="w-full sm:w-auto">
            <DateRangeFilter
              onApply={({ startDate, endDate }) => {
                setStartDate(startDate);
                setEndDate(endDate);
              }}
              onReset={() => {
                setStartDate("");
                setEndDate("");
              }}
            />
          </div>
          <button
            onClick={() => setShowExportModal(true)}
            className="w-full px-5 py-2 text-sm font-semibold text-white sm:w-auto bg-brand-first rounded-xl hover:bg-brand-primary"
          >
            Export Data
          </button>
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40">
              <div className="relative w-full max-w-md p-6 bg-white shadow-xl rounded-2xl">
                {/* CLOSE BUTTON (X) */}
                <button
                  onClick={() => {
                    if (exportLoading) return;
                    setShowExportModal(false);
                    setExportType("all");
                    setExportMonth("");
                  }}
                  className="absolute text-xl text-gray-400 top-4 right-4 hover:text-gray-600"
                >
                  ✕
                </button>
                {/* TITLE */}
                <h3 className="text-xl font-semibold text-brand-first">
                  Export Program Overview
                </h3>
                <p className="mt-2 text-sm text-gray-600">
                  Pilih jenis data yang ingin diexport.
                </p>
                {/* BUTTONS (KANAN KIRI) */}
                <div className="mt-5 space-y-3">
                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="exportType"
                      value="all"
                      checked={exportType === "all"}
                      onChange={() => setExportType("all")}
                    />
                    <span>All Data</span>
                  </label>

                  <label className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="exportType"
                      value="month"
                      checked={exportType === "month"}
                      onChange={() => setExportType("month")}
                    />
                    <span>Per Bulan</span>
                  </label>

                  {exportType === "month" && (
                    <input
                      type="month"
                      value={exportMonth}
                      onChange={(e) => setExportMonth(e.target.value)}
                      className="w-full px-4 py-3 mt-2 border rounded-xl"
                    />
                  )}

                  <button
                    onClick={handleExportData}
                    disabled={
                      exportLoading || (exportType === "month" && !exportMonth)
                    }
                    className="w-full px-4 py-3 mt-4 text-sm font-semibold text-white rounded-xl bg-brand-first hover:bg-brand-primary disabled:opacity-50"
                  >
                    {exportLoading ? "Processing..." : "Export"}
                  </button>
                </div>{" "}
              </div>
            </div>
          )}{" "}
        </div>
      </div>

      <div className="w-full overflow-x-auto">
        <table className="w-full text-sm min-w-[900px]">
          <thead className="bg-surface-background text-brand-first">
            <tr className="transition-colors border-t hover:bg-surface-background">
              <th className="px-4 py-3 font-semibold text-left">
                Program Name
              </th>
              <th className="px-4 py-3 font-semibold text-left">Program No</th>
              <th className="px-4 py-3 font-semibold text-left">Period</th>
              {/* <th className="px-4 py-3 font-semibold text-left">
                SKU Name
              </th> */}
              <th className="px-4 py-3 font-semibold text-left">
                Terms & Conditions
              </th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-gray-400">
                  Loading programs...
                </td>
              </tr>
            ) : paginatedRows.length > 0 ? (
              paginatedRows.map((row) => (
                <tr
                  key={row.id}
                  className="border-t hover:bg-surface-background"
                >
                  {/* NAME */}
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {row.name}
                  </td>

                  {/* CODE */}
                  <td className="px-4 py-3 text-gray-600">
                    {row.program_code}
                  </td>

                  {/* Period */}
                  <td className="px-4 py-3 text-gray-600">
                    {formatDate(row.period_start)} –{" "}
                    {formatDate(row.period_end)}
                  </td>
                  {/* SKU */}
                  {/* <td className="px-4 py-3">
                    {row.skus.length > 0 ? (
                      <ul className="pl-4 space-y-1 list-disc">
                        {row.skus.map((sku, i) => (
                          <li key={i}>{sku}</li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td> */}

                  {/* TERMS */}
                  <td className="px-4 py-3 text-gray-600 max-w-[360px]">
                    {row.terms}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="py-6 text-center text-text-light">
                  No program found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {!loading && totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(newPage) => {
            setPage(newPage);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </div>
  );
};

export default ProgramOverviewTable;
