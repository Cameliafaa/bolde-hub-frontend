import React, { useEffect, useState } from "react";
import { ApiRequest } from "../../../services/apiRequest";

const MarketingBanner = () => {
    const [banners, setBanners] = useState([]);
    const [loading, setLoading] = useState(true);
    const [active, setActive] = useState(0);

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await ApiRequest({
                    url: "/banners/all",
                    method: "GET",
                });

                if (res.status === "success") {
                    setBanners(res.data || []);
                }
            } catch (err) {
                console.error("Fetch banners failed:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchBanners();
    }, []);

    // AUTO SLIDE
    useEffect(() => {
        if (banners.length <= 1) return;

        const interval = setInterval(() => {
            setActive((prev) => (prev + 1) % banners.length);
        }, 4000); // 4 detik

        return () => clearInterval(interval);
    }, [banners]);

    if (loading || !banners.length) return null;

    return (
        <div className="mb-6">
            <div
                className="
        w-full
        relative
        overflow-hidden
        rounded-2xl
        shadow-md
      "
            >
                {/* SLIDER TRACK */}
                <div
                    className="flex transition-transform duration-700 ease-in-out"
                    style={{
                        transform: `translateX(-${active * 100}%)`,
                    }}
                >
                    {banners.map((b) => (
                        <div key={b.banner_id} className="w-full flex-shrink-0">
                            <img
                                src={b.image_url}
                                alt={b.name}
                                className="
                w-full
                h-auto
                object-contain
                block
              "
                            />
                        </div>
                    ))}
                </div>

                {/* DOTS OVERLAY */}
                {banners.length > 1 && (
                    <div
                        className="
    absolute
    bottom-2 sm:bottom-3 md:bottom-4
    left-1/2
    -translate-x-1/2
    flex
    gap-1.5 sm:gap-2
  "
                    >
                        {banners.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActive(idx)}
                                className={`
        h-1.5 sm:h-2
        rounded-full
        transition-all duration-300
        ${idx === active
                                        ? "w-4 sm:w-6 bg-[#002D62]"
                                        : "w-1.5 sm:w-2 bg-white/70"
                                    }
      `}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MarketingBanner;
