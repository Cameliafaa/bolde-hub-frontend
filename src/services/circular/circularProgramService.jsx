import { ApiRequest } from "../apiRequest";
import { fetchAllPrograms } from "../program/programService";

export const fetchFilteredCircularProgramData = async ({
  search = "",
  filterData,
  userContext,
}) => {
  // ===============================
  // 1️⃣ AMBIL SEMUA PROGRAM (HANDLE PAGINATION)
  // ===============================
  const allPrograms = await fetchAllPrograms({
    search,
    filters: {
      program_channel_id: filterData?.program_channel_id,
      area_id: filterData?.area_id,
    },
  });

  if (!Array.isArray(allPrograms) || !allPrograms.length) {
    return [];
  }

  // ===============================
  // 2️⃣ FILTER APPROVAL (SAMA SEPERTI CIRCULAR LETTER)
  // ===============================
  const approvedPrograms = allPrograms.filter((item) => {
    const approvals = item.approvals || [];

    return (
      approvals.length > 0 &&
      approvals.every((a) => (a.status || "").toLowerCase() === "approved")
    );
  });

  // ===============================
  // 3️⃣ FILTER PROFILE (AREA / CHANNEL / STORE)
  // ===============================
  const results = await Promise.all(
    approvedPrograms.map(async (item) => {
      const detailRes = await ApiRequest({
        url: `/programs/detail/${item.program_id}`,
        method: "GET",
      });

      const detail = detailRes.data;

      const programAreaIds = detail.program_areas?.map((a) => a.area_id) || [];
      if (
        userContext?.areaId !== 0 &&
        programAreaIds.length > 0 &&
        !programAreaIds.includes(userContext?.areaId)
      )
        return null;

      const programChannelIds =
        detail.program_channels?.map((c) => c.channel_id) || [];

      if (
        userContext?.channelId !== 0 &&
        programChannelIds.length > 0 &&
        !programChannelIds.includes(userContext?.channelId)
      )
        return null;

      const programStoreIds =
        detail.program_stores?.map((s) => s.store_id) || [];

      if (
        userContext?.storeId !== 0 &&
        programStoreIds.length > 0 &&
        !programStoreIds.includes(userContext?.storeId)
      )
        return null;

      return item; // ⬅️ return raw program (supaya computeCircularSummary bisa pakai period_end)
    }),
  );

  return results.filter(Boolean);
};
