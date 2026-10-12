import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";

const ProfileDevelopment = ({ setTotalPoint }) => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  /* =====================
     FETCH PROGRESS (RETURN MAP)
  ===================== */
  const fetchProgress = async (devList) => {
    const map = {};

    for (const d of devList) {
      try {
        const detailRes = await ApiRequest({
          url: `/developments/detail/${d.development_id}`,
          method: "GET",
        });

        const questions = detailRes?.data?.questions || [];
        const totalUnit = new Set(
          questions.map((q) => q.video_title)
        ).size;

        const scoreRes = await ApiRequest({
          url: `/user-scores/question/me?development_id=${d.development_id}`,
          method: "GET",
        });

        const completedUnit = (scoreRes?.questions || []).filter(
          (q) => q.is_completed
        ).length;

        const progress = totalUnit
          ? Math.round((completedUnit / totalUnit) * 100)
          : 0;

        map[d.development_id] = progress;
      } catch {
        map[d.development_id] = 0;
      }
    }

    return map;
  };

  useEffect(() => {
    fetchProfileDevelopment();
  }, []);

  /* =====================
     FETCH PROFILE DEVELOPMENT
  ===================== */
  const fetchProfileDevelopment = async () => {
    try {
      const [catRes, devRes] = await Promise.all([
        ApiRequest({ url: "/development-categories/all", method: "GET" }),
        ApiRequest({ url: "/developments/all", method: "GET" }),
      ]);

      const developments = devRes.data || [];

      // 🔥 AMBIL PROGRESS RESULT
      const progressResult = await fetchProgress(developments);
      setProgressMap(progressResult);

      const mapped = (catRes.data || []).map((cat) => {
        const devByCat = developments.filter(
          (d) =>
            d.development_category_id === cat.development_category_id
        );

        const totalPoint = devByCat.reduce((sum, d) => {
          if (progressResult[d.development_id] === 100) {
            return sum + (d.core_value || 0);
          }
          return sum;
        }, 0);

        const updatedAt =
          devByCat.length > 0
            ? new Date(
                Math.max(
                  ...devByCat.map((d) =>
                    new Date(d.updated_at).getTime()
                  )
                )
              ).toLocaleDateString("id-ID")
            : "-";

        return {
          id: cat.development_category_id,
          category: cat.name,
          point: totalPoint,
          updatedAt,
        };
      });

      setCategories(mapped);

      // 🔥 TOTAL POINT HEADER
      setTotalPoint(
        mapped.reduce((sum, c) => sum + c.point, 0)
      );
    } catch (err) {
      console.error("Fetch profile development error:", err);
    }
  };

  const formatPoint = (num = 0) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 pb-4">
      {categories.map((item) => (
        <div
          key={item.id}
          className="flex justify-between items-center bg-white border rounded-xl shadow-lg px-4 py-4"
        >
          <div className="w-[30%]">
            <p className="text-xs text-gray-400">Category</p>
            <p className="font-medium">{item.category}</p>
          </div>

          <div className="w-[20%]">
            <p className="text-xs text-gray-400">Total Point</p>
            <p className="font-semibold text-[#0F4C81]">
              {formatPoint(item.point)} Point
            </p>
          </div>

          <div className="w-[20%]">
            <p className="text-xs text-gray-400">Update At</p>
            <p className="font-semibold">{item.updatedAt}</p>
          </div>

          <div className="w-[20%] flex justify-end">
            <button
              onClick={() =>
                navigate(`/profile/development/${item.id}`)
              }
              className="bg-[#002D62] text-white text-xs rounded-full px-5 py-2"
            >
              View More
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileDevelopment;
