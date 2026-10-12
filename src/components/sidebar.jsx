import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronRight, ArrowLeft } from "lucide-react";
import logoFull from "../assets/images/logo.png";
import logoMini from "../assets/images/logo-only.png";
import { ApiRequest } from "../services/apiRequest";

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [menus, setMenus] = useState([]);
  const [activeParent, setActiveParent] = useState(null);

  // ===== Helper mapping menu dari access =====
  const mapMenus = (access) => {
    const mapped = access
      .filter((m) => m.is_active && m.permissions?.can_read)
      .map((m) => ({
        id: m.menu_id,
        name: m.menu_name,
        icon: m.icon,
        path: m.url,
        order_no: m.order_no,
        subMenus: (m.sub_menus || [])
          .filter((sm) => sm.is_active && sm.permissions?.can_read)
          .map((sm) => ({
            id: sm.id,
            name: sm.name,
            icon: sm.icon,
            path: sm.url,
            order_no: sm.order_no,
          })),
      }))
      .sort((a, b) => a.order_no - b.order_no);

    setMenus(mapped);
  };

  // ===== Refresh menu dari backend (/users/refresh-menu) =====
  useEffect(() => {
    const refreshMenus = async () => {
      try {
        const res = await ApiRequest({
          url: "/users/refresh-menu",
          method: "GET",
        });

        const access = res.data.user.role.access || [];

        // simpan ke localStorage untuk dipakai halaman lain
        const stored = JSON.parse(localStorage.getItem("user")) || {};
        stored.role = stored.role || {};
        stored.role.access = access;
        localStorage.setItem("user", JSON.stringify(stored));

        // Hapus duplikat berdasarkan menu_id
        const uniqueAccess = Object.values(
          access.reduce((acc, item) => {
            acc[item.menu_id] = acc[item.menu_id] || item;
            return acc;
          }, {}),
        );

        mapMenus(uniqueAccess);
      } catch (err) {
        console.error("Gagal refresh menu:", err);
      }
    };

    refreshMenus();
  }, []);

  // ===== Responsif open/close sidebar =====
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsOpen(false);
      else setIsOpen(true);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // ===== Ambil menu awal dari localStorage (fallback) =====
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (!storedUser) return;

      const user = JSON.parse(storedUser);
      const access = user?.role?.access || [];
      if (!access.length) return;

      // Hapus duplikat berdasarkan menu_id
      const uniqueAccess = Object.values(
        access.reduce((acc, item) => {
          acc[item.menu_id] = acc[item.menu_id] || item;
          return acc;
        }, {}),
      );

      mapMenus(uniqueAccess);
    } catch (err) {
      console.error("Gagal parsing menu dari login:", err);
    }
  }, []);

  // ===== Ambil profil =====
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiRequest({ url: "/profile/me", method: "GET" });
        if (res.status === "success") setProfile(res.data);
      } catch (err) {
        console.error("Gagal ambil profile:", err);
      }
    };
    fetchProfile();
  }, []);

  const getInitials = (name = "") => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0][0].toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // ===== Panel Submenu (DESIGN SAMA PERSIS DENGAN MENU UTAMA) =====
  if (activeParent) {
    const parentMenu = menus.find((m) => m.name === activeParent);

    return (
      <aside
        className={`fixed top-0 left-0 z-40 ${
          isOpen ? "w-64" : "w-20"
        } bg-white shadow-md flex flex-col justify-between h-screen rounded-r-2xl transition-all duration-300 ease-in-out overflow-y-auto`}
      >
        <div>
          {/* Tombol kembali */}
          <button
            onClick={() => setActiveParent(null)}
            title="Kembali ke menu"
            className={`flex items-center gap-2 pt-6 text-sm text-gray-500 hover:text-[#0F4C81] transition
    ${isOpen ? "px-6 justify-start" : "px-0 justify-center w-full"}`}
          >
            <ArrowLeft size={16} />
            {isOpen && "Kembali ke menu"}
          </button>
          {/* SUBMENU LIST */}
          <nav className="mt-6 space-y-1">
            {parentMenu?.subMenus?.map((item) => {
              const active = pathname.startsWith(item.path);

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center cursor-pointer ${
                    isOpen ? "justify-between px-4" : "justify-center"
                  } mx-3 py-3 rounded-lg transition-all ${
                    active
                      ? "bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white shadow-sm"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon ? (
                      <img
                        src={item.icon}
                        alt={item.name}
                        className={`w-5 h-5 object-contain transition ${
                          active ? "filter brightness-0 invert" : ""
                        }`}
                        onError={(e) =>
                          (e.currentTarget.src = "/fallback-icon.png")
                        }
                      />
                    ) : (
                      <div className="w-5 h-5 bg-gray-300 rounded" />
                    )}

                    {isOpen && (
                      <span className="text-sm font-medium">{item.name}</span>
                    )}
                  </div>

                  {isOpen && (
                    <ChevronRight
                      size={16}
                      className={`text-gray-400 ${active && "text-white"}`}
                    />
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div
          className={`p-6 transition-all ${
            !isOpen && "px-0 flex flex-col items-center"
          }`}
        >
          {isOpen ? (
            <>
              {/* <div className="p-5 text-center text-white shadow-md bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] rounded-2xl">
              <p className="mb-3 text-sm font-semibold leading-tight">
                Dapatkan informasi terbaru sekarang juga
              </p>
              <button className="px-6 py-2 text-sm font-bold transition bg-white rounded-full shadow text-[#0F4C81] hover:shadow-md">
                Subscribe Now
              </button>
            </div> */}

              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 mt-6 cursor-pointer"
              >
                {profile?.image_url ? (
                  <img
                    src={profile.image_url}
                    alt="User"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full bg-[#2D9CDB]">
                    {getInitials(profile?.full_name)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.positions?.name || "Staff"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <>
              {profile?.image_url ? (
                <img
                  src={profile.image_url}
                  alt="User"
                  className="object-cover w-10 h-10 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full bg-[#2D9CDB]">
                  {getInitials(profile?.full_name)}
                </div>
              )}

              {/* <button
                className="px-3 py-1 mt-3 text-xs font-semibold text-white rounded-full bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81]"
                onClick={() => alert("Subscribe feature coming soon!")}
              >
                +
              </button> */}
            </>
          )}
        </div>
      </aside>
    );
  }

  // ===== Sidebar utama =====
  return (
    <>
      {/* BACKDROP – hanya HP & Tablet */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 ${
          isOpen ? "w-64" : "w-20"
        } bg-white shadow-md flex flex-col justify-between h-screen rounded-r-2xl transition-all duration-300 ease-in-out overflow-y-auto`}
      >
        <div>
          {/* Logo */}
          <div
            onClick={() => setIsOpen(!isOpen)}
            className="relative flex items-center justify-center p-6 overflow-hidden cursor-pointer"
          >
            <div className="relative flex items-center justify-center w-44 h-14">
              <img
                src={logoFull}
                alt="Logo Full"
                className={`absolute transition-opacity duration-300 ease-in-out ${
                  isOpen ? "opacity-100" : "opacity-0"
                }`}
                style={{ width: "11rem", height: "auto" }}
              />
              <img
                src={logoMini}
                alt="Logo Mini"
                className={`absolute transition-opacity duration-300 ease-in-out ${
                  isOpen ? "opacity-0" : "opacity-100"
                }`}
                style={{ width: "2.5rem", height: "auto" }}
              />
            </div>
          </div>

          {/* Menu List */}
          <nav className="mt-4 space-y-1">
            {menus.map((item) => {
              const active = pathname.startsWith(item.path);
              const hasSubmenu = item.subMenus?.length > 0;
              const isSalesTools = item.name === "Sales Tools KIT";

              return (
                <div key={item.id}>
                  <div
                    onClick={() => {
                      if (isSalesTools) {
                        navigate("/sales-tools");
                        return;
                      }
                      if (hasSubmenu) {
                        setActiveParent(item.name); // buka panel submenu
                      } else {
                        navigate(item.path);
                      }
                    }}
                    className={`flex items-center cursor-pointer ${
                      isOpen ? "justify-between px-4" : "justify-center"
                    } mx-3 py-3 rounded-lg transition-all ${
                      active
                        ? "bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white shadow-sm"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon ? (
                        <img
                          src={item.icon}
                          alt={item.name}
                          className={`w-5 h-5 object-contain transition ${
                            active ? "filter brightness-0 invert" : ""
                          }`}
                          onError={(e) =>
                            (e.currentTarget.src = "/fallback-icon.png")
                          }
                        />
                      ) : (
                        <div className="w-5 h-5 bg-gray-300 rounded" />
                      )}
                      {isOpen && (
                        <span className="text-sm font-medium">{item.name}</span>
                      )}
                    </div>

                    {isOpen && hasSubmenu && !isSalesTools && (
                      <ChevronRight
                        size={16}
                        className={`text-gray-400 ${active && "text-white"}`}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer Sidebar */}
        <div
          className={`p-6 transition-all ${
            !isOpen && "px-0 flex flex-col items-center"
          }`}
        >
          {isOpen ? (
            <>
              {/* <div className="p-5 text-center text-white shadow-md bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] rounded-2xl">
              <p className="mb-3 text-sm font-semibold leading-tight">
                Dapatkan informasi terbaru sekarang juga
              </p>
              <button className="px-6 py-2 text-sm font-bold transition bg-white rounded-full shadow text-[#0F4C81] hover:shadow-md">
                Subscribe Now
              </button>
            </div> */}

              <div
                onClick={() => navigate("/profile")}
                className="flex items-center gap-3 mt-6 cursor-pointer"
              >
                {profile?.image_url ? (
                  <img
                    src={profile.image_url}
                    alt="User"
                    className="object-cover w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full bg-[#2D9CDB]">
                    {getInitials(profile?.full_name)}
                  </div>
                )}

                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {profile?.full_name || "User"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {profile?.positions?.name || "Staff"}
                  </p>
                </div>
              </div>
            </>
          ) : (
            <div
              onClick={() => navigate("/profile")}
              className="flex items-center gap-3 mt-6 cursor-pointer"
            >
              {profile?.image_url ? (
                <img
                  src={profile.image_url}
                  alt="User"
                  className="object-cover w-10 h-10 rounded-full"
                />
              ) : (
                <div className="flex items-center justify-center w-10 h-10 text-sm font-semibold text-white rounded-full bg-[#2D9CDB]">
                  {getInitials(profile?.full_name)}
                </div>
              )}

              {/* <button
              className="px-3 py-1 mt-3 text-xs font-semibold text-white rounded-full bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81]"
              onClick={() => alert("Subscribe feature coming soon!")}
            >
              +
            </button> */}
            </div>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
