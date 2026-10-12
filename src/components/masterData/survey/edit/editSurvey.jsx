import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Stepper from "../../../common/stepper";
import { ApiRequest } from "../../../../services/apiRequest";
import StepSurveyEditSuccess from "./successEdit";
import StepSurveyEditQuestions from "./form/stepEditQuestions";
import StepSurveyEditInfo from "./form/stepEditInfo";

const EditSurveyModal = ({ open, onClose, surveyId, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [surveyInfo, setSurveyInfo] = useState(null);
  const [finishSuccess, setFinishSuccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const steps = ["Survey Info", "Questions"];

  /* ================= FETCH DETAIL ================= */
  useEffect(() => {
    if (!open || !surveyId) return;

    const fetchDetail = async () => {
      setLoading(true);

      try {
        const res = await ApiRequest({
          url: `/surveys/${surveyId}`,
          method: "GET",
        });

        const mappedData = {
          id: res.data.id,
          title: res.data.title,
          description: res.data.description,
          status: res.data.status,
          start_date: res.data.start_date,
          end_date: res.data.end_date,

          questions: (res.data.questions || []).map((q, idx) => ({
            question_id: q.id,
            question_text: q.question_text,
            question_type: q.question_type,
            score: q.score ?? 0,
            is_required: q.is_required,
            allow_multiple: q.allow_multiple ?? false,
            allow_other: q.allow_other ?? false,
            order_number: idx + 1,

            options:
              q.question_type === "single_choice" ||
              q.question_type === "multiple_choice"
                ? (q.options || []).map((o, oi) => ({
                    option_id: o.id,
                    option_text: o.option_text,
                    option_value: o.option_value ?? 0,
                    order_number: oi + 1,
                  }))
                : [],
          })),
        };

        setSurveyInfo(mappedData);
      } catch (error) {
        console.error("❌ GAGAL MENGAMBIL DETAIL SURVEY:", error);
        console.error(
          "❌ RESPONSE ERROR:",
          error?.response?.data || error?.message,
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [open, surveyId]);

  /* ================= CEK PERUBAHAN STATE ================= */
  const handleNext = (data) => {
    if (step === 1) {
      setSurveyInfo((prev) => {
        const updatedData = {
          ...prev,
          ...data,
          id: prev?.id,
          questions: prev?.questions || [],
        };

        return updatedData;
      });
    }

    if (step === 2) {
      setFinishSuccess(true);
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl max-h-[95vh] rounded-t-3xl animate-slideUpMobile sm:max-w-lg sm:rounded-2xl sm:p-8 sm:animate-none">
        {!finishSuccess && (
          <>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-semibold">Edit Survey</h2>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full bg-[#F6FAFF]"
              >
                <X size={20} />
              </button>
            </div>

            <Stepper steps={steps} activeStep={step} />
          </>
        )}

        {loading ? (
          <p className="mt-20 text-center text-gray-400">Loading...</p>
        ) : (
          <div className="animate-fadeIn">
            {!finishSuccess ? (
              <>
                {step === 1 && (
                  <StepSurveyEditInfo
                    initialData={surveyInfo}
                    onNext={handleNext}
                  />
                )}

                {step === 2 && (
                  <StepSurveyEditQuestions
                    surveyId={surveyId}
                    info={surveyInfo}
                    isEdit
                    onBack={handleBack}
                    onNext={handleNext}
                  />
                )}
              </>
            ) : (
              <StepSurveyEditSuccess
                onClose={() => {
                  onClose();
                  onSuccess?.();
                }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditSurveyModal;
