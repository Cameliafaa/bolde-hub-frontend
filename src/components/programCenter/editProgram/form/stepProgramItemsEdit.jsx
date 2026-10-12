import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import CustomDropdown from "../../../common/customDropdown";
import { ApiRequest } from "../../../../services/apiRequest";
import { getAllProductsByCategory } from "../../../../services/product/productService";

const createEmptyItem = () => ({
  id: crypto.randomUUID(),

  program_item_id: null,

  category_id: "",
  category_name: "",

  sku_name: "",
  product_id: "",

  skuOptions: [],

  price: 0,
  default_price: 0,
  isPriceEdited: false,

  qty: 0,

  qty_bonus: 0,
  value_bonus: 0,

  target_selling_qty: 0,

  description: "",

  amount: 0,

  nett: 0,
  isNettEdited: false,

  total_bonus: 0,

  budget: 0,

  target_selling_rupiah: 0,

  total_budget: 0,

  budget_percentage: 0,
});

const mapExistingItem = (it) => ({
  ...createEmptyItem(),

  ...it,

  id: it.program_item_id
    ? `existing-${it.program_item_id}`
    : crypto.randomUUID(),

  program_item_id: it.program_item_id || null,

  category_id: Number(it.category_id || 0),
  category_name: it.category_name || "",

  product_id: Number(it.product_id || 0),
  sku_name: it.sku_name || "",

  price: Number(it.price || 0),
  default_price: Number(it.price || 0),

  qty: Number(it.qty || 0),

  qty_bonus: Number(it.qty_bonus || 0),
  value_bonus: Number(it.value_bonus || 0),

  description: it.description || "",

  target_selling_qty: Number(it.target_selling_qty || 0),

  // backend -> form
  nett: Number(it.price_net ?? it.nett ?? 0),

  total_bonus: Number(it.total_bonus || 0),

  budget: Number(it.budget_percent ?? it.budget ?? 0),

  target_selling_rupiah: Number(
    it.target_selling_price ?? it.target_selling_rupiah ?? 0,
  ),

  total_budget: Number(it.total_budget || 0),

  budget_percentage: Number(
    it.budget_selling_percent ?? it.budget_percentage ?? 0,
  ),

  skuOptions: [],

  // existing nett jangan langsung dioverwrite kalkulasi
  isNettEdited: true,

  isPriceEdited: false,
});

