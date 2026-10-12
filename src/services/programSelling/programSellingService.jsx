import { ApiRequest } from "../apiRequest";

/**
 * Fetch ALL program selling achieves (handle pagination)
 */
export const fetchAllProgramSellingAchieves = async () => {
  let page = 1;
  let totalPage = 1;
  let allData = [];

  do {
    const res = await ApiRequest({
      url: "/program-selling-achieves",
      method: "GET",
      params: {
        page,
        limit: 10,
      },
    });

    // 🔥 SESUAI DENGAN ApiRequest KAMU
    const rows = Array.isArray(res?.data) ? res.data : [];
    const meta = res?.meta || {};

    if (!rows.length) {
      console.warn("EMPTY PAGE:", page, res);
    }

    allData = allData.concat(rows);

    totalPage = meta.total_pages || 1;
    page++;
  } while (page <= totalPage);

  return allData;
};
