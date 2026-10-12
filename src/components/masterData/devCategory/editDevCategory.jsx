import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const DevelopmentCategoryEditModal = ({
  open,
  onClose,
  onSuccess,
  category,
}) => {
  const [form, setForm] = useState({
    name: "",
    description: "",
    loading: false,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (open && category) {
      setForm({
        name: category.name || "",
        description:
          category.original?.description ??
          (category.description === "-" ? "" : category.description || ""),
        loading: false,
      });

      setError("");
    }
  }, [open, category]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Development category name is required");
      return;
    }

    if (!category?.id) {
      setError("Development category not found");
      return;
    }

    setForm((prev) => ({
      ...prev,
      loading: true,
    }));

    setError("");

    try {
      const res = await ApiRequest({
        url: `/development-categories/update/${category.id}`,
        method: "PUT",
        data: {
          name: form.name.trim(),
          description: form.description.trim(),
        },
      });

      if (res.status === "success") {
        onSuccess?.();
        onClose();
      } else {
        setError(res.message || "Failed to update development category");
      }
    } catch (e) {
      const msg = e.message?.toLowerCase().includes("network")
        ? "Tidak dapat terhubung ke server."
        : e.message || "Terjadi kesalahan pada server.";

      setError(msg);
    } finally {
      setForm((prev) => ({
        ...prev,
        loading: false,
      }));
    }
  };

  const handleClose = () => {
    setForm({
      name: "",
      description: "",
      loading: false,
    });

    setError("");
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl sm:max-w-lg rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        {/* HEADER */}
        <div className="sticky top-0 z-20 flex items-center justify-between pb-3 mb-4 bg-white border-b ">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
            Edit Development Category
          </h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {/* ERROR */}
        {error && (
          <p className="mb-3 text-sm font-medium text-red-600">{error}</p>
        )}

        {/* FORM */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          <div>
            <label className="font-semibold text-[#6B7280]">
              Development Category Name
            </label>

            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter development category name"
              className={`w-full p-4 bg-white border ${
                error && !form.name.trim()
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-200 focus:ring-[#002D62]"
              } rounded-2xl shadow-sm text-gray-800 font-medium focus:ring-2 focus:border-[#002D62] focus:outline-none placeholder:text-gray-400`}
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">Description</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              rows={3}
              className="w-full p-4 font-medium text-gray-800 bg-white border border-gray-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-[#002D62] focus:border-[#002D62] focus:outline-none placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end gap-3 pt-4 mt-6 border-t">
          <button
            onClick={handleSubmit}
            disabled={form.loading}
            className="px-6 py-2 text-white rounded-lg bg-[#002D62] hover:opacity-90 disabled:opacity-60"
          >
            {form.loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DevelopmentCategoryEditModal;
