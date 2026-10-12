import React, { useState, useEffect, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import YouTube from "react-youtube";
import QuizBox from "../../components/developments/quizBox";
import UpdateIcon from "../../assets/images/icons/editIcon.png";
import DeleteIcon from "../../assets/images/icons/deleteIcon.png";
import ConfirmDeleteModal from "../../components/common/ConfirmDeleteModal";
import usePermission from "../../utils/usePermission";
import EditDevelopmentModal from "../../components/developments/edit/editDevelopment";
import ActionMenu from "../../components/common/actionMenu";

const DevelopmentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [development, setDevelopment] = useState(null);
  const [history, setHistory] = useState(null);
  const [loading, setLoading] = useState(true);

  const [videoDone, setVideoDone] = useState({});
  const [assignmentDone, setAssignmentDone] = useState({}); // map: unitQuestionId -> true
  const [backendScore, setBackendScore] = useState(0);

  const [mode, setMode] = useState("video");
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  const [showQuizResult, setShowQuizResult] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);
  const [quizKey, setQuizKey] = useState(0);
  const [isLastUnitPassed, setIsLastUnitPassed] = useState(false);

  const [showPopup, setShowPopup] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);


  // ✅ popup kelulusan akhir + point
  const [showCompletedPopup, setShowCompletedPopup] = useState(false);
  const [completedInfo, setCompletedInfo] = useState(null); // { score_total, certificate_url, certificate_code }

  const VIDEO_STORAGE_KEY = `mlabs_video_${id}`;
  const ANSWER_STORAGE_KEY = `mlabs_answers_${id}`;

  const { can_update, can_delete } = usePermission();

  const loadVideoProgress = () => {
    try {
      const saved = localStorage.getItem(VIDEO_STORAGE_KEY);
      if (!saved) return;
      const parsed = JSON.parse(saved);
      setVideoDone(parsed || {});
    } catch (err) {
      console.error("Failed to load local video progress:", err);
    }
  };

  const saveVideoProgress = (map) => {
    try {
      localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(map));
    } catch (err) {
      console.error("Failed to save local video progress:", err);
    }
  };

  const loadDraftAnswers = () => {
    try {
      const saved = localStorage.getItem(ANSWER_STORAGE_KEY);
      if (!saved) return {};
      return JSON.parse(saved) || {};
    } catch (e) {
      return {};
    }
  };

  const saveDraftAnswers = (draftMap) => {
    try {
      localStorage.setItem(ANSWER_STORAGE_KEY, JSON.stringify(draftMap));
    } catch (e) {
      console.error("Failed to save draft answers:", e);
    }
  };

  const fetchDetail = async () => {
    try {
      const res = await ApiRequest({
        url: `/developments/detail/${id}`,
        method: "GET",
      });

      if (res?.status === "success") {
        setDevelopment(res.data);
      }
    } catch (err) {
      console.error("Fetch detail error:", err);
    }
  };

  const handleDeleteDevelopment = async () => {
    if (!deleteTarget) return;

    try {
      await ApiRequest({
        url: `/developments/delete/${deleteTarget.development_id}`,
        method: "DELETE",
      });

      navigate("/development"); // arahkan balik
    } catch (err) {
      console.error("Delete development error:", err);
    } finally {
      setDeleteTarget(null);
    }
  };


  const fetchHistory = async () => {
    try {
      const res = await ApiRequest({
        url: `/developments/history?development_id=${id}`,
        method: "GET",
      });

      if (res?.status === "success" && res.data?.length > 0) {
        setHistory(res.data[0]);
      } else {
        setHistory(null);
      }
    } catch (err) {
      console.error("Fetch history error:", err);
    }
  };

  /**
   * ✅ backend progress: /user-scores/question/me
   * - res.questions = list unit question_id yang sudah completed
   */
  const fetchUserScore = async (unitQuestionIds = []) => {
    try {
      const res = await ApiRequest({
        url: `/user-scores/question/me?development_id=${id}`,
        method: "GET",
      });

      if (res?.status === "success") {
        const completedMap = {};

        const completedUnitIds = (res.questions || [])
          .filter(
            (q) => q.is_completed && unitQuestionIds.includes(q.question_id)
          )
          .map((q) => q.question_id);

        completedUnitIds.forEach((qid) => (completedMap[qid] = true));
        setAssignmentDone(completedMap);

        const totalUnits = unitQuestionIds.length || 1;
        const completedUnits = completedUnitIds.length;

        const progress = Math.round((completedUnits / totalUnits) * 100);
        setBackendScore(progress);

        return { progress, completedUnits, totalUnits, completedMap };
      }
    } catch (err) {
      console.error("Fetch user score error:", err);
    }

    return null;
  };

  /**
   * ✅ simpan progress per unit (hanya saat lulus)
   * /user-scores/question
   */
  const submitUnitProgress = async ({ unitQuestionId, unitPercent }) => {
    try {
      const res = await ApiRequest({
        url: `/user-scores/question`,
        method: "POST",
        data: {
          question_id: unitQuestionId,
          score: unitPercent,
          is_completed: true,
        },
      });
      return res;
    } catch (err) {
      console.error("Submit unit progress error:", err);
      return null;
    }
  };

  /**
   * ✅ FINAL SUBMIT (hanya sekali di akhir)
   * /developments/{id}/submit
   */
  const submitFinalAnswers = async (finalAnswers) => {
    try {
      const res = await ApiRequest({
        url: `/developments/${id}/submit`,
        method: "POST",
        data: { answers: finalAnswers },
      });
      return res;
    } catch (err) {
      console.error("Submit final answers error:", err);
      return null;
    }
  };

  // ====== GROUPING UNIT ======
  const { groupedLessons, questionIdByVideo, unitQuestionIds } = useMemo(() => {
    if (!development?.questions) {
      return { groupedLessons: [], questionIdByVideo: {}, unitQuestionIds: [] };
    }

    const grouped = {};
    const questionMap = {};

    development.questions.forEach((q) => {
      const vt = q.video_title || "Untitled";

      if (!grouped[vt]) {
        grouped[vt] = {
          video_title: vt,
          video_url: q.video_url,
          questions: [],
        };
        // ✅ wakil 1 unit (video + assignment)
        questionMap[vt] = q.question_id;
      }

      grouped[vt].questions.push(q);
    });

    const groupedArray = Object.values(grouped);
    const unitIds = groupedArray
      .map((g) => questionMap[g.video_title])
      .filter(Boolean);

    return {
      groupedLessons: groupedArray,
      questionIdByVideo: questionMap,
      unitQuestionIds: unitIds,
    };
  }, [development]);

  useEffect(() => {
    loadVideoProgress();
    setLoading(true);
    Promise.all([fetchDetail(), fetchHistory()]).finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // setelah groupedLessons siap, fetch user score yang benar (berdasarkan total unit)
  useEffect(() => {
    if (!unitQuestionIds.length) return;
    fetchUserScore(unitQuestionIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitQuestionIds.join(",")]);

  // ✅ auto focus ke video pertama yang assignment-nya belum completed
  useEffect(() => {
    if (!groupedLessons.length) return;

    const idx = groupedLessons.findIndex((g) => {
      const unitId = questionIdByVideo[g.video_title];
      return unitId ? !assignmentDone[unitId] : true;
    });

    setCurrentVideoIndex(idx === -1 ? 0 : idx);
  }, [groupedLessons, assignmentDone, questionIdByVideo]);

  const quizPassingScore = development?.passing_score || 60;
  const isPassed = backendScore === 100 || history?.passed === true;

  // ====== VIDEO RENDER ======
  const renderVideo = (group) => {
    if (!group?.video_url)
      return (
        <div className="w-full aspect-video bg-gray-200 rounded-xl flex items-center justify-center">
          No Video Available
        </div>
      );

    const match = group.video_url.match(
      /(?:youtu\.be\/|youtube\.com\/watch\?v=)([^?&]+)/i
    );

    const handleFinish = () => {
      if (history?.passed) return;

      const vt = group.video_title;

      // simpan video selesai (local fallback)
      const updated = { ...videoDone, [vt]: true };
      setVideoDone(updated);
      saveVideoProgress(updated);

      // 🔥 SET GROUP AKTIF UNTUK QUIZ
      setSelectedGroup(group);

      setShowPopup(true);
    };

    if (match)
      return (
        <div className="w-full h-full">
          <YouTube
            videoId={match[1]}
            className="w-full h-full"
            iframeClassName="w-full h-full"
            opts={{
              width: "100%",
              height: "100%",
              playerVars: { rel: 0, modestbranding: 1 },
            }}
            onEnd={handleFinish}
          />
        </div>
      );

    return (
      <video className="w-full rounded-xl" controls onEnded={handleFinish}>
        <source src={group.video_url} type="video/mp4" />
      </video>
    );
  };

  // ====== FINALIZATION CHECK ======
  const maybeFinalizeIfCompleted = async () => {
    if (history?.passed) return;

    const scoreRes = await fetchUserScore(unitQuestionIds);
    if (!scoreRes) return;

    if (scoreRes.progress === 100) {
      const draft = loadDraftAnswers();
      const finalAnswers = Object.values(draft);

      if (!finalAnswers.length) return;

      const submitRes = await submitFinalAnswers(finalAnswers);
      if (submitRes?.status === "success") {
        await fetchHistory();

        const cert = submitRes?.data?.certificate;
        setCompletedInfo({
          score_total: submitRes?.data?.score_total,
          certificate_url: cert?.certificate_url,
          certificate_code: cert?.certificate_code,
        });

        // ✅ Popup final cuma dari sini (sekali)
        setShowCompletedPopup(true);
      }
    }
  };

  if (loading || !development)
    return (
      <div className="h-screen flex justify-center items-center">
        Loading Development...
      </div>
    );

  // ✅ Continue handler (anti double popup & flow benar)
  const handleContinueAfterQuiz = async () => {
    setShowQuizResult(false);

    // ❌ belum lulus → reset quiz (jawaban kosong) dan tetap di mode quiz
    if (!quizPassed) {
      setQuizKey((prev) => prev + 1);
      return;
    }

    // ✅ lulus & unit terakhir → finalize setelah user klik Continue
    if (isLastUnitPassed) {
      await maybeFinalizeIfCompleted();
      setIsLastUnitPassed(false);
      // biarkan popup final muncul dari maybeFinalizeIfCompleted()
      return;
    }

    // ✅ lulus tapi bukan terakhir → pindah ke video berikutnya
    const currentTitle = selectedGroup?.video_title;
    const nextIndex =
      groupedLessons.findIndex((g) => g.video_title === currentTitle) + 1;

    if (nextIndex >= 0 && nextIndex < groupedLessons.length) {
      setCurrentVideoIndex(nextIndex);
    }

    setMode("video");
  };

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
      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <div onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-text-secondary">
          <ArrowLeft
            size={18}
            onClick={() => navigate(-1)}
            className="cursor-pointer hover:text-brand-first transition"
          />
          <p className="text-xs sm:text-sm lg:text-sm md:text-sm font-medium hover:text-brand-first cursor-pointer transition">
            Back to Development Center
          </p>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div
        className="
bg-surface-card
border border-surface-border
shadow-sm
    p-4 sm:p-6
    rounded-3xl
    mb-8
    flex flex-col
    lg:flex-row
    gap-6
  "
      >
        {/* LEFT */}
        <div className="w-full">
          {mode === "video" && (
            <div className="w-full aspect-video rounded-xl overflow-hidden">
              {renderVideo(groupedLessons[currentVideoIndex])}
            </div>
          )}

          {/* ✅ QUIZ hanya boleh kalau belum lulus */}
          {mode === "quiz" && selectedGroup && !history?.passed && (
            <div
              className="
        w-full
        rounded-xl
        overflow-visible

        /* tinggi aman di layar besar */
        lg:min-h-[360px]
      "
            >
              <QuizBox
                key={quizKey}
                questions={selectedGroup.questions}
                onFinish={async (score, answers) => {
                  const totalQuestions = selectedGroup.questions.length;
                  const passingPercent = 60;

                  const percentScore = totalQuestions > 0
                    ? Math.round((score / totalQuestions) * 100)
                    : 0;

                  const passed = percentScore >= passingPercent;

                  setQuizScore(score);
                  setQuizPassed(passed);
                  setShowQuizResult(true);

                  // ✅ simpan draft jawaban ke localStorage
                  const draft = loadDraftAnswers();
                  const builtAnswers = selectedGroup.questions.map((q) => {
                    const ans = answers?.[q.question_id] || {};
                    return {
                      question_id: q.question_id,
                      selected_option_id: ans.question_options_id ?? null,
                      essay_answer: ans.essay_answer ?? "",
                    };
                  });
                  builtAnswers.forEach((payload) => {
                    draft[payload.question_id] = payload;
                  });
                  saveDraftAnswers(draft);

                  // ❌ kalau tidak lulus → stop, tunggu user klik Continue (nanti reset)
                  if (!passed) return;

                  // ✅ kalau lulus → submit unit progress (SATU KALI)
                  const unitId = questionIdByVideo[selectedGroup.video_title];
                  const totalUnits = unitQuestionIds.length || 1;
                  const unitPercent = Math.round(100 / totalUnits);

                  if (unitId && !assignmentDone[unitId]) {
                    await submitUnitProgress({
                      unitQuestionId: unitId,
                      unitPercent,
                    });
                  }

                  // ✅ tentukan apakah ini unit terakhir (AMAN: pakai Set, bukan assignmentDone yang stale)
                  const completedUnitIds = new Set([
                    ...Object.keys(assignmentDone),
                    unitId,
                  ]);

                  if (completedUnitIds.size === unitQuestionIds.length) {
                    setIsLastUnitPassed(true);
                  }

                  // ⚠️ Jangan auto pindah video / mode di sini
                  // pindah video dilakukan setelah user klik Continue di popup quiz result
                }}
              />
            </div>
          )}
        </div>

        {/* RIGHT PROGRESS PANEL */}
        <div
          className="
    w-full
    lg:w-[40%]

    order-1
    lg:order-2
  "
        >
          <h2
            className="
    text-sm        /* HP */
    sm:text-base   /* tablet */
    lg:text-lg     /* laptop (tetap) */
    font-semibold
    text-brand-first
  "
          >
            Video Lessons & Assignment
          </h2>

          {groupedLessons.map((group) => {
            const vt = group.video_title;
            // const videoCompleted = history?.passed ? true : !!videoDone[vt];

            const unitId = questionIdByVideo[vt];
            const assignmentCompleted = unitId ? !!assignmentDone[unitId] : false;

            const videoCompleted =
              history?.passed ||
              assignmentCompleted || // ← quiz lulus = video auto lulus
              !!videoDone[vt];

            const lockAll = !!history?.passed;

            return (
              <div key={vt} className="space-y-2 mb-6">
                <div className="flex justify-between items-center">
                  <p
                    className="
    text-xs        /* HP */
    sm:text-sm     /* tablet */
    lg:text-sm     /* laptop */
    font-semibold
text-brand-first
  "
                  >
                    {vt}
                  </p>
                  <input
                    type="checkbox"
                    checked={videoCompleted}
                    readOnly
                    className="w-4 h-4 accent-brand-first"
                  />
                </div>

                <div className="flex justify-between items-center pl-5">
                  <p
                    className={`
    text-xs        /* HP */
    sm:text-sm     /* tablet */
    lg:text-sm
    leading-relaxed ${lockAll
                        ? "text-gray-400 cursor-not-allowed"
                        : videoCompleted && !assignmentCompleted
                          ? "text-brand-first cursor-pointer"
                          : "text-text-primary"
                      }`}
                    onClick={() => {
                      if (lockAll) return;
                      if (videoCompleted && !assignmentCompleted) {
                        setSelectedGroup(group);
                        setMode("quiz");
                        // reset quiz state saat masuk quiz (optional)
                        setQuizKey((k) => k + 1);
                      }
                    }}
                  >
                    • Assignment – {vt}
                  </p>

                  <input
                    type="checkbox"
                    checked={assignmentCompleted}
                    readOnly
                    className="w-4 h-4 accent-brand-first"
                  />
                </div>
              </div>
            );
          })}

          {/* PASSING SCORE */}
          <div className="mt-6">
            <p
              className="
    text-xs
    sm:text-sm
    text-text-secondary
  "
            >
              Your Passing Score
            </p>
            <p
              className="
    text-xl        /* HP */
    sm:text-2xl    /* tablet */
    lg:text-3xl    /* desktop */
    font-bold
    text-brand-first
  "
            >
              {history?.passed ? "100" : backendScore}%{" "}
              <span
                className={`text-sm ml-2 ${isPassed ? "text-status-success" : "text-status-error"
                  }`}
              >
                {isPassed ? "Completed" : "Not Passed"}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold text-brand-first">
            {development.title}
          </h2>

          {(can_update || can_delete) && (
            <ActionMenu
              onEdit={() => {
                if (!can_update) return;
                setShowEdit(true);
              }}
              onDelete={() => {
                if (!can_delete) return;
                setDeleteTarget(development);
              }}
            />
          )}
        </div>

        <p
          className="
    text-sm sm:text-base
text-text-primary
    leading-relaxed
    text-justify
    break-words
    mb-4
  "
        >
          {development.description}
        </p>

        <div
          dangerouslySetInnerHTML={{ __html: development.content }}
          className="
    text-sm sm:text-base
text-text-primary
    leading-relaxed
    text-justify
    break-words
  "
        />
      </div>

      {/* VIDEO FINISHED POPUP */}
      {showPopup && !history?.passed && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div
            className="
bg-surface-card
rounded-2xl
border border-surface-border
shadow-lg
    text-center
=
    w-[90%]        /* HP: hampir full */
    max-w-xs       /* HP: batas kecil */
    p-4            /* HP padding */

    sm:w-auto
    sm:max-w-sm
    sm:p-8
  "
          >
            <h2 className="text-base sm:text-xl font-bold text-brand-first">Video Completed</h2>

            <p className="text-sm sm:text-base text-text-primary mt-2 mb-6">
              Great job! You may continue to assignment.
            </p>

            <button
              className="
    w-full         /* HP */
    sm:w-auto
    px-4 sm:px-5
    py-2
    text-sm
bg-brand-first hover:bg-brand-secondary transition
    text-white
    rounded-xl
  "
              onClick={() => setShowPopup(false)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* QUIZ RESULT POPUP */}
      {showQuizResult && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div
            className="
bg-surface-card
rounded-2xl
border border-surface-border
shadow-lg
    text-center
    w-[90%]
    max-w-xs
    p-4

    sm:max-w-sm
    sm:p-6
  "
          >
            <h2 className="text-base sm:text-xl font-semibold text-brand-first mb-2">
              Quiz Result
            </h2>

            <p className="text-sm sm:text-text-primary mb-3">
              Score Anda: <b>{quizScore}</b>
            </p>

            <p
              className={`text-sm sm:text-base font-semibold mb-6 ${quizPassed ? "text-status-success" : "text-status-error"
                }`}
            >
              {quizPassed ? "Lulus" : "Belum Lulus"}
            </p>

            <button
              onClick={handleContinueAfterQuiz}
              className="
    w-full
    sm:w-auto
    px-4 sm:px-5
    py-2
    text-sm
bg-brand-first hover:bg-brand-secondary transition
text-surface-card
    rounded-xl
  "            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ✅ COMPLETED POPUP (akhir) */}
      {showCompletedPopup && (
        <div className="fixed inset-0 bg-overlay flex items-center justify-center z-50">
          <div
            className="
    text-center
bg-surface-card
rounded-2xl
border border-surface-border
shadow-lg

    w-[90%]
    max-w-xs
    p-4

    sm:max-w-sm
    sm:p-6
  "
          >
            <h2 className="text-base sm:text-xl font-semibold text-brand-first mb-2">
              Selamat! Anda Lulus
            </h2>

            <p className=" text-sm sm:text-text-primary mb-2">
              Anda mendapatkan point sebesar{" "}
              <b>{completedInfo?.score_total ?? history?.total_score ?? "-"}</b>
            </p>

            {completedInfo?.certificate_code && (
              <p className="text-xs sm:text-sm text-text-primary mb-4">
                Certificate: <b>{completedInfo.certificate_code}</b>
              </p>
            )}

            <button
              onClick={() => setShowCompletedPopup(false)}
              className="
    w-full
    sm:w-auto
    px-4 sm:px-5
    py-2
    text-sm
bg-brand-first hover:bg-brand-secondary transition
text-surface-card
    rounded-xl
  "            >
              OK
            </button>
          </div>
        </div>
      )}

      <EditDevelopmentModal
        open={showEdit}
        developmentId={development.development_id}
        onClose={() => setShowEdit(false)}
        onSuccess={fetchDetail}
      />

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDeleteDevelopment}
      />

    </div>
  );
};

export default DevelopmentDetail;
