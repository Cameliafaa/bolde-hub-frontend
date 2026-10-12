import { ApiRequest } from "../apiRequest";

/**
 * Fetch ALL users (handle pagination)
 * @param {number} limitPerPage
 * @returns {Promise<Array>}
 */
export const fetchAllUsers = async (limitPerPage = 50) => {
  let page = 1;
  let totalPage = 1;
  let allUsers = [];

  do {
    const res = await ApiRequest({
      url: `/users/all?page=${page}&limit=${limitPerPage}`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allUsers = allUsers.concat(data);

    totalPage = meta.total_page || 1;
    page++;
  } while (page <= totalPage);

  return allUsers;
};

/**
 * Fetch user detail
 */
export const fetchUserDetail = async (userId) => {
  const res = await ApiRequest({
    url: `/users/detail/${userId}`,
    method: "GET",
  });

  return res?.data || null;
};
