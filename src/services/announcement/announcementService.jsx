import { ApiRequest } from "../apiRequest";

export const getAnnouncements = async (params = {}) => {
  return await ApiRequest({
    url: "/announcements",
    method: "GET",
    params,
  });
};

export const getAnnouncementDetail = async (id) => {
  return await ApiRequest({
    url: `/announcements/${id}`,
    method: "GET",
  });
};

export const createAnnouncement = async (payload) => {
  const formData = new FormData();
  formData.append("title", payload.title || "");
  formData.append("description", payload.description || "");
  formData.append("type", payload.type || "promo");

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return await ApiRequest({
    url: "/announcements",
    method: "POST",
    data: formData,
    isFormData: true,
  });
};

export const updateAnnouncement = async (id, payload) => {
  const formData = new FormData();
  formData.append("title", payload.title || "");
  formData.append("description", payload.description || "");
  formData.append("type", payload.type || "promo");

  if (payload.image) {
    formData.append("image", payload.image);
  }

  return await ApiRequest({
    url: `/announcements/${id}`,
    method: "PUT",
    data: formData,
    isFormData: true,
  });
};

export const removeAnnouncement = async (id) => {
  return await ApiRequest({
    url: `/announcements/${id}`,
    method: "DELETE",
  });
};
