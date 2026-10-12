import { ApiRequest } from "../apiRequest";

/**
 * Fetch ALL stores (handle pagination)
 * @returns {Promise<Array<{id:number,name:string,province_id:number,channel_id:number}>>}
 */
export const fetchAllStores = async () => {
  let page = 1;
  let totalPage = 1;
  let allStores = [];

  do {
    const res = await ApiRequest({
      url: `/stores?page=${page}&limit=50`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allStores = allStores.concat(
      data.map((s) => ({
        id: Number(s.store_id),
        name: s.store_name,
        province_id: Number(s.province_id),
        channel_id: Number(s.channel_id),
      })),
    );

    totalPage = meta.total_page || 1;
    page++;
  } while (page <= totalPage);

  return allStores;
};

export const searchStores = async (search, page = 1) => {
  const res = await ApiRequest({
    url: "/stores",
    method: "GET",
    params: {
      page,
      limit: 20,
      search,
    },
  });

  return (res?.data || []).map((s) => ({
    id: Number(s.store_id),
    name: s.store_name,
    province_id: Number(s.province_id),
    channel_id: Number(s.channel_id),
  }));
};
