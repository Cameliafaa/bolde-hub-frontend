import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import SurveySuccessModal from "../../components/masterData/survey/succesSubmit";

const SurveyUserFill = () => {
  const { surveyId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // response_id hasil POST /start
  const responseId = location.state?.responseId;

  const [survey, setSurvey] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(true);
  const [otherTexts, setOtherTexts] = useState({});

  /* ================= SAFETY ================= */
  useEffect(() => {
    if (!responseId) {
      // kalau user buka langsung tanpa start
      navigate("/survey-user");
    }
  }, [responseId, navigate]);

  /* ================= FETCH SURVEY ================= */
  useEffect(() => {
    if (!surveyId) return;

    setLoading(true);
    ApiRequest({
      url: `/surveys/${surveyId}`,
      method: "GET",
    })
      .then((res) => setSurvey(res.data))
      .finally(() => setLoading(false));
  }, [surveyId]);

  /* ================= ANSWER HANDLER ================= */
  const updateAnswer = (payload) => {
    setAnswers((prev) => [
      ...prev.filter((a) => a.question_id !== payload.question_id),
      payload,
    ]);
  };

  /* ================= SUBMIT ================= */
  const handleSubmit = async () => {
    const questions = survey?.questions || [];

    const requiredQuestions = questions.filter((q) => q.is_required);
    const answeredIds = answers.map((a) => a.question_id);

    const invalidOther = answers.find((a) => {
      const q = questions.find((q) => q.question_id === a.question_id);
      const opt = q?.options?.find(
        (o) => o.is_other && a.option_ids?.includes(o.option_id),
      );

      return opt && !a.other_text?.trim();
    });

    if (invalidOther) {
      alert("Please fill the 'Other' answer");
      return;
    }

    const missing = requiredQuestions.filter(
      (q) => !answeredIds.includes(q.question_id),
    );

    if (missing.length) {
      alert("Please answer all required questions");
      return;
    }

    setSubmitting(true);
    try {
      await ApiRequest({
        url: `/surveys/${surveyId}/submit`,
        method: "POST",
        data: { answers },
      });

      setShowSuccess(true);
    } finally {
      setSubmitting(false);
    }
  };

  const updateOtherText = (questionId, value) => {
    setOtherTexts((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const isOptionSelected = (questionId, optionId) => {
    const ans = answers.find((a) => a.question_id === questionId);
    return ans?.option_ids?.includes(optionId);
  };

  /* ================= RENDER ================= */
  if (loading) return <p className="p-6">Loading survey...</p>;
  if (!survey) return <p className="p-6">Survey not found</p>;

  return (
    <div
      className="w-full px-4 mx-auto  max-w-[1400px] /* HP */ sm:px-4 tablet lg:px-4 laptop xl:px-4 desktop besar 2xl:px-4 layar"
    >
      <div className="mx-auto max-w-9xl">
        <h1 className="mb-2 text-xl font-semibold sm:text-2xl text-brand-first">
          {survey.title}
        </h1>
        <p className="mb-5 text-md sm:text-md text-text-secondary">
          {survey.description}
        </p>

        <div className="space-y-6">
          {survey.questions.map((q, idx) => (
            <div
              key={q.question_id}
              className="p-6 bg-white border rounded-2xl"
            >
              <p className="mb-4 font-medium">
                {idx + 1}. {q.question_text}
                {q.is_required && (
                  <span className="ml-1 text-status-danger">*</span>
                )}
              </p>

              {/* ===== SINGLE CHOICE ===== */}
              {q.question_type === "single_choice" &&
                q.options.map((opt) => {
                  const isOther = opt.is_other;
                  const selected = isOptionSelected(
                    q.question_id,
                    opt.option_id,
                  );

                  return (
                    <div key={opt.option_id} className="mb-3">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name={`q_${q.question_id}`}
                          checked={selected}
                          onChange={() =>
                            updateAnswer({
                              question_id: q.question_id,
                              option_ids: [opt.option_id],
                              ...(isOther && {
                                other_text: otherTexts[q.question_id] || "",
                              }),
                            })
                          }
                        />
                        <span>{opt.option_text}</span>
                      </label>

                      {/* INPUT ONLY WHEN OTHER IS SELECTED */}
                      {isOther && selected && (
                        <input
                          type="text"
                          className="w-full max-w-md px-3 py-2 mt-2 border rounded-lg ml-7"
                          placeholder="Isi jawaban Anda..."
                          value={otherTexts[q.question_id] || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            updateOtherText(q.question_id, value);

                            updateAnswer({
                              question_id: q.question_id,
                              option_ids: [opt.option_id],
                              other_text: value,
                            });
                          }}
                          onClick={(e) => e.stopPropagation()} // 🔥 PENTING
                        />
                      )}
                    </div>
                  );
                })}

              {/* ===== TEXT ===== */}
              {q.question_type === "text" && (
                <textarea
                  className="w-full p-3 border rounded-xl"
                  rows={3}
                  placeholder="Tulis jawaban..."
                  onChange={(e) =>
                    updateAnswer({
                      question_id: q.question_id,
                      answer_text: e.target.value,
                    })
                  }
                />
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-10">
          <button
            disabled={submitting}
            onClick={handleSubmit}
            className="px-10 py-3 bg-brand-first text-surface-background rounded-xl"
          >
            {submitting ? "Submitting..." : "Submit Survey"}
          </button>
        </div>

        {/* SUCCESS MODAL */}
        <SurveySuccessModal
          open={showSuccess}
          onClose={() => {
            setShowSuccess(false);
            navigate("/survey-user");
          }}
        />
      </div>
    </div>
  );
};

export default SurveyUserFill;
