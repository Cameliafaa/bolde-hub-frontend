import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import Garis from "../../assets/images/garis.png";

const SalesToolsKit = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // =========================
        // 1. REFRESH MENU (ACCESS TERBARU)
        // =========================
        const refreshRes = await ApiRequest({
          url: "/users/refresh-menu",
          method: "GET",
        });

        const user = refreshRes.data?.user;
        if (!user) return;

        localStorage.setItem("userData", JSON.stringify(user));

        const salesTools = user.role?.access?.find(
          (m) => m.menu_name?.toLowerCase() === "sales tools kit"
        );

        if (!salesTools) {
          setMenus([]);
          return;
        }

        // sub menu yang boleh dibaca + urutan
        const allowedSubMenus = (salesTools.sub_menus || [])
          .filter((sm) => sm.permissions?.can_read)
          .map((sm) => ({
            name: sm.name.toLowerCase(),
            order_no: sm.order_no,
            image_url: sm.icon || sm.image_url || "",
          }));

        // =========================
        // 2. AMBIL ITEM CATEGORIES
        // =========================
        const catRes = await ApiRequest({
          url: "/item-categories/all",
          method: "GET",
        });

        // =========================
        // 3. JOIN + SORT
        // =========================
        const merged = allowedSubMenus
          .map((sm) => {
            const cat = catRes.data?.find(
              (c) => c.name.toLowerCase() === sm.name
            );
            if (!cat) return null;

            return {
              ...cat,
              order_no: sm.order_no,
              image_url: sm.image_url,
            };
          })
          .filter(Boolean)
          .sort((a, b) => a.order_no - b.order_no);

        setMenus(merged);
      } catch (err) {
        console.error("SalesToolsKit error:", err);
        setMenus([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-20 text-gray-400">
        Loading Sales Tools...
      </div>
    );
  }

  return (
    <div
      className="
      w-full
      max-w-[1400px]
      mx-auto

      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
    >
      <h1 className="text-xl sm:text-2xl font-semibold text-brand-first mb-5">
        Sales Tools Kit
      </h1>

      {menus.length === 0 ? (
        <div className="text-text-primary text-center mt-20">
          Tidak ada menu yang bisa diakses
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {menus.map((item) => (
            <div
              key={item.item_category_id}
              onClick={() =>
                navigate(`/sales-tools/${item.item_category_id}`)
              }
              className="flex items-center bg-surface-card shadow-sm rounded-2xl
                         border border-surface-border p-6 hover:shadow-md
                         transition cursor-pointer"
            >
              <img src={Garis} alt="line" className="w-1 h-10" />

              <div className="p-3 rounded-xl">
                <img
                  src={item.image_url || ""}
                  alt={item.name}
                  className="w-9 h-9 object-contain"
                />
              </div>

              <h3 className="text-[14px] sm:text-xl text-brand-first font-semibold text-lg ml-3">
                {item.name}
              </h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SalesToolsKit;
