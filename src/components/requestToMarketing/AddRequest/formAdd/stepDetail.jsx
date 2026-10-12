import React, { useState } from "react";
import DatePicker from "react-datepicker";

const StepRequestDetail = ({ data, onNext, onBack, submitting, onError }) => {
  const [form, setForm] = useState({
    description: data?.description || "",
    notes: data?.notes || "",
    document: data?.document || null,
    startDate: data?.startDate || null,
    endDate: data?.endDate || null,
  });

  const [errors, setErrors] = useState({});

  const requiredLabel = (label) => (
    <label className="font-semibold text-text-secondary">
      {label} <span className="text-red-500">*</span>
    </label>
  );

  const allowedTypes = [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  const allowedExtensions = [".pdf", ".doc", ".docx"];
  const maxSize = 10 * 1024 * 1024;

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    const isValidType =
      allowedTypes.includes(file.type) ||
      allowedExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      e.target.value = "";

      setForm((prev) => ({
        ...prev,
        document: null,
      }));

      onError?.(
        "Format dokumen tidak didukung. Silakan upload file dengan format PDF, DOC, atau DOCX.",
      );

      return;
    }

    if (file.size > maxSize) {
      e.target.value = "";

      setForm((prev) => ({
        ...prev,
        document: null,
      }));

      onError?.("Ukuran file maksimal 10 MB.");

      return;
    }

    setErrors((prev) => ({ ...prev, document: "" }));
    setForm((prev) => ({ ...prev, document: file }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.description.trim()) {
      newErrors.description = "Description Project wajib diisi.";
    }

    if (!form.document) {
      newErrors.document = "Support Document wajib diupload.";
    }

    if (!form.startDate) {
      newErrors.startDate = "Event Date wajib diisi.";
    }

    if (!form.endDate) {
      newErrors.endDate = "End Date wajib diisi.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onNext(form);
  };

  return (
    <div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8">
        <div className="flex flex-col col-span-1 sm:col-span-2">
          {requiredLabel("Description Project")}
          <textarea
            placeholder="Input Description"
            className={`border p-4 rounded-xl ${
              errors.description ? "border-red-400" : ""
            }`}
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-red-500">{errors.description}</p>
          )}
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-text-secondary">
            Additional Notes
          </label>
          <textarea
            placeholder="Add Notes"
            className="p-4 border rounded-xl"
            rows={4}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        {/* SUPPORT DOCUMENT */}
        <div>
          {requiredLabel("Support Document")}

          <div
            className={`
      border rounded-xl overflow-hidden
      min-h-[160px]
      flex flex-col items-center justify-center
      text-center cursor-pointer hover:bg-surface-background
      ${errors.document ? "border-red-400" : ""}
    `}
          >
            <input
              type="file"
              className="hidden"
              id="upload-doc"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={handleFileChange}
            />

            {!form.document ? (
              <label
                htmlFor="upload-doc"
                className="flex flex-col items-center justify-center w-full cursor-pointer h-[160px]"
              >
                <p className="mb-3 text-sm text-text-secondary">
                  Upload Document
                </p>

                <div className="flex justify-center gap-2">
                  {["PDF", "DOC", "DOCX", "Max 10 MB"].map((t) => (
                    <span
                      key={t}
                      className="px-3 py-1 text-xs rounded-full bg-surface-background text-text-secondary"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </label>
            ) : form.document.type === "application/pdf" ? (
              <div className="w-full">
                <div className="flex items-center justify-between px-4 py-2 border-b bg-gray-50">
                  <p className="text-xs font-medium truncate text-text-secondary">
                    {form.document.name}
                  </p>

                  <label
                    htmlFor="upload-doc"
                    className="text-xs font-semibold cursor-pointer text-brand-first"
                  >
                    Change
                  </label>
                </div>

                <iframe
                  src={URL.createObjectURL(form.document)}
                  title="PDF Preview"
                  className="w-full h-[260px]"
                />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center w-full px-4 h-[160px]">
                <p className="text-sm font-semibold text-text-primary">
                  {form.document.name}
                </p>

                <p className="mt-1 text-xs text-text-secondary">
                  Preview hanya tersedia untuk file PDF.
                </p>

                <label
                  htmlFor="upload-doc"
                  className="mt-3 text-xs font-semibold cursor-pointer text-brand-first"
                >
                  Change Document
                </label>
              </div>
            )}
          </div>

          {errors.document && (
            <p className="mt-1 text-xs text-red-500">{errors.document}</p>
          )}
        </div>

        <div className="flex flex-col">
          {requiredLabel("Event Date")}
          <DatePicker
            selected={form.startDate}
            onChange={(d) => setForm({ ...form, startDate: d })}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className={`w-full p-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-first ${
              errors.startDate ? "border-red-400" : "border-text-light"
            }`}
          />
          {errors.startDate && (
            <p className="mt-1 text-xs text-red-500">{errors.startDate}</p>
          )}
        </div>

        <div className="flex flex-col">
          {requiredLabel("End Date")}
          <DatePicker
            selected={form.endDate}
            onChange={(d) => setForm({ ...form, endDate: d })}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className={`w-full p-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-first ${
              errors.endDate ? "border-red-400" : "border-text-light"
            }`}
          />
          {errors.endDate && (
            <p className="mt-1 text-xs text-red-500">{errors.endDate}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col-reverse justify-between gap-3 mt-6 sm:flex-row sm:gap-0">
        <button
          onClick={onBack}
          disabled={submitting}
          className="w-full px-6 border rounded-lg border-text-secondary py-2.5 sm:w-auto disabled:opacity-60"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full px-6 py-3 transition shadow-lg bg-brand-first text-surface-background rounded-xl hover:bg-brand-primary sm:w-auto disabled:opacity-60"
        >
          {submitting ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
};

export default StepRequestDetail;
