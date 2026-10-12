import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ChevronDown,
  Home,
  MessageCircleMore,
  BriefcaseBusiness,
  UserRound,
} from "lucide-react";

import { ApiRequest } from "../services/apiRequest";
import boldeHubLogo from "../assets/images/logo-2.png";

const WORKSPACES = [
  {
    id: "big",
    code: "BW",
    name: "BIG WorkSpace",
  },
  {
    id: "bmi",
    code: "BMI",
    name: "BMI WorkSpace",
  },
];

const MAIN_MODULES = [
  {
    id: "home",
    name: "Home",
    icon: Home,
  },
  {
    id: "communication",
    name: "Communication",
    icon: MessageCircleMore,
  },
  {
    id: "work",
    name: "Work",
    icon: BriefcaseBusiness,
  },
];

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const workspaceRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [menus, setMenus] = useState([]);
  const [activeModule, setActiveModule] = useState("home");

  const [selectedWorkspace, setSelectedWorkspace] = useState(WORKSPACES[0]);
  const [workspaceOpen, setWorkspaceOpen] = useState(false);

  const [expandedMenus, setExpandedMenus] = useState({});

  // =========================================================
  // MAP MENU API
  // =========================================================

  const mapMenus = (access = []) => {
    const mapped = access
      .filter((menu) => menu.is_active && menu.permissions?.can_read)
      .map((menu) => ({
        id: menu.menu_id,
        name: menu.menu_name,
        icon: menu.icon,
        path: menu.url,
        order_no: menu.order_no,

        subMenus: (menu.sub_menus || [])
          .filter(
            (subMenu) => subMenu.is_active && subMenu.permissions?.can_read,
          )
          .map((subMenu) => ({
            id: subMenu.id,
            name: subMenu.name,
            icon: subMenu.icon,
            path: subMenu.url,
            order_no: subMenu.order_no,
          }))
          .sort((a, b) => (a.order_no || 0) - (b.order_no || 0)),
      }))
      .sort((a, b) => (a.order_no || 0) - (b.order_no || 0));

    setMenus(mapped);
  };

  // =========================================================
  // REFRESH MENU
  // =========================================================

  useEffect(() => {
    const refreshMenus = async () => {
      try {
        const res = await ApiRequest({
          url: "/users/refresh-menu",
          method: "GET",
        });

        const access = res?.data?.user?.role?.access || [];

        const stored = JSON.parse(localStorage.getItem("user")) || {};

        stored.role = stored.role || {};
        stored.role.access = access;

        localStorage.setItem("user", JSON.stringify(stored));

        const uniqueAccess = Object.values(
          access.reduce((acc, item) => {
            acc[item.menu_id] = acc[item.menu_id] || item;

            return acc;
          }, {}),
        );

        mapMenus(uniqueAccess);
      } catch (error) {
        console.error("Gagal refresh menu:", error);
      }
    };

    refreshMenus();
  }, []);

  // =========================================================
  // FALLBACK MENU LOCAL STORAGE
  // =========================================================

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) return;

      const user = JSON.parse(storedUser);

      const access = user?.role?.access || [];

      if (!access.length) return;

      const uniqueAccess = Object.values(
        access.reduce((acc, item) => {
          acc[item.menu_id] = acc[item.menu_id] || item;

          return acc;
        }, {}),
      );

      mapMenus(uniqueAccess);
    } catch (error) {
      console.error("Gagal parsing menu:", error);
    }
  }, []);

  // =========================================================
  // PROFILE
  // =========================================================

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await ApiRequest({
          url: "/profile/me",
          method: "GET",
        });

        if (res.status === "success") {
          setProfile(res.data);
        }
      } catch (error) {
        console.error("Gagal ambil profile:", error);
      }
    };

    fetchProfile();
  }, []);

  // =========================================================
  // CLOSE WORKSPACE DROPDOWN SAAT KLIK LUAR
  // =========================================================

  useEffect(() => {
    const handleOutside = (event) => {
      if (
        workspaceRef.current &&
        !workspaceRef.current.contains(event.target)
      ) {
        setWorkspaceOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
    };
  }, []);

  // =========================================================
  // RESPONSIVE
  // =========================================================

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsOpen]);

  // =========================================================
  // INITIAL USER
  // =========================================================

  const getInitials = (name = "") => {
    if (!name) return "U";

    const words = name.trim().split(" ");

    if (words.length === 1) {
      return words[0][0].toUpperCase();
    }

    return (words[0][0] + words[1][0]).toUpperCase();
  };

  // =========================================================
  // ACTIVE MENU
  // =========================================================

  const isMenuActive = (item) => {
    if (item.path && pathname === item.path) {
      return true;
    }

    return item.subMenus?.some((sub) => sub.path && pathname === sub.path);
  };

  // =========================================================
  // AUTO OPEN ACTIVE PARENT
  // =========================================================

  useEffect(() => {
    if (!menus.length) return;

    const activeParent = menus.find((item) =>
      item.subMenus?.some((sub) => sub.path && pathname === sub.path),
    );

    if (activeParent) {
      setExpandedMenus((prev) => ({
        ...prev,
        [activeParent.id]: true,
      }));
    }
  }, [pathname, menus]);

  // =========================================================
  // CLICK PARENT
  // =========================================================

  const MENU_TOGGLE_ONLY = ["Master Data", "User Management"];
  const MENU_NO_DROPDOWN = ["Sales Tools KIT"];

  const handleMenuClick = (item) => {
    const hasSubmenu = item.subMenus?.length > 0;

    // =====================================================
    // SALES TOOLS KIT
    // Tidak tampil dropdown submenu.
    // Langsung buka halaman parent.
    // =====================================================
    if (MENU_NO_DROPDOWN.includes(item.name)) {
      if (item.path) {
        navigate(item.path);
      }

      if (window.innerWidth < 1024) {
        setIsOpen(false);
      }

      return;
    }

    // =====================================================
    // MASTER DATA & USER MANAGEMENT
    // Hanya expand / collapse.
    // JANGAN berpindah halaman.
    // =====================================================
    if (MENU_TOGGLE_ONLY.includes(item.name) && hasSubmenu) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));

      return;
    }

    // =====================================================
    // PARENT LAIN YANG PUNYA SUBMENU
    // =====================================================
    if (hasSubmenu) {
      setExpandedMenus((prev) => ({
        ...prev,
        [item.id]: !prev[item.id],
      }));

      if (item.path) {
        navigate(item.path);
      }

      return;
    }

    // =====================================================
    // MENU TANPA SUBMENU
    // =====================================================
    if (item.path) {
      navigate(item.path);
    }

    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // =========================================================
  // CLICK SUBMENU
  // =========================================================

  const handleSubMenuClick = (sub) => {
    if (!sub.path) return;

    navigate(sub.path);

    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  };

  // =========================================================
  // CLICK MAIN MODULE
  // =========================================================

  const handleModuleClick = (moduleId) => {
    setActiveModule(moduleId);

    if (!isOpen) {
      setIsOpen(true);
    }
  };

  return (
    <>
      {/* MOBILE BACKDROP */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
        fixed
        left-0
        top-0
        z-40
        h-screen
        bg-[#f6f6f6]
        transition-all
        duration-300

        ${
          isOpen
            ? "w-[20rem] translate-x-0"
            : "-translate-x-full lg:w-[6.5rem] lg:translate-x-0"
        }
      `}
      >
        <div className="flex flex-col h-full px-4 py-5">
          {/* =================================================
    TOP SECTION
================================================= */}

          <div
            className={`
    mb-3
    flex
    ${isOpen ? "items-center gap-3" : "justify-center"}
  `}
          >
            {/* LOGO BOLDE HUB */}
            <button
              type="button"
              onClick={() => {
                setWorkspaceOpen(false);
                setIsOpen((prev) => !prev);
              }}
              title={isOpen ? "Tutup sidebar" : "Buka sidebar"}
              className={`
      flex
      shrink-0
      items-center
      justify-center
      bg-transparent
      transition-all
      duration-300

      ${isOpen ? "h-[40px] w-[40px]" : "h-12 w-12"}
    `}
            >
              <img
                src={boldeHubLogo}
                alt="BOLDe Hub"
                className={`
        object-contain
        transition-all
        duration-300

        ${isOpen ? "h-9 w-9" : "h-8 w-8"}
      `}
              />
            </button>

            {/* WORKSPACE - HANYA TAMPIL SAAT SIDEBAR OPEN */}
            {isOpen && (
              <div ref={workspaceRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setWorkspaceOpen((prev) => !prev);
                  }}
                  className="flex items-center px-5 text-left transition h-[50px] w-[190px] rounded-2xl bg-[#dedede] hover:bg-[#d5d5d5]"
                >
                  <span className="flex-1 min-w-0 text-base font-semibold truncate text-[#1e293b]">
                    {selectedWorkspace.name}
                  </span>

                  <ChevronDown
                    size={20}
                    className={`
            shrink-0
            transition-transform
            duration-200
            ${workspaceOpen ? "rotate-180" : ""}
          `}
                  />
                </button>

                {/* WORKSPACE DROPDOWN */}
                {workspaceOpen && (
                  <div className="absolute left-0 z-50 p-2 overflow-hidden bg-white border border-gray-200 shadow-xl top-[58px] w-[190px] rounded-2xl">
                    {WORKSPACES.map((workspace) => {
                      const selected = workspace.id === selectedWorkspace.id;

                      return (
                        <button
                          type="button"
                          key={workspace.id}
                          onClick={() => {
                            setSelectedWorkspace(workspace);
                            setWorkspaceOpen(false);
                          }}
                          className={`
                  flex
                  w-full
                  items-center
                  rounded-xl
                  px-3
                  py-2.5
                  text-left
                  transition

                  ${selected ? "bg-brand-soft" : "hover:bg-gray-100"}
                `}
                        >
                          <span
                            className={`
                    text-sm
                    ${
                      selected
                        ? "font-semibold text-brand-primary"
                        : "text-gray-700"
                    }
                  `}
                          >
                            {workspace.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
          {/* =================================================
            NAVIGATION BODY
        ================================================= */}

          <div className="flex flex-1 min-h-0 gap-2 mt-3">
            {/* ===============================================
              BLACK MAIN MODULE RAIL
          =============================================== */}

            <div className="relative flex flex-col items-center py-5 bg-black w-[72px] shrink-0 rounded-t-xl">
              {/* MAIN MODULES */}
              <div className="flex flex-col flex-1 gap-5">
                {MAIN_MODULES.map((module) => {
                  const Icon = module.icon;
                  const active = activeModule === module.id;

                  return (
                    <button
                      type="button"
                      key={module.id}
                      title={module.name}
                      onClick={() => handleModuleClick(module.id)}
                      className={`
                      flex
                      h-10
                      w-10
                      items-center
                      justify-center
                      rounded-xl
                      transition-all
                      duration-200

                      ${
                        active
                          ? "bg-white text-brand-primary"
                          : "text-white hover:bg-white/10"
                      }
                    `}
                    >
                      <Icon size={19} strokeWidth={1.8} />
                    </button>
                  );
                })}
              </div>

              {/* PROFILE */}
              <button
                type="button"
                onClick={() => navigate("/profile")}
                className="flex items-center justify-center w-10 h-10 mt-auto overflow-hidden bg-gray-700 border-2 rounded-full border-white/30"
              >
                {profile?.image_url ? (
                  <img
                    src={profile.image_url}
                    alt="User"
                    className="object-cover w-full h-full"
                  />
                ) : profile?.full_name ? (
                  <span className="font-bold text-white text-[10px]">
                    {getInitials(profile.full_name)}
                  </span>
                ) : (
                  <UserRound size={17} className="text-white" />
                )}
              </button>
            </div>

            {/* ===============================================
              SECONDARY MENU
          =============================================== */}

            <div
              className={`
              bg-[#dedede]
              transition-all
              duration-300

              ${
                isOpen
                  ? "w-[195px] overflow-y-auto px-3 py-7 opacity-100"
                  : "w-0 overflow-hidden px-0 py-7 opacity-0"
              }
            `}
            >
              {/* HOME */}
              {activeModule === "home" && (
                <>
                  <h2 className="px-2 font-semibold text-[15px] text-[#172033]">
                    Home
                  </h2>

                  <nav className="mt-4 space-y-1">
                    {menus.map((item) => {
                      const active = isMenuActive(item);
                      const actualHasSubmenu = item.subMenus?.length > 0;

                      const hideSubmenu = MENU_NO_DROPDOWN.includes(item.name);

                      const hasSubmenu = actualHasSubmenu && !hideSubmenu;

                      const expanded = !!expandedMenus[item.id];

                      return (
                        <React.Fragment key={item.id}>
                          {/* PARENT MENU */}
                          <button
                            type="button"
                            onClick={() => handleMenuClick(item)}
                            className={`
                            flex
                            w-full
                            items-center
                            justify-between
                            gap-2
                            rounded-lg
                            px-2.5
                            py-2
                            text-left
                            transition

                            ${
                              active
                                ? "text-brand-primary"
                                : "text-[#666] hover:bg-white/50 hover:text-[#222]"
                            }
                          `}
                          >
                            <div className="flex items-center flex-1 min-w-0 gap-3">
                              {/* ICON */}
                              {item.icon ? (
                                <img
                                  src={item.icon}
                                  alt={item.name}
                                  className={`
                                  h-[18px]
                                  w-[18px]
                                  shrink-0
                                  object-contain

                                  ${active ? "" : "grayscale"}
                                `}
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";
                                  }}
                                />
                              ) : (
                                <div
                                  className={`
                                  h-[16px]
                                  w-[16px]
                                  shrink-0
                                  rounded-sm

                                  ${active ? "bg-brand-primary" : "bg-[#777]"}
                                `}
                                />
                              )}

                              <span
                                className={`
                                truncate
                                text-xs

                                ${active ? "font-medium" : "font-normal"}
                              `}
                              >
                                {item.name}
                              </span>
                            </div>

                            {hasSubmenu && (
                              <ChevronDown
                                size={14}
                                className={`
                                shrink-0
                                transition-transform
                                duration-200

                                ${expanded ? "rotate-180" : ""}
                              `}
                              />
                            )}
                          </button>

                          {/* SUBMENU */}
                          {hasSubmenu && expanded && (
                            <div className="mt-1 space-y-1 ml-7">
                              {item.subMenus.map((sub) => {
                                const subActive =
                                  sub.path && pathname === sub.path;

                                return (
                                  <button
                                    type="button"
                                    key={sub.id}
                                    onClick={() => handleSubMenuClick(sub)}
                                    className={`
                                    block
                                    w-full
                                    rounded-md
                                    px-2
                                    py-1.5
                                    text-left
                                    text-[11px]
                                    transition

                                    ${
                                      subActive
                                        ? "font-semibold text-brand-primary"
                                        : "text-gray-500 hover:bg-white/40 hover:text-brand-primary"
                                    }
                                  `}
                                  >
                                    {sub.name}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </nav>
                </>
              )}

              {/* COMMUNICATION */}
              {activeModule === "communication" && (
                <>
                  <h2 className="px-2 font-semibold text-[15px] text-[#172033]">
                    Communication
                  </h2>

                  <div className="px-2 mt-4">
                    <p className="text-xs leading-5 text-gray-500">
                      Menu communication belum tersedia dari API.
                    </p>
                  </div>
                </>
              )}

              {/* WORK */}
              {activeModule === "work" && (
                <>
                  <h2 className="px-2 font-semibold text-[15px] text-[#172033]">
                    Work
                  </h2>

                  <div className="px-2 mt-4">
                    <p className="text-xs leading-5 text-gray-500">
                      Menu work belum tersedia dari API.
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
