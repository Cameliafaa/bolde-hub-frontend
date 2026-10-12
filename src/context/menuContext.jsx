import { createContext, useContext, useState, useEffect } from "react";
import { ApiRequest } from "../services/apiRequest";

const MenuContext = createContext();

export const MenuProvider = ({ children }) => {
  const [menus, setMenus] = useState([]);
  const [loadingMenu, setLoadingMenu] = useState(true);

  const refreshMenu = async () => {
    try {
      const res = await ApiRequest({
        url: "/users/refresh-menu",
        method: "GET",
      });

      const access = res?.data?.user?.role?.access || [];
      setMenus(access);

      // 🔥 SINKRON KE LOCALSTORAGE (penting)
      const userData = JSON.parse(localStorage.getItem("userData")) || {};
      localStorage.setItem(
        "userData",
        JSON.stringify({ ...userData, role: res.data.user.role })
      );
    } catch (err) {
      console.error("❌ refreshMenu error:", err);
    } finally {
      setLoadingMenu(false);
    }
  };

  useEffect(() => {
    refreshMenu();
  }, []);

  return (
    <MenuContext.Provider value={{ menus, refreshMenu, loadingMenu }}>
      {children}
    </MenuContext.Provider>
  );
};

export const useMenu = () => useContext(MenuContext);
