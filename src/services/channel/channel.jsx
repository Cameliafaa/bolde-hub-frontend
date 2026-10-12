import { ApiRequest } from "../apiRequest";

export const fetchAllChannels = async () => {
  let page = 1;
  let totalPage = 1;
  let allChannels = [];

  do {
    const res = await ApiRequest({
      url: `/channels/all?page=${page}&limit=50`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allChannels = allChannels.concat(
      data.map((c) => ({
        id: Number(c.channel_id),
        name: c.name,
        code: c.channel_code,
      })),
    );

    totalPage = Number(meta.total_page || 1);
    page++;
  } while (page <= totalPage);

  return allChannels;
};
