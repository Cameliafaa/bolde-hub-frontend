import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { ApiRequest } from "../../../../../services/apiRequest";

const StepSurveyQuestions = ({ info, onBack, onNext }) => {
  const [questions, setQuestions] = useState([
    {
      question_text: "",
      question_type: "single_choice",
      is_required: true,
      allow_multiple: false,
      allow_other: true,
      order_number: 1,
      options: [{ option_text: "Option 1", order_number: 1, is_other: false }],
    },
  ]);

  /* ================= QUESTION CRUD ================= */

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        question_text: "",
        question_type: "single_choice",
        is_required: true,
        allow_multiple: false,
        allow_other: false,
        order_number: prev.length + 1,
        options: [{ option_text: "Option 1", order_number: 1, is_other: false }],
      },
    ]);
  };

  const updateQuestionAt = (qIndex, key, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex] = { ...updated[qIndex], [key]: value };
      return updated;
    });
  };

  const toggleOtherOption = (qIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = updated[qIndex];

      let options = [...q.options];

      if (value) {
        // tambah "Isi sendiri"
        options.push({
          option_text: "Isi sendiri",
          order_number: options.length + 1,
          is_other: true,
        });
      } else {
        // hapus option other
        options = options.filter((o) => !o.is_other);
      }

      updated[qIndex] = {
        ...q,
        allow_other: value,
        options: options.map((o, i) => ({
          ...o,
          order_number: i + 1,
        })),
      };

      return updated;
    });
  };


  const addOptionAt = (qIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const q = updated[qIndex];

      const normalOptions = q.options.filter(o => !o.is_other);
      const otherOption = q.options.find(o => o.is_other);

      const newOptions = [
        ...normalOptions,
        {
          option_text: "",
          order_number: normalOptions.length + 1,
          is_other: false,
        },
        ...(otherOption ? [otherOption] : [])
      ].map((o, i) => ({ ...o, order_number: i + 1 }));

      updated[qIndex] = { ...q, options: newOptions };
      return updated;
    });
  };

  const updateOptionAt = (qIndex, optIndex, value) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = [...updated[qIndex].options];
      options[optIndex] = { ...options[optIndex], option_text: value };
      updated[qIndex] = { ...updated[qIndex], options };
      return updated;
    });
  };

  const removeOptionAt = (qIndex, optIndex) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const options = updated[qIndex].options
        .filter((_, i) => i !== optIndex)
        .map((o, i) => ({ ...o, order_number: i + 1 }));
      updated[qIndex] = { ...updated[qIndex], options };
      return updated;
    });
  };

  /* ================= SUBMIT ================= */

  const handleFinish = async () => {
    const payload = {
      title: info.title,
      description: info.description,
      status: info.status,
      questions,
    };

    await ApiRequest({
      url: "/surveys",
      method: "POST",
      data: payload,
    });

    onNext();
  };

  return (
    <div className="max-w-[1200px] mx-auto">
      <div className="bg-white rounded-2xl border flex flex-col h-[57vh]">

        {/* ===== HEADER (FIXED) ===== */}
        <div className="flex justify-between items-center px-8 py-3">
          <h2 className="text-lg font-semibold text-[#002D62]">
            Survey Question
          </h2>

          <button
            onClick={addQuestion}
            className="px-4 py-2 text-sm bg-[#002D62] text-white rounded-xl"
          >
            + Add Question
          </button>
        </div>

        {/* ===== BODY (SCROLLABLE) ===== */}
        <div className="flex-1 overflow-y-auto px-8 pt-1 pb-28">
          <div className="space-y-4">

            {questions.map((q, qIndex) => (
              <div
                key={qIndex}
                className="border rounded-xl p-4"
              >
                {/* QUESTION NUMBER */}
                {/* <p className="text-sm font-semibold text-gray-500 mb-3">
                  Question 
                </p> */}

                {/* QUESTION INPUT */}
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">
                    Question {qIndex + 1}
                  </label>
                  <input
                    className="w-full border rounded-xl px-4 py-3"
                    placeholder="Your question here"
                    value={q.question_text}
                    onChange={(e) =>
                      updateQuestionAt(
                        qIndex,
                        "question_text",
                        e.target.value
                      )
                    }
                  />
                </div>

                {/* ANSWER TYPE + OPTIONS */}
                <div className="grid grid-cols-2 gap-6">

                  {/* LEFT — ANSWER TYPE */}
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Answer Type
                    </label>

                    <select
                      className="w-full max-w-[360px] border rounded-xl px-4 py-3 mb-4"
                      value={q.question_type}
                      onChange={(e) =>
                        updateQuestionAt(
                          qIndex,
                          "question_type",
                          e.target.value
                        )
                      }
                    >
                      <option value="single_choice">Multiple Choice</option>
                      <option value="text">Text</option>
                    </select>

                    <div className="flex items-center gap-8 mt-1">
                      <Toggle
                        label="Required"
                        value={q.is_required}
                        onChange={(v) =>
                          updateQuestionAt(qIndex, "is_required", v)
                        }
                      />

                      <Toggle
                        label="Multiple Selection"
                        value={q.allow_multiple}
                        onChange={(v) =>
                          updateQuestionAt(qIndex, "allow_multiple", v)
                        }
                      />

                      <Toggle
                        label="Other Option"
                        value={q.allow_other}
                        onChange={(v) =>
                          toggleOtherOption(qIndex, v)
                        }
                      />
                    </div>
                  </div>

                  {/* RIGHT — OPTIONS */}
                  {q.question_type === "single_choice" && (
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <label className="text-sm font-medium">
                          Options
                        </label>

                        <button
                          onClick={() => addOptionAt(qIndex)}
                          className="text-sm text-[#002D62] font-semibold"
                        >
                          + Add option
                        </button>
                      </div>

                      <div className="space-y-3">
                        {q.options.map((opt, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-3"
                          >
                            <span className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center text-sm font-semibold">
                              {String.fromCharCode(65 + idx)}
                            </span>

                            <input
                              className="flex-1 border rounded-xl px-4 py-3"
                              placeholder="Option text"
                              value={opt.option_text}
                              disabled={opt.is_other}
                              onChange={(e) =>
                                updateOptionAt(
                                  qIndex,
                                  idx,
                                  e.target.value
                                )
                              }
                            />

                            {!opt.is_other && q.options.length > 1 && (
                              <button
                                onClick={() =>
                                  removeOptionAt(qIndex, idx)
                                }
                              >
                                <Trash2
                                  size={16}
                                  className="text-red-500"
                                />
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

        {/* ===== FOOTER (FIXED) ===== */}
        <div className="mt-auto px-8 py-6 flex justify-between bg-white rounded-b-2xl">
          <button
            onClick={onBack}
            className="px-6 py-2 border rounded-xl"
          >
            Back
          </button>
          <button
            onClick={handleFinish}
            className="px-8 py-2 bg-[#002D62] text-white rounded-xl"
          >
            Finish
          </button>
        </div>
      </div>
    </div >
  );
};

/* ================= TOGGLE ================= */

const Toggle = ({ label, value, onChange }) => (
  <div className="flex items-center gap-3">
    <span className="text-sm">{label}</span>
    <button
      onClick={() => onChange(!value)}
      className={`w-10 h-5 rounded-full relative transition ${value ? "bg-[#0F4C81]" : "bg-gray-300"
        }`}
    >
      <span
        className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition ${value ? "right-0.5" : "left-0.5"
          }`}
      />
    </button>
  </div>
);

export default StepSurveyQuestions;
