import { ApiRequest } from "../apiRequest";

/**
 * Fetch ALL provinces
 * Handle pagination otomatis
 */
export const fetchAllProvinces = async () => {
  let page = 1;
  let totalPage = 1;
  let allProvinces = [];

  do {
    const res = await ApiRequest({
      url: `/provinces?page=${page}&limit=50`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allProvinces = allProvinces.concat(
      data.map((p) => ({
        id: Number(p.province_id),
        name: p.name,
        area_id: Number(p.area_id),
        area_name: p.area?.name || "",
      })),
    );

    totalPage = Number(meta.total_page || 1);
    page++;
  } while (page <= totalPage);

  return allProvinces;
};
