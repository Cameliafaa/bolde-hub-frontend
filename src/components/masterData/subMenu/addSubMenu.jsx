import React, { useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";

const AddSubMenuModal = ({ open, onClose, onSuccess, menus }) => {
  const [form, setForm] = useState({
    menu_id: "",
    name: "",
    url: "",
    order_no: "",
  });

  const [menuValue, setMenuValue] = useState(null);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setForm({
      menu_id: "",
      name: "",
      url: "",
      order_no: "",
    });
    setMenuValue(null);
    setIcon(null);
    setIconPreview(null);
    setLoading(false);
  };

  const isSalesToolsKit = (menus, menuId) => {
    const m = menus.find((x) => x.menu_id === menuId);
    return m?.name?.toLowerCase() === "sales tools kit";
  };

  const handleSubmit = async () => {
    if (!form.menu_id || !form.name.trim()) {
      alert("Menu & Name wajib diisi");
      return;
    }

    setLoading(true);

    try {
      // =========================
      // 1. CREATE SUB MENU (SELALU)
      // =========================
      const fd = new FormData();
      fd.append("menu_id", String(form.menu_id));
      fd.append("name", form.name);
      fd.append("url", form.url || "");
      fd.append("order_no", String(form.order_no || 0));
      fd.append("is_active", "1");
      if (icon) fd.append("icon", icon);

      const subMenuRes = await ApiRequest({
        url: "/sub-menus",
        method: "POST",
        data: fd,
        isFormData: true,
      });

      // =========================
      // 2. CREATE ITEM CATEGORY (KHUSUS SALES TOOLS)
      // =========================
      if (isSalesToolsKit(menus, form.menu_id)) {
        const catFd = new FormData();
        catFd.append("name", form.name);
        catFd.append("description", form.name);
        if (icon) catFd.append("image", icon); // ⬅️ SESUAI POSTMAN

        const catRes = await ApiRequest({
          url: "/item-categories/create",
          method: "POST",
          data: catFd,
          isFormData: true,
        });
      }

      onSuccess();
      resetForm();
      onClose();
    } catch (err) {
      console.error("ADD SUBMENU ERROR:", err);
      alert(err?.message || "Gagal membuat Sub Menu");
    } finally {
      setLoading(false);
    }
  };

  const ALLOWED_MENU_IDS = [4, 6, 7];

  const menuOptions = (menus || [])
    .filter((m) => ALLOWED_MENU_IDS.includes(m.menu_id))
    .map((m) => ({
      id: m.menu_id,
      name: m.name,
    }));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div
        className="relative w-full p-6 overflow-y-auto bg-white shadow-xl  sm:max-w-lg rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none"
      >
        <div
          className="sticky top-0 z-20 flex items-center justify-between pb-3 mb-4 bg-white border-b "
        >
          <h2 className="text-lg font-semibold text-gray-800 sm:text-2xl">
            Add Sub Menu
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* MENU */}
          <div className="col-span-2">
            <CustomDropdown
              label="Menu"
              placeholder="Select Menu"
              options={menuOptions}
              searchable
              value={menuValue}
              onChange={(opt) => {
                setMenuValue(opt);
                setForm((p) => ({ ...p, menu_id: opt.id }));
              }}
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleInput}
              placeholder="Position"
              className="w-full p-4 border rounded-2xl"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">URL</label>
            <input
              name="url"
              value={form.url}
              onChange={handleInput}
              placeholder="/position"
              className="w-full p-4 border rounded-2xl"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">Order No</label>
            <input
              name="order_no"
              value={form.order_no}
              onChange={handleInput}
              className="w-full p-4 border rounded-2xl"
            />
          </div>

          {/* ICON */}
          <div className="col-span-2">
            <label className="font-semibold text-[#6B7280]">Upload Icon</label>
            <div
              className="flex items-center justify-center w-full h-48 mt-2 border-2 border-dashed cursor-pointer rounded-xl bg-[#F6F9FF]"
              onClick={() => document.getElementById("iconUpload").click()}
            >
              {!iconPreview ? (
                <p>Upload icon here</p>
              ) : (
                <img src={iconPreview} className="object-contain h-full" />
              )}
              <input
                id="iconUpload"
                type="file"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setIcon(file);
                  setIconPreview(URL.createObjectURL(file));
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-2 text-white rounded-lg bg-[#002D62]"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubMenuModal;
