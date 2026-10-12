import React, { useEffect, useRef, useState } from "react";
import { FileText } from "lucide-react";
import * as pdfjsLib from "pdfjs-dist";
import "pdfjs-dist/build/pdf.worker.entry";

const PDFPreviewCard = ({ fileUrl, fileName }) => {
  const canvasRef = useRef(null);
  const [meta, setMeta] = useState({
    pages: "-",
    size: "-",
  });

  useEffect(() => {
    const loadPdf = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument(fileUrl);
        const pdf = await loadingTask.promise;

        // PAGE COUNT
        setMeta((prev) => ({
          ...prev,
          pages: pdf.numPages,
        }));

        // RENDER FIRST PAGE
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1 });

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");

        canvas.width = viewport.width;
        canvas.height = viewport.height;

        await page.render({
          canvasContext: context,
          viewport,
        }).promise;
      } catch (err) {
        console.error("PDF preview error:", err);
      }
    };

    if (fileUrl) loadPdf();
  }, [fileUrl]);

  return (
    <a
      href={fileUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block mt-4"
    >
  <div
    className="
      bg-gray-400
      rounded-2xl
      p-3 sm:p-4
      text-white
      transition
      hover:bg-[#0E4A3A]

      flex flex-col
      sm:flex-row
      sm:items-center
      gap-3 sm:gap-4
    "
  >        {/* THUMBNAIL */}
    <div
      className="
        w-full
        sm:w-20
        h-32 sm:h-24
        bg-white
        rounded-lg
        overflow-hidden
        flex items-center justify-center
      "
    >          <canvas ref={canvasRef} className="w-full h-full object-cover" />
        </div>

        {/* INFO */}
        <div className="flex-1">
      <p
        className="
          font-semibold
          text-sm sm:text-base
          leading-snug
          line-clamp-2
        "
        title={fileName}
      >
                    {fileName}
          </p>

   <p className="text-xs sm:text-sm text-green-200 mt-1">
                {meta.pages} page • PDF
          </p>
        </div>

        {/* ICON */}
    <div
      className="
        self-start sm:self-auto
      "
    >          <div className="bg-red-600 p-2 rounded-lg">
            <FileText size={20} />
          </div>
        </div>
      </div>
    </a>
  );
};

export default PDFPreviewCard;
