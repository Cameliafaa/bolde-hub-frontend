import React, { useState, useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import CustomDropdown from "../../../common/customDropdown";
import { ApiRequest } from "../../../../services/apiRequest";
import { getAllProductsByCategory } from "../../../../services/product/productService";

const createEmptyItem = () => ({
  id: crypto.randomUUID(),
  category_id: "",
  category_name: "",
  sku_name: "",
  product_id: "",
  skuOptions: [],
  price: 0,
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

const StepProgramItems = ({ data = [], onNext, onChange, onBack }) => {
  const [items, setItems] = useState(
    data.length
      ? data.map((it) => ({ ...createEmptyItem(), ...it }))
      : [createEmptyItem()],
  );

  // 🔥 TOKEN POS PERMANENT
  const TOKEN_POS =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7InVzZXJfaWQiOiI2IiwidXNlcm5hbWUiOiJhZG1pbiIsImVtYWlsIjoiYWRtaW5AYm9sZGUuaWQiLCJwaG9uZSI6IjA4MjExMTU5NzU3MCIsInVzZXJfcm9sZV9pZCI6IjEifSwiaWF0IjoxNzY1NDE3NTAyfQ.rhIop2EkUk_Vu2rCuazsMlHOC1iJb2IAvPZNPN5lTlA";

  const [errors, setErrors] = useState([]);
  const [touched, setTouched] = useState([]);

  const [categoryOptions, setCategoryOptions] = useState([]);
  const [skuOptions, setSkuOptions] = useState([]);

  /* ------------------------------------------
      Helpers
  ------------------------------------------ */
  const formatIDR = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;
  const formatNumber = (val) => Number(val || 0).toLocaleString("id-ID");

  const parseToNumber = (raw) => {
    const digits = String(raw).replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  };

  const updateItem = (idx, field, value) => {
    setItems((prev) =>
      prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)),
    );
    // setErrors((prev) => {
    //   const e = [...prev];
    //   if (!e[idx]) e[idx] = {};
    //   e[idx][field] = "";
    //   return e;
    // });
  };

  const fetchCategories = async () => {
    const res = await ApiRequest({
      url: "/categories",
      method: "GET",
    });

    if (res?.status !== "success") return [];
    return res.data || [];
  };

  useEffect(() => {
    const loadCategories = async () => {
      const data = await fetchCategories();

      setCategoryOptions(
        data.map((c) => ({
          id: c.category_id,
          name: c.category_name,
        })),
      );
    };

    loadCategories();
  }, []);

  const fetchProductsByCategory = async (idx, categoryId) => {
    const products = await getAllProductsByCategory(categoryId);

    updateItem(idx, "skuOptions", products);
  };

  const handleSelectSKU = (idx, product) => {
    updateItem(idx, "product_id", product.product_id);
    updateItem(idx, "sku_name", product.product_name);
    // updateItem(idx, "product_name", product.product_name);

    updateItem(idx, "price", product.price);
    updateItem(idx, "default_price", product.price);
    updateItem(idx, "isPriceEdited", false);
  };

  /* ------------------------------------------
      Recalculate each row when inputs change
  ------------------------------------------ */
  useEffect(() => {
    setItems((prev) =>
      prev.map((it) => {
        const price = Number(it.price) || 0;
        const qty = Number(it.qty) || 0;
        const qty_bonus = Number(it.qty_bonus) || 0;
        const value_bonus = Number(it.value_bonus) || 0;
        const target_qty = Number(it.target_selling_qty) || 0;

        const amount = price * qty;
        const autoNett = Math.ceil(amount * 0.79152);

        const nett = it.isNettEdited ? Number(it.nett || 0) : autoNett;
        const total_bonus = qty_bonus * value_bonus;
        const budgetPct = amount > 0 ? (value_bonus / amount) * 100 : 0;
        // const budgetPct = amount > 0 ? (total_bonus / amount) * 100 : 0;

        const target_selling_rupiah = nett * target_qty;
        // const target_selling_rupiah = amount * target_qty;
        const total_budget = total_bonus * target_qty;

        const budget_percentage =
          target_selling_rupiah > 0
            ? (total_budget / target_selling_rupiah) * 100
            : 0;

        return {
          ...it,
          amount,
          nett,
          total_bonus,
          budget: budgetPct,
          target_selling_rupiah,
          total_budget,
          budget_percentage,
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
      })),
    ),
  ]);

  /* ------------------------------------------
      Validasi item
  ------------------------------------------ */
  const validateItems = () => {
    const err = items.map((it) => {
      const e = {};
      if (!it.sku_name.trim()) e.sku_name = "Required";
      if (!it.price) e.price = "Required";
      if (!it.qty) e.qty = "Required";
      if (!it.qty_bonus) e.qty_bonus = "Required";
      if (!it.value_bonus) e.value_bonus = "Required";
      if (!it.target_selling_qty) e.target_selling_qty = "Required";
      if (!it.description.trim()) e.description = "Required";
      return e;
    });

    setErrors(err);
    return err.every((e) => Object.keys(e).length === 0);
  };

  /* ------------------------------------------
      NEXT
  ------------------------------------------ */
  const handleNextClick = () => {
    // set semua field jadi menyentuh validation
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

    // pastikan harga sesuai logic edit / tidak edit
    const finalItems = items.map((it) => ({
      ...it,
      price: it.isPriceEdited ? it.price : (it.default_price ?? it.price),
    }));

    const totalBudget = finalItems.reduce(
      (sum, it) => sum + Number(it.total_budget || 0),
      0,
    );

    const totalTargetSellingRupiah = finalItems.reduce(
      (sum, it) => sum + Number(it.target_selling_rupiah || 0),
      0,
    );

    onNext({
      program_items: finalItems,
      total_budget: totalBudget,
      target_selling_rupiah: totalTargetSellingRupiah,
    });
  };

  /* ------------------------------------------
      UI Helpers
  ------------------------------------------ */
  const handleMoneyChange = (idx, name, raw) => {
    updateItem(idx, name, parseToNumber(raw));
    updateItem(idx, "isPriceEdited", true);
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

  const formatCurrency = (v) => `Rp ${Number(v || 0).toLocaleString("id-ID")}`;

  /* ------------------------------------------
      RENDER
  ------------------------------------------ */
  return (
    <div className="flex flex-col h-[65vh] sm:h-[70vh]">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-[#002D62]">
          Rincian Budget Program
        </h2>

        <button
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
                onClick={() => handleRemoveItem(idx)}
                className="absolute text-red-500 top-3 right-3"
              >
                <Trash2 size={16} />
              </button>
            )}

            <h3 className="mb-3 font-semibold text-[#002D62]">SKU {idx + 1}</h3>

            {/* SECTION 1 */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* CATEGORY */}
              <CustomDropdown
                label="Category"
                placeholder="Select Category"
                searchable
                value={
                  it.category_id
                    ? { id: it.category_id, name: it.category_name }
                    : null
                }
                options={categoryOptions}
                onChange={(opt) => {
                  updateItem(idx, "category_id", opt.id);
                  updateItem(idx, "category_name", opt.name);

                  // reset SKU dulu
                  updateItem(idx, "product_id", "");
                  updateItem(idx, "sku_name", "");
                  updateItem(idx, "price", 0);
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
                    ? { id: it.product_id, name: it.sku_name }
                    : null
                }
                options={(it.skuOptions || []).map((p) => ({
                  id: p.product_id,
                  name: `${p.product_code} - ${p.product_name}`,
                  raw: p,
                }))}
                onChange={(opt) => {
                  handleSelectSKU(idx, opt.raw); // ✅ SATU-SATUNYA YANG BOLEH
                }}
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
                  onBlur={() =>
                    setTouched((t) => {
                      const clone = [...t];
                      if (!clone[idx]) clone[idx] = {};
                      clone[idx].price = true;
                      return clone;
                    })
                  }
                  className={`p-4 border rounded-xl
                     ${
                       errors[idx]?.price && touched[idx]?.price
                         ? "border-red-500"
                         : "border-gray-300"
                     }`}
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
                  onBlur={() =>
                    setTouched((t) => {
                      const clone = [...t];
                      if (!clone[idx]) clone[idx] = {};
                      clone[idx].qty = true;
                      return clone;
                    })
                  }
                  className={`p-4 border rounded-xl ${
                    errors[idx]?.qty && touched[idx]?.qty
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
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
                  onBlur={() =>
                    setTouched((t) => {
                      const clone = [...t];
                      if (!clone[idx]) clone[idx] = {};
                      clone[idx].description = true;
                      return clone;
                    })
                  }
                  className={`p-4 border rounded-xl ${
                    errors[idx]?.description && touched[idx]?.description
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
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
                  onBlur={() =>
                    setTouched((t) => {
                      const clone = [...t];
                      if (!clone[idx]) clone[idx] = {};
                      clone[idx].value_bonus = true;
                      return clone;
                    })
                  }
                  className={`p-4 border rounded-xl ${
                    errors[idx]?.value_bonus && touched[idx]?.value_bonus
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
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
              {/* Budget */}
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

              {/* Target Qty */}
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
                  onBlur={() =>
                    setTouched((t) => {
                      const clone = [...t];
                      if (!clone[idx]) clone[idx] = {};
                      clone[idx].target_selling_qty = true;
                      return clone;
                    })
                  }
                  className={`border rounded-xl p-4 ${
                    errors[idx]?.target_selling_qty &&
                    touched[idx]?.target_selling_qty
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
                {errText(idx, "target_selling_qty")}
              </div>

              {/* Target Selling Rupiah */}
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

              {/* Total Budget */}
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

              {/* Budget % */}
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

      {/* FOOTER BUTTONS */}
      <div className="flex justify-between pt-4 mt-4 border-t">
        <button
          onClick={onBack}
          className="px-6 border border-gray-400 py-1.5 rounded-xl"
        >
          Back
        </button>

        <button
          onClick={handleNextClick}
          className="px-6 text-white bg-[#002D62] py-1.5 rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgramItems;
