import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { updateAnnouncement } from "../../../services/announcement/announcementService";

const initialForm = {
  title: "",
  description: "",
  type: "promo",
  image: null,
};

const normalizeImageUrl = (url) => {
  if (!url) return "";
  return url.replace(/\\/g, "/");
};

const EditAnnouncementModal = ({ open, announcement, onClose, onSuccess }) => {
  const [form, setForm] = useState(initialForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (announcement && open) {
      setForm({
        title: announcement.title || "",
        description: announcement.description || "",
        type: announcement.type || "promo",
        image: null,
      });
    }
  }, [announcement, open]);

  if (!open) return null;

  const handleClose = () => {
    if (saving) return;
    setForm(initialForm);
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!announcement?.id) return;

    try {
      setSaving(true);
      await updateAnnouncement(announcement.id, form);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("Update announcement error:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60">
      <div className="relative w-full max-w-2xl p-6 bg-white shadow-lg rounded-2xl sm:p-8">
        <button
          onClick={handleClose}
          className="absolute p-2 bg-white rounded-full shadow -top-3 -right-3 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        <h2 className="mb-6 text-2xl font-bold text-[#002D62]">
          Edit Announcement
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Announcement Title
            </label>
            <input
              type="text"
              placeholder="Enter announcement title"
              value={form.title}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, title: e.target.value }))
              }
              className="w-full px-4 py-3 text-sm border border-gray-200 outline-none rounded-xl focus:border-[#2D9CDB]"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Description
            </label>
            <textarea
              rows={5}
              placeholder="Enter description"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full px-4 py-3 text-sm border border-gray-200 outline-none resize-none rounded-xl focus:border-[#2D9CDB]"
              required
            />
          </div>

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, type: e.target.value }))
              }
              className="w-full px-4 py-3 text-sm border border-gray-200 outline-none rounded-xl focus:border-[#2D9CDB]"
            >
              <option value="promo">Promo</option>
              <option value="info">Info</option>
            </select>
          </div>

          {announcement?.image && (
            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-700">
                Current Image
              </label>
              <img
                src={normalizeImageUrl(announcement.image)}
                alt={announcement.title}
                className="object-cover w-40 border h-28 rounded-xl"
              />
            </div>
          )}

          <div>
            <label className="block mb-2 text-sm font-semibold text-gray-700">
              Replace Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  image: e.target.files?.[0] || null,
                }))
              }
              className="w-full px-4 py-3 text-sm border border-gray-200 outline-none rounded-xl"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-5 font-medium text-gray-600 border border-gray-200 rounded-lg py-2.5"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="px-5 font-medium text-white rounded-lg shadow bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] py-2.5 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Update Announcement"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAnnouncementModal;
