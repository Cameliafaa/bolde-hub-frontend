import { useLocation } from "react-router-dom";

export default function usePermission(overrideSubMenuName) {
  const { pathname } = useLocation();
  const userData = JSON.parse(localStorage.getItem("userData"));

  const defaultPerm = {
    can_create: false,
    can_read: false,
    can_update: false,
    can_delete: false,
  };

  if (!userData) return defaultPerm;

  const accessList = userData.role?.access || [];

  // ======================================================
  // 1️⃣ PRIORITAS: OVERRIDE SUBMENU (AMAN, OPSIONAL)
  // ======================================================
  if (overrideSubMenuName) {
    const submenu = accessList
      .flatMap((menu) => menu.sub_menus || [])
      .find(
        (sm) => sm.name?.toLowerCase() === overrideSubMenuName.toLowerCase(),
      );

    if (submenu) {
      return {
        can_create: submenu.permissions?.can_create ?? false,
        can_read: submenu.permissions?.can_read ?? false,
        can_update: submenu.permissions?.can_update ?? false,
        can_delete: submenu.permissions?.can_delete ?? false,
      };
    }
  }

  // ======================================================
  // 2️⃣ LOGIC LAMA (TIDAK DIUBAH)
  // ======================================================
  for (const menu of accessList) {
    if (Array.isArray(menu.sub_menus)) {
      for (const sm of menu.sub_menus) {
        if (sm.url && pathname.startsWith(sm.url)) {
          return {
            can_create:
              sm.permissions?.can_create ??
              menu.permissions?.can_create ??
              false,
            can_read:
              sm.permissions?.can_read ?? menu.permissions?.can_read ?? false,
            can_update:
              sm.permissions?.can_update ??
              menu.permissions?.can_update ??
              false,
            can_delete:
              sm.permissions?.can_delete ??
              menu.permissions?.can_delete ??
              false,
          };
        }
      }
    }
  }

  // ======================================================
  // 3️⃣ FALLBACK MENU UTAMA (LAMA)
  // ======================================================
  const menuMatch = accessList.find((m) => m.url && pathname.startsWith(m.url));

  if (menuMatch) {
    return {
      can_create: menuMatch.permissions?.can_create ?? false,
      can_read: menuMatch.permissions?.can_read ?? false,
      can_update: menuMatch.permissions?.can_update ?? false,
      can_delete: menuMatch.permissions?.can_delete ?? false,
    };
  }

  return defaultPerm;
}
