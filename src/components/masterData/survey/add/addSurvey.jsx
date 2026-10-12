import React, { useState } from "react";
import { X } from "lucide-react";
import Stepper from "../../../common/stepper";
import StepSurveyInfo from "./form/stepInfo";
import StepSurveyQuestions from "./form/stepQuestions";
import StepSurveySuccess from "./success";

const AddSurveyModal = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [finishSuccess, setFinishSuccess] = useState(false);

  const steps = ["Survey Info", "Questions"];

  const handleNext = (data) => {
    if (step === 1) setSurveyInfo(data);
    if (step === 2) {
      setQuestions(data);
      setFinishSuccess(true);
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
      <div
        className={`
    bg-white
    w-full
    rounded-t-3xl sm:rounded-2xl
    shadow-xl
    relative
    sm:max-w-lg

    p-6 sm:p-8

    max-h-[95vh]
    overflow-y-auto

    animate-slideUpMobile
    sm:animate-none
  `}
      >
        {!finishSuccess && (
          <>
            <div className="mb-5 flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Add Survey</h2>
              <button onClick={onClose} className="bg-[#F6FAFF] p-2 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* STEPPER */}
            <Stepper steps={steps} activeStep={step} />
          </>
        )}

        <div className="animate-fadeIn">
          {!finishSuccess ? (
            <>
              {step === 1 && <StepSurveyInfo onNext={handleNext} />}
              {step === 2 && (
                <StepSurveyQuestions
                  info={surveyInfo}
                  onNext={handleNext}
                  onBack={handleBack}
                />
              )}
            </>
          ) : (
            <StepSurveySuccess
              onClose={() => {
                onClose();
                onSuccess?.();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AddSurveyModal;
