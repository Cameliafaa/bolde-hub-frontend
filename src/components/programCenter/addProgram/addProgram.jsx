import React, { useState } from "react";
import { X, Check } from "lucide-react";

// Steps
import StepProgramInfo from "./form/stepProgramInfo";
import StepProgramItems from "./form/stepProgramItems";
import StepProgramCostBenefit from "./form/stepProgramBudget";
import StepProgramLetter from "./form/stepProgramLetter";
import StepProgramSuccess from "./stepSuccess";
import StepSpecialProgramInfo from "../specialProgram/add/form/stepSpecialProgramInfo";
import StepSpecialProgramLetter from "../specialProgram/add/form/stepSpecialProgramLetter";

const AddProgramModal = ({ onClose, onSuccess, currentMenuUrl }) => {
  const [flowType, setFlowType] = useState(null);
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    info: {},
    items: [],
    total_budget: 0,
    budget: {},
    letter: {},
    programCreated: null,
  });

  const steps = flowType === "special"
    ? ["Program Info", "Program Letter"]
    : ["Program Info", "Item & Budgeting", "Cost & Benefit", "Program Letter"];

  const handleNext = (data) => {

    // ================= STEP 1 =================
    if (step === 1) {
      const categoryId = data.programCategory?.id;

      const type = categoryId === 2 ? "special" : "regular";
      setFlowType(type);

      setFormData(prev => ({
        ...prev,
        info: {
          ...data,
          url_path: currentMenuUrl || "/program-center",
        }
      }));

      setStep(2);
      return;
    }

    // ================= REGULAR FLOW =================
    if (flowType === "regular") {

      if (step === 2) {
        setFormData(prev => ({
          ...prev,
          items: data.program_items,
          total_budget: data.total_budget,
          target_selling_rupiah: data.target_selling_rupiah,
        }));
        setStep(3);
        return;
      }

      if (step === 3) {
        setFormData(prev => ({
          ...prev,
          budget: data,
        }));
        setStep(4);
        return;
      }

      if (step === 4) {
        setFormData(prev => ({
          ...prev,
          letter: data,
        }));
        setShowSuccess(true);
        return;
      }
    }

    // ================= SPECIAL FLOW =================
    if (flowType === "special") {

      if (step === 2) {
        setFormData(prev => ({
          ...prev,
          letter: data,
        }));
        setShowSuccess(true);
        return;
      }
    }
  }; const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCategoryChange = (category) => {
    const type = category?.id === 2 ? "special" : "regular";

    setFlowType(type);

    setFormData(prev => ({
      ...prev,
      info: {
        ...prev.info,
        programCategory: category,  // 🔥 SIMPAN VALUE DI PARENT
      }
    }));

    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-end sm:items-center justify-center">
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
        sm:animate-none ${showSuccess ? "max-w-3xl w-full" : "max-w-6xl w-full"
          }`}
      >
        {!showSuccess && (
          <>
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">Add Program</h2>
              <button
                onClick={onClose}
                className="absolute top-6 right-6 bg-[#F6FAFF] p-2 rounded-full hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Stepper */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 sm:gap-0 mb-8">
              {steps.map((label, index) => {
                const stepNum = index + 1;
                const isCompleted = stepNum < step;
                const isActive = stepNum === step;

                return (
                  <div
                    key={index}
                    className="flex items-center cursor-pointer"
                    onClick={() => stepNum <= step && setStep(stepNum)}
                  >
                    <div
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-medium ${isCompleted
                        ? "bg-brand-first text-surface-background"
                        : isActive
                          ? "border-brand-first"
                          : "border-text-light"
                        }`}
                    >
                      {isCompleted ? <Check size={18} /> : stepNum}
                    </div>

                    <div
                      className={`ml-2 text-sm font-medium ${isCompleted || isActive ? "text-brand-first" : "text-text-light"
                        }`}
                    >
                      {label}
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`hidden sm:block w-16 h-[2px] mx-2 ${isCompleted ? "bg-brand-first" : "bg-text-light"
                          }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* ===== STEP 1 (COMMON) ===== */}
        {/* ===== STEP 1 ===== */}
        {showSuccess && (
          <StepProgramSuccess
            onClose={() => {
              setShowSuccess(false);
              onClose?.();
            }}
          />
        )}
        {step === 1 && !showSuccess && (
          flowType === "special" ? (
            <StepSpecialProgramInfo
              data={formData.info}
              onNext={handleNext}
              onCategoryChange={handleCategoryChange}
            />
          ) : (
            <StepProgramInfo
              data={formData.info}
              onNext={handleNext}
              onCategoryChange={handleCategoryChange}
            />
          )
        )}        {/* ===== REGULAR FLOW ===== */}
        {flowType === "regular" && !showSuccess && (
          <>
            {step === 2 && (
              <StepProgramItems
                data={formData.items}
                onNext={handleNext}
                onBack={() => setStep(1)}
              />
            )}

            {step === 3 && (
              <StepProgramCostBenefit
                data={formData.budget}
                total_budget={formData.total_budget}
                target_selling_rupiah={formData.target_selling_rupiah}
                onNext={handleNext}
                onBack={() => setStep(2)}
              />
            )}

            {step === 4 && (
              <StepProgramLetter
                data={formData.letter}
                allData={formData}
                onNext={handleNext}
                onBack={() => setStep(3)}
              />
            )}
          </>
        )}

        {/* ===== SPECIAL FLOW ===== */}
        {flowType === "special" && !showSuccess && step === 2 && (
          <StepSpecialProgramLetter
            data={formData.letter}
            allData={formData}
            onNext={handleNext}
            onBack={() => setStep(1)}
          />
        )}        </div>
    </div>
  );
};

export default AddProgramModal;
