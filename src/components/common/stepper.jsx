import React from "react";
import { Check } from "lucide-react";

const Stepper = ({ steps, activeStep }) => {
  return (
    <div className="flex justify-center mb-10">
      {steps.map((label, index) => {
        const stepNum = index + 1;
        const isCompleted = stepNum < activeStep;
        const isActive = stepNum === activeStep;

        return (
          <div key={index} className="flex items-center">
            {/* CIRCLE */}
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full border-2 text-sm font-medium
                ${
                  isCompleted
                    ? "bg-[#002D62] text-white border-[#002D62]"
                    : isActive
                    ? "border-[#002D62] text-[#002D62]"
                    : "border-gray-300 text-gray-400"
                }`}
            >
              {isCompleted ? <Check size={18} /> : stepNum}
            </div>

            {/* LABEL */}
            <p
              className={`ml-2 text-sm font-medium ${
                isCompleted || isActive
                  ? "text-[#002D62]"
                  : "text-gray-400"
              }`}
            >
              {label}
            </p>

            {/* LINE */}
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-[2px] mx-3 ${
                  isCompleted ? "bg-[#002D62]" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Stepper;
