import axios from "axios";

const BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const ApiRequest = async ({
  url,
  method = "GET",
  headers = {},
  params = {},
  data = {},
  timeout = 20000,
  isFormData = false,
  skipAuth = false,
}) => {
  try {
    const token = localStorage.getItem("token");

    // FORM DATA → JANGAN SET Content-Type
    let finalHeaders = {
      ...headers,
    };

    if (!skipAuth && token) {
      finalHeaders.Authorization = `Bearer ${token}`;
    }

    if (isFormData) {
      // WAJIB: biarkan axios generate content-type boundary
      delete finalHeaders["Content-Type"];
    } else {
      finalHeaders["Content-Type"] = "application/json";
    }

    const response = await axios({
      baseURL: BASE_URL,
      url,
      method: method.toUpperCase(),
      headers: finalHeaders,
      params,
      data, // axios membaca body DI SINI, bukan "body"
      timeout,
    });

    return response.data;
  } catch (error) {
    console.error("API Request Error:", error.response || error.message);

    const status = error.response?.status;
    const message =
      error.response?.data?.message || "Terjadi kesalahan pada server.";
    const requestUrl = error.config?.url || "";
    const currentPath = window.location.pathname;

    if (
      error.code === "ECONNABORTED" ||
      error.message.includes("Network Error")
    ) {
      alert("Tidak dapat terhubung ke server. Periksa koneksi internet kamu.");
      throw { status: 0, message: "Network error / timeout" };
    }

    if (status === 401 && currentPath !== "/") {
      console.warn("🚫 Token expired (401). Redirecting to login...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      alert("Sesi kamu sudah berakhir. Silakan login kembali.");
      window.location.href = "/";
      return;
    }

    if (status >= 500) {
      console.warn("Server error:", message);
      // alert("Server mengalami gangguan. Coba lagi nanti.");
    }

    throw {
      status,
      message,
      data: error.response?.data || null,
    };
  }
};

export const getPrograms = async (filters = {}) => {
  const params = {
    page: 1,
    limit: 10,
    search: filters.program || filters.search || "",
    program_channel_id: filters.channel_id || "",
    area_id: filters.area_id || "",
    start_date: filters.startDate || filters.start_date || "",
    end_date: filters.endDate || filters.end_date || "",
  };

  return await ApiRequest({
    url: "/programs/all",
    method: "GET",
    params,
  });
};

export async function fetchProgramsHistory() {
  const token = localStorage.getItem("token");
  const res = await ApiRequest({
    url: `/programs/history`,
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res?.status !== "success") return [];
  return (res.data || []).map(mapHistoryRecord);
}

// Normalisasi shape biar mirip data programs yang lain
function mapHistoryRecord(p) {
  const approvals = (p.approvals || []).map((a) => ({
    ...a,
    status: (a.status || "").toLowerCase(), // "Approved" -> "approved"
  }));
  return {
    ...p,
    status: (p.status || "").toLowerCase(), // "active"/"pending"/"rejected"
    approvals,
    // fallback field agar ProgramCard gak error kalau butuh:
    program_id: p.program_id,
    name: p.name,
    program_code: p.program_code,
    description: p.description,
    period_start: p.period_start,
    period_end: p.period_end,
    budget_program: p.budget_program,
    monthly_turnover: p.monthly_turnover,
    target_program: p.target_program,
  };
}
