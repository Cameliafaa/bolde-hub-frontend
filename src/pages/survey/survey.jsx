import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import SurveyStartModal from "../../components/survey/startModal";

const SurveyUserList = () => {
  const navigate = useNavigate();

  const [surveys, setSurveys] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedSurvey, setSelectedSurvey] = useState(null);
  const [showStart, setShowStart] = useState(false);
  const [starting, setStarting] = useState(false);

  /* ================= FETCH ================= */
  useEffect(() => {
    ApiRequest({
      url: "/surveys",
      method: "GET",
    })
      .then((res) => {
        const onlyActive = (res.data || []).filter(
          (s) => s.status === "active"
        );
        setSurveys(onlyActive);
      })
      .finally(() => setLoading(false));
  }, []);

  /* ================= START SURVEY ================= */
  const handleStartSurvey = async () => {
    if (!selectedSurvey) return;

    setStarting(true);
    try {
      const res = await ApiRequest({
        url: `/surveys/${selectedSurvey.survey_id}/start`,
        method: "POST",
      });

      const responseId = res.data?.response_id;

      navigate(`/survey-user/${selectedSurvey.survey_id}`, {
        state: { responseId },
      });
    } finally {
      setStarting(false);
      setShowStart(false);
    }
  };

  if (loading) return <p className="p-6">Loading survey...</p>;

  return (
    <div
      className="
      w-full
      max-w-[1400px]
      mx-auto

      px-4          /* HP */
      sm:px-4       /* tablet */
      lg:px-4       /* laptop */
      xl:px-4       /* desktop besar */
      2xl:px-4      /* layar besar */
    "
    >
      <h1 className="text-xl sm:text-2xl font-semibold text-brand-first mb-5">
        Survey</h1>

      {/* TABLE */}
      <div className="hidden sm:block bg-surface-background rounded-2xl shadow border overflow-hidden">        <table className="min-w-full text-sm">
        <thead className="bg-surface-border">
          <tr>
            <th className="px-6 py-3 text-center w-16">No</th>
            <th className="px-6 py-3 text-center">Title</th>
            <th className="px-6 py-3 text-center">Action</th>

          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={2} className="text-center py-10 text-text-light">
                Loading survey...
              </td>
            </tr>
          ) : surveys.length ? (
            surveys.map((item, index) => (
              <tr
                key={item.survey_id}
                className="border-t hover:bg-surafce-background cursor-pointer"
                onClick={() => {
                  setSelectedSurvey(item);
                  setShowStart(true);
                }}
              >
                <td className="px-6 py-3 text-center">
                  {index + 1}
                </td>

                <td className="px-6 py-3 font-medium text-text-primary">
                  {item.title}
                </td>
                <td className="px-6 py-3 text-center">
                  <button
                    onClick={() => {
                      setSelectedSurvey(item);
                      setShowStart(true);
                    }}
                    className="px-4 py-1.5 rounded-lg bg-brand-first text-surface-background text-sm font-semibold hover:bg-brand-secondary"
                  >
                    Kerjakan
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2} className="text-center py-10 text-text-light">
                No survey available
              </td>
            </tr>
          )}
        </tbody>
      </table>
      </div>

      {/* CARD – MOBILE */}
      <div className="sm:hidden space-y-4">
        {surveys.length ? (
          surveys.map((item, index) => (
            <div
              key={item.survey_id}
              className="bg-surface-background rounded-2xl border shadow-sm p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <p className="text-sm text-text-light">#{index + 1}</p>
              </div>

              <p className="font-semibold text-text-primary mb-4">
                {item.title}
              </p>

              <button
                onClick={() => {
                  setSelectedSurvey(item);
                  setShowStart(true);
                }}
                className="w-full py-2 rounded-xl bg-brand-first text-surface-background text-sm font-semibold"
              >
                Kerjakan
              </button>
            </div>
          ))
        ) : (
          <p className="text-center text-text-light py-10">
            No survey available
          </p>
        )}
      </div>

      {/* START MODAL */}
      {showStart && (
        <SurveyStartModal
          survey={selectedSurvey}
          onClose={() => setShowStart(false)}
          onStarted={(responseId) => {
            navigate(`/survey-user/${selectedSurvey.survey_id}`, {
              state: { responseId },
            });
          }}
        />
      )}
    </div>
  );
};

export default SurveyUserList;
