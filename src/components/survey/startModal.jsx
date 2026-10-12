import React, { useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../services/apiRequest";

const SurveyStartModal = ({ survey, onClose, onStarted }) => {
    const [loading, setLoading] = useState(false);

    const handleStart = async () => {
        setLoading(true);
        try {
            const res = await ApiRequest({
                url: `/surveys/${survey.survey_id}/start`,
                method: "POST",
            });

            const responseId = res?.data?.response_id;
            if (responseId) {
                onStarted(responseId);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
    <div className="fixed inset-0 z-[1000]">
              {/* Overlay */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fadeIn"
      />


      {/* Container */}
      <div className="
        absolute inset-x-0 bottom-0
        sm:inset-0 sm:flex sm:items-center sm:justify-center
      ">
        <div
          className="
            relative
            bg-white
            w-full
            h-auto
            sm:max-w-md

            rounded-t-3xl sm:rounded-2xl
            shadow-2xl

            p-6 sm:p-8
            text-center

            animate-slideUp
          "
        >

                      {/* Drag Handle (Mobile Only) */}
          <div className="flex justify-center mb-4 sm:hidden">
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>



      {/* <button
                    onClick={onClose}
                    className="absolute top-5 right-5 text-gray-400"
                >
                    <X />
                </button>
 */}
                {/* <h2 className="text-xl font-semibold mb-3">
          Start Survey
        </h2> */}

                <p className="text-gray-600 mb-6 text-center leading-relaxed">
                    <h2 className="text-xl sm:text-2xl font-semibold text-gray-700">Ayo mulai survey!</h2>
                    <br />
<span className="text-sm sm:text-lg text-gray-500 leading-relaxed mb-8">                        Durasi akan mulai dihitung setelah Anda menekan tombol{" "}
                        <span className="font-semibold">Start</span>.
                    </span>
                </p>

                <div className="flex justify-center gap-3">
                    <button
                        onClick={handleStart}
                        disabled={loading}
       className="
              w-full sm:w-auto
              px-8 py-3
              bg-[#002D62] text-white
              rounded-xl font-semibold
              hover:bg-[#001f45]
              transition
              disabled:opacity-60
            "                    >
                        {loading ? "Starting..." : "Start"}
                    </button>
                </div>
            </div>
        </div>
        </div>
    );
};

export default SurveyStartModal;
