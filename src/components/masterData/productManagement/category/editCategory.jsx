import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../../services/apiRequest";

const CategoryEditModal = ({ open, onClose, onSuccess, data }) => {
  const [form, setForm] = useState({
    category_code: "",
    category_name: "",
    description: "",
    loading: false,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (open && data) {
      setForm({
        category_code: data.category_code || "",
        category_name: data.category_name || "",
        description: data.description || "",
        loading: false,
      });
      setError("");
    }
  }, [open, data]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.category_code.trim() || !form.category_name.trim()) {
      setError("Category Code and Category Name are required");
      return;
    }

    setForm((f) => ({ ...f, loading: true }));

    try {
      const res = await ApiRequest({
        url: `/categories/${data.category_id}`,
        method: "PUT",
        data: {
          category_code: form.category_code,
          category_name: form.category_name,
          description: form.description,
        },
      });

      if (res?.status === "success") {
        onSuccess?.();
        onClose();
      } else {
        setError(res?.message || "Failed to update category");
      }
    } catch (e) {
      setError(e?.message || "Terjadi kesalahan pada server.");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
    }
  };

  if (!open) return null;

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
            Edit Category
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="space-y-4">
          <input
            name="category_code"
            value={form.category_code}
            onChange={handleChange}
            placeholder="Category Code"
            className="w-full p-4 border rounded-2xl"
          />
          <input
            name="category_name"
            value={form.category_name}
            onChange={handleChange}
            placeholder="Category Name"
            className="w-full p-4 border rounded-2xl"
          />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Description"
            rows={3}
            className="w-full p-4 border rounded-2xl"
          />
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

export default CategoryEditModal;
