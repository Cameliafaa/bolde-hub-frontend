import React, { useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const ChannelAddModal = ({ open, onClose, onSuccess }) => {
  const [form, setForm] = useState({
    channel_code: "",
    name: "",
    description: "",
    loading: false,
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Channel name is required");
      return;
    }

    setForm((f) => ({ ...f, loading: true }));

    try {
      const res = await ApiRequest({
        url: "/channels/create",
        method: "POST",
        data: {
          channel_code: form.channel_code,
          name: form.name,
          description: form.description,
        },
      });

      if (res.status === "success") {
        setForm({ channel_code: "", name: "", description: "", loading: false });
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to add channel");
      }
    } catch (e) {
      setError("Error connecting to server");
    } finally {
      setForm((f) => ({ ...f, loading: false }));
    }
  };

  const handleClose = () => {
    setForm({ channel_code: "", name: "", description: "", loading: false });
    setError("");
    onClose();
  };

  if (!open) return null;

  return (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">
            <div
                className="
    bg-white
    w-full
    sm:max-w-lg

    rounded-t-3xl sm:rounded-2xl
    shadow-xl
    relative

    p-6 sm:p-8

    max-h-[95vh]
    overflow-y-auto

    animate-slideUpMobile
    sm:animate-none
  "
            >
        <div
          className="
    flex items-center justify-between
    mb-4
    sticky top-0
    bg-white
    z-20
    pb-3
    border-b
  "
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800">
            Add Channel
          </h2>

          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && <p className="text-red-600 text-sm mb-3">{error}</p>}

        <div className="space-y-4">

          <div>
            <label className="text-gray-600 font-semibold">Channel Code</label>
            <input
              type="text"
              name="channel_code"
              value={form.channel_code}
              onChange={handleChange}
              placeholder="Enter channel code"
              className="w-full p-4 border border-gray-200 rounded-2xl"
            />
          </div>

          <div>
            <label className="text-gray-600 font-semibold">Channel Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Enter channel name"
              className="w-full p-4 border border-gray-200 rounded-2xl"
            />
          </div>

          <div>
            <label className="text-gray-600 font-semibold">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter description"
              className="w-full p-4 border border-gray-200 rounded-2xl"
              rows={3}
            />
          </div>

        </div>

        <div className="flex justify-end mt-6 gap-3 pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={form.loading}
            className="bg-[#002D62] text-white px-6 py-2 rounded-lg"
          >
            {form.loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChannelAddModal;
