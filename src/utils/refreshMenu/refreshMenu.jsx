// utils/refreshMenu.js
import { ApiRequest } from "../../services/apiRequest";

export const refreshMenu = async () => {
  const res = await ApiRequest({
    url: "/users/refresh-menu",
    method: "GET",
  });

  // simpan user terbaru + access terbaru
  localStorage.setItem("userData", JSON.stringify(res.data.user));

  return res.data.user;
};
