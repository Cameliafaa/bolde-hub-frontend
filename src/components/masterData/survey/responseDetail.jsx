import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const ResponseDetailModal = ({ response, onClose }) => {
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!response?.response_id) return;

    ApiRequest({
      url: `/survey-responses/${response.response_id}`,
      method: "GET",
    }).then((res) => {
      setDetail(res?.data?.data ?? null);
    });
  }, [response]);

  if (!detail) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full relative">
        <button onClick={onClose} className="absolute top-6 right-6">
          <X />
        </button>

        <h2 className="text-xl font-semibold mb-6">
          Response Detail
        </h2>

        <div className="space-y-4">
          {detail.answers.map((a, i) => (
            <div key={i} className="border rounded-xl p-4">
              <p className="font-semibold mb-1">
                {i + 1}. {a.question_text}
              </p>
              <p className="text-gray-700">{a.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ResponseDetailModal;
