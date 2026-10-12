import React, { useEffect, useRef, useState } from "react";
import { UploadCloud, X } from "lucide-react";

const DragDropImage = ({ value, onChange, className = "h-[190px]" }) => {
  const inputRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    if (typeof value === "string") {
      setPreview(value);
      return;
    }

    const objectUrl = URL.createObjectURL(value);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  const handleFile = (file) => {
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png"];

    if (!allowedTypes.includes(file.type)) {
      alert("File harus JPG atau PNG");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Ukuran file maksimal 5MB");
      return;
    }

    onChange?.(file);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();

    onChange?.(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="w-full">
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setIsDragging(false);
        }}
        onDrop={(e) => {
          e.preventDefault();

          setIsDragging(false);

          const file = e.dataTransfer.files?.[0];

          handleFile(file);
        }}
        className={`
          relative
          flex
          flex-col
          items-center
          justify-center

          w-full
          ${className}

          overflow-hidden

          bg-white

          border-2
          border-dashed

          rounded-2xl

          cursor-pointer

          transition-all
          duration-200

          ${
            isDragging
              ? "border-[#0F3B73] bg-gray-50"
              : "border-gray-300 hover:border-gray-400"
          }
        `}
      >
        {!preview ? (
          <>
            <div className="flex items-center justify-center mb-2 rounded-full w-11 h-11 bg-gray-50">
              <UploadCloud
                size={27}
                strokeWidth={1.8}
                className="text-gray-500"
              />
            </div>

            <p className="text-sm font-medium text-gray-800">
              Upload image here
            </p>

            <div className="flex gap-2 mt-2">
              <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full ">
                JPG / PNG
              </span>

              <span className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full ">
                &lt; 5MB
              </span>
            </div>

            <p className="px-4 mt-2 text-xs text-center text-gray-400 ">
              Drag &amp; drop image here or click to browse
            </p>
          </>
        ) : (
          <>
            <img
              src={preview}
              alt="Preview"
              className="object-contain w-full h-full bg-white "
            />

            <button
              type="button"
              onClick={handleClear}
              className="absolute flex items-center justify-center w-8 h-8 text-gray-500 transition bg-white border border-gray-200 rounded-full shadow-sm top-3 right-3 hover:text-red-500"
            >
              <X size={16} />
            </button>
          </>
        )}

        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          className="hidden"
          onChange={(e) => {
            handleFile(e.target.files?.[0]);
          }}
        />
      </div>
    </div>
  );
};

export default DragDropImage;
