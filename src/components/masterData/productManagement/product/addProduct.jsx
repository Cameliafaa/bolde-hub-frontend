import React, { useEffect, useState } from "react";
import axios from "axios";
import { X } from "lucide-react";
import { ApiRequest } from "../../../../services/apiRequest";

const ProductAddModal = ({ open, onClose, onSuccess }) => {
    const [categories, setCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);

    const [form, setForm] = useState({
        category_id: "",
        product_code: "",
        product_name: "",
        price: "",
        loading: false,
    });

    const [error, setError] = useState("");
    /* ================= FETCH CATEGORY ================= */
    const fetchCategories = async () => {
        const res = await ApiRequest({ url: "/categories", method: "GET" });
        setCategories(res?.data || []);
    };

    useEffect(() => {
        if (open) {
            fetchCategories();
        }
    }, [open]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError("");
    };

    /* ================= ADD MANUAL ================= */
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
                url: "/products",
                method: "POST",
                data: {
                    category_id: Number(form.category_id),
                    product_code: form.product_code,
                    product_name: form.product_name,
                    price: Number(form.price),
                },
            });

            if (res?.status === "success") {
                resetForm();
                onSuccess?.();
                onClose();
            } else {
                setError(res?.message || "Failed to add product");
            }
        } catch (e) {
            setError("Server error.");
        } finally {
            setForm((f) => ({ ...f, loading: false }));
        }
    };

    /* ================= IMPORT EXCEL ================= */
    const handleImportExcel = async () => {
        if (!selectedFile) {
            setError("Please select an Excel file first.");
            return;
        }

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            setForm((f) => ({ ...f, loading: true }));

            const res = await axios.post(
                process.env.REACT_APP_API_BASE_URL + "/products/import",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            if (res.data?.status === "success") {
                resetForm();
                onSuccess?.();
                onClose();
            } else {
                setError(res.data?.message || "Import failed.");
            }
        } catch (err) {
            console.error(err);
            setError("Failed to import Excel.");
        } finally {
            setForm((f) => ({ ...f, loading: false }));
        }
    };

    /* ================= TEMPLATE DOWNLOAD (OPTIONAL) ================= */
    const handleDownloadTemplate = () => {
        const link = document.createElement("a");
        link.href = "/templates/TEMPLATE UPLOAD PRODUCT.xlsx";
        link.download = "TEMPLATE UPLOAD PRODUCT.xlsx";
        link.click();
    };


    const resetForm = () => {
        setForm({
            category_id: "",
            product_code: "",
            product_name: "",
            price: "",
            loading: false,
        });
        setSelectedFile(null);
        setError("");
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
                        Add Product
                    </h2>

                    <button
                        onClick={() => {
                            resetForm();
                            onClose();
                        }}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        <X size={22} />
                    </button>
                </div>
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                {/* ================= IMPORT SECTION ================= */}
                <div className="mb-6">
                    <label className="text-[#6B7280] font-semibold">
                        Import from Excel
                    </label>

                    <input
                        type="file"
                        accept=".xlsx"
                        onChange={(e) => setSelectedFile(e.target.files[0])}
                        className="w-full p-3 border rounded-xl mt-2"
                    />

                    <div className="flex justify-end gap-3 mt-3">
                        <button
                            onClick={handleDownloadTemplate}
                            className="bg-blue-600 text-white px-5 py-2 rounded-xl"
                        >
                            Download Template
                        </button>

                        <button
                            onClick={handleImportExcel}
                            disabled={form.loading}
                            className="bg-[#002D62] text-white px-5 py-2 rounded-xl"
                        >
                            Import Excel
                        </button>
                    </div>
                </div>

                {/* ================= MANUAL FORM ================= */}
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
                        className="bg-[#002D62] text-white px-6 py-2 rounded-xl"
                    >
                        {form.loading ? "Saving..." : "Save Product"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductAddModal;
