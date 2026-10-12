import { FileText } from "lucide-react";

const AttachmentPreview = ({ file }) => {
  if (!file) return null;

  return (
    <a
      href={file.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-4 block"
      download
    >
      <div className="flex items-center gap-4 p-4 rounded-xl bg-status-success text-surface-border hover:bg-status-success transition">
        {/* ICON */}
        <div className="bg-status-danger p-3 rounded-lg">
          <FileText size={24} />
        </div>

        {/* INFO */}
        <div className="flex-1">
          <p className="font-semibold text-sm truncate">
            {file.name}
          </p>
          <p className="text-xs text-text-light">
            {file.size} • {file.type.toUpperCase()}
          </p>
        </div>
      </div>
    </a>
  );
};

export default AttachmentPreview;
