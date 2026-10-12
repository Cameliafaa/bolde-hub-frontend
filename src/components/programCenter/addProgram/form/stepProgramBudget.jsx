import React, { useState, useEffect } from "react";

const StepProgramCostBenefit = ({ data = {}, total_budget = 0, target_selling_rupiah = 0, onNext, onBack }) => {
  const [form, setForm] = useState({
    monthly_turnover: Number(target_selling_rupiah) || 0,
    margin_percentage: 30,          // fix 30%
    margin_value: 0,
    budget_program: Number(data.budget_program) || 0,
    target_program: Number(data.target_program) || 0,
    budget_percentage: 0,
    summary: data.summary || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const formatIDR = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  const parseToNumber = (raw) => {
    const digits = String(raw).replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  };

  // 🔁 Auto update margin_value, target_program, budget_percentage
  useEffect(() => {
    const turnover = Number(form.monthly_turnover) || 0;
    const budget = Number(form.budget_program) || 0;
    const marginValue = turnover * (form.margin_percentage / 100);
    const budgetPct = turnover > 0 ? (budget / turnover) * 100 : 0;

    setForm((prev) => ({
      ...prev,
      margin_value: marginValue,
      budget_percentage: budgetPct,
    }));
  }, [form.monthly_turnover, form.budget_program]);

  // 🔥 Auto inject total_budget dari Step 2 ke budget_program
  useEffect(() => {
    if (total_budget) {
      setForm((prev) => ({
        ...prev,
        budget_program: total_budget,
      }));
    }
  }, [total_budget]);

  useEffect(() => {
    if (target_selling_rupiah) {
      setForm((prev) => ({
        ...prev,
        monthly_turnover: Number(target_selling_rupiah),
        target_program: Number(target_selling_rupiah),
      }));
    }
  }, [target_selling_rupiah]);


  const handleMoneyChange = (name, raw) => {
    const num = parseToNumber(raw);
    setForm((prev) => ({
      ...prev,
      [name]: num,
    }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const markTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const validateForm = () => {
    const newErr = {};
    if (!form.budget_program) newErr.budget_program = "Required";

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const errText = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
    ) : null;

  const handleSubmit = () => {
    setTouched({
      budget_program: true,
    });

    const isValid = validateForm();
    if (!isValid) return;

    const payload = {
      ...form,
      monthly_turnover: Number(form.monthly_turnover) || 0,
      budget_program: Number(form.budget_program) || 0,
      margin_value: Number(form.margin_value) || 0,
      budget_percentage: Number(form.budget_percentage) || 0,
      target_program: Number(form.target_program) || 0,
    };

    onNext(payload);
  };

  const handleBack = () => {
    onBack(form);
  };

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Omzet per bulan */}
        <div>
          <label className="text-[#6B7280] font-semibold">
            Pertumbuhan Omzet (Sell-In) per Bulan
          </label>
          <input
            disabled
            value={formatIDR(form.monthly_turnover)}
            className="w-full border bg-gray-100 text-gray-600 rounded-lg p-3"
          />
          {errText("monthly_turnover")}
        </div>

        {/* Estimasi Margin 30% */}
        <div>
          <label className="text-[#6B7280] font-semibold">
            Estimasi Margin Kotor ({form.margin_percentage}%)
          </label>
          <input
            disabled
            value={formatIDR(form.margin_value)}
            className="w-full border bg-gray-100 text-gray-600 rounded-lg p-3"
          />
        </div>

        {/* Budget Program (dari Step 2) */}
        <div>
          <label className="text-[#6B7280] font-semibold">Budget Program</label>
          <input
            disabled
            value={formatIDR(form.budget_program)}
            className="w-full border bg-gray-100 text-gray-600 rounded-lg p-3"
          />
          {errText("budget_program")}
        </div>

        {/* Target Program (otomatis = omzet) */}
        <div>
          <label className="text-[#6B7280] font-semibold">
            Budget Program vs Target Program
          </label>
          <input
            disabled
            value={formatIDR(form.target_program)}
            className="w-full border bg-gray-100 text-gray-600 rounded-lg p-3"
          />
        </div>

        {/* Persentase Budget */}
        <div>
          <label className="text-[#6B7280] font-semibold">
            Budget Percentage
          </label>
          <input
            disabled
            value={`${form.budget_percentage.toFixed(2)}%`}
            className="w-full border bg-gray-100 text-gray-600 rounded-lg p-3"
          />
        </div>
      </div>

      {/* Tombol navigasi */}
      <div className="flex justify-between mt-8">
        <button
          onClick={handleBack}
          className="border border-gray-400 px-8 py-2 rounded-lg text-sm font-medium"
        >
          Back
        </button>
        <button
          onClick={handleSubmit}
          className="bg-[#002D62] text-white px-8 py-2 rounded-lg text-sm font-semibold hover:opacity-90"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgramCostBenefit;
