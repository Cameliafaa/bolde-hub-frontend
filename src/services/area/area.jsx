import { ApiRequest } from "../apiRequest";

export const fetchAllAreas = async () => {
  let page = 1;
  let totalPage = 1;
  let allAreas = [];

  do {
    const res = await ApiRequest({
      url: `/areas/all?page=${page}&limit=50`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allAreas = allAreas.concat(
      data.map((a) => ({
        id: Number(a.area_id),
        name: a.name,
        provinces: a.provinces || [],
      })),
    );

    totalPage = Number(meta.total_page || 1);
    page++;
  } while (page <= totalPage);

  return allAreas;
};
