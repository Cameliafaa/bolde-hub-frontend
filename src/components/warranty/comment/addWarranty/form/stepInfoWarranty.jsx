// StepClaimInfo.jsx
import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../../common/customDropdown";
import { ApiRequest } from "../../../../../services/apiRequest";
import { fetchAllStores } from "../../../../../services/storeServices";

/* ================= STATIC ================= */
const QTY_OPTIONS = [
    { id: 1, qty: 1, unit: "PCS", name: "1 Unit" },
    { id: 2, qty: 2, unit: "PCS", name: "2 Unit" },
    { id: 3, qty: 3, unit: "PCS", name: "3 Unit" },
    { id: 4, qty: 4, unit: "PCS", name: "4 Unit" },
    { id: 5, qty: 5, unit: "PCS", name: "5 Unit" },
];

const StepClaimInfo = ({ data = {}, onNext }) => {
    const [form, setForm] = useState({
        area: data.area || null,
        store: data.store || null,
        category: data.category || null,
        product: data.product || null,
        quantity: data.quantity || null,
    });

    const [areaOptions, setAreaOptions] = useState([]);
    const [provinceMap, setProvinceMap] = useState([]); // 🔥 helper only

    const [allStores, setAllStores] = useState([]);
    const [storeOptions, setStoreOptions] = useState([]);

    const [categoryOptions, setCategoryOptions] = useState([]);
    const [productOptions, setProductOptions] = useState([]);
    const [loadingProduct, setLoadingProduct] = useState(false);

    /* ================= FETCH AREA ================= */
    useEffect(() => {
        (async () => {
            const res = await ApiRequest({
                url: "/areas/all",
                method: "GET",
                params: { page: 1, limit: 100 },
            });

            if (res?.status === "success") {
                setAreaOptions(
                    res.data.map(a => ({
                        id: a.area_id,
                        name: a.name,
                    }))
                );
            }
        })();
    }, []);

    /* ================= FETCH PROVINCE (HIDDEN) ================= */
    useEffect(() => {
        (async () => {
            const res = await ApiRequest({
                url: "/provinces",
                method: "GET",
                params: { page: 1, limit: 200 },
            });

            if (res?.status === "success") {
                setProvinceMap(
                    res.data.map(p => ({
                        id: p.province_id,
                        area_id: p.area_id,
                    }))
                );
            }
        })();
    }, []);

    /* ================= FETCH STORE (ONCE) ================= */
    useEffect(() => {
        (async () => {
            const stores = await fetchAllStores();

            const mapped = stores.map(s => ({
                id: s.id,
                name: s.name,
                province_id: s.province_id,
            }));

            setAllStores(mapped);
            setStoreOptions(mapped);
        })();
    }, []);

    /* ================= FILTER STORE BY AREA ================= */
    useEffect(() => {
        if (!form.area) {
            setStoreOptions(allStores);
            return;
        }

        // ambil semua province dalam area ini
        const provinceIds = provinceMap
            .filter(p => p.area_id === form.area.id)
            .map(p => p.id);

        const filteredStores = allStores.filter(s =>
            provinceIds.includes(s.province_id)
        );

        setStoreOptions(filteredStores);

        // reset store kalau sudah tidak valid
        setForm(prev => ({
            ...prev,
            store: filteredStores.some(s => s.id === prev.store?.id)
                ? prev.store
                : null,
        }));
    }, [form.area, provinceMap, allStores]);

    /* ================= FETCH CATEGORY ================= */
    useEffect(() => {
        (async () => {
            const res = await ApiRequest({
                url: "/categories",
                method: "GET",
                params: { page: 1, limit: 50 },
            });

            if (res?.status === "success") {
                setCategoryOptions(
                    res.data.map(c => ({
                        id: c.category_id,
                        name: c.category_name,
                    }))
                );
            }
        })();
    }, []);

    /* ================= FETCH PRODUCT ================= */
    const fetchProductsByCategory = async (categoryId) => {
        setLoadingProduct(true);
        setProductOptions([]);

        try {
            const res = await ApiRequest({
                url: "/products",
                method: "GET",
                params: { category_id: categoryId, limit: 100 },
            });

            if (res?.status === "success") {
                setProductOptions(
                    res.data.map(p => ({
                        id: p.product_id,
                        name: `${p.product_code} - ${p.product_name}`,
                    }))
                );
            }
        } finally {
            setLoadingProduct(false);
        }
    };

    /* ================= NEXT ================= */
    const handleNext = () => {
        if (
            !form.area ||
            !form.store ||
            !form.category ||
            !form.product ||
            !form.quantity
        ) {
            alert("Lengkapi semua field");
            return;
        }

        onNext(form); // 🔥 province TIDAK dikirim
    };

    return (
        <div className="space-y-6">

            {/* AREA */}
            <CustomDropdown
                label="Area Toko"
                placeholder="Pilih Area"
                searchable
                value={form.area}
                options={areaOptions}
                onChange={(opt) =>
                    setForm({ ...form, area: opt, store: null })
                }
            />

            {/* STORE */}
            <CustomDropdown
                label="Store"
                placeholder={
                    !form.area
                        ? "Pilih Area terlebih dahulu"
                        : "Pilih Store"
                }
                disabled={!form.area}
                value={form.store}
                options={storeOptions}
                onChange={(opt) =>
                    setForm({ ...form, store: opt })
                }
            />

            {/* CATEGORY */}
            <CustomDropdown
                label="Category Produk"
                placeholder="Pilih Category"
                searchable
                value={form.category}
                options={categoryOptions}
                onChange={(opt) => {
                    setForm({ ...form, category: opt, product: null });
                    fetchProductsByCategory(opt.id);
                }}
            />

            {/* PRODUCT */}
            <CustomDropdown
                label="Nama Produk"
                placeholder={
                    !form.category
                        ? "Pilih category terlebih dahulu"
                        : loadingProduct
                            ? "Loading produk..."
                            : "Pilih Produk"
                }
                searchable
                disabled={!form.category || loadingProduct}
                value={form.product}
                options={productOptions}
                onChange={(opt) =>
                    setForm({ ...form, product: opt })
                }
            />

            {/* JUMLAH */}
            <CustomDropdown
                label="Jumlah Unit"
                placeholder="Pilih Jumlah"
                value={form.quantity}
                options={QTY_OPTIONS}
                onChange={(opt) =>
                    setForm({ ...form, quantity: opt })
                }
            />

            {/* ACTION */}
            <div className="flex justify-end pt-4">
                <button
                    onClick={handleNext}
                    className="bg-[#002D62] text-white px-6 py-2 rounded-xl"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default StepClaimInfo;
