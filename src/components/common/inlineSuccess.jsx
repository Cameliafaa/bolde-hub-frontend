import React, { useEffect } from "react";
import { CheckCircle } from "lucide-react";

const InlineSuccess = ({ message, onClose }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => onClose(), 2500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className="flex items-center gap-2 text-status-success font-medium px-4 py-3 rounded-xl mb-4 w-fit animate-fadeIn">
      <CheckCircle className="w-4 h-4 text-status-success" />
      <span>{message}</span>
    </div>
  );
};

export default InlineSuccess;
