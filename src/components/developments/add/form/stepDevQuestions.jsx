import React, { useState } from "react";
import { ApiRequest } from "../../../../services/apiRequest";
import { Plus, Trash2 } from "lucide-react";

const StepDevQuestions = ({ info, onNext, onBack }) => {

  const [lessons, setLessons] = useState([
    {
      video_url: "",
      video_title: "",
      questions: [
        {
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

  const addLesson = () => {
    setLessons(prev => [
      ...prev,
      {
        video_url: "",
        video_title: "",
        questions: [
          {
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
          type: "ESSAY",
          question_text: "",
          core_value: 20,
          is_active: true,
          options: [],
        }
    );
    setLessons(updated);
  };

  const deleteQuestion = (lessonIdx, qIdx) => {
    const updated = [...lessons];
    updated[lessonIdx].questions = updated[lessonIdx].questions.filter((_, i) => i !== qIdx);
    setLessons(updated);
  };

  const submitAll = async () => {
    // 1️⃣ CREATE DEVELOPMENT
    const form = new FormData();
    form.append("title", info.title);
    form.append("description", info.description);
    form.append("content", info.content);
    form.append("video_url", "");
    form.append("development_category_id", info.development_category_id);
    form.append("is_active", "true");
    form.append("core_value", info.core_value);

    if (info.thumbnail) form.append("image", info.thumbnail);

    const devRes = await ApiRequest({
      url: "/developments/create",
      method: "POST",
      data: form,
      isFormData: true,
    });

    const development = devRes.data;

    // 2️⃣ CREATE QUESTIONS PER LESSON
    for (let lesson of lessons) {
      if (!lesson.questions.length) continue;

      const payload = {
        questions: lesson.questions.map(q => ({
          question_text: q.question_text,
          question_type: q.type,
          core_value: q.core_value,
          is_active: true,
          video_url: lesson.video_url || "",
          video_title: lesson.video_title || "",
          options: q.type === "MCQ" ? q.options : [],
        })),
      };

      await ApiRequest({
        url: `/developments/${development.development_id}/questions/bulk`,
        method: "POST",
        data: payload,
      });
    }

    onNext({ savedSets: lessons });
  };

  return (
    <div>
      <div className="
  max-h-[65vh] sm:max-h-[56vh]
  overflow-y-auto
  pr-1 sm:pr-3
  custom-scroll
">

        {lessons.map((lesson, idx) => (
          <div className="border border-surface-border rounded-2xl p-4 mb-10 bg-brand-soft">

            {/* ==== VIDEO URL & TITLE ===== */}
            <div className="border border-surface-border p-4 rounded-xl bg-surface-card mb-5">

              <div className="flex justify-between mb-2">
                <div className="font-semibold text-[#002D62]">
                  Video Info <span className="text-gray-400 text-sm">(optional)</span>
                </div>

                {lessons.length > 1 && (
                  <button
                    className="text-red-500"
                    onClick={() => setLessons(prev => prev.filter((_, i) => i !== idx))}
                  >
                    <Trash2 size={18} />
                  </button>
                )}
              </div>

              {/* VIDEO TITLE */}
              <input
                className="w-full border px-4 py-2 rounded-lg mb-3 bg-[#FAFBFF]"
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
                className="w-full border px-4 py-2 rounded-lg bg-[#FAFBFF]"
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
              <div key={qIdx} className="border border-surface-border p-4 rounded-xl bg-surface-card mb-4 shadow-sm">


                <div className="flex items-center justify-between mb-2 gap-2">                  <div className="font-semibold text-[#002D62]">
                  {q.type === "MCQ" ? "Multiple Choice" : "Essay"}
                </div>

                  <button className="text-red-500 flex-shrink-0" onClick={() => deleteQuestion(idx, qIdx)}>
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* QUESTION TEXT */}
                <input
                  className="w-full border border-surface-border px-4 py-2 rounded-xl bg-surface-card text-text-primary focus:ring-2 focus:ring-brand-primary"
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
                  className="w-full border px-4 py-2 rounded-lg mb-3 bg-[#FAFBFF]"
                  placeholder="Core Value"
                  value={q.core_value}
                  onChange={(e) => {
                    const updated = [...lessons];
                    updated[idx].questions[qIdx].core_value = Number(e.target.value) || 0;
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
                            updated[idx].questions[qIdx].options =
                              updated[idx].questions[qIdx].options.map((o, oi) => ({
                                ...o,
                                is_correct: oi === optIdx,
                              }));
                            setLessons(updated);
                          }}
                        />

                        <input
                          className="flex-1 border border-surface-border px-3 py-2 rounded-lg bg-surface-card text-text-primary text-sm focus:ring-2 focus:ring-brand-primary"
                          placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                          value={opt.option_text}
                          onChange={(e) => {
                            const updated = [...lessons];
                            updated[idx].questions[qIdx].options[optIdx].option_text =
                              e.target.value;
                            setLessons(updated);
                          }}
                        />

                        <button
                          className="text-red-500"
                          onClick={() => {
                            const updated = [...lessons];
                            updated[idx].questions[qIdx].options =
                              updated[idx].questions[qIdx].options.filter((_, o) => o !== optIdx);
                            setLessons(updated);
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}

                    {/* <button
                      className="text-blue-700 text-sm mt-1"
                      onClick={() => {
                        const updated = [...lessons];
                        updated[idx].questions[qIdx].options.push({
                          option_text: "",
                          is_correct: false,
                        });
                        setLessons(updated);
                      }}
                    >
                      + Add Option
                    </button> */}
                  </div>
                )}
              </div>
            ))}

            {/* ADD NEW QUESTION */}
            <div className="flex flex-col sm:flex-row gap-2 mt-2">
              <button
                className="px-4 py-2 bg-brand-first text-white rounded-xl hover:bg-brand-secondary transition"
                onClick={() => addQuestion(idx, "MCQ")}
              >
                + Add MCQ
              </button>

              <button
                className="px-4 py-2 bg-brand-secondary text-white rounded-xl hover:opacity-90 transition"
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
        className="px-5 py-2 mt-4 bg-status-success text-white rounded-xl hover:opacity-90 transition"
      >
        + Add Another Video Lesson
      </button>

      {/* ACTION BUTTONS */}
      <div className="
  flex flex-col-reverse sm:flex-row
  gap-3 sm:gap-0
  justify-between
  mt-6
">
        <button
          onClick={onBack}
          className="px-5 py-2 rounded-xl border border-surface-border text-text-secondary hover:bg-surface-background transition"
        >
          Back
        </button>

        <button
          onClick={submitAll}
          className="px-8 py-2 rounded-xl bg-brand-first text-white font-semibold hover:bg-brand-secondary transition"
        >
          Finish
        </button>
      </div>
    </div>
  );
};

export default StepDevQuestions;
