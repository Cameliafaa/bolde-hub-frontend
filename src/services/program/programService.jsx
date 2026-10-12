import { ApiRequest } from "../apiRequest";

/**
 * Fetch ALL programs (handle pagination)
 * @param {Object} options
 * @param {string} options.search
 * @param {Object} options.filters
 * @returns {Promise<Array<Object>>}
 */
export const fetchAllPrograms = async ({ search = "", filters = {} } = {}) => {
  let page = 1;
  let totalPage = 1;
  let allPrograms = [];

  do {
    const params = new URLSearchParams({
      page,
      limit: 50, // 🔥 sesuaikan (50 / 100)
    });

    if (search) params.append("search", search);
    if (filters.program_category_id)
      params.append("program_category_id", filters.program_category_id);
    if (filters.area_id) params.append("area_id", filters.area_id);
    if (filters.program_channel_id)
      params.append("program_channel_id", filters.program_channel_id);
    if (filters.start_date) params.append("start_date", filters.start_date);
    if (filters.end_date) params.append("end_date", filters.end_date);

    const res = await ApiRequest({
      url: `/programs/all?${params.toString()}`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allPrograms = allPrograms.concat(data);

    totalPage = meta.total_page || 1;
    page++;
  } while (page <= totalPage);

  return allPrograms;
};
