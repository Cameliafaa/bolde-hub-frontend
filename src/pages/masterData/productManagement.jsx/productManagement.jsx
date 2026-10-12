import React, { useEffect, useState } from "react";
import { Search, Plus } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import Tabs from "../../../components/common/tabs";
import ConfirmDeleteModal from "../../../components/common/ConfirmDeleteModal";
import Pagination from "../../../components/common/pagination";
import InlineSuccess from "../../../components/common/inlineSuccess";

// CATEGORY
import CategoryManagement from "./categoryManagement";
import CategoryEditModal from "../../../components/masterData/productManagement/category/editCategory";
import CategoryAddModal from "../../../components/masterData/productManagement/category/addCategory";

// PRODUCT
import EditIcon from "../../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../../assets/images/icons/deleteIcon.png";
import ProductAddModal from "../../../components/masterData/productManagement/product/addProduct";
import ProductEditModal from "../../../components/masterData/productManagement/product/editProduct";

const ProductManagement = () => {
    /* ================= TAB ================= */
    const [activeTab, setActiveTab] = useState("category");

    /* ================= SHARED ================= */
    const [search, setSearch] = useState("");
    const [selectedData, setSelectedData] = useState(null);
    const [showDelete, setShowDelete] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    /* ================= CATEGORY ================= */
    const [categories, setCategories] = useState([]);
    const [loadingCategory, setLoadingCategory] = useState(false);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showEditCategory, setShowEditCategory] = useState(false);
    const [categoryPage, setCategoryPage] = useState(1);
    const [categoryTotal, setCategoryTotal] = useState(1);

    /* ================= PRODUCT ================= */
    const [products, setProducts] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(false);
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [showEditProduct, setShowEditProduct] = useState(false);
    const [productPage, setProductPage] = useState(1);
    const [productTotal, setProductTotal] = useState(1);

    const limit = 10;

    /* ================= FETCH CATEGORY ================= */
    const fetchCategories = async () => {
        setLoadingCategory(true);
        try {
            const res = await ApiRequest({
                url: "/categories",
                method: "GET",
                params: {
                    page: categoryPage,
                    limit,
                    search,
                },
            });

            setCategories(res?.data || []);
            setCategoryTotal(res?.meta?.total_page || 1);
        } finally {
            setLoadingCategory(false);
        }
    };

    /* ================= FETCH PRODUCT ================= */
    const fetchProducts = async () => {
        setLoadingProduct(true);
        try {
            const res = await ApiRequest({
                url: "/products",
                method: "GET",
                params: {
                    page: productPage,
                    limit,
                    search,
                },
            });

            setProducts(res?.data || []);
            setProductTotal(res?.meta?.total_page || 1);
        } finally {
            setLoadingProduct(false);
        }
    };

    /* ================= EFFECT ================= */
    useEffect(() => {
        if (activeTab === "category") {
            fetchCategories();
        }
    }, [activeTab, categoryPage, search]);

    useEffect(() => {
        if (activeTab === "product") {
            fetchProducts();
        }
    }, [activeTab, productPage, search]);

    /* ================= DELETE ================= */
    const handleConfirmDelete = async () => {
        if (!selectedData) return;

        try {
            if (activeTab === "category") {
                await ApiRequest({
                    url: `/categories/${selectedData.category_id}`,
                    method: "DELETE",
                });
                setSuccessMessage("Category deleted successfully");
                fetchCategories();
            }

            if (activeTab === "product") {
                await ApiRequest({
                    url: `/products/${selectedData.product_id}`,
                    method: "DELETE",
                });
                setSuccessMessage("Product deleted successfully");
                fetchProducts();
            }

            setShowDelete(false);
            setSelectedData(null);
        } catch (e) {
            console.error("DELETE ERROR:", e);
        }
    };

    const handleCancelDelete = () => {
        setShowDelete(false);
        setSelectedData(null);
    };

    /* ================= UI ================= */
    return (
    <div
      className="
      w-full
      max-w-[1400px]
      mx-auto

      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
    >
            {/* ===== TITLE ===== */}
            <h1 className="text-2xl font-bold text-[#002D62] mb-4">
                {activeTab === "category"
                    ? "Category Management"
                    : "Product Management"}
            </h1>

            {/* ===== SEARCH + ADD ===== */}
            <div className="
  flex flex-col gap-4
  sm:flex-row sm:justify-between sm:items-center
  mb-4
">
                <div className="
  flex items-center
  bg-white border-2 border-gray-200
  rounded-xl px-3 py-2
  w-full
  sm:w-1/2
  lg:w-1/3
">
                    <Search size={18} className="text-gray-400 mr-2" />
                    <input
                        placeholder={
                            activeTab === "category"
                                ? "Search Category"
                                : "Search Product"
                        }
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setCategoryPage(1);
                            setProductPage(1);
                        }}
                        className="outline-none w-full text-sm"
                    />
                </div>

                <button
                    onClick={() =>
                        activeTab === "category"
                            ? setShowAddCategory(true)
                            : setShowAddProduct(true)
                    }
                    className="flex items-center gap-2 bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white px-5 py-2.5 rounded-lg shadow"
                >
                    <Plus size={16} />
                    {activeTab === "category" ? "Add Category" : "Add Product"}
                </button>
            </div>

            {/* ===== TABS ===== */}
            <div className="mb-8">
                <Tabs
                    tabs={[
                        { key: "category", label: "Category" },
                        { key: "product", label: "Product" },
                    ]}
                    active={activeTab}
                    onChange={(tab) => {
                        setActiveTab(tab);
                        setSearch("");
                        setCategoryPage(1);
                        setProductPage(1);
                    }}
                />
            </div>

            <InlineSuccess
                message={successMessage}
                onClose={() => setSuccessMessage("")}
            />


            {/* ===== CATEGORY TAB ===== */}
            {activeTab === "category" && (
                <>
                    <CategoryManagement
                        categories={categories}
                        loading={loadingCategory}
                        onEdit={(c) => {
                            setSelectedData(c);
                            setShowEditCategory(true);
                        }}
                        onDelete={(c) => {
                            setSelectedData(c);
                            setShowDelete(true);
                        }}
                    />

                    {categoryTotal > 1 && (
                        <Pagination
                            current={categoryPage}
                            total={categoryTotal}
                            onChange={(p) => setCategoryPage(p)}
                        />
                    )}
                </>
            )}

            {/* ===== PRODUCT TAB ===== */}
            {activeTab === "product" && (
                <>
                    <div className="hidden sm:block bg-white rounded-3xl shadow-md overflow-auto border border-gray-100">
                        <table className="min-w-full text-sm text-gray-700">
                            <thead className="bg-[#E9EEF6]">
                                <tr>
                                    <th className="px-4 py-3">No</th>
                                    <th className="px-4 py-3">Code</th>
                                    <th className="px-4 py-3">Product</th>
                                    <th className="px-4 py-3">Category</th>
                                    <th className="px-4 py-3 text-right">Price</th>
                                    <th className="px-4 py-3 text-center">Action</th>
                                </tr>
                            </thead>

                            <tbody>
                                {loadingProduct ? (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10">
                                            Loading...
                                        </td>
                                    </tr>
                                ) : products.length ? (
                                    products.map((p, i) => (
                                        <tr key={p.product_id} className="border-t">
                                            <td className="px-4 py-3 text-center">
                                                {(productPage - 1) * limit + i + 1}
                                            </td>
                                            <td className="px-4 py-3">{p.product_code}</td>
                                            <td className="px-4 py-3">{p.product_name}</td>
                                            <td className="px-4 py-3">
                                                {p.category?.category_name || "-"}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                Rp {p.price?.toLocaleString("id-ID")}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => {
                                                        setSelectedData(p);
                                                        setShowEditProduct(true);
                                                    }}
                                                >
                                                    <img src={EditIcon} className="w-5 inline mr-3" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedData(p);
                                                        setShowDelete(true);
                                                    }}
                                                >
                                                    <img src={DeleteIcon} className="w-5 inline" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="text-center py-10 text-gray-400">
                                            No Product Found
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="sm:hidden space-y-4">
                        {loadingProduct ? (
                            <p className="text-center text-gray-400 py-10">Loading...</p>
                        ) : products.length ? (
                            products.map((p, i) => (
                                <div
                                    key={p.product_id}
                                    className="bg-white rounded-2xl border shadow-sm p-4"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <p className="text-xs text-gray-400">
                                            #{(productPage - 1) * limit + i + 1}
                                        </p>

                                        <div className="flex gap-3">
                                            <button
                                                onClick={() => {
                                                    setSelectedData(p);
                                                    setShowEditProduct(true);
                                                }}
                                            >
                                                <img src={EditIcon} className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedData(p);
                                                    setShowDelete(true);
                                                }}
                                            >
                                                <img src={DeleteIcon} className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="font-semibold text-[#002D62] mb-1">
                                        {p.product_name}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Code: {p.product_code}
                                    </p>

                                    <p className="text-xs text-gray-500">
                                        Category: {p.category?.category_name || "-"}
                                    </p>

                                    <p className="text-sm font-semibold text-right mt-2">
                                        Rp {p.price?.toLocaleString("id-ID")}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-400 py-10">
                                No Product Found
                            </p>
                        )}
                    </div>


                    {productTotal > 1 && (
                        <Pagination
                            current={productPage}
                            total={productTotal}
                            onChange={(p) => setProductPage(p)}
                        />
                    )}
                </>
            )}

            {/* ===== MODALS ===== */}
            <CategoryAddModal
                open={showAddCategory}
                onClose={() => setShowAddCategory(false)}
                onSuccess={fetchCategories}
            />

            <CategoryEditModal
                open={showEditCategory}
                data={selectedData}
                onClose={() => setShowEditCategory(false)}
                onSuccess={fetchCategories}
            />

            <ProductAddModal
                open={showAddProduct}
                onClose={() => setShowAddProduct(false)}
                onSuccess={fetchProducts}
            />

            <ProductEditModal
                open={showEditProduct}
                data={selectedData}
                onClose={() => setShowEditProduct(false)}
                onSuccess={fetchProducts}
            />

            <ConfirmDeleteModal
                open={showDelete}
                onCancel={handleCancelDelete}
                onConfirm={handleConfirmDelete}
            />
        </div>
    );
};

export default ProductManagement;
