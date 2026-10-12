// src/components/programCenter/editProgram/editProgram.jsx
import React, { useState } from "react";
import { X, Check } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import StepProgramInfoEdit from "./form/stepProgramInfoEdit";
import StepProgramItemsEdit from "./form/stepProgramItemsEdit";
import StepProgramCostBenefitEdit from "./form/stepProgramBudgetEdit";
import StepProgramLetterEdit from "./form/stepProgramLetterEdit";
import StepProgramSuccessEdit from "./stepSuccessEdit";

const EditProgramModal = ({ program, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  // ===== INITIAL FORM DATA =====
  const [formData, setFormData] = useState({
    program_id: program.program_id,

    info: {
      namaProgram: program.name,
      startDate: program.period_start,
      endDate: program.period_end,
      area: program.areas?.map((a) => ({
        id: a.area_id,
        name:
          a.area_name || // backend version A
          a.name || // backend version B
          a.area || // backend version C
          a.label || // optional
          a.title || // optional fallback
          "",
      })),

      channel: program.channels?.map((c) => ({
        id: c.channel_id,
        name:
          c.channel_name || // backend version A
          c.name || // backend version B
          c.channel || // backend version C
          c.title || // fallback version
          "",
      })),

      province: (program.provinces || program.program_provinces || []).map(
        (p) => ({
          id: p.province_id,
          name: p.province_name || p.name || "",
        }),
      ),

      store: (program.stores || program.program_stores || []).map((s) => ({
        id: s.store_id,
        name: s.store_name || s.name || "",
      })),

      programType: program.program_types?.length
        ? { id: program.program_types[0].type_id }
        : null,

      // Simpan approvalLine existing (kalau dibutuhkan di tempat lain)
      approvalLine: program.approvals || [],
    },

    items: program.items || [],

    budget: {
      monthly_turnover: program.monthly_turnover,
      margin_percentage: program.margin_percentage,
      budget_program: program.budget_program,
      target_program: program.target_program,
    },

    letter: Array.isArray(program.program_letters)
      ? program.program_letters[0] || {}
      : program.program_letters || {},
  });

  const steps = [
    "Program Info",
    "Item & Budgeting",
    "Cost & Benefit",
    "Program Letter",
  ];

  // ============= HANDLE NEXT =============
  const handleNext = async (data) => {
    if (step === 1) {
      setFormData((prev) => ({
        ...prev,
        info: {
          ...data,
          // kalau mau simpan approvalLine lama, bisa di sini
          approvalLine: prev.info.approvalLine,
        },
      }));
      return setStep(2);
    }

    if (step === 2) {
      setFormData((prev) => ({
        ...prev,
        items: data.program_items,
        total_budget: data.total_budget,
      }));
      return setStep(3);
    }

    if (step === 3) {
      setFormData((prev) => ({
        ...prev,
        budget: {
          ...data,
          budget_program: data.budget_program || prev.total_budget || 0,
        },
      }));
      return setStep(4);
    }

    // ========== STEP 4 → SUBMIT UPDATE ==========
    if (step === 4) {
      // data di sini = output dari StepProgramLetter
      const letterPayload = data;

      const info = formData.info;
      const budget = formData.budget;
      const items = formData.items;

      // Siapkan payload final untuk PUT
      const payload = {
        name: info.namaProgram,
        description: `Program Promosi ${info.namaProgram}`,
        priority: "High",
        program_category_id: 1,

        // INFO
        period_start: info.startDate,
        period_end: info.endDate,

        program_areas: (info.area || []).map((a) => ({ area_id: a.id })),
        program_channels: (info.channel || []).map((c) => ({
          channel_id: c.id,
        })),

        program_provinces: (info.province || []).map((p) => ({
          province_id: p.id,
        })),

        program_stores: (info.store || []).map((s) => ({
          store_id: s.id,
        })),
        program_types: info.programType
          ? [{ type_id: info.programType.id }]
          : [],

        // BUDGET
        monthly_turnover: Number(budget.monthly_turnover),
        margin_percentage: Number(budget.margin_percentage),
        budget_program: Number(budget.budget_program),
        target_program: Number(budget.target_program),

        // ITEMS
        program_items: items,

        // LETTER
        program_letters: letterPayload,

        // status akan di-reset pending, backend bisa reset approval
        status: "pending",
      };

      try {
        await ApiRequest({
          url: `/programs/update/${program.program_id}`,
          method: "PUT",
          data: payload,
        });

        setShowSuccess(true);
      } catch (err) {
        console.error(err);
        alert("Failed to update program.");
      }

      return;
    }
  };

  const stepComplete = {
    1: !!formData.info.namaProgram,
    2: formData.items && formData.items.length > 0,
    3: !!formData.budget.budget_program,
    4: !!formData.letter,
  };

  const handleBack = () => setStep((prev) => Math.max(1, prev - 1));

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center">
      <div
        className={`bg-surface-background
        w-full
        sm:max-w-3xl
        lg:max-w-6xl

        rounded-t-3xl sm:rounded-3xl
        shadow-xl
        relative

        p-6 sm:p-8 lg:p-10

        max-h-[95vh]
        overflow-y-auto

        animate-slideUpMobile
        sm:animate-none ${
          showSuccess ? "max-w-3xl w-full" : "max-w-6xl w-full"
        }`}
      >
        {!showSuccess && (
          <div className="mb-5">
            <h2 className="text-2xl font-semibold">Edit Program</h2>
            <button onClick={onClose} className="absolute top-6 right-6">
              <X size={20} />
            </button>
          </div>
        )}

        {!showSuccess && (
          <div className="flex flex-col items-start justify-center gap-4 mb-8 sm:flex-row sm:items-center sm:gap-0">
            {steps.map((label, i) => {
              const num = i + 1;
              return (
                <div
                  key={i}
                  className="flex items-center cursor-pointer"
                  onClick={() => {
                    if (
                      num === 1 ||
                      stepComplete[num - 1] ||
                      stepComplete[num]
                    ) {
                      setStep(num);
                    }
                  }}
                >
                  <div
                    className={`w-10 h-10 flex items-center justify-center rounded-full border-2
                      ${
                        num < step
                          ? "bg-brand-first text-surface-background"
                          : num === step
                            ? "border-brand-first"
                            : "border-text-light"
                      }`}
                  >
                    {num < step ? <Check size={18} /> : num}
                  </div>
                  <p
                    className={`ml-2 ${
                      num <= step ? "text-brand-first" : "text-text-light"
                    }`}
                  >
                    {label}
                  </p>

                  {i < steps.length - 1 && (
                    <div
                      className={`hidden sm:block w-16 h-[2px] mx-2 ${
                        num < step ? "bg-brand-first" : "bg-text-lig"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div>
          {!showSuccess ? (
            <>
              {step === 1 && (
                <StepProgramInfoEdit
                  data={formData.info}
                  onNext={handleNext}
                  isEdit={true}
                />
              )}

              {step === 2 && (
                <StepProgramItemsEdit
                  data={formData.items}
                  onNext={handleNext}
                  onBack={handleBack}
                  isEdit
                />
              )}

              {step === 3 && (
                <StepProgramCostBenefitEdit
                  data={formData.budget}
                  total_budget={formData.total_budget}
                  onNext={handleNext}
                  onBack={handleBack}
                  isEdit
                />
              )}

              {step === 4 && (
                <StepProgramLetterEdit
                  data={formData.letter}
                  allData={formData}
                  onNext={handleNext}
                  onBack={handleBack}
                  isEdit
                />
              )}
            </>
          ) : (
            <StepProgramSuccessEdit
              data={{ message: "Program updated successfully!" }}
              onClose={() => {
                onClose();
                onSuccess();
              }}
              isEdit
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default EditProgramModal;
