import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../../services/apiRequest";

const ProductEditModal = ({ open, onClose, onSuccess, data }) => {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    product_code: "",
    product_name: "",
    price: "",
    loading: false,
  });

  const [error, setError] = useState("");

  const fetchCategories = async () => {
    const res = await ApiRequest({ url: "/categories", method: "GET" });
    setCategories(res?.data || []);
  };

  useEffect(() => {
    if (open && data) {
      fetchCategories();
      setForm({
        category_id: data.category_id || "",
        product_code: data.product_code || "",
        product_name: data.product_name || "",
        price: data.price || "",
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
    if (
      !form.category_id ||
      !form.product_code.trim() ||
      !form.product_name.trim() ||
      !form.price
    ) {
      setError("All fields are required");
      return;
    }

    setForm((f) => ({ ...f, loading: true }));

    try {
      const res = await ApiRequest({
        url: `/products/${data.product_id}`,
        method: "PUT",
        data: {
          category_id: Number(form.category_id),
          product_code: form.product_code,
          product_name: form.product_name,
          price: Number(form.price),
        },
      });

      if (res?.status === "success") {
        onSuccess?.();
        onClose();
      } else {
        setError(res?.message || "Failed to update product");
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
            Edit Product
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
          <select
            name="category_id"
            value={form.category_id}
            onChange={handleChange}
            className="w-full p-4 border rounded-2xl"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.category_name}
              </option>
            ))}
          </select>

          <input
            name="product_code"
            value={form.product_code}
            onChange={handleChange}
            placeholder="Product Code"
            className="w-full p-4 border rounded-2xl"
          />

          <input
            name="product_name"
            value={form.product_name}
            onChange={handleChange}
            placeholder="Product Name"
            className="w-full p-4 border rounded-2xl"
          />

          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            placeholder="Price"
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

export default ProductEditModal;
