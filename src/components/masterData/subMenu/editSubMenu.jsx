import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";

const EditSubMenuModal = ({ open, onClose, onSuccess, menus, data }) => {
  const [form, setForm] = useState({
    menu_id: "",
    name: "",
    url: "",
    order_no: "",
    is_active: "true",
  });

  const [menuValue, setMenuValue] = useState(null);
  const [icon, setIcon] = useState(null);
  const [iconPreview, setIconPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  /* ===================================================== */
  /* PREFILL DATA                                          */
  /* ===================================================== */
  useEffect(() => {
    if (!data) return;

    setForm({
      menu_id: data.menuId,
      name: data.name || "",
      url: data.url || "",
      order_no: data.orderNo || "",
      is_active: String(data.isActive),
    });

    const selectedMenu = menus.find(m => m.menu_id === data.menuId);
    if (selectedMenu) {
      setMenuValue({
        id: selectedMenu.menu_id,
        name: selectedMenu.name,
      });
    }

    setIcon(null);
    setIconPreview(data.icon_url || null);
  }, [data, menus]);

  if (!open || !data) return null;

  /* ===================================================== */
  /* HELPERS                                               */
  /* ===================================================== */
  const isSalesToolsKit = (menus, menuId) => {
    const m = menus.find(x => x.menu_id === menuId);
    return m?.name?.toLowerCase() === "sales tools kit";
  };

  const getItemCategoryIdFromUrl = (url) => {
    const match = url?.match(/\/sales-tools\/(\d+)/);
    return match ? match[1] : null;
  };

  const handleInput = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
  };

  const resetForm = () => {
    setIcon(null);
    setIconPreview(null);
    setLoading(false);
  };

  const extractItemCategoryId = (url) => {
    const match = url?.match(/\/sales-tools\/(\d+)/);
    return match ? match[1] : null;
  };


  /* ===================================================== */
  /* SUBMIT                                                */
  /* ===================================================== */
  const handleSubmit = async () => {
    if (!form.menu_id || !form.name.trim()) {
      alert("Menu & Name wajib diisi");
      return;
    }

    setLoading(true);

    try {
      /* =========================
         1. UPDATE SUB MENU
      ========================= */
      const fd = new FormData();
      fd.append("menu_id", String(form.menu_id));
      fd.append("name", form.name);
      fd.append("url", form.url || "");
      fd.append("order_no", String(form.order_no || 0));
      fd.append("is_active", String(form.is_active));
      if (icon) fd.append("icon", icon);

      await ApiRequest({
        url: `/sub-menus/${data.id}`,
        method: "PUT",
        data: fd,
        isFormData: true,
      });

      /* =========================
         2. SALES TOOLS KIT SYNC
      ========================= */
      if (isSalesToolsKit(menus, form.menu_id)) {
        const itemCategoryId = extractItemCategoryId(form.url);

        const catFd = new FormData();
        catFd.append("name", form.name);
        catFd.append("description", form.name);
        if (icon) catFd.append("image", icon);

        // 🟢 UPDATE ITEM CATEGORY
        if (itemCategoryId) {
          await ApiRequest({
            url: `/item-categories/update/${itemCategoryId}`,
            method: "PUT",
            data: catFd,
            isFormData: true,
          });
        }
        // 🟡 CREATE ITEM CATEGORY (kalau belum ada)
        else {
          await ApiRequest({
            url: "/item-categories/create",
            method: "POST",
            data: catFd,
            isFormData: true,
          });
        }
      }

      onSuccess();
      onClose();

    } catch (err) {
      console.error("EDIT SUB MENU ERROR:", err);
      alert("Gagal update Sub Menu");
    } finally {
      setLoading(false);
    }
  };

  /* ===================================================== */
  /* DROPDOWN MENU FILTER                                  */
  /* ===================================================== */
  const ALLOWED_MENU_IDS = [4, 6, 7]; // Sales Tools, Master Data, User Management

  const menuOptions = (menus || [])
    .filter(m => ALLOWED_MENU_IDS.includes(m.menu_id))
    .map(m => ({
      id: m.menu_id,
      name: m.name,
    }));

  /* ===================================================== */
  /* RENDER                                                */
  /* ===================================================== */
  return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
            <div
                className="
    bg-white
    w-full
    sm:max-w-lg

    rounded-t-3xl sm:rounded-2xl
    shadow-xl
    relative

    p-6 sm:p-8

    max-h-[95vh]
    overflow-y-auto

    animate-slideUpMobile
    sm:animate-none
  "
            >
        <div
          className="
    flex items-center justify-between
    mb-4
    sticky top-0
    bg-white
    z-20
    pb-3
    border-b
  "
        >
          <h2 className="text-lg sm:text-2xl font-semibold text-gray-800">
            Edit Sub Menu
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
                setForm(p => ({ ...p, menu_id: opt.id }));
              }}
            />
          </div>

          <div>
            <label className="text-[#6B7280] font-semibold">Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleInput}
              className="w-full p-4 border rounded-2xl"
            />
          </div>

          <div>
            <label className="text-[#6B7280] font-semibold">URL</label>
            <input
              name="url"
              value={form.url}
              onChange={handleInput}
              className="w-full p-4 border rounded-2xl"
            />
          </div>

          <div>
            <label className="text-[#6B7280] font-semibold">Order No</label>
            <input
              type="number"
              name="order_no"
              value={form.order_no}
              onChange={handleInput}
              className="w-full p-4 border rounded-2xl"
            />
          </div>

          <div>
            <label className="text-[#6B7280] font-semibold">Status</label>
            <select
              name="is_active"
              value={form.is_active}
              onChange={handleInput}
              className="w-full p-4 border rounded-2xl"
            >
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>
          </div>

          {/* ICON */}
          <div className="col-span-2">
            <label className="text-[#6B7280] font-semibold">Upload Icon</label>
            <div
              className="w-full h-48 border-2 border-dashed rounded-xl bg-[#F6F9FF]
                         flex items-center justify-center cursor-pointer mt-2"
              onClick={() => document.getElementById("iconEditUpload").click()}
            >
              {!iconPreview ? (
                <p>Upload icon here</p>
              ) : (
                <img src={iconPreview} className="h-full object-contain" />
              )}
              <input
                id="iconEditUpload"
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
            className="bg-[#002D62] text-white px-6 py-2 rounded-lg"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSubMenuModal;
