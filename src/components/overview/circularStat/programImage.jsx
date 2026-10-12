import React, { useEffect, useState } from "react";
import { ApiRequest } from "../../../services/apiRequest";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";

const ProgramImage = () => {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPrograms = async () => {
    try {
      setLoading(true);

      const res = await ApiRequest({
        url: "/programs/all?page=1&limit=100",
        method: "GET",
      });

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mapped = (res?.data || [])
        .filter((item) => {
          if (!item.image_url) return false;

          const status = item.status?.toLowerCase();
          if (status !== "active") return false;

          if (!item.period_end) return true;

          const endDate = new Date(item.period_end);
          endDate.setHours(0, 0, 0, 0);

          return endDate >= today;
        })
        .map((item) => ({
          id: item.program_id,
          title: item.program_name || item.name || "-",
          banner: item.image_url,
        }));

      setPrograms(mapped);
    } catch (err) {
      console.error("Fetch program images failed:", err);
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  if (loading || programs.length === 0) return null;

  return (
    <div className="w-full">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{
          delay: 4000,
          disableOnInteraction: false,
        }}
        loop={programs.length > 5}
        navigation
        spaceBetween={16}
        slidesPerView={2}
        breakpoints={{
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 5 },
        }}
        className="px-2"
      >
        {programs.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="relative w-full overflow-hidden transition-transform duration-300 border shadow-sm group aspect-[3/4] rounded-2xl border-surface-border bg-surface-card hover:scale-[1.02]">
              <img
                src={item.banner}
                alt={item.title}
                className="object-cover w-full h-full"
              />

              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all opacity-0 bg-text-primary/60 group-hover:opacity-100">
                <a
                  href={`/circular/${item.id}`}
                  className="px-3 py-1 text-xs font-medium transition border rounded-lg bg-surface-card text-text-primary border-surface-border sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  View More
                </a>

                <button
                  onClick={() => {
                    const downloadUrl = `${process.env.REACT_APP_API_BASE_URL}/download?url=${encodeURIComponent(
                      item.banner,
                    )}`;
                    window.location.href = downloadUrl;
                  }}
                  className="px-3 py-1 text-xs font-medium text-white transition rounded-lg bg-brand-first hover:bg-brand-secondary sm:px-4 sm:py-1.5 sm:text-sm"
                >
                  Download
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default ProgramImage;
