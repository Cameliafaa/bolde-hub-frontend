import React, { useEffect, useMemo, useState } from "react";
import { Filter, Search, X } from "lucide-react";
import { useLocation } from "react-router-dom";

import { ApiRequest } from "../../services/apiRequest";
import { fetchAllPrograms } from "../../services/program/programService";

import LetterCard from "../../components/circularLetter/letterCard";
import Pagination from "../../components/common/pagination";
import CircularLetterFilter from "../../components/circularLetter/filterLetter";
import SearchDropdown from "../../components/common/searchDropdown";

import { computeCircularSummary } from "../../utils/circularSummary/circularSummary";
import { useCircularSummary } from "../../context/circularSummaryContext";

const CircularLetter = () => {
  const location = useLocation();
  const { setSummary } = useCircularSummary();

  // =========================================================
  // DATA
  // =========================================================
  const [programs, setPrograms] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productCategoryMap, setProductCategoryMap] = useState({});

  // =========================================================
  // SEARCH & DROPDOWN
  // =========================================================
  const [search, setSearch] = useState("");

  const [selectedProductCategory, setSelectedProductCategory] = useState(null);

  const [selectedCategory, setSelectedCategory] = useState(null);

  // =========================================================
  // FILTER
  // =========================================================
  const [filterData, setFilterData] = useState(null);
  const [activeTab, setActiveTab] = useState("Active");
  const [showFilterModal, setShowFilterModal] = useState(false);

  // =========================================================
  // LOADING
  // =========================================================
  const [loading, setLoading] = useState(true);

  // =========================================================
  // PAGINATION
  // =========================================================
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // =========================================================
  // USER CONTEXT
  // =========================================================
  const [userContext, setUserContext] = useState({
    areaId: null,
    channelId: null,
    storeId: null,
  });

  // =========================================================
  // ORDER
  // =========================================================
  const PRODUCT_CATEGORY_ORDER = ["MOP", "COOKWARE", "ELECTRO", "OTHER"];

  const PROGRAM_TYPE_ORDER = ["Potongan Harga", "Bundling", "Cashback"];

  // =========================================================
  // RESPONSIVE PAGINATION
  // =========================================================
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

  // =========================================================
  // URL FILTER
  // =========================================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const filter = params.get("filter");

    if (filter === "7days") {
      setActiveTab("Expired Soon");

      setFilterData({
        filterType: "expSoon",
        expSoonType: "H7-H2",
      });

      setPage(1);
      return;
    }

    if (filter === "1day") {
      setActiveTab("Expired Soon");

      setFilterData({
        filterType: "expSoon",
        expSoonType: "H1",
      });

      setPage(1);
      return;
    }

    setFilterData((prev) => {
      if (prev?.filterType === "expSoon") {
        return null;
      }

      return prev;
    });
  }, [location.search]);

  // =========================================================
  // FETCH PROFILE
  // =========================================================
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiRequest({
          url: "/profile/me",
          method: "GET",
        });

        if (res.status === "success") {
          setUserContext({
            areaId: res.data.area_id,
            channelId: res.data.channel_id,
            storeId: res.data.store_id,
          });
        }
      } catch (err) {
        console.error("Failed fetch profile:", err);
      }
    };

    fetchProfile();
  }, []);

  // =========================================================
  // FETCH TYPES
  // Category: Potongan Harga, Bundling, Cashback
  // =========================================================
  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const res = await ApiRequest({
          url: "/types/all",
          method: "GET",
        });

        if (res.status === "success") {
          setCategories(res.data || []);
        }
      } catch (err) {
        console.error("Error fetch types:", err);
      }
    };

    fetchTypes();
  }, []);

  // =========================================================
  // FETCH PRODUCT CATEGORY
  // =========================================================
  useEffect(() => {
    const fetchProductCategories = async () => {
      try {
        const res = await ApiRequest({
          url: "/categories",
          method: "GET",
        });

        if (res.status === "success") {
          const map = {};

          (res.data || []).forEach((category) => {
            map[category.category_id] = category.category_name;
          });

          setProductCategoryMap(map);
        }
      } catch (err) {
        console.error("Error fetch product categories:", err);
      }
    };

    fetchProductCategories();
  }, []);

  // =========================================================
  // PRODUCT CATEGORY OPTIONS
  // =========================================================
  const productCategoryOptions = useMemo(() => {
    return Object.entries(productCategoryMap)
      .map(([id, name]) => ({
        id,
        name,
      }))
      .filter((item) => item.name && item.name !== "-")
      .sort((a, b) => {
        const indexA = PRODUCT_CATEGORY_ORDER.indexOf(a.name);
        const indexB = PRODUCT_CATEGORY_ORDER.indexOf(b.name);

        if (indexA === -1 && indexB === -1) {
          return a.name.localeCompare(b.name);
        }

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });
  }, [productCategoryMap]);

  // =========================================================
  // CATEGORY OPTIONS
  // =========================================================
  const categoryOptions = useMemo(() => {
    return categories
      .map((item) => ({
        id: item.type_id,
        name: item.name,
      }))
      .filter((item) => item.name)
      .sort((a, b) => {
        const indexA = PROGRAM_TYPE_ORDER.indexOf(a.name);
        const indexB = PROGRAM_TYPE_ORDER.indexOf(b.name);

        if (indexA === -1 && indexB === -1) {
          return a.name.localeCompare(b.name);
        }

        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });
  }, [categories]);

  // =========================================================
  // FETCH PROGRAM
  // =========================================================
  const fetchProfileAndPrograms = async () => {
    if (categories.length === 0) return;

    if (Object.keys(productCategoryMap).length === 0) {
      return;
    }

    setLoading(true);

    try {
      const allPrograms = await fetchAllPrograms({
        search,
        filters: {
          program_channel_id: filterData?.program_channel_id,
          area_id: filterData?.area_id,
        },
      });

      // =====================================================
      // APPROVED ONLY
      // =====================================================
      const approvedPrograms = allPrograms.filter((item) => {
        const approvals = item.approvals || [];

        return (
          approvals.length > 0 &&
          approvals.every(
            (approval) => (approval.status || "").toLowerCase() === "approved",
          )
        );
      });

      // =====================================================
      // FORMAT PROGRAM
      // =====================================================
      const formatted = await Promise.all(
        approvedPrograms.map(async (item) => {
          try {
            const detailRes = await ApiRequest({
              url: `/programs/detail/${item.program_id}`,
              method: "GET",
            });

            const detail = detailRes.data;

            if (!detail) {
              return null;
            }

            // =================================================
            // AREA FILTER
            // =================================================
            const programAreaIds =
              detail.program_areas?.map((area) => area.area_id) || [];

            if (userContext.areaId !== 0 && userContext.areaId !== null) {
              if (
                programAreaIds.length > 0 &&
                !programAreaIds.includes(userContext.areaId)
              ) {
                return null;
              }
            }

            // =================================================
            // CHANNEL FILTER
            // =================================================
            const programChannelIds =
              detail.program_channels?.map((channel) => channel.channel_id) ||
              [];

            if (userContext.channelId !== 0 && userContext.channelId !== null) {
              if (
                programChannelIds.length > 0 &&
                !programChannelIds.includes(userContext.channelId)
              ) {
                return null;
              }
            }

            // =================================================
            // STORE FILTER
            // =================================================
            const programStoreIds =
              detail.program_stores?.map((store) => store.store_id) || [];

            if (userContext.storeId !== 0 && userContext.storeId !== null) {
              if (
                programStoreIds.length > 0 &&
                !programStoreIds.includes(userContext.storeId)
              ) {
                return null;
              }
            }

            // =================================================
            // FIRST ITEM
            // =================================================
            const firstItem = detail.program_items?.[0];

            const productCategoryId = firstItem?.category_id;

            const productCategoryName =
              productCategoryMap[productCategoryId] || "-";

            // =================================================
            // TYPE / CATEGORY
            // =================================================
            const typeId = detail.program_types?.[0]?.type_id;

            const typeName =
              categories.find(
                (category) => Number(category.type_id) === Number(typeId),
              )?.name || "-";

            // =================================================
            // DATE
            // =================================================
            const endDate = new Date(item.period_end);
            const today = new Date();

            endDate.setHours(0, 0, 0, 0);
            today.setHours(0, 0, 0, 0);

            const diffDays = Math.ceil((endDate - today) / 86400000);

            // =================================================
            // FILTER MODAL - LETTER TYPE
            // =================================================
            if (filterData?.letter_type_id) {
              if (Number(typeId) !== Number(filterData.letter_type_id)) {
                return null;
              }
            }

            // =================================================
            // FILTER MODAL - DATE
            // =================================================
            if (filterData?.startDate || filterData?.endDate) {
              const start = filterData.startDate
                ? new Date(filterData.startDate)
                : null;

              const end = filterData.endDate
                ? new Date(filterData.endDate)
                : null;

              const programEnd = new Date(item.period_end);

              if (start) {
                start.setHours(0, 0, 0, 0);
              }

              if (end) {
                end.setHours(23, 59, 59, 999);
              }

              if (start && programEnd < start) {
                return null;
              }

              if (end && programEnd > end) {
                return null;
              }
            }

            // =================================================
            // EXPIRED SOON FILTER
            // =================================================
            if (filterData?.filterType === "expSoon") {
              if (filterData.expSoonType === "H7-H2") {
                if (!(diffDays >= 2 && diffDays <= 7)) {
                  return null;
                }
              }

              if (filterData.expSoonType === "H1") {
                if (!(diffDays >= 0 && diffDays <= 1)) {
                  return null;
                }
              }
            }

            return {
              id: item.program_id,

              typeId,
              typeName,

              productCategoryId,
              productCategoryName,

              skuName: firstItem?.sku_name || "-",

              terms: firstItem?.description || "-",

              period_end: item.period_end,
            };
          } catch (err) {
            console.error(`Failed loading program ${item.program_id}:`, err);

            return null;
          }
        }),
      );

      // =====================================================
      // SORT
      // =====================================================
      const finalPrograms = formatted.filter(Boolean).sort((a, b) => {
        const pcA = PRODUCT_CATEGORY_ORDER.indexOf(a.productCategoryName);

        const pcB = PRODUCT_CATEGORY_ORDER.indexOf(b.productCategoryName);

        if (pcA !== pcB) {
          if (pcA === -1) return 1;
          if (pcB === -1) return -1;

          return pcA - pcB;
        }

        const ptA = PROGRAM_TYPE_ORDER.indexOf(a.typeName);
        const ptB = PROGRAM_TYPE_ORDER.indexOf(b.typeName);

        if (ptA === -1 && ptB === -1) {
          return 0;
        }

        if (ptA === -1) return 1;
        if (ptB === -1) return -1;

        return ptA - ptB;
      });

      setPrograms(finalPrograms);
    } catch (err) {
      console.error("Error fetching programs:", err);

      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FETCH PROGRAM EFFECT
  // =========================================================
  useEffect(() => {
    if (userContext.areaId === null) {
      return;
    }

    if (categories.length === 0) {
      return;
    }

    if (Object.keys(productCategoryMap).length === 0) {
      return;
    }

    const timeout = setTimeout(() => {
      fetchProfileAndPrograms();
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [search, filterData, categories, userContext, productCategoryMap]);

  // =========================================================
  // FRONTEND FILTER
  // =========================================================
  const filteredPrograms = useMemo(() => {
    return programs.filter((program) => {
      // =====================================================
      // PRODUCT CATEGORY DROPDOWN
      // =====================================================
      if (selectedProductCategory) {
        if (
          String(program.productCategoryId) !==
          String(selectedProductCategory.id)
        ) {
          return false;
        }
      }

      // =====================================================
      // CATEGORY DROPDOWN
      // =====================================================
      if (selectedCategory) {
        if (String(program.typeId) !== String(selectedCategory.id)) {
          return false;
        }
      }

      // =====================================================
      // TAB DATE FILTER
      // =====================================================
      const endDate = new Date(program.period_end);
      const today = new Date();

      today.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      const diffDays = Math.ceil((endDate - today) / 86400000);

      if (activeTab === "Active") {
        return diffDays >= 0;
      }

      if (activeTab === "Expired Soon") {
        if (filterData?.expSoonType === "H7-H2") {
          return diffDays >= 2 && diffDays <= 7;
        }

        if (filterData?.expSoonType === "H1") {
          return diffDays >= 0 && diffDays <= 1;
        }

        return diffDays >= 0 && diffDays <= 7;
      }

      if (activeTab === "Expired") {
        return diffDays < 0;
      }

      return true;
    });
  }, [
    programs,
    selectedProductCategory,
    selectedCategory,
    activeTab,
    filterData,
  ]);

  // =========================================================
  // PAGINATION
  // =========================================================
  const start = (page - 1) * limit;

  const paginatedPrograms = filteredPrograms.slice(start, start + limit);

  useEffect(() => {
    const pages = Math.ceil(filteredPrograms.length / limit);

    setTotalPage(pages > 0 ? pages : 1);
  }, [filteredPrograms.length, limit]);

  // =========================================================
  // RESET PAGE
  // =========================================================
  useEffect(() => {
    setPage(1);
  }, [
    search,
    selectedProductCategory,
    selectedCategory,
    filterData,
    activeTab,
  ]);

  // =========================================================
  // SUMMARY
  // =========================================================
  useEffect(() => {
    const summary = computeCircularSummary(programs);

    setSummary(summary);
  }, [programs, setSummary]);

  // =========================================================
  // HEADER COLORS
  // =========================================================
  const headerColorByTab = {
    Active: {
      bg: "#A3D977",
      text: "#1F4D2B",
    },

    "Expired Soon": {
      bg: "#EDD967",
      text: "#5A4A00",
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

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="w-full px-3 mx-auto max-w-[1400px] sm:px-1 lg:px-1 xl:px-1 2xl:px-1">
      {/* =====================================================
          TITLE
      ====================================================== */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-lg font-semibold sm:text-xl lg:text-2xl text-brand-first whitespace-nowrap">
          Circular Letter
        </h1>
      </div>

      {/* =====================================================
          SEARCH + DROPDOWN + FILTER + TAB
      ====================================================== */}
      <div className="flex flex-col w-full gap-3 mb-8 xl:flex-row xl:items-center xl:flex-nowrap">
        {/* =================================================
            LETTER SEARCH
        ================================================== */}
        <div className="flex items-center w-full min-w-0 px-4 border-2 shadow-sm h-[42px] bg-surface-card border-surface-border rounded-xl xl:flex-[1.2]">
          <Search size={18} className="mr-2 shrink-0 text-text-light" />

          <input
            type="text"
            placeholder="Letter Search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            className="flex-1 w-full min-w-0 text-sm bg-transparent outline-none text-text-primary"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
              }}
              className="ml-2 text-gray-400 shrink-0 hover:text-red-500"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* =================================================
            PRODUCT CATEGORY
        ================================================== */}
        <div className="w-full min-w-0 xl:flex-1">
          <SearchDropdown
            value={selectedProductCategory}
            onChange={setSelectedProductCategory}
            options={productCategoryOptions}
            placeholder="Product Category"
            searchable
            clearable
          />
        </div>

        {/* =================================================
            CATEGORY
        ================================================== */}
        <div className="w-full min-w-0 xl:flex-1">
          <SearchDropdown
            value={selectedCategory}
            onChange={setSelectedCategory}
            options={categoryOptions}
            placeholder="Category"
            searchable
            clearable
          />
        </div>

        {/* =================================================
            FILTER BUTTON
        ================================================== */}
        <button
          type="button"
          onClick={() => {
            setShowFilterModal(true);
          }}
          className="flex items-center justify-center w-full transition border shadow-sm shrink-0 h-[42px] xl:w-[42px] bg-surface-background border-surface-border rounded-xl text-brand-first hover:shadow-md"
        >
          <Filter size={17} />

          <span className="ml-2 text-sm xl:hidden">Filter</span>
        </button>

        {/* =================================================
            TABS
        ================================================== */}
        <div className="flex items-center gap-2 overflow-x-auto shrink-0">
          {["Active", "Expired Soon", "Expired"].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => {
                setActiveTab(tab);
                setPage(1);

                if (tab === "Expired Soon") {
                  setFilterData((prev) => {
                    if (prev?.filterType === "expSoon") {
                      return null;
                    }

                    return prev;
                  });

                  window.history.replaceState(null, "", "/circular");
                }
              }}
              className={`
                h-[42px]

                px-5

                rounded-full

                text-[13px]
                font-semibold

                whitespace-nowrap
                shrink-0

                transition-all

                ${
                  activeTab === tab
                    ? "bg-surface-background border-2 border-brand-first text-brand-first"
                    : "bg-surface-background text-brand-first border border-surface-border"
                }
              `}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          STATUS HEADER
      ====================================================== */}
      <div
        className="py-2 mb-4 text-center transition-all shadow-sm rounded-xl"
        style={{
          backgroundColor: headerColors.bg,
          color: headerColors.text,
        }}
      >
        <p className="text-sm font-semibold">Circular Letter {activeTab}</p>
      </div>

      {/* =====================================================
          PROGRAM LIST
      ====================================================== */}
      <div className="p-4">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-text-light animate-pulse">
              Loading Circular Letter...
            </p>
          </div>
        ) : paginatedPrograms.length > 0 ? (
          <div className="space-y-3">
            {paginatedPrograms.map((item) => (
              <LetterCard key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 h-[200px]">
            <p className="text-sm text-text-light">No Circular Letter Found</p>

            {(search || selectedProductCategory || selectedCategory) && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedProductCategory(null);
                  setSelectedCategory(null);
                }}
                className="text-xs font-medium text-brand-first hover:underline"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>

      {/* =====================================================
          PAGINATION
      ====================================================== */}
      {!loading && filteredPrograms.length > 0 && totalPage > 1 && (
        <Pagination
          current={page}
          total={totalPage}
          onChange={(newPage) => {
            setPage(newPage);
          }}
        />
      )}

      {/* =====================================================
          FILTER MODAL
      ====================================================== */}
      {showFilterModal && (
        <CircularLetterFilter
          onClose={() => {
            setShowFilterModal(false);
          }}
          onApply={(payload) => {
            // ===============================================
            // EXPIRED SOON
            // ===============================================
            if (payload?.filterType === "expSoon") {
              setActiveTab("Expired Soon");

              setFilterData({
                filterType: "expSoon",
                expSoonType: payload.expSoonType,
              });

              setPage(1);
              setShowFilterModal(false);

              return;
            }

            // ===============================================
            // NORMAL FILTER
            // ===============================================
            setFilterData(payload);

            setPage(1);
            setShowFilterModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CircularLetter;
