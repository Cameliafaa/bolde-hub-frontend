 import { Document, Page } from "react-pdf";
import { useState } from "react";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

const PdfViewer = ({ fileUrl }) => {
  const [zoom, setZoom] = useState(1);
  const [numPages, setNumPages] = useState(null);

  return (
    <div className="bg-white rounded-2xl border shadow p-4">
      {/* CONTROLS */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
          <button onClick={() => setZoom(z => Math.max(0.6, z - 0.1))}>−</button>
          <span>{Math.round(zoom * 100)}%</span>
          <button onClick={() => setZoom(z => Math.min(2, z + 0.1))}>+</button>
        </div>
      </div>

      {/* PDF */}
      <div className="flex justify-center bg-white">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        >
          {Array.from(new Array(numPages), (_, i) => (
            <Page
              key={i}
              pageNumber={i + 1}
              scale={zoom}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
          ))}
        </Document>
      </div>
    </div>
  );
};

export default PdfViewer;
