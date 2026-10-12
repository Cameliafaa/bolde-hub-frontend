import api from "./apiBase";

export const publicApi = async ({
  url,
  method = "GET",
  params = {},
  data = {},
  isFormData = false,
}) => {
  try {
    const headers = {};

    if (!isFormData) {
      headers["Content-Type"] = "application/json";
    }

    const res = await api({
      url,
      method,
      params,
      data,
      headers,
    });

    return res.data;
  } catch (error) {
    console.error("Public API Error:", error.response || error.message);

    throw {
      status: error.response?.status,
      message:
        error.response?.data?.message ||
        "Terjadi kesalahan pada server.",
      data: error.response?.data || null,
    };
  }
};
