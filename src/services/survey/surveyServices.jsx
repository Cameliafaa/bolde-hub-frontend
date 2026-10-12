import { ApiRequest } from "../apiRequest";

/**
 * List surveys (paged, backend pagination)
 * @param {{page?:number, limit?:number, search?:string}} params
 */
export const fetchSurveys = async ({
  page = 1,
  limit = 10,
  search = "",
} = {}) => {
  const qs = new URLSearchParams();
  qs.set("page", String(page));
  qs.set("limit", String(limit));
  if (search) qs.set("search", search);

  return ApiRequest({
    url: `/surveys?${qs.toString()}`,
    method: "GET",
  });
};

/**
 * Fetch ALL surveys (handle pagination otomatis)
 * Default limit backend = 200
 * Cocok untuk user list / frontend filtering
 */
export const fetchAllSurveys = async (limit = 200) => {
  let page = 1;
  let totalPage = 1;
  let allSurveys = [];

  do {
    const res = await ApiRequest({
      url: `/surveys?page=${page}&limit=${limit}`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allSurveys = allSurveys.concat(data);

    totalPage = meta.total_page || 1;
    page++;
  } while (page <= totalPage);

  return allSurveys;
};

export const fetchSurveyDetail = async (id) => {
  return ApiRequest({
    url: `/surveys/${id}`,
    method: "GET",
  });
};

export const createSurvey = async (payload) => {
  return ApiRequest({
    url: `/surveys`,
    method: "POST",
    data: payload,
  });
};

export const updateSurvey = async (id, payload) => {
  return ApiRequest({
    url: `/surveys/${id}`,
    method: "PUT",
    data: payload,
  });
};

export const deleteSurvey = async (id) => {
  return ApiRequest({
    url: `/surveys/${id}`,
    method: "DELETE",
  });
};

/**
 * Fetch ALL survey responses (handle pagination otomatis)
 * @param {number|string} surveyId
 * @param {number} limit
 * @returns {Promise<Array>}
 */
export const fetchAllSurveyResponses = async (surveyId, limit = 100) => {
  let page = 1;
  let totalPage = 1;
  let allResponses = [];

  do {
    const res = await ApiRequest({
      url: `/survey-responses/${surveyId}/responses?page=${page}&limit=${limit}`,
      method: "GET",
    });

    const data = res?.data || [];
    const meta = res?.meta || {};

    allResponses = allResponses.concat(data);

    totalPage = Math.ceil((meta.total || 0) / limit);
    page++;
  } while (page <= totalPage);

  return allResponses;
};
