import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const AccessEditModal = ({
  open,
  onClose,
  onSave,
  roleName,
  menus,
  roleCategories = [],
  roleCategoryId,
  onChangeRoleCategory,
}) => {
  const [permissions, setPermissions] = useState([]);

  useEffect(() => {
    if (menus?.length > 0) {
      const mapped = menus.map((m) => ({
        id: m.id || null,
        menu_id: m.menu_id,
        sub_menu_id: m.sub_menu_id ?? null,
        name: m.name,
        canView: m.canView ?? false,
        canCreate: m.canCreate ?? false,
        canEdit: m.canEdit ?? false,
        canDelete: m.canDelete ?? false,
      }));

      setPermissions(mapped);
    } else {
      setPermissions([]);
    }
  }, [menus]);

  const handleToggle = (rowIndex, key) => {
    setPermissions((prev) =>
      prev.map((item, index) =>
        index === rowIndex ? { ...item, [key]: !item[key] } : item,
      ),
    );
  };

  const handleSave = () => {
    if (!roleCategoryId) {
      alert("Category Role wajib dipilih");
      return;
    }

    onSave(permissions);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl sm:max-w-lg rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            Edit Access - {roleName}
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-5">
          <label className="block mb-1 text-sm font-medium text-gray-700">
            Category Role
          </label>

          <select
            className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            value={roleCategoryId || ""}
            onChange={(e) => onChangeRoleCategory?.(e.target.value)}
          >
            <option value="">Pilih Category Role</option>
            {roleCategories.map((item) => (
              <option key={item.role_category_id} value={item.role_category_id}>
                {item.role_category_name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden overflow-y-auto border rounded-lg sm:block max-h-[500px]">
          <table className="w-full text-sm min-w-max">
            <thead className="sticky top-0 z-10 text-left text-gray-700 bg-gray-100">
              <tr>
                <th className="px-5 py-3 font-medium w-[260px]">Nama Menu</th>
                <th className="px-5 py-3 font-medium text-center">View</th>
                <th className="px-5 py-3 font-medium text-center">Create</th>
                <th className="px-5 py-3 font-medium text-center">Edit</th>
                <th className="px-5 py-3 font-medium text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {permissions.map((menu, index) => (
                <tr
                  key={`${menu.menu_id}-${menu.sub_menu_id ?? "root"}-${index}`}
                  className="transition border-t hover:bg-gray-50"
                >
                  <td className="px-5 py-3 font-medium text-gray-700">
                    {menu.name}
                  </td>

                  {["canView", "canCreate", "canEdit", "canDelete"].map(
                    (key) => (
                      <td key={key} className="px-5 py-3 text-center">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={menu[key]}
                            onChange={() => handleToggle(index, key)}
                            className="sr-only peer"
                          />
                          <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-5 after:absolute after:top-[2px] after:left-[2px] after:bg-white after:w-4 after:h-4 after:rounded-full after:transition-all peer-checked:bg-blue-600" />
                        </label>
                      </td>
                    ),
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto sm:hidden">
          {permissions.map((menu, index) => (
            <div
              key={`${menu.menu_id}-${menu.sub_menu_id ?? "root"}-${index}`}
              className="p-4 border rounded-xl bg-gray-50"
            >
              <p className="mb-3 text-sm font-semibold text-gray-700">
                {menu.name}
              </p>

              <div className="grid grid-cols-2 gap-3 text-sm">
                {[
                  ["View", "canView"],
                  ["Create", "canCreate"],
                  ["Edit", "canEdit"],
                  ["Delete", "canDelete"],
                ].map(([label, key]) => (
                  <label
                    key={key}
                    className="flex items-center justify-between"
                  >
                    <span>{label}</span>
                    <input
                      type="checkbox"
                      checked={menu[key]}
                      onChange={() => handleToggle(index, key)}
                      className="w-4 h-4"
                    />
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="sticky bottom-0 flex justify-end pt-4 mt-4 bg-white border-t">
          <button
            onClick={handleSave}
            type="button"
            className="w-full px-6 py-3 font-medium text-white sm:w-auto rounded-2xl bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessEditModal;
