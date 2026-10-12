import { ApiRequest } from "../apiRequest";

/**
 * Fetch ALL positions (handle backend pagination)
 * @returns {Promise<Array>}
 */
export const fetchAllPositions = async () => {
  let page = 1;
  let totalPage = 1;
  let allPositions = [];

  do {
    const res = await ApiRequest({
      url: `/positions/all?page=${page}&limit=20`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allPositions = allPositions.concat(
      data.map((item) => ({
        position_id: item.position_id,
        name: item.name,
        description: item.description || "",
        created_at: item.created_at,
        updated_at: item.updated_at,
      })),
    );

    totalPage = meta.total_page || 1;
    page++;
  } while (page <= totalPage);

  return allPositions;
};

/**
 * Search positions dari backend
 */
export const searchPositions = async (search, page = 1) => {
  const res = await ApiRequest({
    url: "/positions/all",
    method: "GET",
    params: {
      page,
      limit: 20,
      search,
    },
  });

  return {
    data: (res?.data || []).map((item) => ({
      position_id: item.position_id,
      name: item.name,
      description: item.description || "",
      created_at: item.created_at,
      updated_at: item.updated_at,
    })),
    meta: res?.meta || {},
  };
};
