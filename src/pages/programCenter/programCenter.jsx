import React, { useState, useEffect, useCallback, useRef } from "react";

import { Plus, Filter, Search } from "lucide-react";

import { ApiRequest } from "../../services/apiRequest";

import ProgramCard from "../../components/programCenter/programCard";
import ProgramFilter from "../../components/programCenter/filter";
import AddProgramModal from "../../components/programCenter/addProgram/addProgram";

import { filterProgramsByUser } from "../../utils/approvalUtils";
import { determineProgramStatus } from "../../utils/programStatus";

import Pagination from "../../components/common/pagination";

import { useLocation } from "react-router-dom";

import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";

import { fetchAllPrograms } from "../../services/program/programService";

const ProgramCenter = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);

  const [programs, setPrograms] = useState([]);

  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");

  const [filterData, setFilterData] = useState(null);

  const [userProfile, setUserProfile] = useState(null);

  const [activeTab, setActiveTab] = useState("Active");

  const [selectedProgram, setSelectedProgram] = useState(null);

  const [showDelete, setShowDelete] = useState(false);

  const [areaMap, setAreaMap] = useState({});

  // menandakan profile + area sudah selesai
  const [initialDataReady, setInitialDataReady] = useState(false);

  const location = useLocation();

  // ==========================================================
  // CACHE
  // ==========================================================

  /**
   * Sebelumnya cache dibuat di dalam fetchProfileAndPrograms:
   *
   * const userCache = {};
   * const detailCache = {};
   *
   * Akibatnya setiap fetch cache hilang lagi.
   *
   * Sekarang pakai useRef supaya cache tetap ada
   * selama ProgramCenter masih mounted.
   */
  const detailCacheRef = useRef({});
  const userCacheRef = useRef({});

  /**
   * Digunakan untuk mencegah response request lama
   * menimpa request yang lebih baru.
   */
  const requestIdRef = useRef(0);

  // ==========================================================
  // QUERY PARAM
  // ==========================================================

  useEffect(() => {
    const params = new URLSearchParams(location.search);

    const filter = params.get("filter");
    const tab = params.get("tab");

    if (tab) {
      setActiveTab(tab);
    }

    if (filter === "7days") {
      setActiveTab("Expired Soon");

      setFilterData({
        expSoonType: "H7-H2",
      });

      setPage(1);
    }

    if (filter === "1day") {
      setActiveTab("Expired Soon");

      setFilterData({
        expSoonType: "H1",
      });

      setPage(1);
    }
  }, [location.search]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const [page, setPage] = useState(1);

  const [totalPage, setTotalPage] = useState(1);

  const [limit, setLimit] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      if (width < 640) {
        setLimit(3);
      } else if (width < 1024) {
        setLimit(5);
      } else {
        setLimit(10);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ==========================================================
  // INITIAL DATA
  // PROFILE + AREA CUMA SEKALI
  // ==========================================================

  useEffect(() => {
    let mounted = true;

    const fetchInitialData = async () => {
      try {
        /**
         * Profile dan area tidak perlu ditunggu satu-satu.
         * Jalankan bersamaan.
         */
        const [profileRes, areaRes] = await Promise.all([
          ApiRequest({
            url: "/profile/me",
            method: "GET",
          }),

          ApiRequest({
            url: "/areas/all",
            method: "GET",
          }),
        ]);

        if (!mounted) return;

        if (profileRes?.status === "success") {
          setUserProfile(profileRes.data);
        } else {
          setUserProfile(null);
        }

        if (areaRes?.status === "success") {
          const map = {};

          (areaRes.data || []).forEach((area) => {
            map[area.area_id] = area.name;
          });

          setAreaMap(map);
        }
      } catch (err) {
        console.error("Failed fetch initial Program Center data:", err);
      } finally {
        if (mounted) {
          setInitialDataReady(true);
        }
      }
    };

    fetchInitialData();

    return () => {
      mounted = false;
    };
  }, []);

  // ==========================================================
  // FETCH PROGRAMS
  // ==========================================================

  const fetchPrograms = useCallback(
    async ({ forceRefresh = false } = {}) => {
      if (!initialDataReady) {
        return;
      }

      const currentRequestId = ++requestIdRef.current;

      setLoading(true);

      try {
        /**
         * Kalau force refresh:
         *
         * digunakan ketika kembali dari tab detail supaya approval
         * yang baru berubah benar-benar diambil lagi.
         */
        if (forceRefresh) {
          detailCacheRef.current = {};
        }

        const rawPrograms = await fetchAllPrograms({
          search,
          filters: filterData || {},
        });

        const formatted = await Promise.all(
          rawPrograms.map(async (item) => {
            let uploaderId =
              item.uploader_id || item.user_id || item.created_by || null;

            let uploaderImage = item.uploader_image || null;

            let uploaderName = item.uploader_name || null;

            let areaName = "All Area";

            let programAreas = [];

            let programApprovals = [];

            try {
              // ==========================================
              // PROGRAM DETAIL
              // ==========================================

              if (!detailCacheRef.current[item.program_id]) {
                const detailRes = await ApiRequest({
                  url: `/programs/detail/${item.program_id}`,
                  method: "GET",
                });

                detailCacheRef.current[item.program_id] = detailRes?.data || {};
              }

              const detailData = detailCacheRef.current[item.program_id] || {};

              const detailProgram = detailData?.program || {};

              programAreas = detailData?.program_areas || [];

              programApprovals = detailData?.program_approvals || [];

              // ==========================================
              // UPLOADER ID
              // ==========================================

              if (!uploaderId) {
                uploaderId = detailProgram.user_id ?? null;
              }

              // ==========================================
              // AREA
              // ==========================================

              const totalMasterArea = Object.keys(areaMap).length;

              if (programAreas.length === 0) {
                areaName = "All Area";
              } else if (
                totalMasterArea > 0 &&
                programAreas.length === totalMasterArea
              ) {
                areaName = "All Area";
              } else if (programAreas.length > 0) {
                const areaNames = programAreas
                  .map((programArea) => areaMap[programArea.area_id])
                  .filter(Boolean);

                areaName =
                  areaNames.length > 0 ? areaNames.join(", ") : "All Area";
              }

              // ==========================================
              // UPLOADER
              // ==========================================

              if (uploaderId && (!uploaderImage || !uploaderName)) {
                if (!userCacheRef.current[uploaderId]) {
                  const userRes = await ApiRequest({
                    url: `/users/detail/${uploaderId}`,
                    method: "GET",
                  });

                  userCacheRef.current[uploaderId] = userRes?.data || {};
                }

                const userData = userCacheRef.current[uploaderId] || {};

                uploaderImage = userData?.image_url ?? null;

                uploaderName =
                  userData?.name || userData?.full_name || "Unknown User";
              }
            } catch (err) {
              console.warn(`Failed enrich program ${item.program_id}`, err);
            }

            // ==========================================
            // STATUS
            // ==========================================

            const statusFE =
              item.status === "expired"
                ? "Expired"
                : determineProgramStatus({
                    ...item,
                    statusRaw: item.status,
                  });

            return {
              ...item,

              id: item.program_id,

              name: item.name,

              no: item.program_code,

              area: areaName,

              status: statusFE,

              statusRaw: item.status,

              approvals: programApprovals,

              uploader_id: uploaderId,

              uploader_image: uploaderImage,

              uploader_name: uploaderName,

              program_areas: programAreas,
            };
          }),
        );

        // Jika sudah ada request baru,
        // jangan gunakan response request lama.
        if (currentRequestId !== requestIdRef.current) {
          return;
        }

        let finalPrograms = formatted;

        // ==========================================
        // EXPIRED SOON FILTER
        // ==========================================

        if (filterData?.expSoonType) {
          finalPrograms = finalPrograms.filter((program) => {
            const endDate = new Date(program.period_end);

            const today = new Date();

            const diffDays = Math.ceil(
              (endDate - today) / (1000 * 60 * 60 * 24),
            );

            if (filterData.expSoonType === "H7-H2") {
              return diffDays <= 7 && diffDays >= 2;
            }

            if (filterData.expSoonType === "H1") {
              return diffDays === 1;
            }

            return true;
          });
        }

        // ==========================================
        // ACTIVE
        // ==========================================

        if (activeTab === "Active") {
          finalPrograms = finalPrograms.filter(
            (program) =>
              program.status === "Active" || program.status === "Expired Soon",
          );
        }

        // ==========================================
        // EXPIRED SOON
        // ==========================================

        if (activeTab === "Expired Soon") {
          finalPrograms = finalPrograms.filter(
            (program) => program.status === "Expired Soon",
          );
        }

        // ==========================================
        // EXPIRED
        // ==========================================

        if (activeTab === "Expired") {
          finalPrograms = finalPrograms.filter(
            (program) => program.statusRaw === "expired",
          );
        }

        // ==========================================
        // REJECTED
        // ==========================================

        if (activeTab === "Rejected") {
          finalPrograms = finalPrograms.filter(
            (program) => program.status === "Rejected",
          );
        }

        // ==========================================
        // WAITING APPROVE
        // ==========================================

        if (activeTab === "Waiting Approve") {
          finalPrograms = finalPrograms.filter(
            (program) => program.status === "Waiting Approve",
          );
        }

        // ==========================================
        // USER APPROVAL FILTER
        // ==========================================

        if (
          userProfile &&
          activeTab !== "Expired" &&
          activeTab !== "Active" &&
          activeTab !== "Expired Soon"
        ) {
          finalPrograms = filterProgramsByUser(
            finalPrograms,
            userProfile,
            activeTab,
            filterData?.expSoonType,
          );
        }

        setPrograms(finalPrograms);
      } catch (err) {
        console.error("Gagal ambil data programs:", err);

        if (currentRequestId === requestIdRef.current) {
          setPrograms([]);
        }
      } finally {
        if (currentRequestId === requestIdRef.current) {
          setLoading(false);
        }
      }
    },
    [search, filterData, activeTab, areaMap, userProfile, initialDataReady],
  );

  // ==========================================================
  // FETCH PROGRAM — HANYA SATU EFFECT
  // ==========================================================

  useEffect(() => {
    if (!initialDataReady) return;

    /**
     * Search pakai debounce 400ms.
     * Kalau hanya klik tab/filter, fetch langsung.
     */
    const delay = setTimeout(
      () => {
        fetchPrograms();
      },
      search ? 400 : 0,
    );

    return () => {
      clearTimeout(delay);
    };
  }, [fetchPrograms, initialDataReady, search]);

  // ==========================================================
  // REFRESH SETELAH BALIK DARI NEW TAB
  // ==========================================================

  useEffect(() => {
    if (!initialDataReady) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        /**
         * Detail cache dibuang supaya status approval
         * benar-benar diambil dari backend lagi.
         */
        fetchPrograms({
          forceRefresh: true,
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fetchPrograms, initialDataReady]);

  // ==========================================================
  // PAGINATION FRONTEND
  // ==========================================================

  const filteredPrograms = programs;

  const start = (page - 1) * limit;

  const paginatedPrograms = filteredPrograms.slice(start, start + limit);

  useEffect(() => {
    const calculatedTotal = Math.ceil(filteredPrograms.length / limit);

    setTotalPage(calculatedTotal > 0 ? calculatedTotal : 1);

    /**
     * Jika misalnya berada di page 4,
     * lalu hasil filter tinggal 1 page,
     * kembalikan ke page 1.
     */
    if (page > Math.max(calculatedTotal, 1)) {
      setPage(1);
    }
  }, [filteredPrograms.length, limit, page]);

  // ==========================================================
  // RESET PAGE
  // ==========================================================

  useEffect(() => {
    setPage(1);
  }, [search, filterData, activeTab]);

  // ==========================================================
  // AFTER ADD
  // ==========================================================

  const handleAfterAdd = () => {
    setShowAddModal(false);

    /**
     * Program baru harus diambil ulang.
     */
    detailCacheRef.current = {};

    fetchPrograms({
      forceRefresh: true,
    });
  };

  // ==========================================================
  // FORMAT DATE
  // ==========================================================

  const formatDate = (dateValue) => {
    if (!dateValue) return "";

    const date = new Date(dateValue);

    return date.toISOString().split("T")[0];
  };

  // ==========================================================
  // FILTER
  // ==========================================================

  const applyFilter = (filter) => {
    // Expired Soon only
    if (filter?.filterType === "expSoon") {
      setActiveTab("Expired Soon");

      setFilterData({
        expSoonType: filter.expSoonType,
      });

      setPage(1);

      return;
    }

    // Program Filter
    if (filter?.filterType === "program") {
      const params = {
        search: "",

        program_channel_id: filter.channel_id || "",

        program_category_id: filter.program_id || "",

        area_id: filter.area_id || "",

        start_date: formatDate(filter.startDate),

        end_date: formatDate(filter.endDate),

        sort: "program_id asc",
      };

      /**
       * Filter berubah, buang cache detail karena
       * dataset juga berubah.
       */
      detailCacheRef.current = {};

      setFilterData({
        ...params,

        expSoonType: filterData?.expSoonType,
      });

      setPage(1);

      return;
    }

    // Reset filter
    if (filter?.filterType === "programReset") {
      detailCacheRef.current = {};

      setFilterData({
        expSoonType: filterData?.expSoonType || "",
      });

      setPage(1);

      return;
    }
  };

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPage) {
      return;
    }

    setPage(newPage);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // ==========================================================
  // HEADER COLOR
  // ==========================================================

  const headerColorByTab = {
    Active: {
      bg: "#A3D977",
      text: "#1F4D2B",
    },

    "Waiting Approve": {
      bg: "#D6E4FF",
      text: "#1E40AF",
    },

    Rejected: {
      bg: "#FFD6A6",
      text: "#7A3E00",
    },

    Expired: {
      bg: "#E66C63",
      text: "#5A0D0D",
    },
  };

  let headerColors = headerColorByTab[activeTab] || headerColorByTab.Active;

  if (activeTab === "Expired Soon") {
    if (filterData?.expSoonType === "H1") {
      headerColors = {
        bg: "#E66C63",
        text: "#5A0D0D",
      };
    } else {
      headerColors = {
        bg: "#EDD967",
        text: "#5A4A00",
      };
    }
  }

  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDeleteProgram = (program) => {
    setSelectedProgram(program);
    setShowDelete(true);
  };

  const confirmDeleteProgram = async () => {
    if (!selectedProgram?.program_id) {
      return;
    }

    try {
      await ApiRequest({
        url: `/programs/delete/${selectedProgram.program_id}`,
        method: "DELETE",
      });

      /**
       * Hapus program yang sudah delete dari cache.
       */
      delete detailCacheRef.current[selectedProgram.program_id];

      setShowDelete(false);

      setSelectedProgram(null);

      await fetchPrograms({
        forceRefresh: true,
      });
    } catch (err) {
      console.error("Gagal delete program:", err);

      alert("Failed to delete program");
    }
  };

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="w-full px-4 mx-auto max-w-[1400px] sm:px-1 lg:px-1 xl:px-1 2xl:px-1">
      {/* HEADER */}

      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
          Program Center
        </h1>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm text-white transition bg-brand-first sm:px-5 sm:py-3 rounded-xl sm:text-base w-fit hover:bg-brand-secondary"
        >
          <Plus size={18} />
          Add Program
        </button>
      </div>

      {/* ADD PROGRAM */}

      {showAddModal && (
        <AddProgramModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleAfterAdd}
        />
      )}

      {/* SEARCH + TAB */}

      <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center">
        {/* SEARCH */}

        <div className="flex items-center w-full gap-3 lg:w-auto">
          <div className="flex items-center flex-1 px-4 py-3 border-2 shadow-sm bg-surface-card border-surface-border rounded-xl h-[42px] lg:w-1/3">
            <Search size={18} className="mr-2 text-text-light" />

            <input
              type="text"
              placeholder="Letter Search"
              className="w-full text-sm bg-transparent outline-none text-text-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilterModal(true)}
            className="flex items-center justify-center transition border shadow-sm h-[42px] w-[42px] rounded-2xl bg-surface-background text-brand-first border-surface-border hover:shadow-md"
          >
            <Filter size={17} />
          </button>
        </div>

        {/* TABS */}

        <div className="flex w-full gap-3 overflow-x-auto lg:flex-1 lg:justify-end">
          {[
            "Active",
            "Expired Soon",
            "Waiting Approve",
            "Rejected",
            "Expired",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap ${
                activeTab === tab
                  ? "bg-surface-background border-2 border-brand-first text-brand-first"
                  : "bg-surface-background text-brand-first border border-surface-border"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* SECTION HEADER */}

      <div
        className="py-2 mb-4 text-center transition-all shadow-sm rounded-xl"
        style={{
          backgroundColor: headerColors.bg,

          color: headerColors.text,
        }}
      >
        <p className="text-sm font-semibold">Program {activeTab}</p>
      </div>

      {/* PROGRAM LIST */}

      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-text-light animate-pulse">
              Loading Programs...
            </p>
          </div>
        ) : programs.length > 0 ? (
          <div className="space-y-3">
            {paginatedPrograms.map((item) => (
              <ProgramCard
                key={item.program_id}
                {...item}
                userProfile={userProfile}
                activeTab={activeTab}
                uploader_name={item.uploader_name}
                uploader_image={item.uploader_image}
                onDelete={handleDeleteProgram}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-text-light">No Program Found</p>
          </div>
        )}
      </div>

      {/* PAGINATION */}

      {!loading && programs.length > 0 && totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={handlePageChange}
        />
      )}

      {/* FILTER MODAL */}

      {showFilterModal && (
        <ProgramFilter
          onClose={() => setShowFilterModal(false)}
          onApply={applyFilter}
        />
      )}

      {/* DELETE MODAL */}

      <ConfirmDeleteModal
        open={showDelete}
        onCancel={() => {
          setShowDelete(false);

          setSelectedProgram(null);
        }}
        onConfirm={confirmDeleteProgram}
      />
    </div>
  );
};

export default ProgramCenter;
