import React, { useEffect, useState } from "react";
import { X } from "lucide-react";

const AccessCategoryModal = ({ open, onClose, onSave, data }) => {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    if (open) {
      setCategoryName(data?.name || "");
    } else {
      setCategoryName("");
    }
  }, [open, data]);

  const handleSave = () => {
    if (!categoryName.trim()) {
      alert("Category Role wajib diisi");
      return;
    }

    const payload = {
      role_category_name: categoryName.trim(),
    };

    onSave(payload);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl sm:max-w-lg rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        <div className="sticky top-0 z-10 flex items-center justify-between mb-4 bg-white">
          <h2 className="text-xl font-semibold text-gray-800">
            {data ? "Edit Access Category" : "Add Access Category"}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 mb-6">
          <div>
            <label className="block mb-1 text-sm font-medium">
              Category Role
            </label>

            <input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="Masukkan category role"
              className="w-full px-3 py-2 text-sm border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
            />
          </div>
        </div>

        <div className="sticky bottom-0 flex justify-end pt-4 mt-4 bg-white border-t">
          <button
            type="button"
            onClick={handleSave}
            className="w-full px-6 py-3 text-white sm:w-auto rounded-2xl bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccessCategoryModal;
