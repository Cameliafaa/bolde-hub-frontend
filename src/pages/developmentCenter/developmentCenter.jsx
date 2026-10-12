import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import { Plus, Search } from "lucide-react";
import AddDevelopment from "../../components/developments/add/addDevelopment";
import usePermission from "../../utils/usePermission";
import Pagination from "../../components/common/pagination";

const DevelopmentCenter = () => {
  const navigate = useNavigate();
  const { can_create } = usePermission();

  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");

  const [tabs, setTabs] = useState([]);
  const [activeTab, setActiveTab] = useState(null);
  const [activeCategoryId, setActiveCategoryId] = useState(null);

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 development_id -> { progress, passed }
  const [progressMap, setProgressMap] = useState({});

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(8);
  const [totalPage, setTotalPage] = useState(1);

  const CATEGORY_ORDER = [
    "Introduction",
    "Product Knowlegde",
    "NPD",
    "Grooming",
    "",
  ];

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setLimit(2); // mobile
      } else if (width < 1024) {
        setLimit(6); // tablet
      } else {
        setLimit(8); // desktop
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()),
  );

  const start = (page - 1) * limit;
  const paginatedCourses = filteredCourses.slice(start, start + limit);

  useEffect(() => {
    setTotalPage(Math.ceil(filteredCourses.length / limit));
  }, [filteredCourses, limit]);

  useEffect(() => {
    setPage(1);
  }, [search, activeCategoryId]);

  /* ================= FETCH CATEGORY ================= */
  const fetchCategories = async () => {
    try {
      const res = await ApiRequest({
        url: "/development-categories/all",
        method: "GET",
      });

      const list = res?.data || [];
      const tabs = list
        .sort((a, b) => {
          const ia = CATEGORY_ORDER.indexOf(a.name);
          const ib = CATEGORY_ORDER.indexOf(b.name);

          // kalau dua-duanya tidak ada di list → jangan diubah
          if (ia === -1 && ib === -1) return 0;

          // yang tidak ada di CATEGORY_ORDER taruh PALING BELAKANG
          if (ia === -1) return 1;
          if (ib === -1) return -1;

          return ia - ib;
        })
        .map((c) => ({
          id: c.development_category_id,
          name: c.name,
        }));

      setTabs(tabs);

      if (tabs.length) {
        setActiveTab(tabs[0].name);
        setActiveCategoryId(tabs[0].id);
      }
    } catch (err) {
      console.error("Fetch categories error:", err);
    }
  };

  const fetchProgress = async () => {
    try {
      const res = await ApiRequest({
        url: "/user-scores/question/me",
        method: "GET",
      });

      /**
       * Expected response:
       * {
       *   data: [
       *     { development_id, question_id, is_completed }
       *   ]
       * }
       */

      const temp = {};
      const map = {};

      // 1️⃣ hitung total & completed unit per development
      res.data.forEach((item) => {
        if (!temp[item.development_id]) {
          temp[item.development_id] = {
            total: 0,
            completed: 0,
          };
        }

        temp[item.development_id].total += 1;

        if (item.is_completed) {
          temp[item.development_id].completed += 1;
        }
      });

      // 2️⃣ convert ke persen (SAMA DENGAN DETAIL)
      Object.keys(temp).forEach((devId) => {
        const { total, completed } = temp[devId];
        const progress = total ? Math.round((completed / total) * 100) : 0;

        map[devId] = {
          progress,
          passed: progress === 100,
        };
      });

      setProgressMap(map);
    } catch (err) {
      console.error("Fetch progress error:", err);
    }
  };

  /* ================= FETCH COURSES ================= */
  const fetchCourses = async () => {
    if (!activeCategoryId) return;

    try {
      setLoading(true);

      const res = await ApiRequest({
        url: "/developments/all",
        method: "GET",
      });

      if (res.status !== "success") return;

      const filtered = res.data.filter(
        (d) => d.development_category_id === activeCategoryId,
      );

      const mapped = [];

      for (const d of filtered) {
        let progress = 0;
        let passed = false;

        try {
          // 1) ambil struktur development untuk total unit (SAMA kaya detail)
          const detailRes = await ApiRequest({
            url: `/developments/detail/${d.development_id}`,
            method: "GET",
          });

          // ⚠️ sesuaikan ini dengan struktur response detail kamu
          // biasanya: detailRes.data.lessons / detailRes.data.questions / detailRes.data.content_groups
          // target akhirnya: totalUnit = jumlah "video + assignment group"
          const detailQuestions = detailRes?.data?.questions || [];

          // ambil video_title unik
          const uniqueUnits = new Set(
            detailQuestions.map((q) => q.video_title),
          );

          const totalUnit = uniqueUnits.size;

          // 2) ambil unit yang sudah completed dari backend
          const scoreRes = await ApiRequest({
            url: `/user-scores/question/me?development_id=${d.development_id}`,
            method: "GET",
          });

          const completedUnit = (scoreRes?.questions || []).filter(
            (q) => q.is_completed,
          ).length;

          progress = totalUnit
            ? Math.round((completedUnit / totalUnit) * 100)
            : 0;

          passed = totalUnit > 0 && completedUnit === totalUnit;
        } catch (e) {
          console.warn("Progress fetch failed for dev:", d.development_id, e);
        }

        mapped.push({
          id: d.development_id,
          title: d.title,
          desc: d.description,
          img: d.image_url || "https://via.placeholder.com/400x300",
          passing_score: progress,
          passed,
        });
      }

      setCourses(mapped);
    } catch (err) {
      console.error("Fetch courses error:", err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= EFFECT ================= */
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [activeCategoryId]);

  /* ================= UI ================= */
  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] /* HP */ sm:px-1 tablet lg:px-1 laptop xl:px-1 desktop besar 2xl:px-1 layar">
      {/* HEADER */}
      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
          Development Center
        </h1>

        {can_create && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-brand-first sm:px-5 sm:py-3 rounded-xl sm:text-base w-fit hover:bg-brand-secondary"
            onClick={() => setShowAddModal(true)}
          >
            {" "}
            <Plus size={18} /> Add Development
          </button>
        )}
      </div>

      {showAddModal && (
        <AddDevelopment
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            fetchCategories();
            fetchProgress();
          }}
        />
      )}

      {/* SEARCH + TABS */}
      <div className="flex flex-col gap-4 mb-8 sm:gap-5">
        <div className="flex items-center w-full px-3 py-2 border shadow-sm bg-surface-card border-surface-border rounded-xl sm:w-1/2 lg:w-1/4">
          <Search size={16} className="mr-2 text-text-light" />
          <input
            placeholder="Search Development..."
            className="w-full text-sm bg-transparent outline-none text-text-primary"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex max-w-full gap-2 ml-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {tabs.map((t) => {
            const isActive = activeTab === t.name;

            return (
              <button
                key={t.id}
                onClick={() => {
                  setActiveTab(t.name);
                  setActiveCategoryId(t.id);
                }}
                className={`relative
  px-5 sm:px-6 lg:px-8
  py-2
  rounded-full
  text-[12px] sm:text-[13px]
  font-semibold
  transition-all duration-300
${
  isActive
    ? "bg-surface-background border-2 border-brand-first text-brand-first"
    : "bg-surface-background text-brand-first border border-surface-border"
}
`}
              >
                {t.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-text-light animate-pulse">
            Loading development...
          </p>
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex items-center justify-center h-[200px]">
          <p className="text-sm text-text-light">No Development Found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {paginatedCourses
            .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()))
            .map((c) => (
              <div
                key={c.id}
                onClick={() => navigate(`/development-detail/${c.id}`)}
                className="flex flex-col h-full transition border shadow-sm cursor-pointer bg-surface-card rounded-2xl border-surface-border hover:shadow-md"
              >
                {/* IMAGE */}
                <img
                  src={c.img}
                  className="object-cover w-full h-40 rounded-t-xl"
                />

                {/* CONTENT */}
                <div className="flex flex-col flex-1 p-4">
                  {/* ===== CONTENT ATAS ===== */}
                  <div className="flex-1">
                    <h3 className="font-semibold text-text-primary line-clamp-2">
                      {c.title}
                    </h3>

                    <p className="mt-1 text-xs text-text-secondary line-clamp-2">
                      {c.desc}
                    </p>
                  </div>

                  {/* ===== PASSING SCORE (SELALU DI BAWAH) ===== */}
                  <div className="mt-4">
                    <p className="text-xs font-semibold text-brand-first">
                      {Math.min(c.passing_score, 100)}% Passing Score
                    </p>

                    <div className="w-full h-1 mt-1 rounded bg-surface-border">
                      <div
                        className={`h-1 rounded ${
                          Math.min(c.passing_score, 100) === 100
                            ? "bg-status-success"
                            : "bg-brand-first"
                        }`}
                        style={{ width: `${Math.min(c.passing_score, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {!loading && filteredCourses.length > 0 && totalPage > 1 && (
        <div className="mt-10">
          <Pagination
            current={page}
            total={totalPage}
            onChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}
    </div>
  );
};

export default DevelopmentCenter;
