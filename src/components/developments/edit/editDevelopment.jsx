import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import StepEditDevInfo from "./form/stepEditDevInfo";
import StepEditDevQuestions from "./form/stepEditDevQuestions";
import StepDevEditSuccess from "../editSuccess";

const EditDevelopmentModal = ({ open, onClose, developmentId, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [devInfo, setDevInfo] = useState(null);
  const [finishSuccess, setFinishSuccess] = useState(false);

  const steps = ["Development Info", "Video + Questions"];

  useEffect(() => {
    if (open) {
      setStep(1);
      setDevInfo(null);
      setFinishSuccess(false);
    }
  }, [open, developmentId]);

  const handleNext = (data) => {
    if (step === 1) {
      setDevInfo(data?.info || null);
      setStep(2);
      return;
    }

    if (step === 2) {
      setFinishSuccess(true);
    }
  };

  const handleClose = () => {
    setStep(1);
    setDevInfo(null);
    setFinishSuccess(false);

    onClose();
  };

  const handleSuccessClose = async () => {
    setStep(1);
    setDevInfo(null);
    setFinishSuccess(false);

    onClose();

    await onSuccess?.();
  };

  if (!open) return null;

  /* =====================================================
     SUCCESS MODAL BERDIRI SENDIRI
     Wrapper edit TIDAK ikut dirender
  ===================================================== */
  if (finishSuccess) {
    return <StepDevEditSuccess onClose={handleSuccessClose} />;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-overlay sm:items-center">
      <div className="w-full h-full p-5 overflow-y-auto border shadow-xl  bg-surface-card sm:max-w-3xl lg:max-w-5xl sm:h-auto rounded-t-3xl sm:rounded-3xl border-surface-border sm:p-8 lg:p-10 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="mb-6 text-lg font-semibold sm:text-xl lg:text-2xl">
            Edit Development
          </h2>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 transition rounded-full  bg-surface-background text-text-secondary hover:bg-surface-border"
          >
            <X />
          </button>
        </div>

        {/* STEPPER */}
        <div className="flex flex-col items-start justify-center gap-4 mb-8  sm:flex-row sm:items-center sm:gap-0">
          {steps.map((label, idx) => {
            const n = idx + 1;

            return (
              <div key={idx} className="flex items-center">
                <div
                  className={`
                    w-9 h-9
                    rounded-full
                    flex items-center justify-center
                    border-2

                    ${
                      n < step
                        ? "bg-brand-first text-white border-brand-first"
                        : n === step
                          ? "border-brand-first text-brand-first"
                          : "border-surface-border text-text-light"
                    }
                  `}
                >
                  {n < step ? <Check size={16} /> : n}
                </div>

                <span className="ml-2 mr-4 text-sm">{label}</span>
              </div>
            );
          })}
        </div>

        {/* STEP CONTENT */}
        {step === 1 && (
          <StepEditDevInfo developmentId={developmentId} onNext={handleNext} />
        )}

        {step === 2 && (
          <StepEditDevQuestions
            developmentId={developmentId}
            info={devInfo}
            onFinish={handleNext}
            onBack={() => setStep(1)}
          />
        )}
      </div>
    </div>
  );
};

export default EditDevelopmentModal;
