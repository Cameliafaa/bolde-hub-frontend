import React, { useState } from "react";
import { X, Check, AlertCircle } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

import StepRequestInfo from "./formAdd/stepInfoAdd";
import StepRequestDetail from "./formAdd/stepDetail";
import ReqSuccess from "./success";

const AddRequestModal = ({ open, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
  });

  const [formData, setFormData] = useState({
    info: {},
    detail: {},
  });

  if (!open) return null;

  const buildRequestFormData = (formData) => {
    const fd = new FormData();

    fd.append("name", formData.info.title);
    fd.append("description", formData.detail.description || "");
    fd.append("priority", "high");

    if (formData.info.tag) {
      fd.append("tag", formData.info.tag.name);
      fd.append("tag_id", formData.info.tag.id);
    }

    if (formData.detail.startDate) {
      fd.append(
        "start_date",
        new Date(formData.detail.startDate).toISOString().split("T")[0],
      );
    }

    if (formData.detail.endDate) {
      fd.append(
        "end_date",
        new Date(formData.detail.endDate).toISOString().split("T")[0],
      );
    }

    if (formData.detail.document) {
      fd.append("document", formData.detail.document);
    }

    if (formData.detail.notes) {
      fd.append("notes", formData.detail.notes);
    }

    fd.append("asm_id", formData.info.asm_id || "");
    fd.append("province_id", formData.info.province?.id || "");
    fd.append("program_id", formData.info.program?.id || "");
    fd.append("store_id", formData.info.store?.id || "");
    fd.append("channel_id", formData.info.channel?.id || "");

    [1, 2].forEach((id) => fd.append("approvals[]", id));

    return fd;
  };

  const steps = ["Info", "Request Detail"];

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

      setFormData(finalData);
      setSubmitting(true);

      try {
        const fd = buildRequestFormData(finalData);

        await ApiRequest({
          url: "/requests/create",
          method: "POST",
          data: fd,
          isFormData: true,
        });

        setShowSuccess(true);
      } catch (err) {
        console.error("CREATE REQUEST ERROR:", err);

        const apiMessage =
          err?.response?.data?.message ||
          err?.response?.data?.error ||
          "Request gagal dikirim. Pastikan semua data wajib sudah diisi dengan benar.";

        setErrorModal({
          open: true,
          title: "Request gagal dikirim",
          message: apiMessage,
        });
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
    setErrorModal({ open: false, title: "", message: "" });
    setFormData({ info: {}, detail: {} });
    setSubmitting(false);

    onClose();
    onSuccess?.();
  };

  return (
    <div className="fixed inset-0 z-[999]">
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-overlay backdrop-blur-sm animate-fadeIn"
      />

      <div className="absolute inset-x-0 bottom-0 sm:inset-0 sm:flex sm:items-center sm:justify-center">
        <div className="relative w-full p-5 overflow-y-auto bg-white shadow-2xl h-[92vh] sm:h-auto max-h-[95vh] sm:max-w-3xl lg:max-w-5xl rounded-t-3xl sm:rounded-3xl sm:p-8 lg:p-10 animate-slideUp">
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 rounded-full h-1.5 bg-surface-border" />
          </div>

          {!showSuccess && (
            <>
              <button
                onClick={handleClose}
                className="absolute p-2 bg-gray-100 rounded-full right-6 top-6 hover:bg-text-light"
                disabled={submitting}
              >
                <X size={20} />
              </button>

              <h2 className="mb-6 text-lg font-semibold sm:text-xl lg:text-2xl">
                Add Request
              </h2>

              <div className="flex flex-col items-start justify-center gap-4 mb-8 sm:flex-row sm:items-center sm:gap-0">
                {steps.map((label, index) => {
                  const s = index + 1;
                  const active = s === step;
                  const done = s < step;

                  return (
                    <div
                      key={index}
                      className="flex items-center cursor-pointer"
                      onClick={() => s <= step && !submitting && setStep(s)}
                    >
                      <div
                        className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-medium
                        ${
                          done
                            ? "bg-brand-first text-surface-background border-brand-first"
                            : active
                              ? "border-brand-first text-brand-first"
                              : "border-text-light text-text-secondary"
                        }`}
                      >
                        {done ? <Check size={18} /> : s}
                      </div>

                      <span
                        className={`ml-2 text-sm font-medium ${
                          done || active
                            ? "text-brand-first"
                            : "text-text-secondary"
                        }`}
                      >
                        {label}
                      </span>

                      {index < steps.length - 1 && (
                        <div
                          className={`hidden sm:block w-16 h-[2px] mx-3 ${
                            done ? "bg-brand-first" : "bg-text-light"
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}

          {!showSuccess ? (
            <>
              {step === 1 && (
                <StepRequestInfo data={formData.info} onNext={handleNext} />
              )}

              {step === 2 && (
                <StepRequestDetail
                  data={formData.detail}
                  onNext={handleNext}
                  onBack={handleBack}
                  submitting={submitting}
                  onError={(message) =>
                    setErrorModal({
                      open: true,
                      title: "Dokumen tidak sesuai",
                      message,
                    })
                  }
                />
              )}
            </>
          ) : (
            <ReqSuccess onClose={handleClose} />
          )}
        </div>
      </div>

      {errorModal.open && (
        <div className="fixed inset-0 flex items-center justify-center px-4 z-[1000] bg-black/40">
          <div className="w-full max-w-md p-6 bg-white shadow-2xl rounded-3xl animate-fadeIn">
            <div className="flex items-center justify-center w-12 h-12 mb-4 bg-red-100 rounded-full">
              <AlertCircle className="text-red-600" size={26} />
            </div>

            <h3 className="mb-2 text-lg font-semibold text-text-primary">
              {errorModal.title}
            </h3>

            <p className="mb-6 text-sm leading-relaxed text-text-secondary">
              {errorModal.message}
            </p>

            <button
              onClick={() =>
                setErrorModal({ open: false, title: "", message: "" })
              }
              className="w-full px-5 py-3 text-sm font-semibold text-white rounded-xl bg-brand-first hover:bg-brand-primary"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddRequestModal;
