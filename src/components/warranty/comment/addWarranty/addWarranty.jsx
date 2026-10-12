// AddClaimModal.jsx
import React, { useState } from "react";
import { X, Check } from "lucide-react";

import StepClaimInfo from "./form/stepInfoWarranty";
import StepClaimDetail from "./form/stepDetailWarranty";
import ClaimSuccess from "./claimSuccess";
import { ApiRequest } from "../../../../services/apiRequest";

const AddClaimModal = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    info: {},
    detail: {},
  });

  if (!open) return null;

  const steps = ["Info Klaim", "Detail Klaim"];

  const handleNext = async (data) => {
    if (step === 1) {
      setFormData((prev) => ({ ...prev, info: data }));
      setStep(2);
      return;
    }

    if (step === 2) {
      const finalData = {
        ...formData,
        detail: data,
      };

      setSubmitting(true);

      try {
        const fd = new FormData();

        // INFO
        fd.append("area_id", finalData.info.area.id);
        fd.append("store_id", finalData.info.store.id);
        fd.append("category_id", finalData.info.category.id);
        fd.append("product_id", finalData.info.product.id);
        fd.append("unit_quantity", finalData.info.quantity.qty);
        fd.append("unit_name", finalData.info.quantity.unit);

        // DETAIL
        fd.append(
          "serial_number",
          String(finalData.detail.serial_number), // 🔥 JANGAN Number()
        );
        fd.append(
          "problem_desc",
          finalData.detail.issue, // 🔥 WAJIB
        );
        fd.append("status", "Waiting");

        // FILES
        if (finalData.detail.receipt) {
          fd.append("receipt_file", finalData.detail.receipt);
        }
        if (finalData.detail.condition) {
          fd.append("product_file", finalData.detail.condition);
        }
        if (finalData.detail.handover) {
          fd.append("other_file", finalData.detail.handover);
        }
        // 🔥 DEBUG FORM DATA
        for (let pair of fd.entries()) {
        }

        const res = await ApiRequest({
          url: "/warranty-claims/create",
          method: "POST",
          data: fd,
          isFormData: true, // 🔥 WAJIB
        });

        if (res?.status !== "success") {
          throw new Error("Create claim failed");
        }

        setShowSuccess(true);
      } catch (err) {
        console.error("Create claim error:", err);
        alert("Gagal membuat klaim");
      } finally {
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1 && !submitting) setStep(step - 1);
  };

  const handleClose = () => {
    setStep(1);
    setShowSuccess(false);
    setFormData({ info: {}, detail: {} });
    setSubmitting(false);

    onClose();
    onSuccess?.();
  };

  /* ================= RENDER ================= */

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-[999]">
      <div className="relative w-full h-full max-w-full p-4 overflow-y-auto bg-white rounded-none shadow-xl sm:h-auto sm:max-w-3xl lg:max-w-5xl sm:rounded-2xl lg:rounded-3xl sm:p-6 lg:p-10">
        {/* HEADER & STEPPER */}
        {!showSuccess && (
          <>
            <button
              onClick={handleClose}
              className="absolute p-2 bg-gray-100 rounded-full right-6 top-6 hover:bg-gray-200"
            >
              <X size={20} />
            </button>

            <h2 className="mb-6 text-lg font-semibold sm:text-xl lg:text-2xl">
              Add Claim
            </h2>

            {/* STEPPER */}
            <div className="flex flex-col items-start justify-center gap-4 mb-8 sm:flex-row sm:items-center">
              {steps.map((label, index) => {
                const s = index + 1;
                const active = s === step;
                const done = s < step;

                return (
                  <div key={index} className="flex items-center">
                    <div
                      className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-medium
                        ${
                          done
                            ? "bg-[#002D62] text-white border-[#002D62]"
                            : active
                              ? "border-[#002D62] text-[#002D62]"
                              : "border-gray-300 text-gray-400"
                        }`}
                    >
                      {done ? <Check size={18} /> : s}
                    </div>

                    <span
                      className={`ml-2 text-sm font-medium ${
                        done || active ? "text-[#002D62]" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </span>

                    {index < steps.length - 1 && (
                      <div className="hidden w-16 mx-3 bg-gray-200 sm:block h-[2px]" />
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* CONTENT */}
        {!showSuccess ? (
          <>
            {step === 1 && (
              <StepClaimInfo data={formData.info} onNext={handleNext} />
            )}

            {step === 2 && (
              <StepClaimDetail
                data={formData.detail}
                onNext={handleNext}
                onBack={handleBack}
                submitting={submitting}
              />
            )}
          </>
        ) : (
          <ClaimSuccess onClose={handleClose} />
        )}
      </div>
    </div>
  );
};

export default AddClaimModal;
