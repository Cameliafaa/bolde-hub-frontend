import React, { useEffect, useState } from "react";
import CustomDropdown from "../../../common/customDropdown";
import { ApiRequest } from "../../../../services/apiRequest";
import DragDropImage from "../../../common/dragImage";

const StepEditDevInfo = ({ developmentId, onNext }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [coreValue, setCoreValue] = useState("");

  const [thumbnail, setThumbnail] = useState(null);
  const [category, setCategory] = useState(null);
  const [categories, setCategories] = useState([]);

  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchAll = async () => {
      const [devRes, catRes] = await Promise.all([
        ApiRequest({
          url: `/developments/detail/${developmentId}`,
          method: "GET",
        }),
        ApiRequest({ url: "/development-categories/all", method: "GET" }),
      ]);

      const dev = devRes.data;
      const cats = catRes.data.map((c) => ({
        id: c.development_category_id,
        name: c.name,
      }));

      setCategories(cats);
      setCategory(cats.find((c) => c.id === dev.development_category_id));
      setTitle(dev.title);
      setDescription(dev.description);
      const stripHtml = (html = "") => {
        const temp = document.createElement("div");
        temp.innerHTML = html;
        return temp.textContent || temp.innerText || "";
      };

      setContent(stripHtml(dev.content));
      setCoreValue(dev.core_value?.toString() || "");
    };

    fetchAll();
  }, [developmentId]);

  const handleSubmit = async () => {
    const form = new FormData();
    form.append("title", title);
    form.append("description", description);
    form.append("content", content);
    form.append("core_value", Number(coreValue) || 0);
    form.append("development_category_id", category?.id);
    if (thumbnail) form.append("image", thumbnail);

    await ApiRequest({
      url: `/developments/update/${developmentId}`,
      method: "PUT",
      data: form,
      isFormData: true,
    });

    onNext({ info: { title, description, content, core_value: coreValue } });
  };

  const formatNumber = (value) => {
    if (!value) return "";
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (value) => {
    return value.replace(/\./g, "");
  };

  return (
    <div className="grid grid-cols-1 gap-6 /* HP */ sm:grid-cols-2 tablet+ sm:gap-10">
      {/* LEFT */}
      <div className="flex flex-col space-y-2">
        <CustomDropdown
          label="Development Category"
          value={category}
          onChange={setCategory}
          options={categories}
          placeholder="Select Category"
        />
        <label className="font-semibold text-text-secondary">
          Short Description
        </label>
        <input
          className="w-full px-4 py-3 transition border border-surface-border rounded-2xl bg-surface-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-first"
          placeholder="Short Description..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <label className="font-semibold text-text-secondary">
          Long Description
        </label>
        <textarea
          className="w-full px-4 py-3 transition border border-surface-border rounded-2xl bg-surface-background text-text-primary focus:outline-none focus:ring-2 focus:ring-brand-first h-28"
          placeholder="Long Description"
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      </div>

      {/* RIGHT */}
      <div className="flex flex-col space-y-2">
        <label className="font-semibold text-text-secondary">
          Development Title
        </label>
        <input
          className={`p-4 border rounded-xl ${
            touched.title && errors.title
              ? "border-status-danger"
              : "border-text-secondary"
          }`}
          placeholder="Development Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label className="font-semibold text-text-secondary">Point</label>
        <input
          type="text"
          inputMode="numeric"
          placeholder="Masukkan Point"
          className="p-4 border rounded-xl border-surface-border"
          value={formatNumber(coreValue)}
          onChange={(e) => {
            const raw = parseNumber(e.target.value).replace(/\D/g, "");
            setCoreValue(raw);
          }}
        />

        <label className="font-semibold text-text-secondary">Image</label>
        <DragDropImage onChange={setThumbnail} />

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            className="px-6 py-2 rounded-lg bg-brand-first text-surface-border"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepEditDevInfo;
