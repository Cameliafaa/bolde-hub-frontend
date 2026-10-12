import React, { useState } from "react";
import { ApiRequest } from "../../../../services/apiRequest";
import { UploadCloud, X } from "lucide-react";

const StepProgramLetterEdit = ({ data = {}, allData, onBack, onNext }) => {
  const [form, setForm] = useState({
    opening_text_html: data.opening_text_html || "",
    conclusion_text_html: data.conclusion_text_html || "",
    closing_text_html: data.closing_text_html || "",
    footer_text_html: data.footer_text_html || "",
    imageFile: null,
    imagePreview: null,
    loading: false,
  });

  const validate = () => {
    if (!form.conclusion_text_html.trim()) {
      alert("Objective Program is required");
      return false;
    }
    return true;
  };

  const formatLocalDate = (date) => {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    onNext({
      opening_text_html: form.opening_text_html,
      conclusion_text_html: form.conclusion_text_html,
      closing_text_html: form.closing_text_html,
      footer_text_html: form.footer_text_html,
    });
  };

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

        {/* OBJECTIVE */}
        <div>
          <label className="font-semibold">Objective Program</label>
          <textarea
            value={form.conclusion_text_html}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                conclusion_text_html: e.target.value,
              }))
            }
            className="border px-3 py-2 rounded-lg w-full"
            rows={8}
          />
        </div>

        {/* IMAGE UPLOAD */}
        <div>
          <label className="font-semibold">Upload Program Image</label>

          <div
            className="h-48 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer"
            onClick={() => document.getElementById("upload-edit-img").click()}
          >
            {!form.imagePreview ? (
              <>
                <UploadCloud size={40} />
                <p className="text-gray-500 mt-2">Upload Image</p>
              </>
            ) : (
              <div className="relative">
                <img
                  src={form.imagePreview}
                  alt="preview"
                  className="h-44 object-contain rounded-xl"
                />
                <button
                  className="absolute top-2 right-2 bg-white p-1 rounded-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    setForm((p) => ({ ...p, imagePreview: null }));
                  }}
                >
                  <X size={12} />
                </button>
              </div>
            )}

            <input
              id="upload-edit-img"
              type="file"
              className="hidden"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setForm((p) => ({
                  ...p,
                  imageFile: file,
                  imagePreview: URL.createObjectURL(file),
                }));
              }}
            />
          </div>
        </div>

      </div>

      <div className="flex justify-between mt-10">
        <button onClick={onBack} className="border px-6 py-2 rounded-lg">
          Back
        </button>

        <button
          onClick={handleSubmit}
          className="bg-[#002D62] text-white px-10 py-2 rounded-lg"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
};

export default StepProgramLetterEdit;
