import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Lock, Unlock, X } from "lucide-react";
import { ApiRequest } from "../../services/apiRequest";
import html2canvas from "html2canvas";
import { useRef } from "react";
import CertificateTemplate from "../../components/common/certificateTemplate";

const ProfileDevelopmentDetail = () => {
  const { id } = useParams(); // category_id
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [category, setCategory] = useState(null);
  const [developments, setDevelopments] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [selectedDev, setSelectedDev] = useState(null);
  const certificateRef = useRef();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await ApiRequest({
        url: "/profile/me",
        method: "GET",
      });

      setUser(res.data);
    } catch (err) {
      console.error("Profile fetch error:", err);
    }
  };

  const downloadCertificate = async () => {
    await new Promise((r) => setTimeout(r, 200));

    const canvas = await html2canvas(certificateRef.current, {
      scale: 3,
      useCORS: true,
    });

    const image = canvas.toDataURL("image/png");

    const link = document.createElement("a");
    link.href = image;
    link.download = "certificate.png";
    link.click();
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const fetchDetail = async () => {
    try {
      const [catRes, devRes] = await Promise.all([
        ApiRequest({ url: "/development-categories/all", method: "GET" }),
        ApiRequest({ url: "/developments/all", method: "GET" }),
      ]);

      const currentCategory = catRes.data.find(
        (c) => String(c.development_category_id) === id,
      );

      const devByCat = devRes.data.filter(
        (d) => String(d.development_category_id) === id,
      );

      setCategory(currentCategory);
      setDevelopments(devByCat);

      await fetchProgress(devByCat);
    } catch (err) {
      console.error("Fetch profile development detail error:", err);
    }
  };

  /** ================= PROGRESS (SAMA DENGAN DEVELOPMENT CENTER) ================= */
  const fetchProgress = async (devList) => {
    const map = {};

    for (const d of devList) {
      try {
        // 1️⃣ Ambil detail development → total unit
        const detailRes = await ApiRequest({
          url: `/developments/detail/${d.development_id}`,
          method: "GET",
        });

        const questions = detailRes?.data?.questions || [];

        // hitung unit unik per video
        const totalUnit = new Set(questions.map((q) => q.video_title)).size;

        // 2️⃣ Ambil user progress
        const scoreRes = await ApiRequest({
          url: `/user-scores/question/me?development_id=${d.development_id}`,
          method: "GET",
        });

        const completedUnit = (scoreRes?.questions || []).filter(
          (q) => q.is_completed,
        ).length;

        const progress = totalUnit
          ? Math.round((completedUnit / totalUnit) * 100)
          : 0;

        map[d.development_id] = {
          progress,
          passed: progress === 100,
        };
      } catch (e) {
        console.warn("Progress fetch failed:", d.development_id);
        map[d.development_id] = { progress: 0, passed: false };
      }
    }

    setProgressMap(map);
  };

  /** ================= TOTAL POINT (CORE VALUE) ================= */
  const totalPoint = developments.reduce((sum, d) => {
    const progress = progressMap[d.development_id]?.progress || 0;
    if (progress === 100) {
      return sum + (d.core_value || 0);
    }
    return sum;
  }, 0);

  const formatPoint = (num = 0) =>
    num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return (
    <div className="bg-[#F5FAFF]">
      <button
        onClick={() => navigate(-1)}
        className="mb-5 text-[#2D4B73] hover:underline"
      >
        ← Back profile
      </button>

      {/* HEADER */}
      <div className="p-8 mb-6 bg-white shadow-sm rounded-3xl">
        <h2 className="text-2xl font-semibold">Video Lessons & Assignment</h2>
        <p className="text-gray-500">{category?.name}</p>

        <div className="flex items-center gap-4 mt-4">
          <p className="text-3xl font-bold text-[#1B7B83]">
            {totalPoint.toLocaleString()} Point
          </p>
        </div>
      </div>

      {/* LIST */}
      <div className="p-6 space-y-4 bg-white shadow-sm rounded-3xl">
        {developments.map((d) => {
          const progress = progressMap[d.development_id]?.progress || 0;
          const passed = progressMap[d.development_id]?.passed;

          return (
            <div
              key={d.development_id}
              className="p-5 border bg-[#FAFCFF] rounded-2xl"
            >
              <div className="flex items-center gap-6">
                {/* Category */}
                <div className="w-[18%]">
                  <p className="text-xs text-gray-400">Category</p>
                  <p className="font-semibold text-[#1B7B83]">
                    {category?.name}
                  </p>
                </div>

                {/* Video Name */}
                <div className="flex-1">
                  <p className="text-xs text-gray-400">Video Name</p>
                  <p className="font-semibold text-[#0F4C81]">{d.title}</p>
                </div>

                {/* Point */}
                <div className="w-[20%]">
                  <p className="text-xs text-gray-400">Point</p>
                  <p className="font-semibold text-gray-700">
                    {passed ? (
                      `${formatPoint(d.core_value || 0)} Point`
                    ) : (
                      <span className="italic text-gray-400">
                        Complete to earn points
                      </span>
                    )}
                  </p>
                </div>

                {/* PASSING SCORE */}
                <div className="w-[15%]">
                  <p className="mb-1 text-xs text-gray-400">
                    {progress}% Passing Score
                  </p>

                  <div className="w-full h-2 bg-gray-200 rounded-full">
                    <div
                      className={`h-2 rounded-full ${
                        passed
                          ? "bg-green-600"
                          : progress > 0
                            ? "bg-[#002D62]"
                            : "bg-gray-300"
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* CERTIFICATE BUTTON */}
                <div className="flex justify-end w-[150px]">
                  <button
                    disabled={!passed}
                    onClick={() => {
                      setSelectedDev(d);
                      setShowCertificateModal(true);
                    }}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition ${
                      passed
                        ? "bg-[#0F4C81] text-white hover:bg-[#002D62]"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {passed ? (
                      <Unlock size={14} className="mr-2" />
                    ) : (
                      <Lock size={14} className="mr-2" />
                    )}
                    Certificate
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL */}
      {showCertificateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="relative p-6 bg-white rounded-xl w-[600px]">
            {/* CLOSE BUTTON */}
            <button
              onClick={() => setShowCertificateModal(false)}
              className="absolute text-gray-400 top-4 right-4 hover:text-gray-600"
            >
              <X size={20} />
            </button>

            <h3 className="mb-3 text-lg font-semibold">Download Certificate</h3>

            <p className="mb-5 text-gray-500">
              Download certificate for <b>{selectedDev?.title}</b> ?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={downloadCertificate}
                className="px-5 py-2 text-white rounded-lg bg-[#0F4C81] hover:bg-[#002D62]"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      )}
      {/* HIDDEN CERTIFICATE TEMPLATE */}
      <div style={{ position: "absolute", left: "-9999px" }}>
        <CertificateTemplate
          ref={certificateRef}
          username={user?.full_name || "USER NAME"}
        />{" "}
      </div>
    </div>
  );
};

export default ProfileDevelopmentDetail;
