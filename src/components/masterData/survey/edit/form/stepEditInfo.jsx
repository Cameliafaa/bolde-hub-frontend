import React, { useEffect, useState } from "react";

const StepSurveyEditInfo = ({ onNext, initialData }) => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    start_date: "",
    end_date: "",
    status: "active",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        description: initialData.description || "",
        start_date: initialData.start_date?.slice(0, 10) || "",
        end_date: initialData.end_date?.slice(0, 10) || "",
        status: initialData.status || "active",
      });
    }
  }, [initialData]);



  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      <div className="col-span-2">
        <div className="mb-6">
          <label className="font-semibold text-gray-600">Survey Title *</label>
          <input
            className="w-full p-4 border rounded-xl"
            placeholder="Enter survey title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <label className="font-semibold text-gray-600">Description</label>
        <textarea
          className="w-full p-4 border rounded-xl"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="flex justify-end">
          <button
            onClick={() => onNext(form)}
            className="bg-[#002D62] text-white px-8 py-2 rounded-lg"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepSurveyEditInfo;
