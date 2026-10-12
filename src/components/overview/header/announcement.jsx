import React, { useEffect, useState } from "react";
import Announce from "../../../assets/images/icons/announcement.png";
import { useNavigate } from "react-router-dom";

const AnnouncementButton = ({ disabled = false }) => {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.REACT_APP_API_BASE_URL}/announcements/unread-count`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const result = await res.json();

      setUnreadCount(result?.data?.unread_count || 0);
    } catch (error) {
      console.error("Failed to fetch unread announcement count:", error);
    }
  };

  useEffect(() => {
    fetchUnreadCount();

    window.addEventListener("announcement-notification", fetchUnreadCount);
    window.addEventListener("announcement-read-updated", fetchUnreadCount);

    return () => {
      window.removeEventListener("announcement-notification", fetchUnreadCount);
      window.removeEventListener("announcement-read-updated", fetchUnreadCount);
    };
  }, []);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        if (!disabled) navigate("/overview/announcement");
      }}
      className={`
        relative p-2
        bg-surface
        border border-surface-border
        rounded-full shadow-sm
        transition
        ${disabled ? "cursor-not-allowed opacity-60" : "hover:bg-surface-hover"}
      `}
      title="Announcement"
    >
      <img
        src={Announce}
        alt="announcement"
        className="object-contain w-6 h-6"
      />

      {unreadCount > 0 && (
        <span className="absolute flex items-center justify-center h-5 px-1 font-bold text-white bg-red-500 rounded-full -top-1 -right-1 min-w-5 text-[10px]">
          {unreadCount}
        </span>
      )}
    </button>
  );
};

export default AnnouncementButton;
