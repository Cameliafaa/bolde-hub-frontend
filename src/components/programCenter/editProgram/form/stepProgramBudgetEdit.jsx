import React, { useState, useEffect } from "react";

const StepProgramCostBenefitEdit = ({
  data = {},
  total_budget = 0,
  onNext,
  onBack,
}) => {
  const [form, setForm] = useState({
    monthly_turnover: Number(data.monthly_turnover) || 0,
    margin_percentage: 30, // Fix 30%
    margin_value: 0,
    budget_program: Number(data.budget_program) || total_budget || 0,
    target_program: Number(data.target_program) || 0,
    budget_percentage: 0,
    summary: data.summary || "",
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const formatIDR = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;

  const parseToNumber = (raw) => {
    const cleaned = String(raw).replace(/[^\d]/g, "");
    return cleaned ? Number(cleaned) : 0;
  };

  //
  // 🔁 AUTO UPDATE COMPUTATION (Margin, Target, Budget %)
  //
  useEffect(() => {
    const turnover = Number(form.monthly_turnover) || 0;
    const budget = Number(form.budget_program) || 0;

    const marginValue = turnover * (form.margin_percentage / 100);

    setForm((prev) => ({
      ...prev,
      margin_value: marginValue,
      target_program: turnover,
      budget_percentage: turnover > 0 ? (budget / turnover) * 100 : 0,
    }));
  }, [form.monthly_turnover, form.budget_program]);

  //
  // 🔁 AUTO INJECT total budget from items (Step 2)
  //
  useEffect(() => {
    if (total_budget > 0) {
      setForm((prev) => ({
        ...prev,
        budget_program: total_budget,
      }));
    }
  }, [total_budget]);

  const handleMoneyChange = (name, raw) => {
    const num = parseToNumber(raw);
    setForm((prev) => ({ ...prev, [name]: num }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const markTouched = (field) =>
    setTouched((prev) => ({ ...prev, [field]: true }));

  const validate = () => {
    const e = {};
    if (!form.monthly_turnover) e.monthly_turnover = "Required";
    if (!form.budget_program) e.budget_program = "Required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const errText = (field) =>
    touched[field] && errors[field] ? (
      <p className="text-xs text-red-500 mt-1">{errors[field]}</p>
    ) : null;

  const handleSubmit = () => {
    setTouched({
      monthly_turnover: true,
      budget_program: true,
    });

    if (!validate()) return;

    const payload = {
      ...form,
      monthly_turnover: Number(form.monthly_turnover),
      margin_value: Number(form.margin_value),
      budget_program: Number(form.budget_program),
      target_program: Number(form.target_program),
      budget_percentage: Number(form.budget_percentage),
    };

    onNext(payload);
  };

  return (
    <div className="w-full space-y-6">

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* Monthly Turnover */}
        <div>
          <label className="text-gray-600 font-semibold">
            Pertumbuhan Omzet (Sell-In) per Bulan
          </label>
          <input
            disabled
            value={formatIDR(form.monthly_turnover)}
            onChange={(e) =>
              handleMoneyChange("monthly_turnover", e.target.value)
            }
            onBlur={() => markTouched("monthly_turnover")}
            className="w-full border bg-gray-100 rounded-lg p-3"
          />
          {errText("monthly_turnover")}
        </div>

        {/* Margin */}
        <div>
          <label className="text-gray-600 font-semibold">
            Estimasi Margin Kotor ({form.margin_percentage}%)
          </label>
          <input
            disabled
            value={formatIDR(form.margin_value)}
            className="w-full border bg-gray-100 rounded-lg p-3"
          />
        </div>

        {/* Budget Program */}
        <div>
          <label className="text-gray-600 font-semibold">
            Budget Program
          </label>
          <input
            disabled
            value={formatIDR(form.budget_program)}
            onBlur={() => markTouched("budget_program")}
            className="w-full border bg-gray-100 rounded-lg p-3"
          />
          {errText("budget_program")}
        </div>

        {/* Target Program */}
        <div>
          <label className="text-gray-600 font-semibold">
            Target Program (Omzet)
          </label>
          <input
            disabled
            value={formatIDR(form.target_program)}
            className="w-full border bg-gray-100 rounded-lg p-3"
          />
        </div>

        {/* Budget % */}
        <div>
          <label className="text-gray-600 font-semibold">
            Budget Percentage
          </label>
          <input
            disabled
            value={`${form.budget_percentage.toFixed(2)}%`}
            className="w-full border bg-gray-100 rounded-lg p-3"
          />
        </div>
      </div>

      {/* BUTTONS */}
      <div className="flex justify-between mt-8">
        <button
          onClick={() => onBack(form)}
          className="border border-gray-400 px-8 py-2 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="bg-[#002D62] text-white px-8 py-2 rounded-lg"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgramCostBenefitEdit;
