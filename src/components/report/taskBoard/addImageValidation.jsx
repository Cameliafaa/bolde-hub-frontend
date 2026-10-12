import React from "react";
import { X } from "lucide-react";
import DragDropImage from "../../common/dragImage";

const DoneValidationModal = ({
  show,
  onClose,
  onConfirm,
  file,
  setFile,
  submitting,
  taskTitle,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999] bg-black/40">
      <div className="w-full max-w-lg p-6 bg-white shadow-xl rounded-3xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold">Validasi Done</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-[#F6FAFF] hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-4 text-sm text-gray-600">
          Upload image validasi untuk task:
          <div className="mt-1 font-semibold text-gray-900">{taskTitle}</div>
        </div>

        <div className="mb-5">
          <label className="block mb-2 font-semibold text-gray-600">
            Image Validation
          </label>

          <DragDropImage value={file} onChange={setFile} />
        </div>

        {file && typeof file !== "string" && (
          <div className="p-4 mb-5 text-sm text-gray-700 rounded-2xl bg-gray-50">
            {file.name}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-5 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="px-6 py-2 text-white rounded-lg bg-[#002D62]"
          >
            {submitting ? "Uploading..." : "OK"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoneValidationModal;
