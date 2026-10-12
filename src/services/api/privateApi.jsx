// src/services/api/privateApi.js
import api from "./apiBase";

export const privateApi = async ({
  url,
  method = "GET",
  params = {},
  data = {},
  isFormData = false,
}) => {
  const token = localStorage.getItem("token");

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
    };

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
    console.error("Private API Error:", error.response || error.message);

    const status = error.response?.status;

    if (status === 401) {
      console.warn("🚫 Token expired (401). Redirecting to login...");
      localStorage.clear();
      alert("Sesi kamu sudah berakhir. Silakan login kembali.");
      window.location.href = "/";
      return;
    }

    throw {
      status,
      message:
        error.response?.data?.message ||
        "Terjadi kesalahan pada server.",
      data: error.response?.data || null,
    };
  }
};
