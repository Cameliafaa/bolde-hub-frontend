import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { ApiRequest } from "../../../../../services/apiRequest";

const StepSurveyEditQuestions = ({ info, onBack, onNext, surveyId }) => {
  const [questions, setQuestions] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (info?.questions?.length) {
      setQuestions(info.questions);
      setActiveIndex(0);
    }
  }, [info]);

  if (!questions.length) {
    return (
      <p className="mt-20 text-center text-gray-400">Loading questions...</p>
    );
  }

  const activeQuestion = questions[activeIndex];

  /* ================= QUESTION CRUD ================= */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        question_type: "single_choice",
        is_required: true,
        allow_multiple: false,
        allow_other: true,
        order_number: prev.length + 1,
        options: [{ option_text: "Option 1", order_number: 1 }],
      },
    ]);
    setActiveIndex(questions.length);
  };

  const updateQuestion = (key, value) => {
    const updated = [...questions];
    updated[activeIndex][key] = value;
    setQuestions(updated);
  };

  const addOption = () => {
    const updated = [...questions];
    updated[activeIndex].options.push({
      option_text: "",
      order_number: updated[activeIndex].options.length + 1,
    });
    setQuestions(updated);
  };

  const updateOption = (idx, value) => {
    const updated = [...questions];
    updated[activeIndex].options[idx].option_text = value;
    setQuestions(updated);
  };

  const removeOption = (idx) => {
    const updated = [...questions];
    updated[activeIndex].options = updated[activeIndex].options
      .filter((_, i) => i !== idx)
      .map((o, i) => ({ ...o, order_number: i + 1 }));
    setQuestions(updated);
  };

  /* ================= QUESTION & OPTION CRUD ================= */

  const updateQuestionAt = (qIndex, key, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = {
        ...updated[qIndex],
        [key]: value,
      };
      return updated;
    });
  };

  const addOptionAt = (qIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = updated[qIndex];

      updated[qIndex] = {
        ...q,
        options: [
          ...(q.options || []),
          {
            option_text: "",
            order_number: (q.options?.length || 0) + 1,
          },
        ],
      };

      return updated;
    });
  };

  const updateOptionAt = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = [...(updated[qIndex].options || [])];

      options[optIndex] = {
        ...options[optIndex],
        option_text: value,
      };

      updated[qIndex] = {
        ...updated[qIndex],
        options,
      };

      return updated;
    });
  };

  const removeOptionAt = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = (updated[qIndex].options || [])
        .filter((_, i) => i !== optIndex)
        .map((o, i) => ({
          ...o,
          order_number: i + 1,
        }));

      updated[qIndex] = {
        ...updated[qIndex],
        options,
      };

      return updated;
    });
  };

  /* ================= SUBMIT ================= */

  const handleFinish = async () => {
    if (submitting) return;

    if (!surveyId) {
      console.error("❌ Survey ID missing");
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        title: info?.title || "",
        description: info?.description || "",
        status: info?.status || "active",

        start_date: info?.start_date
          ? new Date(info.start_date).toISOString()
          : null,

        end_date: info?.end_date ? new Date(info.end_date).toISOString() : null,

        questions: questions.map((q, qi) => ({
          ...(q.question_id ? { question_id: q.question_id } : {}),

          question_text: q.question_text,
          question_type: q.question_type,

          score: q.question_type === "text" ? 0 : Number(q.score || 0),

          is_required: Boolean(q.is_required),
          allow_multiple: Boolean(q.allow_multiple),
          allow_other: Boolean(q.allow_other),

          order_number: qi + 1,

          options:
            q.question_type === "single_choice" ||
            q.question_type === "multiple_choice"
              ? (q.options || []).map((o, oi) => ({
                  // PENTING UNTUK EDIT
                  ...(o.option_id ? { option_id: o.option_id } : {}),

                  option_text: o.option_text,
                  option_value: Number(o.option_value || 0),
                  order_number: oi + 1,
                }))
              : [],
        })),
      };

      const response = await ApiRequest({
        url: `/surveys/${surveyId}`,
        method: "PUT",
        data: payload,
      });

      // baru pindah ke success kalau API benar-benar berhasil
      onNext(response);
    } catch (err) {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <div className="flex flex-col bg-white border rounded-2xl h-[57vh]">
        {/* ===== HEADER ===== */}
        <div className="flex items-center justify-between px-8 py-3">
          <h2 className="text-lg font-semibold text-[#002D62]">
            Survey Question
          </h2>
          <button
            onClick={addQuestion}
            className="px-4 py-2 text-sm text-white bg-[#002D62] rounded-xl"
          >
            + Add Question
          </button>
        </div>

        {/* ===== BODY ===== */}
        <div className="flex-1 px-8 pt-2 overflow-y-auto pb-28">
          <div className="space-y-4">
            {questions.map((q, qIndex) => (
              <div key={qIndex} className="p-4 border rounded-xl">
                {/* QUESTION */}
                <div className="mb-6">
                  <label className="block mb-2 text-sm font-medium">
                    Question {qIndex + 1}
                  </label>
                  <input
                    className="w-full px-4 py-3 border rounded-xl"
                    placeholder="Your question here"
                    value={q.question_text}
                    onChange={(e) =>
                      updateQuestionAt(qIndex, "question_text", e.target.value)
                    }
                  />
                </div>

                {/* ANSWER TYPE + OPTIONS */}
                <div className="grid grid-cols-2 gap-6">
                  {/* LEFT */}
                  <div>
                    <label className="block mb-2 text-sm font-medium">
                      Answer Type
                    </label>

                    <select
                      className="w-full px-4 py-3 mb-4 border max-w-[360px] rounded-xl"
                      value={q.question_type}
                      onChange={(e) =>
                        updateQuestionAt(
                          qIndex,
                          "question_type",
                          e.target.value,
                        )
                      }
                    >
                      <select
                        className="w-full px-4 py-3 mb-4 border max-w-[360px] rounded-xl"
                        value={q.question_type}
                        onChange={(e) =>
                          updateQuestionAt(
                            qIndex,
                            "question_type",
                            e.target.value,
                          )
                        }
                      >
                        <option value="single_choice">Single Choice</option>

                        <option value="multiple_choice">Multiple Choice</option>

                        <option value="text">Text</option>
                      </select>
                      <option value="text">Text</option>
                    </select>

                    {/* TOGGLES — GRID BIKIN RAPI */}
                    <div className="grid grid-cols-3 mt-2 gap-x-10 max-w-[520px]">
                      <Toggle
                        label="Required"
                        value={q.is_required}
                        onChange={(v) =>
                          updateQuestionAt(qIndex, "is_required", v)
                        }
                      />
                      <Toggle
                        label="Multiple Selection"
                        value={q.question_type === "multiple_choice"}
                        onChange={(v) =>
                          updateQuestionAt(
                            qIndex,
                            "question_type",
                            v ? "multiple_choice" : "single_choice",
                          )
                        }
                      />
                      <Toggle
                        label="Other Option"
                        value={q.allow_other}
                        onChange={(v) =>
                          updateQuestionAt(qIndex, "allow_other", v)
                        }
                      />
                    </div>
                  </div>

                  {/* RIGHT */}
                  {q.question_type === "single_choice" && (
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <label className="text-sm font-medium">Options</label>
                        <button
                          onClick={() => addOptionAt(qIndex)}
                          className="text-sm font-semibold text-[#002D62]"
                        >
                          + Add option
                        </button>
                      </div>

                      <div className="space-y-3">
                        {(q.options || []).map((opt, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="flex items-center justify-center text-sm font-semibold bg-gray-100 rounded-lg w-9 h-9">
                              {String.fromCharCode(65 + idx)}
                            </span>
                            <input
                              className="flex-1 px-4 py-3 border rounded-xl"
                              value={opt.option_text}
                              onChange={(e) =>
                                updateOptionAt(qIndex, idx, e.target.value)
                              }
                            />
                            {q.options.length > 1 && (
                              <button
                                onClick={() => removeOptionAt(qIndex, idx)}
                              >
                                <Trash2 size={16} className="text-red-500" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FOOTER ===== */}
        <div className="flex justify-between px-8 py-6 mt-auto bg-white rounded-b-2xl">
          <button onClick={onBack} className="px-6 py-2 border rounded-xl">
            Back
          </button>
          <button
            onClick={handleFinish}
            className="px-8 py-2 text-white bg-[#002D62] rounded-xl"
          >
            Finish
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= TOGGLE ================= */

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center justify-between">
    <span className="text-sm">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full relative transition ${
        value ? "bg-[#0F4C81]" : "bg-gray-300"
      }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${
          value ? "right-0.5" : "left-0.5"
        }`}
      />
    </button>
  </div>
);

export default StepSurveyEditQuestions;
