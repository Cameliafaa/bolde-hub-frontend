import React, { useState } from "react";
import DragDropImage from "../../../../common/dragImage";
import { ApiRequest } from "../../../../../services/apiRequest";

const StepSpecialProgramLetter = ({ data = {}, allData, onBack, onNext }) => {
  const programYear =
    (allData?.info?.startDate &&
      new Date(allData.info.startDate).getFullYear()) ||
    new Date().getFullYear();

  const [form, setForm] = useState({
    opening_text_html:
      data.opening_text_html ||
      `<p>Bersama surat ini, kami mengajukan special program marketing berikut :</p>`,

    conclusion_text_html: data.conclusion_text_html || "",

    closing_text_html:
      data.closing_text_html ||
      `<p>Program ini dirancang untuk mendorong pertumbuhan yang berpotensi besar di pasar. Diharapkan dapat mengakselerasi pencapaian target nasional kuartal akhir ${programYear}.</p>
       <p>Demikian pengajuan program ini kami sampaikan. Atas perhatian dan dukungan Bapak, kami ucapkan terima kasih.</p>`,

    footer_text_html:
      data.footer_text_html ||
      `<div style="margin-top:40px; text-align:center; font-size:12px; color:#555;">
         <p><strong>Marketing Department</strong><br/>PT. Boldé Digital Indonesia</p>
       </div>`,

    loading: false,
  });

  const [thumbnail, setThumbnail] = useState(null);
  const [error, setError] = useState("");

  const handleConclusionChange = (e) => {
    setForm((prev) => ({ ...prev, conclusion_text_html: e.target.value }));
    setError("");
  };

  const validate = () => {
    if (!form.conclusion_text_html.trim()) {
      setError("Objective Program is required");
      return false;
    }
    return true;
  };

  const formatLocalDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString().split("T")[0];
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    const info = allData.info || {};
    const storeTargets = info.store_targets || [];

    const payload = {
      name: info.namaProgram,
      description: `Special Program ${info.namaProgram}`,
      priority: "High",
      program_category_id: info.programCategory?.id,

      period_start: formatLocalDate(info.startDate),
      period_end: formatLocalDate(info.endDate),

      program_areas: (info.area || []).map((a) => ({
        area_id: a.id,
      })),

      program_types: [
        {
          type_id: info.programType?.id,
        },
      ],

      program_channels: (info.channel || []).map((c) => ({
        channel_id: c.id,
      })),

      approvals: (info.approvalLine || []).map((a) => ({
        user_id: a.id,
        status: "pending",
        notes: `Waiting approval step ${a.order}`,
      })),

      program_letters: {
        opening_text_html: form.opening_text_html,
        closing_text_html: form.closing_text_html,
        conclusion_text_html: form.conclusion_text_html,
        header_text_html: "<h1>Program Promosi</h1>",
        footer_text_html: form.footer_text_html,
        status: "draft",
        is_circular: false,
        is_submission: true,
      },

      program_provinces: (info.province || []).map((p) => ({
        province_id: p.id,
      })),

      program_stores: storeTargets.map((s) => ({
        store_id: s.store_id,
        target_selling_num: Number(s.target_selling_num) || 0,
      })),
    };

    try {
      setForm((prev) => ({ ...prev, loading: true }));

      const res = await ApiRequest({
        url: "/programs/create",
        method: "POST",
        data: payload,
      });

      if (res.status !== "success") {
        alert("Failed to save special program");
        return;
      }

      const programId = res.data?.program_id;

      if (thumbnail && programId) {
        const fd = new FormData();
        fd.append("image", thumbnail);

        await ApiRequest({
          url: `/programs/${programId}/upload-image`,
          method: "POST",
          data: fd,
          isFormData: true,
        });
      }

      onNext(res.data);
    } catch (err) {
      console.error("SPECIAL SUBMIT ERROR:", err);
    } finally {
      setForm((prev) => ({ ...prev, loading: false }));
    }
  };
  return (
    <div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        {/* OBJECTIVE */}
        <div>
          <label className="font-semibold text-gray-600">
            Objective Program
          </label>
          <textarea
            value={form.conclusion_text_html}
            onChange={handleConclusionChange}
            placeholder="Input Objective Program"
            rows={9}
            className={`w-full border rounded-lg p-3 text-[15px] ${
              error ? "border-red-500" : "border-gray-300"
            }`}
          />
          {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
        </div>

        {/* IMAGE */}
        <div>
          <label className="font-semibold text-gray-500">Image</label>
          <DragDropImage value={thumbnail} onChange={setThumbnail} />
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex justify-between mt-10">
        <button
          onClick={onBack}
          className="px-8 py-3 border border-gray-400 rounded-lg"
        >
          Back
        </button>

        <button
          onClick={handleSubmit}
          disabled={form.loading}
          className="px-10 py-3 font-semibold text-white rounded-lg bg-[#002D62]"
        >
          {form.loading ? "Saving..." : "Publish Now"}
        </button>
      </div>
    </div>
  );
};

export default StepSpecialProgramLetter;
