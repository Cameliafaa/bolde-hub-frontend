import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL;

const api = axios.create({
  baseURL: `${API_URL}/report-automation`,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") ||
    JSON.parse(localStorage.getItem("auth") || "{}")?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const reportAutomationApi = {
  // =========================
  // TASK
  // =========================

  getTasks: async (params = {}) => {
    const res = await api.get("/tasks", { params });
    return res.data.data || [];
  },

  getTaskDetail: async (taskId) => {
    const res = await api.get(`/tasks/${taskId}`);
    return res.data.data || null;
  },

  createTask: async (payload) => {
    const res = await api.post("/tasks", payload);
    return res.data;
  },

  deleteTask: async (taskId) => {
    const res = await api.delete(`/tasks/${taskId}`);
    return res.data;
  },

  // =========================
  // TASK APPROVAL FLOW
  // =========================

  reviewTask: async (taskId, payload) => {
    const res = await api.post(`/tasks/${taskId}/review`, payload);

    return res.data;
  },

  approveTask: async (taskId, note = "") => {
    const res = await api.post(`/tasks/${taskId}/review`, {
      status: "approved",
      note,
    });

    return res.data;
  },

  rejectTask: async (taskId, note) => {
    const res = await api.post(`/tasks/${taskId}/review`, {
      status: "rejected",
      note,
    });

    return res.data;
  },

  getMyApprovalTasks: async () => {
    const res = await api.get("/tasks", {
      params: {
        status: "pending_approval",
        current_approver_only: true,
      },
    });

    return res.data.data || [];
  },

  // =========================
  // JOB
  // =========================

  startJob: async (taskId, jobId) => {
    const res = await api.post(`/tasks/${taskId}/jobs/${jobId}/start`);

    return res.data;
  },

  uploadJobEvidence: async (taskId, jobId, formData) => {
    const res = await api.post(
      `/tasks/${taskId}/jobs/${jobId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return res.data;
  },

  submitJob: async (taskId, jobId, payload) => {
    const res = await api.post(
      `/tasks/${taskId}/jobs/${jobId}/submit`,
      payload,
    );

    return res.data;
  },

  reviewJob: async (taskId, jobId, payload) => {
    const res = await api.post(
      `/tasks/${taskId}/jobs/${jobId}/review`,
      payload,
    );

    return res.data;
  },

  // =========================
  // FINAL TASK
  // =========================

  submitFinalTask: async (taskId, formData) => {
    const res = await api.post(`/tasks/${taskId}/final-submit`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data;
  },

  reviewFinalTask: async (taskId, payload) => {
    const res = await api.post(`/tasks/${taskId}/final-review`, payload);

    return res.data;
  },

  // =========================
  // DASHBOARD
  // =========================

  getDashboardSummary: async (params = {}) => {
    const res = await api.get("/dashboard/summary", { params });

    return res.data.data;
  },

  getDashboardWorkflow: async (params = {}) => {
    const res = await api.get("/dashboard/workflow", { params });

    return res.data.data || [];
  },

  getDashboardOutputs: async (params = {}) => {
    const res = await api.get("/dashboard/outputs", { params });

    return res.data.data || [];
  },

  getDashboardDelayed: async (params = {}) => {
    const res = await api.get("/dashboard/delayed", { params });

    return res.data.data || [];
  },

  getDashboardPerformance: async (params = {}) => {
    const res = await api.get("/dashboard/performance", { params });

    return res.data.data || [];
  },

  updateTask: async (id, payload) => {
    const res = await api.put(`/tasks/${id}`, payload);

    return res.data?.data || res.data;
  },
};
