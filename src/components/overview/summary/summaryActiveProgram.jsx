import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../../services/apiRequest";
import { fetchAllProgramSellingAchieves } from "../../../services/programSelling/programSellingService";
import Pagination from "../../common/pagination";
import Tabs from "../../common/tabs";

const SummaryActiveProgram = () => {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [activeCategoryId, setActiveCategoryId] = useState(null);
  const [allAchieves, setAllAchieves] = useState([]);
  const [programCategoryId, setProgramCategoryId] = useState(1);

  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setItemsPerPage(2);
      } else if (width < 1024) {
        setItemsPerPage(3);
      } else {
        setItemsPerPage(5);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId, itemsPerPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ApiRequest({
          url: "/categories?page=1&limit=10",
          method: "GET",
        });

        const order = ["COOKWARE", "ELECTRO", "MOP", "OTHER"];
        const sorted = (res.data || []).sort(
          (a, b) =>
            order.indexOf(a.category_name) - order.indexOf(b.category_name),
        );

        setCategories(sorted);
        if (sorted.length) {
          setActiveCategoryId(sorted[0].category_id);
        }
      } catch (err) {
        console.error("Fetch categories failed:", err);
      }
    };

    fetchCategories();
  }, []);

  const formatCompactNumber = (value) => {
    if (value === null || value === undefined) return "0";

    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
    }

    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace(".0", "") + "M";
    }

    if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(".0", "") + "K";
    }

    return String(value);
  };

  useEffect(() => {
    const fetchPrograms = async () => {
      setLoading(true);

      try {
        let detailed = [];

        // REGULAR
        if (Number(programCategoryId) === 1) {
          const baseList = allAchieves;

          detailed = (
            await Promise.all(
              baseList.map(async (item) => {
                try {
                  const detailRes = await ApiRequest({
                    url: `/programs/detail/${item.program_id}`,
                    method: "GET",
                  });

                  const detail = detailRes.data?.program;
                  const programItems = detailRes.data?.program_items || [];

                  if (Number(detail.program_category_id) !== 1) return null;

                  const matchCategory = programItems.some(
                    (pi) => Number(pi.category_id) === Number(activeCategoryId),
                  );

                  if (!matchCategory) return null;
                  if (detail.status?.toLowerCase() === "pending") return null;

                  const dashboardRes = await ApiRequest({
                    url: `/program-selling-achieve-details/${detail.program_id}/dashboard`,
                    method: "GET",
                  });

                  const dashboard = dashboardRes.data;
                  const achievement = dashboard?.achievement_program || {};

                  return {
                    sellingAchieveId: item.program_selling_achieve_id,
                    programId: detail.program_id,
                    programCategoryId: detail.program_category_id,
                    name: detail.name,
                    type: "Regular",
                    status: detail.status?.toLowerCase(),
                    percent: Number(achievement?.achievement_percent) || 0,
                    actualLabel: "Actual Qty",
                    actualDisplay: Number(achievement?.total_actual) || 0,
                  };
                } catch (err) {
                  console.error("Fetch regular summary failed:", err);
                  return null;
                }
              }),
            )
          ).filter(Boolean);
        }

        // SPECIAL
        if (Number(programCategoryId) === 2) {
          const specialRes = await ApiRequest({
            url: `/program-selling-achieve-specials`,
            method: "GET",
          });

          const specialList = specialRes?.data || [];

          detailed = (
            await Promise.all(
              specialList
                .filter(
                  (item) =>
                    item.program?.status === "active" &&
                    !item.program?.is_deleted,
                )
                .map(async (item) => {
                  try {
                    const detailRes = await ApiRequest({
                      url: `/program-selling-achieve-special-details`,
                      method: "GET",
                      params: {
                        program_id: item.program.program_id,
                      },
                    });

                    const rows = detailRes?.data || [];

                    const totalTarget = rows.reduce(
                      (sum, row) => sum + (Number(row.target) || 0),
                      0,
                    );

                    const totalActual = rows.reduce(
                      (sum, row) => sum + (Number(row.archieve) || 0),
                      0,
                    );

                    const percent =
                      totalTarget > 0
                        ? Math.min(
                            100,
                            Math.round((totalActual / totalTarget) * 100),
                          )
                        : 0;

                    return {
                      sellingAchieveId: item.program_selling_achieve_special_id,
                      programId: item.program.program_id,
                      programCategoryId: item.program.program_category_id,
                      name: item.program.name,
                      type: "Special",
                      status: item.program.status,
                      percent,
                      actualLabel: "Actual (Rp)",
                      actualDisplay: formatCompactNumber(totalActual),
                    };
                  } catch (err) {
                    console.error("Fetch special summary failed:", err);
                    return null;
                  }
                }),
            )
          ).filter(Boolean);
        }

        setPrograms(detailed);
      } catch (err) {
        console.error("Fetch summary program failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrograms();
  }, [activeCategoryId, allAchieves, programCategoryId]);

  useEffect(() => {
    fetchAllProgramSellingAchieves().then((data) => {
      setAllAchieves(data);
    });
  }, []);

  const getStatusStyle = (status) => {
    if (status === "active") {
      return "bg-status-active text-brand-first";
    }
    if (status === "expired") {
      return "bg-status-expired text-white";
    }
    return "bg-surface-border text-text-secondary";
  };

  const getBarColor = (percent) => {
    if (percent < 50) return "bg-status-danger";
    if (percent < 80) return "bg-status-warning";
    return "bg-status-success";
  };

  const getTextColor = (percent) => {
    if (percent < 50) return "text-status-danger";
    if (percent < 80) return "text-status-warning";
    return "text-status-success";
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategoryId]);

  const totalPages = Math.ceil(programs.length / itemsPerPage);

  const paginatedPrograms = programs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  const programCategoryTabs = [
    { key: 1, label: "Regular" },
    { key: 2, label: "Special" },
  ];

  if (loading) return null;

  return (
    <div className="w-full p-6 mt-8 border shadow-md bg-surface-card rounded-3xl border-surface-border">
      <div className="flex items-center mb-8">
        <h2 className="text-2xl font-semibold text-brand-first">
          Summary Active Program
        </h2>

        <div className="flex-1" />

        <div className="mr-8">
          <Tabs
            tabs={programCategoryTabs}
            active={programCategoryId}
            onChange={(key) => {
              setProgramCategoryId(key);
              setCurrentPage(1);
            }}
          />
        </div>

        <div className="flex justify-end w-[480px]">
          <div
            className={`
              flex gap-2 transition-all duration-300
              ${
                Number(programCategoryId) === 1
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }
            `}
          >
            {categories.map((cat) => (
              <button
                key={cat.category_id}
                onClick={() => setActiveCategoryId(cat.category_id)}
                className={`
                  px-5 py-2 rounded-full text-sm font-semibold transition-all
                  ${
                    activeCategoryId === cat.category_id
                      ? "bg-surface-background border-2 border-brand-first text-brand-first"
                      : "bg-brand-soft text-brand-first border border-surface-border"
                  }
                `}
              >
                {cat.category_name}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {paginatedPrograms.map((item) => (
          <div
            key={item.sellingAchieveId}
            className="flex flex-col gap-4 p-4 bg-white border shadow-md rounded-2xl sm:p-5 lg:px-8 lg:py-6 sm:flex-col lg:flex-row lg:gap-6"
          >
            <div className="w-full lg:w-[28%]">
              <p className="mb-1 text-xs text-gray-400 sm:text-sm">
                Program Name
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm truncate sm:text-base lg:text-lg">
                  {item.name}
                </p>

                <span
                  className={`
                    px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-semibold
                    ${getStatusStyle(item.status)}
                  `}
                >
                  {item.status.toUpperCase()}
                </span>
              </div>
            </div>

            <div className="w-full lg:w-[20%]">
              <p className="mb-1 text-xs text-gray-400 sm:text-sm">Type</p>
              <p className="text-sm font-medium truncate sm:text-base">
                {item.type}
              </p>
            </div>

            <div className="flex items-center w-full gap-3">
              <div className="relative flex-1 h-2 rounded-full bg-surface-border">
                <div
                  className={`absolute left-0 top-0 h-full rounded-full ${getBarColor(
                    item.percent,
                  )}`}
                  style={{ width: `${Math.min(item.percent, 100)}%` }}
                />
              </div>
              <span
                className={`font-semibold text-xs sm:text-sm ${getTextColor(
                  item.percent,
                )}`}
              >
                {item.percent}%
              </span>
            </div>

            <div className="flex items-center justify-between w-full gap-4 lg:justify-end">
              <p className="text-xs text-gray-400">
                {item.actualLabel}: {item.actualDisplay}
              </p>

              <button
                onClick={() => {
                  if (Number(item.programCategoryId) === 1) {
                    navigate(`/summary/regular/${item.sellingAchieveId}`);
                  } else if (Number(item.programCategoryId) === 2) {
                    navigate(`/summary/special/${item.sellingAchieveId}`);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-brand-first hover:bg-brand-primary sm:px-6 rounded-xl sm:text-sm whitespace-nowrap"
              >
                View Detail
              </button>
            </div>
          </div>
        ))}

        {!paginatedPrograms.length && (
          <p className="text-center text-gray-400">No active program found</p>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
};

export default SummaryActiveProgram;