const StepProgramItemsEdit = ({ data = [], onNext, onBack }) => {
  const [items, setItems] = useState(() =>
    Array.isArray(data) && data.length
      ? data.map(mapExistingItem)
      : [createEmptyItem()],
  );

  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState([]);

  const [categoryOptions, setCategoryOptions] = useState([]);

  /* =========================
     FORMAT HELPERS
  ========================= */
  const formatIDR = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  const formatNumber = (val) => Number(val || 0).toLocaleString("id-ID");

  const formatCurrency = (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;

  const parseToNumber = (raw) => {
    const digits = String(raw).replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  };

  /* =========================
     UPDATE ITEM
  ========================= */
  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) =>
        i === idx
          ? {
              ...it,
              [field]: value,
            }
          : it,
      ),
    );
  };

  /* =========================
     SYNC DATA EDIT
  ========================= */
  useEffect(() => {
    if (!Array.isArray(data)) return;

    if (data.length) {
      setItems(data.map(mapExistingItem));
    } else {
      setItems([createEmptyItem()]);
    }
  }, [data]);

  /* =========================
     LOAD CATEGORY
  ========================= */
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await ApiRequest({
          url: "/categories",
          method: "GET",
        });

        if (res?.status !== "success") return;

        setCategoryOptions(
          (res.data || []).map((c) => ({
            id: Number(c.category_id),
            name: c.category_name,
          })),
        );
      } catch (err) {
        console.error("Load category error:", err);
      }
    };

    loadCategories();
  }, []);

  /* =========================
     HYDRATE CATEGORY NAME
  ========================= */
  useEffect(() => {
    if (!categoryOptions.length) return;

    setItems((prev) =>
      prev.map((it) => {
        if (!it.category_id) return it;

        const category = categoryOptions.find(
          (c) => Number(c.id) === Number(it.category_id),
        );

        if (!category) return it;

        return {
          ...it,
          category_name: category.name,
        };
      }),
    );
  }, [categoryOptions]);

  /* =========================
     LOAD SKU EXISTING
  ========================= */
  useEffect(() => {
    if (!categoryOptions.length) return;

    const loadExistingSkuOptions = async () => {
      const currentItems = [...items];

      for (let idx = 0; idx < currentItems.length; idx++) {
        const item = currentItems[idx];

        if (!item.category_id) continue;

        try {
          const products = await getAllProductsByCategory(item.category_id);

          setItems((prev) =>
            prev.map((it, i) =>
              i === idx
                ? {
                    ...it,
                    skuOptions: products || [],
                  }
                : it,
            ),
          );
        } catch (err) {
          console.error("Load SKU edit error:", err);
        }
      }
    };

    loadExistingSkuOptions();
  }, [categoryOptions]);

  const fetchProductsByCategory = async (idx, categoryId) => {
    try {
      const products = await getAllProductsByCategory(categoryId);

      updateItem(idx, "skuOptions", products || []);
    } catch (err) {
      console.error("Fetch product category error:", err);
    }
  };

  /* =========================
     SELECT SKU
  ========================= */
  const handleSelectSKU = (idx, product) => {
    updateItem(idx, "product_id", Number(product.product_id));

    updateItem(idx, "sku_name", product.product_name);

    updateItem(idx, "price", Number(product.price || 0));

    updateItem(idx, "default_price", Number(product.price || 0));

    updateItem(idx, "isPriceEdited", false);

    updateItem(idx, "isNettEdited", false);
  };

  /* =========================
     RECALCULATE
  ========================= */
  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        const price = Number(it.price) || 0;
        const qty = Number(it.qty) || 0;

        const qtyBonus = Number(it.qty_bonus) || 0;

        const valueBonus = Number(it.value_bonus) || 0;

        const targetQty = Number(it.target_selling_qty) || 0;

        const amount = price * qty;

        const autoNett = Math.ceil(amount * 0.79152);

        const nett = it.isNettEdited ? Number(it.nett || 0) : autoNett;

        const totalBonus = qtyBonus * valueBonus;

        const budgetPct = amount > 0 ? (valueBonus / amount) * 100 : 0;

        const targetSellingRupiah = nett * targetQty;

        const totalBudget = totalBonus * targetQty;

        const budgetPercentage =
          targetSellingRupiah > 0
            ? (totalBudget / targetSellingRupiah) * 100
            : 0;

        return {
          ...it,

          amount,
          nett,

          total_bonus: totalBonus,

          budget: budgetPct,

          target_selling_rupiah: targetSellingRupiah,

          total_budget: totalBudget,

          budget_percentage: budgetPercentage,
        };
      }),
    );
  }, [
    JSON.stringify(
      items.map((it) => ({
        price: it.price,
        qty: it.qty,
        qty_bonus: it.qty_bonus,
        value_bonus: it.value_bonus,
        target_selling_qty: it.target_selling_qty,
        isNettEdited: it.isNettEdited,
        nett: it.nett,
      })),
    ),
  ]);

  /* =========================
     VALIDATION
  ========================= */
  const validateItems = () => {
    const err = items.map((it) => {
      const e = {};

      if (!String(it.sku_name || "").trim()) e.sku_name = "Required";

      if (!it.price) e.price = "Required";

      if (!it.qty) e.qty = "Required";

      if (!it.qty_bonus) e.qty_bonus = "Required";

      if (!it.value_bonus) e.value_bonus = "Required";

      if (!it.target_selling_qty) e.target_selling_qty = "Required";

      if (!String(it.description || "").trim()) e.description = "Required";

      return e;
    });

    setErrors(err);

    return err.every((e) => Object.keys(e).length === 0);
  };

  /* =========================
     INPUT HANDLER
  ========================= */
  const handleMoneyChange = (idx, name, raw) => {
    updateItem(idx, name, parseToNumber(raw));

    if (name === "price") {
      updateItem(idx, "isPriceEdited", true);
    }
  };

  const handleNumberChange = (idx, name, raw) =>
    updateItem(idx, name, parseToNumber(raw));

  const handleAddItem = () => setItems((prev) => [...prev, createEmptyItem()]);

  const handleRemoveItem = (idx) =>
    setItems((prev) => prev.filter((_, i) => i !== idx));

  const errText = (idx, field) =>
    touched[idx]?.[field] && errors[idx]?.[field] ? (
      <p className="mt-1 text-xs text-red-500">{errors[idx][field]}</p>
    ) : null;

  /* =========================
     NEXT
  ========================= */
  const handleNextClick = () => {
    setTouched(
      items.map(() => ({
        sku_name: true,
        price: true,
        qty: true,
        qty_bonus: true,
        value_bonus: true,
        target_selling_qty: true,
        description: true,
      })),
    );

    if (!validateItems()) return;

    const finalItems = items.map((it) => ({
      // jangan kirim field UI
      program_item_id: it.program_item_id || undefined,

      product_id: Number(it.product_id),
      category_id: Number(it.category_id),

      sku_name: it.sku_name,

      price: Number(it.price),
      qty: Number(it.qty),

      amount: Number(it.amount),

      // form -> backend
      price_net: Number(it.nett),

      description: it.description,

      qty_bonus: Number(it.qty_bonus),

      value_bonus: Number(it.value_bonus),

      total_bonus: Number(it.total_bonus),

      budget_percent: Number(it.budget),

      target_selling_price: Number(it.target_selling_rupiah),

      target_selling_qty: Number(it.target_selling_qty),

      total_budget: Number(it.total_budget),

      budget_selling_percent: Number(it.budget_percentage),
    }));

    const totalBudget = finalItems.reduce(
      (sum, it) => sum + Number(it.total_budget || 0),
      0,
    );

    const totalTargetSellingRupiah = finalItems.reduce(
      (sum, it) => sum + Number(it.target_selling_price || 0),
      0,
    );

    onNext({
      program_items: finalItems,
      total_budget: totalBudget,
      target_selling_rupiah: totalTargetSellingRupiah,
    });
  };

  /* =========================
     RENDER
  ========================= */
  return (
    <div className="flex flex-col h-[65vh] sm:h-[70vh]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#002D62]">
          Rincian Budget Program
        </h2>

        <button
          type="button"
          onClick={handleAddItem}
          className="flex items-center gap-1 px-3 text-sm text-white bg-[#002D62] py-1.5 rounded-xl"
        >
          <Plus size={14} />
          Add Item
        </button>
      </div>

      <div className="flex-1 pr-1 space-y-4 overflow-y-auto">
        {items.map((it, idx) => (
          <div
            key={it.id}
            className="relative p-4 bg-white border border-gray-200 rounded-xl"
          >
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveItem(idx)}
                className="absolute text-red-500 top-3 right-3"
              >
                <Trash2 size={16} />
              </button>
            )}

            <h3 className="mb-3 font-semibold text-[#002D62]">SKU {idx + 1}</h3>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* CATEGORY */}
              <CustomDropdown
                label="Category"
                placeholder="Select Category"
                searchable
                value={
                  it.category_id
                    ? {
                        id: it.category_id,
                        name: it.category_name || "",
                      }
                    : null
                }
                options={categoryOptions}
                onChange={(opt) => {
                  updateItem(idx, "category_id", Number(opt.id));

                  updateItem(idx, "category_name", opt.name);

                  updateItem(idx, "product_id", "");

                  updateItem(idx, "sku_name", "");

                  updateItem(idx, "price", 0);

                  updateItem(idx, "default_price", 0);

                  updateItem(idx, "skuOptions", []);

                  fetchProductsByCategory(idx, opt.id);
                }}
              />

              {/* SKU */}
              <CustomDropdown
                label="SKU"
                placeholder="Select SKU"
                searchable
                disabled={!it.category_id}
                value={
                  it.product_id
                    ? {
                        id: it.product_id,
                        name: it.sku_name,
                      }
                    : null
                }
                options={(it.skuOptions || []).map((p) => ({
                  id: p.product_id,
                  name: `${p.product_code} - ${p.product_name}`,
                  raw: p,
                }))}
                onChange={(opt) => handleSelectSKU(idx, opt.raw)}
              />

              {/* PRICE */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Harga Pricelist
                </label>

                <input
                  value={formatIDR(it.price)}
                  onChange={(e) =>
                    handleMoneyChange(idx, "price", e.target.value)
                  }
                  className="p-4 border border-gray-300 rounded-xl"
                />

                {errText(idx, "price")}
              </div>

              {/* QTY */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">Qty</label>

                <input
                  value={it.qty ? formatNumber(it.qty) : ""}
                  onChange={(e) =>
                    handleNumberChange(idx, "qty", e.target.value)
                  }
                  className="p-4 border border-gray-300 rounded-xl"
                />

                {errText(idx, "qty")}
              </div>

              {/* AMOUNT */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Amount
                </label>

                <input
                  disabled
                  value={formatCurrency(it.amount)}
                  className="p-4 bg-gray-100 border rounded-xl"
                />
              </div>

              {/* NETT */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">Nett</label>

                <input
                  value={formatCurrency(it.nett)}
                  onChange={(e) => {
                    updateItem(idx, "nett", parseToNumber(e.target.value));

                    updateItem(idx, "isNettEdited", true);
                  }}
                  className="p-4 border rounded-xl"
                />
              </div>

              {/* DESCRIPTION */}
              <div className="flex flex-col col-span-2">
                <label className="mb-2 font-semibold text-gray-500">
                  Terms & Conditions
                </label>

                <textarea
                  value={it.description}
                  onChange={(e) =>
                    updateItem(idx, "description", e.target.value)
                  }
                  className="p-4 border rounded-xl"
                  rows={2}
                />

                {errText(idx, "description")}
              </div>

              {/* QTY BONUS */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Qty Bonus
                </label>

                <input
                  value={it.qty_bonus ? formatNumber(it.qty_bonus) : ""}
                  onChange={(e) =>
                    handleNumberChange(idx, "qty_bonus", e.target.value)
                  }
                  className="p-4 border rounded-xl"
                />

                {errText(idx, "qty_bonus")}
              </div>

              {/* VALUE BONUS */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Nilai Bonus
                </label>

                <input
                  value={it.value_bonus ? formatIDR(it.value_bonus) : ""}
                  onChange={(e) =>
                    handleMoneyChange(idx, "value_bonus", e.target.value)
                  }
                  className="p-4 border rounded-xl"
                />

                {errText(idx, "value_bonus")}
              </div>

              {/* TOTAL BONUS */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Total Bonus
                </label>

                <input
                  disabled
                  value={formatCurrency(it.total_bonus)}
                  className="p-4 bg-gray-100 border rounded-xl"
                />
              </div>

              {/* BUDGET */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Budget
                </label>

                <input
                  disabled
                  value={`${Number(it.budget ?? 0).toFixed(2)}%`}
                  className="p-4 bg-gray-100 border rounded-xl"
                />
              </div>

              {/* TARGET QTY */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Target Selling Qty
                </label>

                <input
                  value={
                    it.target_selling_qty
                      ? formatNumber(it.target_selling_qty)
                      : ""
                  }
                  onChange={(e) =>
                    handleNumberChange(
                      idx,
                      "target_selling_qty",
                      e.target.value,
                    )
                  }
                  className="p-4 border rounded-xl"
                />

                {errText(idx, "target_selling_qty")}
              </div>

              {/* TARGET SELLING RUPIAH */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Target Selling Rupiah
                </label>

                <input
                  disabled
                  value={formatCurrency(it.target_selling_rupiah)}
                  className="p-4 bg-gray-100 border rounded-xl"
                />
              </div>

              {/* TOTAL BUDGET */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  Total Budget
                </label>

                <input
                  disabled
                  value={formatCurrency(it.total_budget)}
                  className="p-4 bg-gray-100 border rounded-xl"
                />
              </div>

              {/* BUDGET % */}
              <div className="flex flex-col">
                <label className="mb-2 font-semibold text-gray-500">
                  % Budget
                </label>

                <input
                  disabled
                  value={`${Number(it.budget_percentage ?? 0).toFixed(2)}%`}
                  className="p-4 bg-gray-100 border rounded-xl"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between pt-4 mt-4 border-t">
        <button
          type="button"
          onClick={onBack}
          className="px-6 border border-gray-400 py-1.5 rounded-xl"
        >
          Back
        </button>

        <button
          type="button"
          onClick={handleNextClick}
          className="px-6 text-white bg-[#002D62] py-1.5 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgramItemsEdit;
