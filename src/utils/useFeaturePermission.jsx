import { useMemo } from "react";

export default function useFeaturePermission(ownerMenuName) {
  const userData = JSON.parse(localStorage.getItem("userData"));

  const defaultPerm = {
    can_create: false,
    can_read: false,
    can_update: false,
    can_delete: false,
  };

  return useMemo(() => {
    if (!userData || !ownerMenuName) return defaultPerm;

    const accessList = userData.role?.access || [];

    // 1. cari menu utama
    const menu = accessList.find(
      (m) => m.name?.toLowerCase() === ownerMenuName.toLowerCase(),
    );

    if (menu) {
      return {
        can_create: menu.permissions?.can_create ?? false,
        can_read: menu.permissions?.can_read ?? false,
        can_update: menu.permissions?.can_update ?? false,
        can_delete: menu.permissions?.can_delete ?? false,
      };
    }

    // 2. fallback: cari dari submenu kalau ternyata owner-nya submenu
    const submenu = accessList
      .flatMap((menu) => menu.sub_menus || [])
      .find((sm) => sm.name?.toLowerCase() === ownerMenuName.toLowerCase());

    if (submenu) {
      return {
        can_create: submenu.permissions?.can_create ?? false,
        can_read: submenu.permissions?.can_read ?? false,
        can_update: submenu.permissions?.can_update ?? false,
        can_delete: submenu.permissions?.can_delete ?? false,
      };
    }

    return defaultPerm;
  }, [ownerMenuName, userData]);
}
