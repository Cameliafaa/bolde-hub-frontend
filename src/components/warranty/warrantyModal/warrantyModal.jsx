// ClaimModal.jsx
import React, { useEffect, useState } from "react";
import { X, Check } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";
import ClaimSuccess from "./success";
import StepClaimInfo from "./form/stepInfo";
import StepClaimDetail from "./form/stepDetail";

const ClaimModal = ({
    open,
    mode = "add", // "add" | "edit"
    claim = null,
    onClose,
    onSuccess,
}) => {
    const isEdit = mode === "edit";

    const [step, setStep] = useState(1);
    const [showSuccess, setShowSuccess] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        info: {},
        detail: {},
    });

    const QTY_OPTIONS = [
        { id: 1, qty: 1, unit: "PCS", name: "1 Unit" },
        { id: 2, qty: 2, unit: "PCS", name: "2 Unit" },
        { id: 3, qty: 3, unit: "PCS", name: "3 Unit" },
        { id: 4, qty: 4, unit: "PCS", name: "4 Unit" },
        { id: 5, qty: 5, unit: "PCS", name: "5 Unit" },
    ];


    /* ================= PREFILL EDIT ================= */
    useEffect(() => {
        if (!open) return;

        if (isEdit && claim) {
            setFormData({
                info: {
                    area: { id: claim.area_id, name: claim.area_name },
                    store: { id: claim.store_id, name: claim.store_name },
                    category: { id: claim.category_id, name: claim.category_name },
                    product: { id: claim.product_id, name: claim.product_name },
                    quantity: QTY_OPTIONS.find(
                        q => q.qty === claim.unit_quantity && q.unit === claim.unit_name
                    ) || null
                },
                detail: {
                    serial_number: claim.serial_number,
                    issue: claim.problem_desc,
                },
            });
        } else {
            setFormData({ info: {}, detail: {} });
        }

        setStep(1);
        setShowSuccess(false);
    }, [open, isEdit, claim]);

    if (!open) return null;

    const steps = ["Info Klaim", "Detail Klaim"];

    /* ================= NEXT ================= */
    const handleNext = async (data) => {
        if (step === 1) {
            setFormData(prev => ({ ...prev, info: data }));
            setStep(2);
            return;
        }

        if (step === 2) {
            const finalData = { ...formData, detail: data };
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
                fd.append("serial_number", String(finalData.detail.serial_number));
                fd.append("problem_desc", finalData.detail.issue);

                if (!isEdit) {
                    fd.append("status", "Waiting");
                }

                // FILES
                if (finalData.detail.receipt)
                    fd.append("receipt_file", finalData.detail.receipt);
                if (finalData.detail.condition)
                    fd.append("product_file", finalData.detail.condition);
                if (finalData.detail.handover)
                    fd.append("other_file", finalData.detail.handover);

                const res = await ApiRequest({
                    url: isEdit
                        ? `/warranty-claims/update/${claim.claim_id}`
                        : "/warranty-claims/create",
                    method: isEdit ? "PUT" : "POST",
                    data: fd,
                    isFormData: true,
                });

                if (res?.status !== "success") {
                    throw new Error("Submit failed");
                }

                if (isEdit) {
                    onClose();
                    onSuccess?.();
                } else {
                    setShowSuccess(true);
                }
            } catch (err) {
                alert(isEdit ? "Gagal update klaim" : "Gagal membuat klaim");
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
    <div className="fixed inset-0 z-[999]">

              {/* Overlay */}
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-fadeIn"
      />

      {/* Modal Container */}
      <div className="
    absolute inset-x-0 bottom-0
    sm:inset-0 sm:flex sm:items-center sm:justify-center
  ">

        <div
          className="
    relative
    bg-surface-background
    w-full
    h-[92vh] sm:h-auto
    max-h-[95vh]
    sm:max-w-3xl lg:max-w-5xl

    rounded-t-3xl sm:rounded-3xl
    shadow-2xl

    p-5 sm:p-8 lg:p-10
    overflow-y-auto

    animate-slideUp
  "
        >
          {/* MOBILE DRAG HANDLE */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 h-1.5 bg-surface-border rounded-full" />
          </div>

                {/* HEADER & STEPPER */}
                {!showSuccess && (
                    <>
                        <button
                            onClick={handleClose}
                            className="absolute right-6 top-6 p-2 bg-surface-background rounded-full hover:bg-surface-border"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-lg sm:text-xl lg:text-2xl font-semibold mb-6">
                            {isEdit ? "Edit Claim" : "Add Claim"}
                        </h2>

                        {/* 🔥 STEPPER — COPY EXACT DARI ADD */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-center gap-4 mb-8">
                            {steps.map((label, index) => {
                                const s = index + 1;
                                const active = s === step;
                                const done = s < step;

                                return (
                                    <div key={index} className="flex items-center">
                                        <div
                                            className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-medium
                        ${done
                                                    ? "bg-[brand-first text-white border-brand-first"
                                                    : active
                                                        ? "border-brand-first text-brand-first"
                                                        : "border-surface-border text-text-light"
                                                }`}
                                        >
                                            {done ? <Check size={18} /> : s}
                                        </div>

                                        <span
                                            className={`ml-2 text-sm font-medium ${done || active
                                                ? "text-brand-first"
                                                : "text-text-light"
                                                }`}
                                        >
                                            {label}
                                        </span>

                                        {index < steps.length - 1 && (
                                            <div className="hidden sm:block w-16 h-[2px] mx-3 bg-surface-background" />
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
        </div>
    );
};

export default ClaimModal;
