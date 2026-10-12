import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../common/customDropdown";
import { ApiRequest } from "../../../../services/apiRequest";
import DragDropImage from "../../../common/dragImage";

const StepDevInfo = ({ onNext }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coreValue, setCoreValue] = useState("");
  const [thumbnail, setThumbnail] = useState(null);

  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await ApiRequest({
          url: "/development-categories/all",
          method: "GET",
        });

        if (res.status === "success") {
          const formatted = (res.data || []).map((item) => ({
            id: item.development_category_id,
            name: item.name,
          }));

          setCategories(formatted);
        }
      } catch (err) {
        console.error("Failed fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const formatNumber = (value) => {
    if (!value) return "";

    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (value) => {
    return value.replace(/\./g, "");
  };

  const handleSubmit = () => {
    onNext({
      info: {
        title,
        description,
        content,
        video_url: "",
        development_category_id: category?.id,
        is_active: true,
        core_value: Number(coreValue) || 0,
        thumbnail,
      },
    });
  };

  const labelClass = "block mb-2 text-sm font-semibold text-gray-600";

  const inputClass = `
    w-full
    h-[58px]
    px-4
    bg-white
    border
    border-gray-200
    rounded-2xl
    shadow-sm
    outline-none
    text-sm
    text-gray-800
    placeholder:text-gray-400
    focus:border-[#0F3B73]
    focus:ring-1
    focus:ring-[#0F3B73]
    transition
  `;

  return (
    <div className="w-full bg-white">
      {/* ================= CONTENT ================= */}
      <div className="py-2">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          {/* LEFT */}
          <div>
            <CustomDropdown
              label="Development Category"
              value={category}
              onChange={setCategory}
              options={categories}
              placeholder="Select Category"
            />
          </div>

          {/* RIGHT */}
          <div>
            <label className={labelClass}>Development Title</label>

            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter development title"
              className={inputClass}
            />
          </div>

          {/* LEFT */}
          <div>
            <label className={labelClass}>Short Description</label>

            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter short description"
              className={inputClass}
            />
          </div>

          {/* RIGHT */}
          <div>
            <label className={labelClass}>Point</label>

            <input
              type="text"
              inputMode="numeric"
              value={formatNumber(coreValue)}
              onChange={(e) => {
                const raw = parseNumber(e.target.value).replace(/\D/g, "");

                setCoreValue(raw);
              }}
              placeholder="Enter point"
              className={inputClass}
            />
          </div>

          {/* LEFT */}
          <div>
            <label className={labelClass}>Long Description</label>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter long description"
              className="w-full px-4 py-4 text-sm text-gray-800 transition bg-white border border-gray-200 shadow-sm outline-none resize-none h-[190px] rounded-2xl placeholder:text-gray-400 focus:border-[#0F3B73] focus:ring-1 focus:ring-[#0F3B73]"
            />
          </div>

          {/* RIGHT */}
          <div>
            <label className={labelClass}>Image</label>

            <DragDropImage onChange={setThumbnail} />
          </div>
        </div>
      </div>

      {/* ================= FOOTER ================= */}
      <div className="pt-6 mt-8 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSubmit}
            className="text-sm font-semibold text-white transition shadow-sm min-w-[120px] h-[48px] px-7 rounded-xl bg-[#0F3B73] hover:bg-[#0A2D59]"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepDevInfo;
