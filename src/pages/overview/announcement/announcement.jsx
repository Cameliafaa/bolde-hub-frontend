import React, { useEffect, useMemo, useState } from "react";
import { Search, FileText, Image as ImageIcon, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

import PdfThumb from "../../../assets/images/banner.png";
import BirthdayThumb from "../../../assets/images/banner.png";
import { getAnnouncements } from "../../../services/announcement/announcementService";

const normalizeImageUrl = (url) => {
  if (!url) return "";
  return url.replace(/\\/g, "/");
};

const formatDate = (iso) => {
  if (!iso || iso === "0001-01-01T00:00:00Z") return "-";

  const d = new Date(iso);

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Jakarta",
  }).format(d);
};

const getTypeConfig = (type) => {
  if (type === "promo") {
    return {
      label: "Promo",
      className: "bg-pink-50 text-pink-500 border border-pink-100",
    };
  }

  if (type === "info") {
    return {
      label: "Info",
      className: "bg-blue-50 text-[#0F2F5A] border border-blue-100",
    };
  }

  return {
    label: type || "-",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
  };
};

const AnnouncementCard = ({ item, onClick }) => {
  const typeConfig = getTypeConfig(item.type);

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-4 text-left transition bg-white border shadow-sm border-[#E6EAF0] rounded-[24px] hover:shadow-md sm:p-5 lg:p-6"
    >
      <div className="flex gap-4 sm:gap-5">
        <div className="flex-shrink-0 overflow-hidden border w-[72px] h-[72px] sm:w-[88px] sm:h-[88px] lg:w-[96px] lg:h-[96px] rounded-2xl bg-[#F5F7FA] border-[#E6EAF0]">
          <img
            src={item.image || BirthdayThumb}
            alt={item.title}
            className="object-cover w-full h-full"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-2">
            <span
              className={`
      inline-flex items-center
      px-3 py-1 rounded-full text-xs font-semibold
      ${typeConfig.className}
    `}
            >
              {typeConfig.label}
            </span>
          </div>
          <h3 className="font-semibold leading-snug text-[#1F2937] text-[14px] sm:text-[16px] lg:text-[18px] line-clamp-2">
            {item.title}
          </h3>

          <p className="mt-2 leading-relaxed text-[#6B7280] text-[12px] sm:text-[12px] lg:text-[13px] line-clamp-2 sm:line-clamp-3">
            {item.description}
          </p>

          <p className="mt-3 font-medium text-[9px] sm:text-[10px] text-[#94A3B8]">
            {item.date}
          </p>
        </div>
      </div>
    </button>
  );
};

const AnnouncementPage = () => {
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncementData();
  }, []);

  useEffect(() => {
    const markAllAsRead = async () => {
      try {
        await fetch(
          `${process.env.REACT_APP_API_BASE_URL}/announcements/read-all`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );

        window.dispatchEvent(new Event("announcement-read-updated"));
      } catch (error) {
        console.error("Failed to mark announcements as read:", error);
      }
    };

    markAllAsRead();
  }, []);

  const fetchAnnouncementData = async () => {
    try {
      setLoading(true);

      const res = await getAnnouncements({
        page: 1,
        limit: 100,
      });

      const rows = Array.isArray(res?.data)
        ? res.data
        : Array.isArray(res?.data?.data)
          ? res.data.data
          : Array.isArray(res)
            ? res
            : [];

      const mapped = rows.map((item) => ({
        id: item.announcement_id,
        title: item.title || "-",
        description: item.description || "-",
        date: formatDate(item.updated_at || item.created_at),
        image: normalizeImageUrl(item.image_url) || PdfThumb,
        type: item.type === "promo" ? "image" : "document",
      }));

      setAnnouncements(mapped);
    } catch (err) {
      console.error("Failed fetch announcements:", err);
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncementData();
  }, []);

  const filteredAnnouncements = useMemo(() => {
    const value = keyword.toLowerCase().trim();

    if (!value) return announcements;

    return announcements.filter(
      (item) =>
        item.title.toLowerCase().includes(value) ||
        item.description.toLowerCase().includes(value),
    );
  }, [keyword, announcements]);

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
          Back to Overview
        </p>
      </div>

      <div className="flex flex-col gap-4 mb-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold sm:text-2xl text-brand-first">
            Announcement
          </h1>
          <p className="mt-1 text-sm text-[#6B7280]">
            Informasi dan pengumuman terbaru untuk seluruh tim.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-8 lg:flex-row lg:items-center">
        <div className="flex items-center flex-1 px-4 py-3 border-2 shadow-sm bg-surface-card border-surface-border rounded-xl h-[42px] lg:max-w-[420px]">
          <Search size={18} className="mr-2 text-text-light" />
          <input
            type="text"
            placeholder="Announcement Search"
            className="w-full text-sm bg-transparent outline-none text-text-primary"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-text-light">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length > 0 ? (
          filteredAnnouncements.map((item) => (
            <AnnouncementCard
              key={item.id}
              item={item}
              onClick={() => navigate(`/overview/announcement/${item.id}`)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-text-light">No Announcement Found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementPage;
