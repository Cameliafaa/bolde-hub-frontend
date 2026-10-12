import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequest } from "../../../services/apiRequest";
import Pagination from "../../common/pagination";
import ProgressBar from "../../common/progresssBarPercentage";
import DateRangeFilter from "../../common/dateRangeFilter";
import UpdateDataModalSpecial from "./updateddata/updateDataSpecial";

const SummaryDetailSpecial = () => {
  const { id: sellingAchieveId } = useParams();
  const navigate = useNavigate();

  const [program, setProgram] = useState(null);
  const [programId, setProgramId] = useState(null);

  const [rows, setRows] = useState([]);
  const [programSellingAchieveSpecialId, setProgramSellingAchieveSpecialId] =
    useState(null);
  const [summaryActual, setSummaryActual] = useState(0);
  const [summaryTarget, setSummaryTarget] = useState(0);
  const [summaryPercent, setSummaryPercent] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [storeTargetMap, setStoreTargetMap] = useState({});
  const [allProvinces, setAllProvinces] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  /* =====================
       1️⃣ FETCH MASTER
    ===================== */
  useEffect(() => {
    if (!sellingAchieveId) return;

    const fetchMaster = async () => {
      try {
        const res = await ApiRequest({
          url: `/program-selling-achieve-specials/${sellingAchieveId}`,
          method: "GET",
        });

        const data = res?.data;

        setProgram(data?.program);
        setProgramId(data?.program_id);
        setProgramSellingAchieveSpecialId(
          data?.program_selling_achieve_special_id,
        );

        // 🔥 FETCH PROGRAM DETAIL UNTUK TARGET
        const detailRes = await ApiRequest({
          url: `/programs/detail/${data?.program_id}`,
          method: "GET",
        });

        const programStores = detailRes?.data?.data?.program_stores || [];

        const targetMap = {};

        programStores.forEach((store) => {
          targetMap[store.store_id] = store.target_selling_num;
        });

        setStoreTargetMap(targetMap);
      } catch (err) {
        console.error(err);
      }
    };

    fetchMaster();
  }, [sellingAchieveId]);

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
       2️⃣ FETCH DETAILS
    ===================== */
  useEffect(() => {
    if (!programId) return;

    const fetchDetails = async () => {
      try {
        const res = await ApiRequest({
          url: `/program-selling-achieve-special-details`,
          method: "GET",
          params: {
            program_id: programId,
            start_date: startDate || undefined,
            end_date: endDate || undefined,
          },
        });

        const mapped = (res?.data || []).map((item) => {
          const target = Number(item.target) || 0;
          const achieve = Number(item.archieve) || 0;

          const percent = target > 0 ? Math.round((achieve / target) * 100) : 0;

          return {
            province: getProvinceName(item),
            store: item.store?.store_name || "-",
            target,
            achieve,
            percent,
          };
        });
        setRows(mapped);
        /* 🔥 SUMMARY CALCULATION */
        const totalTarget = mapped.reduce((s, r) => s + r.target, 0);
        const totalActual = mapped.reduce((s, r) => s + r.achieve, 0);

        const percent =
          totalTarget > 0
            ? Math.min(100, Math.round((totalActual / totalTarget) * 100))
            : 0;

        setSummaryTarget(totalTarget);
        setSummaryActual(totalActual);
        setSummaryPercent(percent);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDetails();
  }, [programId, startDate, endDate, storeTargetMap]);

  const getProvinceName = (item) => {
    const provinceId = item.province_id;

    const foundProvince = allProvinces.find(
      (province) => province.province_id === provinceId,
    );

    return foundProvince?.name || item.province?.name || "-";
  };
  const getColor = (p) => {
    if (p === 0) return "text-red-500";
    if (p < 50) return "text-red-500";
    if (p < 80) return "text-yellow-500";
    return "text-green-500";
  };

  const totalPage = Math.ceil(rows.length / PAGE_SIZE);
  const totalStoreCount = rows.length;

  const highImpactCount = rows.filter((item) => item.percent >= 80).length;
  const mediumImpactCount = rows.filter(
    (item) => item.percent >= 50 && item.percent < 80,
  ).length;
  const underperformingCount = rows.filter((item) => item.percent < 50).length;

  const highImpactPercent =
    totalStoreCount > 0
      ? Math.round((highImpactCount / totalStoreCount) * 100)
      : 0;

  const mediumImpactPercent =
    totalStoreCount > 0
      ? Math.round((mediumImpactCount / totalStoreCount) * 100)
      : 0;

  const underperformingPercent =
    totalStoreCount > 0
      ? Math.round((underperformingCount / totalStoreCount) * 100)
      : 0;

  const paginatedData = rows.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [rows.length]);

  const formatRupiah = (value) => {
    if (!value && value !== 0) return "-";

    return (
      "Rp " +
      new Intl.NumberFormat("id-ID", {
        minimumFractionDigits: 0,
      }).format(value)
    );
  };

  const formatRupiahCompact = (value) => {
    if (value === null || value === undefined) return "-";

    if (value >= 1_000_000_000) {
      return (value / 1_000_000_000).toFixed(1).replace(".0", "") + "B";
    }

    if (value >= 1_000_000) {
      return (value / 1_000_000).toFixed(1).replace(".0", "") + "M";
    }

    if (value >= 1_000) {
      return (value / 1_000).toFixed(1).replace(".0", "") + "K";
    }

    return value.toString();
  };

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
        <div>
          <h1 className="text-3xl font-bold">{program?.name || "Program"}</h1>
          <p className="text-sm text-gray-500">
            {program?.program_code || "-"}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* <DateRangeFilter
            onApply={({ startDate, endDate }) => {
              setStartDate(startDate);
              setEndDate(endDate);
            }}
            onReset={() => {
              setStartDate("");
              setEndDate("");
            }}
          /> */}

          <button
            onClick={() => setShowModal(true)}
            className="px-6 font-semibold text-white bg-[#0F2F5A] py-2.5 rounded-2xl"
          >
            Updated Data
          </button>
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">Achievement Program</p>
          <h2 className="text-4xl font-bold">
            {formatRupiahCompact(summaryActual)}
          </h2>
          <p className="text-sm text-gray-500">
            Program achieved{" "}
            <span className="font-semibold text-green-500">
              {summaryPercent}%
            </span>
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">High Impact</p>
          <h2 className="text-4xl font-bold text-green-500">
            {highImpactCount}
          </h2>
          <p className="text-sm text-gray-500">
            {highImpactPercent}% contribution
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">Medium Impact</p>
          <h2 className="text-4xl font-bold text-yellow-500">
            {mediumImpactCount}
          </h2>
          <p className="text-sm text-gray-500">
            {mediumImpactPercent}% contribution
          </p>
        </div>
        <div className="p-6 bg-white shadow rounded-2xl">
          <p className="mb-2 text-gray-500">Underperforming</p>
          <h2 className="text-4xl font-bold text-red-500">
            {underperformingCount}
          </h2>
          <p className="text-sm text-gray-500">
            {underperformingPercent}% contribution
          </p>
        </div>{" "}
      </div>

      {/* PROGRESS */}
      <ProgressBar value={summaryPercent} />
      <p className="mt-2 text-sm text-gray-500">
        {formatRupiah(summaryActual)} / {formatRupiah(summaryTarget)}
      </p>

      {/* TABLE */}
      <div className="mt-6 overflow-hidden bg-white shadow rounded-2xl">
        <table className="w-full text-sm">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-6 py-3">No</th>
              <th className="px-6 py-3">Province</th>
              <th className="px-6 py-3">Store</th>
              <th className="px-6 py-3">Target</th>
              <th className="px-6 py-3">Achieve</th>
              <th className="px-6 py-3">%</th>
            </tr>
          </thead>

          <tbody>
            {paginatedData.map((p, i) => (
              <tr key={i} className="border-b">
                <td className="px-6 py-4 text-center">
                  {(currentPage - 1) * PAGE_SIZE + i + 1}
                </td>
                <td className="px-6 py-4 text-center">{p.province}</td>
                <td className="px-6 py-4 text-center">{p.store}</td>
                <td className="px-6 py-4 text-center">
                  {formatRupiah(p.target)}
                </td>
                <td className={`px-6 py-4 text-center ${getColor(p.percent)}`}>
                  {formatRupiah(p.achieve)}
                </td>{" "}
                <td className={`px-6 py-4 text-center ${getColor(p.percent)}`}>
                  {p.percent}%
                </td>
              </tr>
            ))}

            {!paginatedData.length && (
              <tr>
                <td colSpan={6} className="py-6 text-center text-gray-400">
                  No data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPage > 1 && (
        <Pagination
          current={currentPage}
          total={totalPage}
          onChange={setCurrentPage}
        />
      )}

      <UpdateDataModalSpecial
        open={showModal}
        programSellingAchieveSpecialId={programSellingAchieveSpecialId}
        programId={programId}
        onClose={() => setShowModal(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
};

export default SummaryDetailSpecial;
