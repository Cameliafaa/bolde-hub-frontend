import React, { useState, useEffect } from "react";
import { ApiRequest } from "../../../../services/apiRequest";
import { downloadSellingAchieveTemplate } from "../../../../services/programSelling/templateSellingAchieve";

const UpdateDataModal = ({
  open,
  onClose,
  programSellingAchieveId,
  programId,
  onSuccess,
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleImport = async () => {
    if (!file) {
      console.warn("⚠️ No file selected");
      alert("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);

      const res = await ApiRequest({
        url: `/program-selling-achieve-details/import/${programId}`,
        method: "POST",
        data: formData,
        isFormData: true,
      });

      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error("❌ IMPORT FAILED");
      console.error("❌ ERROR OBJECT:", err);
      console.error("❌ ERROR RESPONSE:", err?.response);
      console.error("❌ ERROR DATA:", err?.response?.data);

      alert(err?.response?.data?.message || "Failed to import Excel");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      setLoading(true);
      await downloadSellingAchieveTemplate(programSellingAchieveId);
    } catch (err) {
      alert("Failed to download template");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="p-8 bg-white w-[600px] rounded-2xl">
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold">Update Data</h2>
          <button onClick={onClose} className="text-2xl text-gray-400">
            ×
          </button>
        </div>

        {/* FILE INPUT */}
        <div className="mb-10">
          <p className="mb-3 text-lg font-medium">Import from Excel</p>

          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={(e) => {
              setFile(e.target.files[0]);
            }}
            className="w-full text-sm"
          />
        </div>

        {/* ACTION */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleDownloadTemplate}
            disabled={loading}
            className="px-8 py-3 font-medium text-white bg-blue-500 rounded-2xl disabled:opacity-50"
          >
            {loading ? "Generating..." : "Download Template"}
          </button>

          <button
            onClick={handleImport}
            disabled={loading}
            className="px-8 py-3 font-medium text-white rounded-2xl bg-[#05264E] disabled:opacity-50"
          >
            {loading ? "Importing..." : "Import Excel"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateDataModal;
