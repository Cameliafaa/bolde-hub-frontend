import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../services/apiRequest";

const ExtendProgramModal = ({ open, onClose, programId, program, onSuccess }) => {
  const [form, setForm] = useState({
    new_start_date: "",
    new_end_date: "",
    reason: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (program?.period_end) {
      const nextDay = new Date(program.period_end);
      nextDay.setDate(nextDay.getDate() + 1);

      setForm((prev) => ({
        ...prev,
        new_start_date: nextDay.toISOString().split("T")[0],
      }));
    }
  }, [program]);


  const handleExtend = async () => {
    if (!form.new_start_date || !form.new_end_date) {
      alert("Start Date & End Date wajib diisi!");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const payload = {
        period_start: form.new_start_date,
        period_end: form.new_end_date,
        extend_note: form.reason || "",
      };

      const response = await ApiRequest({
        url: `/programs/${programId}/extend`,
        method: "POST",
        data: payload,
        headers: { Authorization: `Bearer ${token}` },
      });
      
      // 🔑 SATU-SATUNYA KONDISI YANG BENAR
      if (response?.status === "success") {
        const newProgramId = response?.data?.new_program_id;

        if (!newProgramId) {
          console.error("new_program_id tidak ditemukan", response);
          alert("Extend gagal (ID program baru tidak ada)");
          return;
        }

        onSuccess(newProgramId);
        onClose();
      } else {
        alert("Extend gagal!");
      }
    } catch (err) {
      console.error("Extend error:", err);
      alert("Gagal memperpanjang program.");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-[9999]">
      <div className="bg-white rounded-2xl w-[480px] p-6 shadow-xl relative">

        {/* CLOSE */}
        <button
          className="absolute right-4 top-4 text-gray-500"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-semibold mb-2">Extend Program</h2>
        <p className="text-gray-500 text-sm mb-6">
          Perpanjang periode program. Approval akan ter-reset otomatis oleh sistem.
        </p>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">New Start Date</label>
            <input
              type="date"
              value={form.new_start_date || ""}
              disabled
              readOnly
              className="
    w-full mt-1 px-3 py-2 border rounded-lg
    bg-gray-100 text-gray-500
    cursor-not-allowed
    disabled:[&::-webkit-calendar-picker-indicator]:hidden
  "
            />
          </div>

          <div>
            <label className="text-sm font-medium">New End Date</label>
            <input
              type="date"
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              value={form.new_end_date}
              onChange={(e) =>
                setForm({ ...form, new_end_date: e.target.value })
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium">Extend Note (optional)</label>
            <textarea
              className="w-full mt-1 px-3 py-2 border rounded-lg"
              rows={3}
              placeholder="Alasan perpanjangan..."
              value={form.reason}
              onChange={(e) =>
                setForm({ ...form, reason: e.target.value })
              }
            ></textarea>
          </div>
        </div>

        <button
          onClick={handleExtend}
          disabled={loading}
          className="w-full mt-6 py-3 bg-[#0F4C81] text-white rounded-xl hover:bg-[#0c3b63] disabled:opacity-50"
        >
          {loading ? "Processing..." : "Perpanjang Program"}
        </button>
      </div>
    </div>
  );
};

export default ExtendProgramModal;
