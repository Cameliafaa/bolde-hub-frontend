import React, { useState } from "react";
import { X, Check } from "lucide-react";
import StepSpecialProgramInfo from "./form/stepSpecialProgramInfo";
import StepSpecialProgramLetter from "./form/stepSpecialProgramLetter";
import StepProgramSuccess from "../../addProgram/stepSuccess";

const AddSpecialProgramModal = ({ onClose, onSuccess, currentMenuUrl }) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);

  const [formData, setFormData] = useState({
    info: {},
    letter: {},
    programCreated: null,
  });

  const steps = ["Program Info", "Program Letter"];

  const handleNext = (data) => {
    if (step === 1) {
      setFormData((prev) => ({
        ...prev,
        info: {
          ...data,
          url_path: currentMenuUrl || "/program-center",
        },
      }));
    }

    if (step === 2) {
      setFormData((prev) => ({ ...prev, letter: data }));
      setShowSuccess(true);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="fixed inset-0 bg-overlay z-50 flex items-end sm:items-center justify-center">
      <div
        className={`bg-surface-background w-full sm:max-w-3xl lg:max-w-6xl
        rounded-t-3xl sm:rounded-3xl shadow-xl relative
        p-6 sm:p-8 lg:p-10 max-h-[95vh] overflow-y-auto
        animate-slideUpMobile sm:animate-none ${showSuccess ? "max-w-3xl w-full" : "max-w-6xl w-full"}`}
      >
        {!showSuccess && (
          <>
            <div className="mb-5">
              <h2 className="text-2xl font-semibold">Add Special Program</h2>
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
                      className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-medium ${
                        isCompleted
                          ? "bg-brand-first text-surface-background"
                          : isActive
                          ? "border-brand-first"
                          : "border-text-light"
                      }`}
                    >
                      {isCompleted ? <Check size={18} /> : stepNum}
                    </div>

                    <div
                      className={`ml-2 text-sm font-medium ${
                        isCompleted || isActive ? "text-brand-first" : "text-text-light"
                      }`}
                    >
                      {label}
                    </div>

                    {index < steps.length - 1 && (
                      <div
                        className={`hidden sm:block w-16 h-[2px] mx-2 ${
                          isCompleted ? "bg-brand-first" : "bg-text-light"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Content */}
        <div className="animate-fadeIn">
          {!showSuccess ? (
            <>
              {step === 1 && (
                <StepSpecialProgramInfo
                  data={formData.info}
                  onNext={handleNext}
                />
              )}

              {step === 2 && (
                <StepSpecialProgramLetter
                  data={formData.letter}
                  allData={formData}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
            </>
          ) : (
            <StepProgramSuccess
              data={formData}
              onClose={() => {
                onClose();
                if (onSuccess) onSuccess();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSpecialProgramModal;