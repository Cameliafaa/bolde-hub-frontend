import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequest } from "../../../services/apiRequest";
import UpdateDataModal from "./updateddata/updateData";
import Tabs from "../../common/tabs";
import ProgressBar from "../../common/progresssBarPercentage";
import Pagination from "../../common/pagination";
import DateRangeFilter from "../../common/dateRangeFilter";

const SummaryDetail = () => {
  const { id: sellingAchieveId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [programId, setProgramId] = useState(null);

  const [summary, setSummary] = useState({
    achievement_program: {},
    high_impact_regions: {},
    medium_impact_regions: {},
    underperforming_province: {},
  });

  const [showModal, setShowModal] = useState(false);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [skuTabs, setSkuTabs] = useState([]);
  const [activeSku, setActiveSku] = useState("ALL");
  const [skuTargetMap, setSkuTargetMap] = useState({});

  const [allProvinces, setAllProvinces] = useState([]);
  const [programProvinceIds, setProgramProvinceIds] = useState([]);
  const [isFiltered, setIsFiltered] = useState(false);

  const [initializedDate, setInitializedDate] = useState(false);
  const [rawProvinceRows, setRawProvinceRows] = useState([]);

  /* =====================
   1b. FETCH PROGRAM DETAIL (SKU SOURCE)
===================== */
  useEffect(() => {
    if (!programId) return;

    const fetchProgramDetail = async () => {
      try {
        const res = await ApiRequest({
          url: `/programs/detail/${programId}`,
          method: "GET",
        });

        const data = res?.data;

        const items = data?.program_items || [];

        // SKU Tabs
        const skuCountMap = {};
        const targetMap = {};

        const tabs = [
          { key: "ALL", label: "All SKU" },
          ...items.map((item) => {
            const skuName = item.sku_name || "SKU";
            skuCountMap[skuName] = (skuCountMap[skuName] || 0) + 1;

            const index = skuCountMap[skuName];
            const uniqueKey = `${skuName}__${item.program_item_id || item.program_selling_id || index}`;

            targetMap[uniqueKey] = item.target_selling_qty || 0;

            return {
              key: uniqueKey,
              label: `${skuName} - Varian ${index}`,
              rawSkuName: skuName,
              itemId: item.program_item_id || item.program_selling_id || index,
            };
          }),
        ];

        setSkuTabs(tabs);
        setSkuTargetMap(targetMap);

        // 🔥 FIX DI SINI
        const programProvinces = data?.program_provinces || [];

        setProgramProvinceIds(programProvinces.map((p) => p.province_id));
      } catch (err) {
        console.error("❌ Failed fetch program detail:", err);
      }
    };

    fetchProgramDetail();
  }, [programId]);
  useEffect(() => {
    const fetchAllProvinces = async () => {
      try {
        const res = await ApiRequest({
          url: `/provinces`,
          method: "GET",
          params: { limit: 100 },
        });

        setAllProvinces(res?.data || []);
      } catch (err) {
        console.error("❌ Failed fetch provinces master:", err);
      }
    };

    fetchAllProvinces();
  }, []);

  /* =====================
     1. FETCH SELLING ACHIEVE (MASTER)
  ===================== */
  useEffect(() => {
    if (!sellingAchieveId) return;

    const fetchSellingAchieve = async () => {
      try {
        const res = await ApiRequest({
          url: `/program-selling-achieves/${sellingAchieveId}`,
          method: "GET",
          params: {
            ...(isFiltered &&
              startDate &&
              endDate && {
                start_date: startDate,
                end_date: endDate,
              }),
          },
        });

        const data = res?.data;
        setProgram(data.program);
        setProgramId(data.program_id);
      } catch (err) {
        console.error("❌ Failed fetch selling achieve:", err);
      }
    };

    fetchSellingAchieve();
  }, [sellingAchieveId, startDate, endDate, isFiltered]);

  /* =====================
     2. DASHBOARD (PAKAI programId)
  ===================== */
  useEffect(() => {
    if (!programId) return;

    const fetchDashboard = async () => {
      try {
        const res = await ApiRequest({
          url: `/program-selling-achieve-details/${programId}/dashboard`,
          method: "GET",
          params: {
            ...(isFiltered &&
              startDate &&
              endDate && {
                start_date: startDate,
                end_date: endDate,
              }),
          },
        });

        setSummary(res?.data);
      } catch (err) {
        console.error("❌ Failed fetch dashboard:", err);
      }
    };

    fetchDashboard();
  }, [programId, startDate, endDate, isFiltered]);

  /* =====================
     3. PROVINCES (PAKAI sellingAchieveId)
  ===================== */
  useEffect(() => {
    if (!sellingAchieveId) return;

    const fetchProvinces = async () => {
      try {
        const res = await ApiRequest({
          url: `/program-selling-achieve-details/${sellingAchieveId}`,
          method: "GET",
          params: {
            limit: 100,
            ...(isFiltered &&
              startDate &&
              endDate && {
                start_date: startDate,
                end_date: endDate,
              }),
          },
        });

        const rows = res?.data?.data || res?.data || [];
        setRawProvinceRows(rows);
      } catch (err) {
        console.error("❌ Failed fetch provinces:", err);
      }
    };

    fetchProvinces();
  }, [sellingAchieveId, startDate, endDate, isFiltered]);

  /* =====================
     HELPERS
  ===================== */
  const getColor = (p) => {
    if (p === 0) return "text-red-500";
    if (p < 50) return "text-red-500";
    if (p < 80) return "text-yellow-500";
    return "text-green-500";
  };

  const provinceData = rawProvinceRows.flatMap((provinceItem) =>
    (provinceItem.program_selling_items || []).map((skuItem, idx) => {
      const uniqueKey = `${skuItem.sku_name}__${skuItem.program_item_id || skuItem.program_selling_id || idx}`;

      return {
        province_id: provinceItem.province_id,
        province: provinceItem.province_name,
        sku: skuItem.sku_name,
        sku_key: uniqueKey,
        value: skuItem.actual_qty || 0,
        participant: skuItem.partisipant ?? 0,
        target_qty: skuItem.target_qty || 0,
      };
    }),
  );

  const provinceTotals = rawProvinceRows.map((provinceItem) => ({
    province_id: provinceItem.province_id,
    province: provinceItem.province_name,
    total_actual_qty: provinceItem.total_actual_qty || 0,
    total_participant: provinceItem.partisipasi ?? 0,
  }));

  const filteredProvinceData =
    activeSku === "ALL"
      ? provinceData
      : provinceData.filter((item) => item.sku_key === activeSku);

  const getPercentage = (actual, sku) => {
    const target = skuTargetMap[sku] || 0;
    if (!target) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
  };

  const sumActualPerProvince = (data) => {
    const map = {};

    data.forEach((item) => {
      const key = item.province;
      map[key] = (map[key] || 0) + (item.value || 0);
    });

    return Object.values(map).reduce((sum, val) => sum + val, 0);
  };

  const getActualBySku = (sku) => {
    if (sku === "ALL") {
      return provinceTotals.reduce(
        (sum, item) => sum + (item.total_actual_qty || 0),
        0,
      );
    }

    const skuData = provinceData.filter((item) => item.sku_key === sku);
    return sumActualPerProvince(skuData);
  };

  const getTargetBySku = (sku) => {
    if (sku === "ALL") {
      return Object.values(skuTargetMap).reduce(
        (sum, val) => sum + (val || 0),
        0,
      );
    }

    return skuTargetMap[sku] || 0;
  };

  const getAchievementPercent = () => {
    const actual = getActualBySku(activeSku);
    const target = getTargetBySku(activeSku);

    if (!target) return 0;
    return Math.min(100, Math.round((actual / target) * 100));
  };

  const visibleProvinces =
    programProvinceIds.length > 0
      ? allProvinces.filter((p) => programProvinceIds.includes(p.province_id))
      : allProvinces;

  // 🔥 buat map dari update data
  const provinceUpdateMap = provinceData.reduce((acc, item) => {
    const provinceKey = item.province?.toLowerCase().trim();
    const skuKey = item.sku?.toLowerCase().trim();

    acc[`${provinceKey}__${skuKey}`] = item;
    return acc;
  }, {});

  const tableData = visibleProvinces.map((province) => {
    const provinceKey = province.name?.toLowerCase().trim();

    const provinceRow = rawProvinceRows.find(
      (item) => item.province_name?.toLowerCase().trim() === provinceKey,
    );

    const items = provinceRow?.program_selling_items || [];

    let target_qty = 0;
    let value = 0;
    let participant = 0;

    if (activeSku === "ALL") {
      target_qty = items.reduce((sum, item) => sum + (item.target_qty || 0), 0);
      value = items.reduce((sum, item) => sum + (item.actual_qty || 0), 0);
      participant = items.reduce(
        (sum, item) => sum + (item.partisipant || 0),
        0,
      );
    } else {
      const match = items.find((item, idx) => {
        const key = `${item.sku_name}__${item.program_item_id || item.program_selling_id || idx}`;
        return key === activeSku;
      });

      target_qty = match?.target_qty || 0;
      value = match?.actual_qty || 0;
      participant = match?.partisipant || 0;
    }

    return {
      province: province.name,
      target_qty,
      value,
      percent: target_qty > 0 ? Math.round((value / target_qty) * 100) : 0,
      participant,
    };
  });
  const totalProvinceCount = tableData.length;

  const highImpactCount = tableData.filter((item) => item.percent >= 80).length;
  const mediumImpactCount = tableData.filter(
    (item) => item.percent >= 50 && item.percent < 80,
  ).length;
  const underperformingCount = tableData.filter(
    (item) => item.percent < 50,
  ).length;

  const highImpactPercent =
    totalProvinceCount > 0
      ? Math.round((highImpactCount / totalProvinceCount) * 100)
      : 0;

  const mediumImpactPercent =
    totalProvinceCount > 0
      ? Math.round((mediumImpactCount / totalProvinceCount) * 100)
      : 0;

  const underperformingPercent =
    totalProvinceCount > 0
      ? Math.round((underperformingCount / totalProvinceCount) * 100)
      : 0;

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;
  const totalPage = Math.ceil(tableData.length / PAGE_SIZE);

  const paginatedData = tableData.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeSku, tableData.length]);

  /* =====================
     RENDER
  ===================== */
  return (
    <div>
      {/* BACK */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 font-medium text-[#0F2F5A]"
      >
        <ArrowLeft size={18} />
        Back to detail
      </button>

      {/* HEADER */}
      <div className="flex items-center justify-between mb-8">
        {/* LEFT */}
        <div className="flex flex-col">
          <h1 className="text-3xl font-bold whitespace-nowrap">
            {program?.name || "Program"}
          </h1>
          <p className="text-sm text-gray-500 whitespace-nowrap">
            {program?.program_code || "-"}
          </p>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4 whitespace-nowrap">
          <DateRangeFilter
            onApply={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
              setIsFiltered(true); // 🔥 penting
              setCurrentPage(1);
            }}
            onReset={() => {
              setStartDate("");
              setEndDate("");
              setIsFiltered(false);
              setCurrentPage(1);
            }}
          />{" "}
          <button
            onClick={() => setShowModal(true)}
            className="px-6 font-semibold text-white bg-[#0F2F5A] py-2.5 rounded-2xl"
          >
            Updated Data
          </button>
        </div>
      </div>
      {/* SKU FILTER */}
      {skuTabs.length > 1 && (
        <div className="mb-4 overflow-x-auto">
          <div className="min-w-max">
            <Tabs tabs={skuTabs} active={activeSku} onChange={setActiveSku} />
          </div>
        </div>
      )}

      {/* SUMMARY */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">Achievement Program</p>
          <h2 className="text-4xl font-bold">{getActualBySku(activeSku)}</h2>
          <p className="text-sm text-gray-500">
            Program has been achieved{" "}
            <span className="font-semibold text-green-500">
              {getAchievementPercent()}%
            </span>
          </p>{" "}
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">High Impact Regions</p>
          <h2 className="text-4xl font-bold text-green-500">
            {highImpactCount}
          </h2>
          <p className="text-sm text-gray-500">
            {highImpactPercent}% contribution
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">Medium Impact Regions</p>
          <h2 className="text-4xl font-bold text-yellow-500">
            {mediumImpactCount}
          </h2>
          <p className="text-sm text-gray-500">
            {mediumImpactPercent}% contribution
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">Underperforming Province</p>
          <h2 className="text-4xl font-bold text-red-500">
            {underperformingCount}
          </h2>
          <p className="text-sm text-gray-500">
            {underperformingPercent}% contribution
          </p>
        </div>{" "}
      </div>

      <ProgressBar value={getAchievementPercent()} />
      <p className="mt-2 text-sm text-gray-500">
        {getActualBySku(activeSku)} / {getTargetBySku(activeSku)} pcs
      </p>

      <p className="mt-2 text-sm text-gray-500">
        Filter: {isFiltered ? `${startDate} → ${endDate}` : "All Data"}
      </p>

      {/* TABLE */}
      <div className="mt-5 overflow-hidden bg-white shadow rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3">No</th>
              <th className="px-6 py-3">Provinsi</th>
              <th className="px-6 py-3">Target Outlet</th>
              <th className="px-6 py-3">Pencapaian</th>
              <th className="px-6 py-3">%</th>
              <th className="px-6 py-3">Participant</th>
            </tr>
          </thead>
          <tbody>
            {/* {provinceData
              .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
              .map((p, i) => ( */}
            {paginatedData.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="px-6 py-4 text-center">
                  {(currentPage - 1) * PAGE_SIZE + i + 1}
                </td>

                <td className="px-6 py-4 text-center">{p.province}</td>

                {/* TARGET QTY */}
                <td className="px-6 py-4 text-center">{p.target_qty}</td>

                {/* PENCAPAIAN */}
                <td className={`px-6 py-4 text-center ${getColor(p.percent)}`}>
                  {p.value}
                </td>

                {/* PERCENT */}
                <td className={`px-6 py-4 text-center ${getColor(p.percent)}`}>
                  {p.percent}%
                </td>

                {/* PARTICIPANT */}
                <td className="px-6 py-4 text-center">{p.participant}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <UpdateDataModal
          open={showModal}
          programSellingAchieveId={sellingAchieveId}
          programId={programId}
          onClose={() => setShowModal(false)}
          onSuccess={() => window.location.reload()}
        />
      </div>

      {totalPage > 0 && (
        <Pagination
          current={currentPage}
          total={totalPage}
          onChange={setCurrentPage}
        />
      )}
    </div>
  );
};

export default SummaryDetail;
