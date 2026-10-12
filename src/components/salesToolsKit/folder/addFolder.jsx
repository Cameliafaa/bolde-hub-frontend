import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import DragDropImage from "../../common/dragImage";

const AddFolderModal = ({
  show,
  onClose,
  onSubmit,
  loading,
  name,
  desc,
  iconFile,
  setName,
  setDesc,
  setIconFile,
}) => {
  const [iconPreview, setIconPreview] = useState(null);

  // PREVIEW IMAGE jika memilih file baru
  useEffect(() => {
    if (!show) return;

    if (iconFile instanceof File) {
      setIconPreview(URL.createObjectURL(iconFile));
    } else {
      setIconPreview(null);
    }
  }, [show, iconFile]);

  if (!show) return null;

  return (
    <div className="
  fixed inset-0 z-50
  bg-overlay
  flex items-end sm:items-center
  justify-center
">
      <div
        className="
    bg-surface-background
    w-full
    max-w-full sm:max-w-lg

    rounded-t-3xl sm:rounded-2xl
    p-6 sm:p-8

    shadow-lg
    relative

    animate-slideUpMobile
    sm:animate-none
  "
      >

        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute right-5 top-5">
          <X size={22} className="text-text-secondary hover:text-text-primary" />
        </button>

        <h3 className="text-lg font-semibold text-brand-first mb-6">
          Add Folder
        </h3>

        {/* NAME */}
        <label className="text-sm font-medium">Folder Name</label>
        <input
          className="w-full mt-1 px-4 py-2 border border-text-secondary  bg-surface-card rounded-lg mb-4 focus:outline-brand-secondary"
          placeholder="Enter folder name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* DESCRIPTION */}
        <label className="text-sm font-medium">Description</label>
        <textarea
          className="w-full mt-1 px-4 py-2 border border-text-secondary bg-surface-card rounded-lg mb-4 focus:outline-brand-secondary"
          placeholder="Optional description..."
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
        />

        {/* ICON UPLOAD */}
        <label className="text-sm font-medium">Folder Icon (optional)</label>

        <DragDropImage
          value={iconFile}
          onChange={(file) => setIconFile(file)}
        />

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3">
          {/* <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border text-gray-600"
          >
            Cancel
          </button> */}

          <button
            onClick={onSubmit}
            disabled={loading}
            className="px-4 py-2 bg-brand-first mt-4 text-white rounded-lg hover:bg-brand-secondary"
          >
            {loading ? "Saving..." : "Create"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default AddFolderModal;
