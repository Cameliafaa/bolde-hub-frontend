import React, { useState, useEffect } from "react";
import { ApiRequest } from "../../../../services/apiRequest";
import { Plus, Trash2 } from "lucide-react";

const StepDevQuestions = ({ onFinish, developmentId, onBack }) => {
  const [lessons, setLessons] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!developmentId) return;

    const fetchQuestions = async () => {
      const res = await ApiRequest({
        url: `/developments/detail/${developmentId}`,
        method: "GET",
      });

      const questions = res?.data?.questions || [];

      // 🔹 group by video_title
      const grouped = {};

      questions.forEach((q) => {
        const key = q.video_title || "Untitled Video";

        if (!grouped[key]) {
          grouped[key] = {
            video_title: q.video_title || "",
            video_url: q.video_url || "",
            questions: [],
          };
        }

        grouped[key].questions.push({
          question_id: q.question_id, // PENTING
          isNew: false, // question dari database

          type: q.question_type,
          question_text: q.question_text,
          core_value: q.core_value,
          is_active: q.is_active,

          options:
            q.question_type === "MCQ"
              ? (q.options || []).map((o) => ({
                  option_text: o.option_text,
                  is_correct: o.is_correct,
                }))
              : [],
        });
      });

      setLessons(Object.values(grouped));
    };

    fetchQuestions();
  }, [developmentId]);

  const addLesson = () => {
    setLessons((prev) => [
      ...prev,
      {
        video_url: "",
        video_title: "",
        questions: [
          {
            isNew: true,

            type: "MCQ",
            question_text: "",
            core_value: 20,
            is_active: true,

            options: [
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
            ],
          },
        ],
      },
    ]);
  };

  const addQuestion = (lessonIdx, type) => {
    const updated = [...lessons];

    updated[lessonIdx].questions.push(
      type === "MCQ"
        ? {
            isNew: true,

            type: "MCQ",
            question_text: "",
            core_value: 20,
            is_active: true,

            options: [
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
              { option_text: "", is_correct: false },
            ],
          }
        : {
            isNew: true,

            type: "ESSAY",
            question_text: "",
            core_value: 20,
            is_active: true,
            options: [],
          },
    );

    setLessons(updated);
  };

  const deleteQuestion = (lessonIdx, qIdx) => {
    const updated = [...lessons];
    updated[lessonIdx].questions = updated[lessonIdx].questions.filter(
      (_, i) => i !== qIdx,
    );
    setLessons(updated);
  };

  const submitAll = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      /* =========================
       QUESTION LAMA -> PUT
    ========================= */

      const existingQuestions = lessons.flatMap((lesson) =>
        lesson.questions
          .filter((q) => !q.isNew && q.question_id)
          .map((q) => ({
            question_id: q.question_id,

            question_text: q.question_text,
            question_type: q.type,
            core_value: Number(q.core_value) || 0,
            is_active: q.is_active ?? true,

            video_url: lesson.video_url || "",
            video_title: lesson.video_title || "",

            options:
              q.type === "MCQ"
                ? (q.options || []).map((opt) => ({
                    option_text: opt.option_text,
                    is_correct: Boolean(opt.is_correct),
                  }))
                : [],
          })),
      );

      /* =========================
       QUESTION BARU -> POST
    ========================= */

      const newQuestions = lessons.flatMap((lesson) =>
        lesson.questions
          .filter((q) => q.isNew)
          .map((q) => ({
            question_text: q.question_text,
            question_type: q.type,
            core_value: Number(q.core_value) || 0,
            is_active: q.is_active ?? true,

            video_url: lesson.video_url || "",
            video_title: lesson.video_title || "",

            options:
              q.type === "MCQ"
                ? (q.options || []).map((opt) => ({
                    option_text: opt.option_text,
                    is_correct: Boolean(opt.is_correct),
                  }))
                : [],
          })),
      );

      /* =========================
       UPDATE QUESTION LAMA
    ========================= */

      if (existingQuestions.length > 0) {
        const updateRes = await ApiRequest({
          url: `/developments/${developmentId}/questions/bulk`,
          method: "PUT",
          data: {
            questions: existingQuestions,
          },
        });
      }

      /* =========================
       CREATE QUESTION BARU
    ========================= */

      if (newQuestions.length > 0) {
        const createRes = await ApiRequest({
          url: `/developments/${developmentId}/questions/bulk`,
          method: "POST",
          data: {
            questions: newQuestions,
          },
        });
      }

      onFinish?.();
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="pr-1 overflow-y-auto max-h-[65vh] sm:max-h-[56vh] sm:pr-3 custom-scroll">
        {lessons.map((lesson, idx) => (
          <div
            key={idx}
            className="p-4 mb-8 border border-surface-border rounded-2xl bg-surface-background"
          >
            {/* ==== VIDEO URL & TITLE ===== */}
            <div className="p-4 mb-5 border border-surface-border rounded-2xl bg-surface-card">
              <div className="flex justify-between mb-2">
                <div className="font-semibold text-brand-first">
                  Video Info{" "}
                  <span className="text-sm text-text-secondary">
                    (optional)
                  </span>
                </div>

                {lessons.length > 1 && (
                  <button
                    className="text-status-danger"
                    onClick={() =>
                      setLessons((prev) => prev.filter((_, i) => i !== idx))
                    }
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* VIDEO TITLE */}
              <input
                className="w-full px-4 py-2 mb-3 border rounded-lg bg-surface-background"
                placeholder="Video title..."
                value={lesson.video_title}
                onChange={(e) => {
                  const updated = [...lessons];
                  updated[idx].video_title = e.target.value;
                  setLessons(updated);
                }}
              />

              {/* VIDEO URL */}
              <input
                className="w-full px-4 py-2 border rounded-lg bg-surface-background"
                placeholder="https://youtube.com/watch?v=..."
                value={lesson.video_url}
                onChange={(e) => {
                  const updated = [...lessons];
                  updated[idx].video_url = e.target.value;
                  setLessons(updated);
                }}
              />
            </div>

            {/* ===== QUESTIONS ===== */}
            {lesson.questions.map((q, qIdx) => (
              <div
                key={qIdx}
                className="p-4 mb-2 border border-surface-border rounded-xl bg-surface-border"
              >
                <div className="flex justify-between mb-2">
                  <div className="font-semibold text-brand-first">
                    {q.type === "MCQ" ? "Multiple Choice" : "Essay"}
                  </div>

                  <button
                    className="text-status-danger"
                    onClick={() => deleteQuestion(idx, qIdx)}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* QUESTION TEXT */}
                <input
                  className="w-full px-4 py-2 mb-3 border rounded-lg bg-surface-border"
                  placeholder="Write question..."
                  value={q.question_text}
                  onChange={(e) => {
                    const updated = [...lessons];
                    updated[idx].questions[qIdx].question_text = e.target.value;
                    setLessons(updated);
                  }}
                />

                {/* CORE VALUE */}
                <input
                  type="number"
                  className="w-full px-4 py-2 mb-3 border rounded-lg bg-surface-border"
                  placeholder="Core Value"
                  value={q.core_value}
                  onChange={(e) => {
                    const updated = [...lessons];
                    updated[idx].questions[qIdx].core_value =
                      Number(e.target.value) || 0;
                    setLessons(updated);
                  }}
                />

                {/* MCQ OPTIONS */}
                {q.type === "MCQ" && (
                  <div className="pl-2 space-y-2">
                    {q.options.map((opt, optIdx) => (
                      <div key={optIdx} className="flex items-center gap-3">
                        <input
                          type="radio"
                          name={`correct_${idx}_${qIdx}`}
                          checked={opt.is_correct}
                          onChange={() => {
                            const updated = [...lessons];
                            updated[idx].questions[qIdx].options = updated[
                              idx
                            ].questions[qIdx].options.map((o, oi) => ({
                              ...o,
                              is_correct: oi === optIdx,
                            }));
                            setLessons(updated);
                          }}
                        />

                        <input
                          className="flex-1 px-3 py-2 border rounded-lg bg-surface-border"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt.option_text}
                          onChange={(e) => {
                            const updated = [...lessons];
                            updated[idx].questions[qIdx].options[
                              optIdx
                            ].option_text = e.target.value;
                            setLessons(updated);
                          }}
                        />

                        <button
                          className="text-status-danger"
                          onClick={() => {
                            const updated = [...lessons];
                            updated[idx].questions[qIdx].options = updated[
                              idx
                            ].questions[qIdx].options.filter(
                              (_, o) => o !== optIdx,
                            );
                            setLessons(updated);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* ADD NEW QUESTION */}
            <div className="flex flex-col gap-2 mt-2 sm:flex-row">
              <button
                className="px-4 py-2 rounded-lg bg-brand-first text-surface-border"
                onClick={() => addQuestion(idx, "MCQ")}
              >
                + Add MCQ
              </button>

              <button
                className="px-4 py-2 rounded-lg bg-brand-secondary text-surface-border"
                onClick={() => addQuestion(idx, "ESSAY")}
              >
                + Add Essay
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ADD NEW LESSON */}
      <button
        onClick={addLesson}
        className="px-5 py-2 mt-3 bg-status-success text-surface-border rounded-xl"
      >
        + Add Another Video Lesson
      </button>

      {/* ACTION BUTTONS */}
      <div className="flex flex-col-reverse justify-between gap-3 mt-6 sm:flex-row sm:gap-0">
        <button onClick={onBack} className="px-5 py-2 border rounded-lg">
          Back
        </button>

        <button
          onClick={submitAll}
          disabled={submitting}
          className={`
    px-8 py-2 rounded-lg
    bg-brand-first
    text-surface-border
    ${submitting ? "opacity-50 cursor-not-allowed" : ""}
  `}
        >
          {submitting ? "Saving..." : "Finish"}
        </button>
      </div>
    </div>
  );
};

export default StepDevQuestions;
