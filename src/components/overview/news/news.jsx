import { useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { ApiRequest } from "../../../services/apiRequest";
import Pagination from "../../common/pagination";

const NewsSection = () => {
  const navigate = useNavigate();

  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(3);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(
    typeof window !== "undefined" ? window.innerWidth < 1024 : false,
  );

  // =========================================
  // RESPONSIVE
  // =========================================
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;

      setIsMobileOrTablet(width < 1024);

      if (width < 640) {
        setLimit(2);
      } else if (width < 1024) {
        setLimit(3);
      } else {
        setLimit(3);
      }
    };

    handleResize();

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // =========================================
  // FETCH NEWS
  // =========================================
  const fetchNews = async () => {
    try {
      setLoading(true);

      const res = await ApiRequest({
        url: "/calendars/all",
        method: "GET",
      });

      if (res.status === "success") {
        const sorted = [...res.data].sort(
          (a, b) => new Date(b.start_date) - new Date(a.start_date),
        );

        setNewsList(sorted);
      }
    } catch (err) {
      console.error("Failed fetching news:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // =========================================
  // NEWS DATA
  // =========================================

  // Desktop
  // 3 berita pertama untuk sisi kiri
  const mainNews = newsList.slice(0, 3);

  // Berita ke-4 dan seterusnya untuk sisi kanan
  const sideNews = newsList.slice(3);

  // Mobile / Tablet pagination
  const paginatedNews = newsList.slice((page - 1) * limit, page * limit);

  const totalPage = Math.ceil(newsList.length / limit);

  // =========================================
  // LOADING
  // =========================================
  if (loading) {
    return (
      <div className="w-full p-6 mt-8 border shadow-md bg-surface-card border-surface-border rounded-3xl">
        <h2 className="mb-6 text-lg font-semibold sm:text-xl lg:text-2xl text-brand-first">
          Marketing News
        </h2>

        <div className="flex items-center justify-center py-10">
          <p className="text-sm text-text-secondary">Loading news...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 mt-8 border shadow-md bg-surface-card border-surface-border rounded-3xl">
      {/* TITLE */}
      <h2 className="mb-6 text-lg font-semibold sm:text-xl lg:text-2xl text-brand-first">
        Marketing News
      </h2>

      {/* =====================================================
                MOBILE & TABLET
            ====================================================== */}
      <div className="lg:hidden">
        <div className="flex flex-col gap-4">
          {paginatedNews.map((news) => (
            <div
              key={news.calendar_id}
              onClick={() => navigate(`/news/${news.calendar_id}`)}
              className="overflow-hidden transition shadow-md cursor-pointer  bg-surface-card rounded-2xl hover:shadow-lg"
            >
              {/* IMAGE */}
              <img
                src={news.image_url || "/fallback.jpg"}
                alt={news.title || "news"}
                className="object-cover w-full  h-[160px] sm:h-[180px]"
              />

              {/* CONTENT */}
              <div className="p-4">
                <div className="text-sm text-text-secondary">
                  Admin • {new Date(news.start_date).toLocaleDateString()}
                </div>

                <h3 className="mt-2 text-base font-semibold line-clamp-2">
                  {news.title}
                </h3>

                <p className="mt-2 text-sm text-text-secondary line-clamp-3">
                  {news.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPage > 1 && (
          <div className="mt-6">
            <Pagination
              current={page}
              total={totalPage}
              onChange={(p) => {
                setPage(p);

                window.scrollTo({
                  top: 0,
                  behavior: "smooth",
                });
              }}
            />
          </div>
        )}
      </div>

      {/* =====================================================
                DESKTOP
            ====================================================== */}
      <div className="relative hidden gap-6 lg:grid lg:grid-cols-3">
        {/* =================================================
                    LEFT SIDE
                ================================================== */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          {mainNews.map((news) => (
            <div
              key={news.calendar_id}
              onClick={() => navigate(`/news/${news.calendar_id}`)}
              className="overflow-hidden transition shadow-md cursor-pointer  bg-surface-card rounded-2xl hover:shadow-lg"
            >
              {/* IMAGE */}
              <img
                src={news.image_url || "/fallback.jpg"}
                alt={news.title || "news"}
                className="object-cover w-full  h-[180px]"
              />

              {/* CONTENT */}
              <div className="p-4">
                {/* DATE */}
                <div className="text-sm text-text-secondary">
                  Admin • {new Date(news.start_date).toLocaleDateString()}
                </div>

                {/* TITLE */}
                <h3 className="mt-2 text-base font-semibold line-clamp-2">
                  {news.title}
                </h3>

                {/* DESCRIPTION */}
                <p className="mt-2 text-sm text-text-secondary line-clamp-3">
                  {news.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Placeholder kolom kanan */}
        <div className="hidden lg:block" />

        {/* =================================================
                    RIGHT SIDE - SCROLLABLE
                ================================================== */}
        <div className="absolute top-0 bottom-0 right-0 pr-2 overflow-x-hidden overflow-y-auto  w-[calc(33.333%-1rem)]">
          <div className="flex flex-col gap-3">
            {sideNews.map((news) => (
              <div
                key={news.calendar_id}
                onClick={() => navigate(`/news/${news.calendar_id}`)}
                className="flex items-start gap-3 p-2 transition cursor-pointer  hover:bg-surface-background rounded-xl"
              >
                {/* THUMBNAIL */}
                <img
                  src={news.image_url || "/fallback.jpg"}
                  alt={news.title || "news-thumbnail"}
                  className="object-cover w-16 h-16 rounded-lg  shrink-0"
                />

                {/* CONTENT */}
                <div className="flex-1 min-w-0">
                  {/* DATE */}
                  <div className="text-sm text-gray-600">
                    Admin • {new Date(news.start_date).toLocaleDateString()}
                  </div>

                  {/* TITLE */}
                  <h4 className="mt-1 text-base font-semibold leading-snug text-gray-800  line-clamp-3">
                    {news.title}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* EMPTY STATE */}
      {!loading && newsList.length === 0 && (
        <div className="py-10 text-center text-text-secondary">
          Belum ada Marketing News.
        </div>
      )}
    </div>
  );
};

export default NewsSection;
