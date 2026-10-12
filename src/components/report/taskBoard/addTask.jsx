import React, { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import CustomDropdown from "../../common/customDropdown";
import InlineSuccess from "../../common/inlineSuccess";

const AddTaskModal = ({
  show,
  onClose,
  onSubmit,
  form,
  setForm,
  initialForm,
  submitting,
  taskCategories,
}) => {
  const [localData, setLocalData] = useState({
    title: "",
    description: "",
    priority: "",
    task_category_id: "",
    start_date: "",
    due_date: "",
    summary: "",
    report_type: "manual",
    report_period: "",
  });

  useEffect(() => {
    if (show) {
      setLocalData({
        title: form.title || "",
        description: form.description || "",
        priority: form.priority || "",
        task_category_id: form.task_category_id || "",
        start_date: form.start_date || "",
        due_date: form.due_date || "",
        summary: form.summary || "",
        report_type: "manual",
        report_period: "",
      });
    }
  }, [show, form]);

  const priorityOptions = [
    { id: "high", name: "High" },
    { id: "medium", name: "Medium" },
    { id: "low", name: "Low" },
  ];

  const categoryOptions = useMemo(() => {
    return (taskCategories || []).map((cat) => ({
      id: cat.task_category_id,
      name: cat.name,
      description: cat.description,
    }));
  }, [taskCategories]);

  const selectedPriority = useMemo(() => {
    return (
      priorityOptions.find(
        (item) => String(item.id) === String(localData.priority),
      ) || null
    );
  }, [localData.priority]);

  const selectedCategory = useMemo(() => {
    return (
      categoryOptions.find(
        (item) => String(item.id) === String(localData.task_category_id),
      ) || null
    );
  }, [categoryOptions, localData.task_category_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLocalData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setLocalData({
      title: "",
      description: "",
      priority: "",
      task_category_id: "",
      start_date: "",
      due_date: "",
      summary: "",
      report_type: "manual",
      report_period: "",
    });
    setForm({ ...initialForm });
    onClose();
  };

  const handleSubmit = async () => {
    const finalData = {
      ...form,
      ...localData,
      report_type: "manual",
      report_period: "",
    };

    try {
      await onSubmit(finalData);

      setLocalData({
        title: "",
        description: "",
        priority: "",
        task_category_id: "",
        start_date: "",
        due_date: "",
        report_type: "manual",
        report_period: "",
      });

      setForm({ ...initialForm });
    } catch (err) {
      console.error(err);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl rounded-t-3xl sm:rounded-3xl sm:max-w-3xl lg:max-w-5xl sm:p-8 lg:p-10 max-h-[95vh]">
        <div className="mb-5">
          <h2 className="text-2xl font-semibold">Add Task</h2>

          <button
            onClick={handleClose}
            className="absolute p-2 rounded-full top-6 right-6 bg-[#F6FAFF] hover:bg-gray-100"
            type="button"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-5">
          <div>
            <label className="block mb-2 font-semibold text-gray-600">
              Title
            </label>
            <input
              name="title"
              value={localData.title}
              onChange={handleChange}
              placeholder="Input task title"
              className="w-full p-4 border border-gray-200 rounded-2xl"
            />
          </div>

          <div>
            <label className="block mb-2 font-semibold text-gray-600">
              Description
            </label>
            <textarea
              name="description"
              value={localData.description}
              onChange={handleChange}
              placeholder="Input task description"
              rows={4}
              className="w-full p-4 border border-gray-200 resize-none rounded-2xl"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <CustomDropdown
                label="Priority"
                value={selectedPriority}
                onChange={(selected) => {
                  setLocalData((prev) => ({
                    ...prev,
                    priority: String(selected.id),
                  }));
                }}
                options={priorityOptions}
                placeholder="Select Priority"
                clearable={true}
                onClear={() => {
                  setLocalData((prev) => ({
                    ...prev,
                    priority: "",
                  }));
                }}
              />
            </div>

            <div>
              <CustomDropdown
                label="Task Category"
                value={selectedCategory}
                onChange={(selected) => {
                  setLocalData((prev) => ({
                    ...prev,
                    task_category_id: selected.id,
                  }));
                }}
                options={categoryOptions}
                placeholder="Select Category"
                searchable={true}
                clearable={true}
                onClear={() => {
                  setLocalData((prev) => ({
                    ...prev,
                    task_category_id: "",
                  }));
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block mb-2 font-semibold text-gray-600">
                Start Date
              </label>
              <input
                type="date"
                name="start_date"
                value={localData.start_date}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 rounded-2xl"
              />
            </div>

            <div>
              <label className="block mb-2 font-semibold text-gray-600">
                Due Date
              </label>
              <input
                type="date"
                name="due_date"
                value={localData.due_date}
                onChange={handleChange}
                className="w-full p-4 border border-gray-200 rounded-2xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-5 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting}
              className="px-6 py-2 text-white rounded-lg bg-[#002D62]"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddTaskModal;
