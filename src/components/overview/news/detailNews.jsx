import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const NewsDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [news, setNews] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(3);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  // ===========================
  // RESPONSIVE
  // ===========================
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOrTablet(window.innerWidth < 1024);
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // ===========================
  // FETCH DETAIL & RELATED NEWS
  // ===========================
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);

        const res = await ApiRequest({
          url: `/calendars/detail/${id}`,
          method: "GET",
        });

        if (res.status === "success") {
          setNews(res.data);
        }
      } catch (err) {
        console.error("Failed loading detail:", err);
      } finally {
        setLoading(false);
      }
    };

    const fetchRelated = async () => {
      try {
        const res = await ApiRequest({
          url: "/calendars/all",
          method: "GET",
        });

        if (res.status === "success") {
          const filtered = [...res.data]
            .filter((n) => n.calendar_id != id)
            .sort((a, b) => new Date(b.start_date) - new Date(a.start_date));

          setRelated(filtered);
        }
      } catch (err) {
        console.error("Failed loading related:", err);
      }
    };

    fetchDetail();
    fetchRelated();
  }, [id]);

  // reset view more ketika pindah berita
  useEffect(() => {
    setVisibleCount(3);
  }, [id]);

  const displayedRelated = isMobileOrTablet
    ? related.slice(0, visibleCount)
    : related;

  // ===========================
  // LOADING
  // ===========================
  if (loading || !news) {
    return (
      <div className="p-10 text-center text-gray-500">Loading news...</div>
    );
  }

  const formattedDate = new Date(news.start_date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // ===========================
  // RENDER DESCRIPTION
  // ===========================
  const renderDescription = (text) => {
    if (!text) return null;

    const blocks = text.split(/\r?\n\r?\n/);

    const isBulletLine = (line) => /^(\-|\•|\*|\d+\.)\s+/.test(line.trim());

    return blocks.map((block, idx) => {
      const rawLines = block
        .split(/\r?\n/)
        .map((l) => l.trim())
        .filter(Boolean);

      const bulletLines = rawLines
        .filter(isBulletLine)
        .map((l) => l.replace(/^(\-|\•|\*|\d+\.)\s+/, "").trim());

      if (bulletLines.length > 0) {
        return (
          <ul
            key={idx}
            className="pl-6 mb-4 space-y-2 text-gray-700 list-disc "
          >
            {bulletLines.map((line, i) => (
              <li key={i} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        );
      }

      if (rawLines.length > 1) {
        return (
          <ul
            key={idx}
            className="pl-6 mb-4 space-y-2 text-gray-700 list-disc "
          >
            {rawLines.map((line, i) => (
              <li key={i} className="leading-relaxed">
                {line}
              </li>
            ))}
          </ul>
        );
      }

      return (
        <p key={idx} className="mb-4 leading-relaxed text-gray-700 ">
          {rawLines[0]}
        </p>
      );
    });
  };

  return (
    <div className="box-border w-full px-4 mx-auto  max-w-[1400px]">
      {/* BACK */}
      <div
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-2 mb-6 text-sm cursor-pointer  text-[#002D62] sm:text-base"
      >
        <ArrowLeft size={18} />
        Back
      </div>

      {/* =====================================================
                MOBILE / TABLET
            ====================================================== */}
      <div className="lg:hidden">
        {/* LEFT CONTENT */}
        <div>
          {/* Title */}
          <h1 className="mb-4 text-2xl font-bold leading-snug text-left text-gray-900  sm:text-3xl">
            {news.title}
          </h1>

          {/* Banner */}
          <img
            src={news.image_url || "/fallback.jpg"}
            alt="News Banner"
            className="block object-contain w-full mb-6  h-[220px] sm:h-[300px] rounded-xl"
          />

          {/* Author */}
          <div className="flex flex-col w-full gap-2 p-4 mb-6 border  bg-gray-50 rounded-xl sm:flex-row">
            <div>
              <p className="text-sm text-gray-600">
                Published by{" "}
                <span className="font-semibold text-red-600">Admin</span>
              </p>

              <p className="text-sm text-gray-500">Jakarta - {formattedDate}</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="w-full text-sm leading-relaxed text-justify text-gray-800 break-words  sm:text-base">
            {renderDescription(news.description)}
          </div>
        </div>

        {/* ALL NEWS */}
        <div className="mt-10">
          <h2 className="mb-4 text-xl font-semibold text-gray-800">All News</h2>

          <div className="flex flex-col gap-3">
            {related.length === 0 && (
              <p className="text-sm text-gray-500">No related news.</p>
            )}

            {displayedRelated.map((item) => (
              <div
                key={item.calendar_id}
                onClick={() => navigate(`/news/${item.calendar_id}`)}
                className="flex gap-3 p-3 transition bg-white border cursor-pointer  group sm:gap-4 sm:p-4 rounded-2xl hover:shadow-lg hover:-translate-y-0.5"
              >
                {/* Thumbnail */}
                <div className="flex-shrink-0 w-24 h-24 overflow-hidden  rounded-xl">
                  <img
                    src={item.image_url || "/fallback.jpg"}
                    alt="thumbnail"
                    className="object-cover w-full h-full transition-transform duration-300  group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center flex-1 min-w-0 ">
                  <div className="mb-1 text-xs text-gray-500">
                    {item.creator?.full_name || "Admin"} •{" "}
                    {new Date(item.start_date).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>

                  <h4 className="font-semibold leading-snug text-gray-800  line-clamp-2">
                    {item.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>

          {/* VIEW MORE */}
          {visibleCount < related.length && (
            <button
              onClick={() => setVisibleCount((prev) => prev + 3)}
              className="w-full mt-4 text-sm font-semibold transition border  py-2.5 rounded-xl border-[#002D62] text-[#002D62] hover:bg-[#002D62] hover:text-white"
            >
              View More
            </button>
          )}
        </div>
      </div>

      {/* =====================================================
                DESKTOP
            ====================================================== */}
      <div className="relative hidden gap-10  lg:grid lg:grid-cols-3">
        {/* =================================================
                    LEFT CONTENT
                ================================================== */}
        <div className="lg:col-span-2">
          {/* TITLE */}
          <h1 className="max-w-full mb-4 text-4xl font-bold leading-snug text-left text-gray-900 ">
            {news.title}
          </h1>

          {/* BANNER IMAGE */}
          <img
            src={news.image_url || "/fallback.jpg"}
            alt="News Banner"
            className="block object-contain w-full mb-6  h-[420px] rounded-xl"
          />

          {/* AUTHOR CARD */}
          <div className="flex w-full gap-2 p-4 mb-6 border  bg-gray-50 rounded-xl">
            <div>
              <p className="text-sm text-gray-600">
                Published by{" "}
                <span className="font-semibold text-red-600">Admin</span>
              </p>

              <p className="text-sm text-gray-500">Jakarta - {formattedDate}</p>
            </div>
          </div>

          {/* DESCRIPTION */}
          <div className="w-full text-base leading-relaxed text-justify text-gray-800 break-words ">
            {renderDescription(news.description)}
          </div>
        </div>

        {/* Placeholder grid kanan */}
        <div />

        {/* =================================================
                    RIGHT SIDEBAR
                    TINGGI MENGIKUTI LEFT CONTENT
                ================================================== */}
        <div className="absolute top-0 bottom-0 right-0 flex flex-col min-h-0  w-[calc(33.333%-1.65rem)]">
          {/* TITLE SIDEBAR */}
          <h2 className="mb-4 text-xl font-semibold text-gray-800  shrink-0">
            All News
          </h2>

          {/* SCROLL AREA */}
          <div className="flex-1 min-h-0 pr-2 overflow-x-hidden overflow-y-auto  scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
            <div className="flex flex-col gap-3">
              {related.length === 0 && (
                <p className="text-sm text-gray-500">No related news.</p>
              )}

              {related.map((item) => (
                <div
                  key={item.calendar_id}
                  onClick={() => navigate(`/news/${item.calendar_id}`)}
                  className="flex gap-4 p-4 transition bg-white border cursor-pointer  group rounded-2xl hover:shadow-lg hover:-translate-y-0.5 shrink-0"
                >
                  {/* THUMBNAIL */}
                  <div className="flex-shrink-0 w-24 h-24 overflow-hidden  rounded-xl">
                    <img
                      src={item.image_url || "/fallback.jpg"}
                      alt="thumbnail"
                      className="object-cover w-full h-full transition-transform duration-300  group-hover:scale-105"
                    />
                  </div>

                  {/* CONTENT */}
                  <div className="flex flex-col justify-center flex-1 min-w-0 ">
                    <div className="mb-1 text-xs text-gray-500">
                      {item.creator?.full_name || "Admin"} •{" "}
                      {new Date(item.start_date).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>

                    <h4 className="font-semibold leading-snug text-gray-800  line-clamp-2">
                      {item.title}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsDetail;
