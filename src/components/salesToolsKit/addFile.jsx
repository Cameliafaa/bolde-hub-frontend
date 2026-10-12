import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

const AddFileModal = ({
  show,
  onClose,
  onSubmit,
  loading,
  categoryId,
  folderId,
}) => {

  const [selectedFile, setSelectedFile] = useState(null);
  const [fileError, setFileError] = useState("");

  if (!show) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    // Validasi ekstensi
    const allowed = ["pdf", "txt", "docx"];
    const ext = file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      setFileError("File must be PDF, DOCX or TXT.");
      setSelectedFile(null);
      return;
    }

    // Validasi size
    if (file.size > 10 * 1024 * 1024) {
      setFileError("File size must be under 10MB.");
      setSelectedFile(null);
      return;
    }

    setFileError("");
    setSelectedFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) {
      setFileError("Please choose a file first.");
      return;
    }
    onSubmit(selectedFile);
  };

  return (
    <div className="fixed inset-0 bg-overlayflex items-center justify-center z-50">
      <div className="bg-surface-background w-full max-w-lg rounded-2xl shadow-lg p-6">

        <h3 className="text-lg font-semibold text-brand-first mb-6">
          Upload File
        </h3>

        {/* Upload Box */}
        <label className="w-full bg-surface-background h-48 rounded-2xl flex flex-col items-center justify-center cursor-pointer border border-dashed border-text-secondary">
          <UploadCloud size={40} className="text-text-secondary mb-2" />

          <p className="text-text-secondary text-sm mb-3">
            {selectedFile ? selectedFile.name : "Upload file here"}
          </p>

          <div className="flex gap-2 text-xs font-medium">
            <span className="px-3 py-1 bg-text-light rounded-full">PDF</span>
            <span className="px-3 py-1 bg-text-light rounded-full">DOCX</span>
            <span className="px-3 py-1 bg-text-light rounded-full">TXT</span>
            <span className="px-3 py-1 bg-text-light rounded-full">&lt; 10 MB</span>
          </div>

          <input
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>

        {fileError && (
          <p className="text-status-danger text-sm mt-2">{fileError}</p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-text-secondary"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-brand-first text-surface-background rounded-lg hover:bg-brand-primary shadow-sm"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddFileModal;
