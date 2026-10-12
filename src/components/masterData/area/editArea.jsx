import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import MultiSelectDropdown from "../../common/multiSelectDropdown";

const AreaEditModal = ({ open, onClose, area, onSuccess }) => {
  const [form, setForm] = useState({
    provinces: [], // 🔥 array of { id, name }
    name: "",
    area_code: "",
    loading: false,
  });

  const [provinceOptions, setProvinceOptions] = useState([]);
  const [error, setError] = useState("");

  /* =========================
     FETCH PROVINCES
  ========================= */
  useEffect(() => {
    if (!open) return;

    const fetchProvinces = async () => {
      const res = await ApiRequest({
        url: "/areas/all?page=1&limit=100",
        method: "GET",
      });

      const provinces =
        res.data?.flatMap((area) =>
          area.provinces.map((p) => ({
            id: p.province_id,
            name: p.name,
          }))
        ) || [];

      setProvinceOptions(provinces);

      // set default selected
      if (area?.provinces?.length) {
        const selected = provinces.filter((opt) =>
          area.provinces.some((ap) => ap.province_id === opt.id)
        );
        setForm((f) => ({ ...f, provinces: selected }));
      }
    };

    fetchProvinces();
  }, [open, area]);

  /* =========================
     SET FORM FROM AREA
  ========================= */
  useEffect(() => {
    if (open && area) {
      setForm((f) => ({
        ...f,
        name: area.name || "",
        area_code: area.area_code || "",
        loading: false,
      }));
      setError("");
    }
  }, [open, area]);

  const handleSubmit = async () => {
    if (!form.name.trim()) return setError("Area name is required");

    setForm((f) => ({ ...f, loading: true }));
    setError("");

    try {
      const res = await ApiRequest({
        url: `/areas/update/${area.area_id}`,
        method: "PUT",
        data: {
          name: form.name,
          area_code: form.area_code,
          province_ids: form.provinces.map((p) => p.id), // ✅ MULTI
        },
      });

      if (res.status === "success") {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to update area");
      }
    } catch (e) {
      setError("Error updating area");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
    }
  };

  if (!open || !area) return null;

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
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Edit Province
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium mb-3">
            {error}
          </p>
        )}

        <div className="space-y-4 flex-1 overflow-y-auto">
          {/* 🔥 MULTI PROVINCE */}
          <MultiSelectDropdown
            label="Province"
            placeholder="Select Province"
            options={provinceOptions}
            values={form.provinces}
            searchable
            onChange={(vals) =>
              setForm((f) => ({ ...f, provinces: vals }))
            }
          />

          {/* AREA CODE */}
          <div>
            <label className="text-gray-600 font-semibold">
              Area Code
            </label>
            <input
              type="text"
              value={form.area_code}
              onChange={(e) =>
                setForm((f) => ({ ...f, area_code: e.target.value }))
              }
              className="w-full p-4 border border-gray-200 rounded-2xl"
            />
          </div>

          {/* AREA NAME */}
          <div>
            <label className="text-gray-600 font-semibold">
              Area Name
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) =>
                setForm((f) => ({ ...f, name: e.target.value }))
              }
              className="w-full p-4 border border-gray-200 rounded-2xl"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 gap-3 pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={form.loading}
            className="bg-[#002D62] text-white px-6 py-2 rounded-lg"
          >
            {form.loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AreaEditModal;
