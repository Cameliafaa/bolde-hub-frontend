import React, { useState } from "react";
import { X, Check } from "lucide-react";
import StepDevInfo from "./form/stepDevInfo";
import StepDevQuestions from "./form/stepDevQuestions";
import StepDevSuccess from "../success";

const AddDevelopmentModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [developmentCreated, setDevelopmentCreated] = useState(null);
  const [devInfo, setDevInfo] = useState(null);
  const [videoLessons, setVideoLessons] = useState([]);
  const [finishSuccess, setFinishSuccess] = useState(false);

  const steps = ["Development Info", "Video + Questions"];

  const handleNext = (data) => {
    if (step === 1) {
      setDevInfo(data.info);
    }

    if (step === 2) {
      setVideoLessons(data.savedSets);
      setFinishSuccess(true);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const handleSuccessClose = () => {
    setStep(1);
    setDevInfo(null);
    setVideoLessons([]);
    setDevelopmentCreated(null);
    setFinishSuccess(false);

    onClose();
    onSuccess?.();
  };

  /* =========================================
     SUCCESS BERDIRI SENDIRI
     TIDAK PAKAI WRAPPER ADD DEVELOPMENT
  ========================================= */
  if (finishSuccess) {
    return (
      <StepDevSuccess
        developmentCreated={developmentCreated}
        onClose={handleSuccessClose}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto shadow-xl bg-surface-card sm:max-w-3xl lg:max-w-5xl rounded-t-3xl sm:rounded-3xl sm:p-8 lg:p-10 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold sm:text-xl lg:text-2xl text-text-primary">
            Add Development
          </h2>

          <button
            onClick={onClose}
            className="absolute p-2 transition rounded-full top-4 right-4 sm:top-6 sm:right-6 bg-surface-background text-text-secondary hover:bg-surface-border"
          >
            <X size={20} />
          </button>
        </div>

        {/* STEPPER */}
        <div className="flex flex-col items-start justify-center gap-4 mb-8 sm:flex-row sm:items-center sm:gap-0">
          {steps.map((label, index) => {
            const stepNum = index + 1;
            const isCompleted = stepNum < step;
            const isActive = stepNum === step;

            return (
              <div key={index} className="flex items-center">
                <div
                  className={`
                    w-10 h-10
                    flex items-center justify-center
                    rounded-full
                    border-2
                    text-sm
                    font-medium

                    ${
                      isCompleted
                        ? "bg-brand-first text-white border-brand-first"
                        : isActive
                          ? "border-brand-first text-brand-first"
                          : "border-surface-border text-text-light"
                    }
                  `}
                >
                  {isCompleted ? <Check size={18} /> : stepNum}
                </div>

                <p
                  className={`
                    ml-2
                    text-sm

                    ${
                      isCompleted || isActive
                        ? "text-brand-first"
                        : "text-text-light"
                    }
                  `}
                >
                  {label}
                </p>

                {index < steps.length - 1 && (
                  <div
                    className={`
                      hidden
                      sm:block
                      w-16
                      h-[2px]
                      mx-2

                      ${isCompleted ? "bg-brand-first" : "bg-surface-border"}
                    `}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* CONTENT */}
        <div className="animate-fadeIn">
          {step === 1 && <StepDevInfo onNext={handleNext} />}

          {step === 2 && (
            <StepDevQuestions
              info={devInfo}
              onNext={handleNext}
              onBack={handleBack}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddDevelopmentModal;
