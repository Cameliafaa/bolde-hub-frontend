import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

const EditFolderModal = ({
    open,
    onClose,
    name,
    desc,
    iconFile,
    setName,
    setDesc,
    setIconFile,
    onSubmit,
    loading,
}) => {

    const [iconPreview, setIconPreview] = useState(null);

    // HANDLE PREVIEW (ikon lama / ikon baru)
    useEffect(() => {
        if (!open) return;

        if (iconFile instanceof File) {
            setIconPreview(URL.createObjectURL(iconFile));
        } else if (typeof iconFile === "string" && iconFile !== "") {
            setIconPreview(iconFile);
        } else {
            setIconPreview(null);
        }
    }, [open, iconFile]);

    if (!open) return null;

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

                <button onClick={onClose} className="absolute right-6 top-6">
                    <X size={22} className="text-gray-400 hover:text-text-primary" />
                </button>

                <h2 className="text-2xl font-semibold mb-6">Edit Folder</h2>

                {/* NAME */}
                <label className="text-sm font-medium">Folder Name</label>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-text-secondary bg-surface-card px-4 py-2 rounded-lg mb-4"
                />

                {/* DESCRIPTION */}
                <label className="text-sm font-medium">Description</label>
                <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="w-full border border-text-secondary bg-surface-card px-4 py-2 rounded-lg mb-4"
                />

                {/* ICON UPLOAD */}
                <label className="text-sm font-medium">Folder Icon</label>

                <div
                    className="bg-surface-background rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer mb-6 border border-dashed border-text-gray"
                    onClick={() => document.getElementById("folderIconInput").click()}
                >
                    {iconPreview ? (
                        <img
                            src={iconPreview}
                            className="w-full h-full object-cover rounded-xl"
                        />
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-text-primary"
                                fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            <p className="text-gray-500 text-sm mt-2">Upload icon here</p>
                        </>
                    )}
                </div>

                <input
                    id="folderIconInput"
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            setIconFile(file);
                            setIconPreview(URL.createObjectURL(file));
                        }
                    }}
                />

                {/* BUTTON */}
                <div className="flex justify-end mt-4">
                    <button
                        onClick={onSubmit}
                        disabled={loading}
                        className="bg-brand-first text-white px-6 py-2 rounded-lg hover:bg-brand-secondary"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EditFolderModal;
