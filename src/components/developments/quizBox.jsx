import React, { useState } from "react";

const QuizBox = ({ questions = [], onFinish }) => {
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});

  if (!questions.length) return null;

  const currentQuestion = questions[current];

  const calculateScore = () => {
    let score = 0;

    questions.forEach((q) => {
      const ans = answers[q.question_id];

      if (q.question_type === "MCQ") {
        const correctOpt = q.options?.find((o) => o.is_correct);
        if (
          ans?.question_options_id &&
          ans.question_options_id === correctOpt?.question_options_id
        ) {
          score += q.core_value || 0;
        }
      }
    });

    return score;
  };

  return (
    <div
      className="
    bg-[#EFF4FA]
    rounded-2xl
    shadow-md

    p-4                /* HP */
    min-h-[280px]      /* HP */

    sm:p-8
    sm:min-h-[350px]
  "
    >
      <p className="text-[10px] sm:text-xs text-gray-500 mb-1 sm:mb-2">
        Question {current + 1} / {questions.length}
      </p>

      <h2 className="
    text-sm           /* HP */
    sm:text-lg
    font-semibold
    text-[#002D62]
    mb-4 sm:mb-6
  ">
        {currentQuestion.question_text}
      </h2>

      {/* ===== MCQ ===== */}
      {currentQuestion.question_type === "MCQ" && (
        <div
          className="
    grid
    grid-cols-1        /* HP: 1 kolom */
    gap-3

    sm:grid-cols-2
    sm:gap-4

    mb-4 sm:mb-6
  "
        >
          {currentQuestion.options?.map((opt) => (
            <div
              key={opt.question_options_id}
              onClick={() =>
                setAnswers((prev) => ({
                  ...prev,
                  [currentQuestion.question_id]: {
                    question_options_id: opt.question_options_id,
                  },
                }))
              }
              className={`
    px-3 py-2.5        /* HP */
    sm:px-4 sm:py-3

    rounded-lg
    border
    cursor-pointer

    text-xs sm:text-sm

    ${answers[currentQuestion.question_id]?.question_options_id ===
                  opt.question_options_id
                  ? "bg-[#002D62] text-white border-[#002D62]"
                  : "border-gray-300 bg-white"
                }
  `}
            >
              {opt.option_text}
            </div>
          ))}
        </div>
      )}

      {/* ===== ESSAY ===== */}
      {currentQuestion.question_type === "ESSAY" && (
        <textarea
          className="
    w-full
    min-h-[100px]     /* HP */
    sm:min-h-[120px]

    border
    rounded-xl
    p-3 sm:p-4
    mb-4 sm:mb-6

    text-sm
  "
          placeholder="Write your answer here..."
          value={answers[currentQuestion.question_id]?.essay_answer || ""}
          onChange={(e) =>
            setAnswers((prev) => ({
              ...prev,
              [currentQuestion.question_id]: {
                ...prev[currentQuestion.question_id],
                essay_answer: e.target.value,
              },
            }))
          }
        />
      )}

      {/* ===== BUTTONS ===== */}
      <div className="flex justify-between gap-2">
        <button
          onClick={() => setCurrent((c) => c - 1)}
          disabled={current === 0}
          className="
    flex-1             /* HP: full */
    sm:flex-none

    px-3 sm:px-4
    py-2

    text-xs sm:text-sm
    bg-gray-300
    rounded-lg
    disabled:opacity-50
  "        >
          Previous
        </button>

        <button
          onClick={() => {
            if (current === questions.length - 1) {
              const score = calculateScore();
              onFinish(score, answers); // ✅ SELALU kirim answers
            } else {
              setCurrent((c) => c + 1);
            }
          }}
          className="
    flex-1
    sm:flex-none

    px-3 sm:px-4
    py-2

    text-xs sm:text-sm
    bg-[#002D62]
    text-white
    rounded-lg
  "        >
          {current === questions.length - 1 ? "Finish" : "Next"}
        </button>
      </div>
    </div>
  );
};

export default QuizBox;
