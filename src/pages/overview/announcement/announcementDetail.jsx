import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Download,
  ZoomIn,
  X,
  FileText,
  Image as ImageIcon,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getAnnouncementDetail } from "../../../services/announcement/announcementService";
import PdfThumb from "../../../assets/images/banner.png";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  return url.replace(/\\/g, "/");
};

const formatDate = (iso) => {
  if (!iso || iso === "0001-01-01T00:00:00Z") return "-";

  const d = new Date(iso);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(d);
};

const getTypeConfig = (type) => {
  if (type === "image") {
    return {
      label: "Image",
      icon: <ImageIcon size={14} />,
      className: "bg-pink-50 text-pink-600 border border-pink-100",
    };
  }

  return {
    label: "Document",
    icon: <FileText size={14} />,
    className: "bg-blue-50 text-[#0F2F5A] border border-blue-100",
  };
};

const AnnouncementDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showZoom, setShowZoom] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);

      const res = await getAnnouncementDetail(id);

      const row = res?.data || res?.data?.data || res;

      if (!row) {
        setItem(null);
        return;
      }

      setItem({
        id: row.announcement_id,
        title: row.title || "-",
        description: row.description || "-",
        date: formatDate(row.updated_at || row.created_at),
        image: normalizeImageUrl(row.image_url) || PdfThumb,
        type: row.type === "promo" ? "image" : "document",
      });
    } catch (err) {
      console.error("Failed fetch announcement detail:", err);
      setItem(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleDownloadImage = async () => {
    if (!item?.image) return;

    try {
      const response = await fetch(item.image);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${item.title || "announcement-image"}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Failed download image:", err);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-4 py-6 mx-auto max-w-[1000px]">
        <div className="flex items-center justify-center bg-white border shadow-sm h-[300px] rounded-[24px] border-[#E6EAF0]">
          <p className="text-sm text-gray-400">
            Loading announcement detail...
          </p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="w-full px-4 py-6 mx-auto max-w-[1000px]">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-sm font-medium text-[#0F2F5A]"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="flex items-center justify-center bg-white border shadow-sm h-[300px] rounded-[24px] border-[#E6EAF0]">
          <p className="text-sm text-gray-400">
            Announcement detail not found.
          </p>
        </div>
      </div>
    );
  }

  const typeConfig = getTypeConfig(item.type);

  return (
    <div className="min-h-screen px-5 py-1 sm:px-3 lg:px-3">
      <div
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-4 text-text-secondary"
      >
        <ArrowLeft
          size={18}
          className="transition cursor-pointer hover:text-brand-first"
        />
        <p className="text-xs font-medium transition cursor-pointer sm:text-sm lg:text-sm md:text-sm hover:text-brand-first">
          Back to Announcement
        </p>
      </div>

      <div className="p-2 sm:p-5">
        <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
          {item.title}
        </h1>
        <span className="text-xs font-medium text-[#94A3B8]">{item.date}</span>
        <div className="relative mt-6 overflow-hidden border rounded-[24px] bg-[#F8FAFC] border-[#E6EAF0] group">
          <img
            src={item.image}
            alt={item.title}
            className="object-cover w-full bg-white max-h-[700px]"
          />
          {/* HOVER OVERLAY */}
          <div className="absolute inset-0 flex items-center justify-center transition-all opacity-0 bg-black/20 group-hover:opacity-100">
            <div className="flex items-center gap-3">
              {/* VIEW */}
              <button
                type="button"
                onClick={() => setShowZoom(true)}
                className="px-5 py-2 text-sm font-medium transition shadow-sm text-[#1F2937] bg-white/80 backdrop-blur-md rounded-xl hover:bg-white"
              >
                View More
              </button>

              {/* DOWNLOAD */}
              <button
                type="button"
                onClick={handleDownloadImage}
                className="px-5 py-2 text-sm font-medium text-white transition shadow-sm bg-[#003B8F]/90 backdrop-blur-md rounded-xl hover:bg-[#003B8F]"
              >
                Download
              </button>
            </div>
          </div>{" "}
        </div>{" "}
        <p className="mt-4 leading-7 whitespace-pre-line text-[14px] text-[#6B7280]">
          {item.description}
        </p>
      </div>

      {showZoom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75">
          <div className="relative w-full max-w-6xl">
            <button
              type="button"
              onClick={() => setShowZoom(false)}
              className="absolute z-10 flex items-center justify-center w-10 h-10 text-white rounded-full top-3 right-3 bg-black/60 hover:bg-black/80"
            >
              <X size={20} />
            </button>

            <div className="flex items-center justify-center p-4 overflow-auto bg-white rounded-2xl max-h-[90vh]">
              <img
                src={item.image}
                alt={item.title}
                className="object-contain h-auto max-w-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementDetailPage;
