import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../services/apiRequest";
import CustomDropdown from "../common/customDropdown";

const ProgramFilter = ({ onClose, onApply }) => {
  const [form, setForm] = useState({
    program_id: "",
    area_id: "",
    channel_id: "",
    startDate: "",
    endDate: "",
    expSoonType: "", // NEW 👉 H-7 to H-2 / H-1
  });

  const [programList, setProgramList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFilterOptions = async () => {
    try {
      const [programsRes, areasRes, channelsRes] = await Promise.all([
        ApiRequest({ url: "/types/all", method: "GET" }),
        ApiRequest({ url: "/areas/all", method: "GET" }),
        ApiRequest({ url: "/channels/all", method: "GET" }),
      ]);

      if (programsRes.status === "success") setProgramList(programsRes.data);
      if (areasRes.status === "success") setAreaList(areasRes.data);
      if (channelsRes.status === "success") setChannelList(channelsRes.data);
    } catch (err) {
      console.error("Gagal memuat filter options:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilterOptions();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    onApply({
      filterType: "program",
      program_id: form.program_id,
      area_id: form.area_id,
      channel_id: form.channel_id,
      startDate: form.startDate,
      endDate: form.endDate
    });
    onClose();
  };

  const handleApplyExpSoon = () => {
    const payload = {
      filterType: "expSoon", // penanda untuk pindah tab
      expSoonType: form.expSoonType, // "", H7-H2, H1
    };
    onApply(payload);
    onClose();
  };

  const handleReset = () => {
    const resetForm = {
      program_id: "",
      area_id: "",
      channel_id: "",
      startDate: "",
      endDate: "",
      expSoonType: form.expSoonType, // ❗ keep expSoonType as current
    };

    setForm(resetForm);

    onApply({
      filterType: "programReset",
      program_id: "",
      area_id: "",
      channel_id: "",
      startDate: "",
      endDate: ""
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-lg p-10 relative">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 bg-[#F6FAFF] p-2 rounded-full text-gray-500 hover:bg-gray-100"
        >
          <X size={20} />
        </button>

        {/* EXP SOON BUTTON GROUP */}
        <div className="mb-6">
          <label className="block text-sm text-gray-500 mb-2 font-medium">
            Expired Soon Category
          </label>

          <div className="flex gap-3">
            {[
              { label: "All Expired Soon", value: "" },
              { label: "H-7 to H-2", value: "H7-H2" },
              { label: "H-1", value: "H1" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => handleChange("expSoonType", item.value)}
                className={`px-4 py-2 rounded-xl border text-sm font-semibold transition 
          ${form.expSoonType === item.value
                    ? "bg-[#002D62] text-white shadow-md"
                    : "bg-[#EBF1FF] text-[#002D62] hover:bg-[#D7E4FF]"
                  }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="flex justify-end mt-3">
            <button
              onClick={handleApplyExpSoon}
              className="px-6 py-2 rounded-xl bg-[#002D62] text-white font-semibold hover:bg-[#001A40] shadow transition"
            >
              Filter
            </button>
          </div>


        </div>


        {/* Title */}
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          Program Filter
        </h2>

        {loading ? (
          <p className="text-gray-400 text-sm text-center">Loading filters...</p>
        ) : (
          <>
            {/* DROPDOWNS */}
            <div className="mb-5">
              <CustomDropdown
                label="Select Program"
                value={
                  programList
                    .map((p) => ({ id: p.type_id, name: p.name }))
                    .find((p) => p.id === Number(form.program_id)) ||
                  { id: "", name: "All Program" }
                }
                onChange={(val) => handleChange("program_id", val.id)}
                options={[
                  { id: "", name: "All Program" },
                  ...programList.map((p) => ({
                    id: p.type_id,
                    name: p.name,
                  })),
                ]}
                placeholder="All Program"
              />
            </div>

            <div className="mb-5">
              <CustomDropdown
                label="Select Area"
                value={
                  areaList
                    .map((a) => ({ id: a.area_id, name: a.name }))
                    .find((a) => a.id === Number(form.area_id)) ||
                  { id: "", name: "All Area" }
                }
                onChange={(val) => handleChange("area_id", val.id)}
                options={[
                  { id: "", name: "All Area" },
                  ...areaList.map((a) => ({
                    id: a.area_id,
                    name: a.name,
                  })),
                ]}
              />
            </div>

            <div className="mb-5">
              <CustomDropdown
                label="Select Channel"
                value={
                  channelList
                    .map((c) => ({ id: c.channel_id, name: c.name }))
                    .find((c) => c.id === Number(form.channel_id)) ||
                  { id: "", name: "All Channels" }
                }
                onChange={(val) => handleChange("channel_id", val.id)}
                options={[
                  { id: "", name: "All Channels" },
                  ...channelList.map((c) => ({
                    id: c.channel_id,
                    name: c.name,
                  })),
                ]}
              />
            </div>

            {/* DATE PICKER */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl shadow-sm text-gray-800"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-500 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="w-full p-4 border border-gray-200 rounded-2xl shadow-sm text-gray-800"
                />
              </div>
            </div>

            {/* NEW SECTION: Expired Soon */}
            {/* <div className="mb-8">
              <label className="block text-sm text-gray-500 mb-2">
                Expired Soon Category
              </label>

              <select
                value={form.expSoonType}
                onChange={(e) => handleChange("expSoonType", e.target.value)}
                className="w-full p-4 border border-gray-200 rounded-2xl shadow text-gray-800"
              >
                <option value="">All Expired Soon</option>
                <option value="H7-H2">H-7 to H-2</option>
                <option value="H1">H-1</option>
              </select>
            </div>
 */}
            {/* BUTTONS */}
            <div className="flex justify-end gap-4 mt-6 border-t pt-6">
              <button
                onClick={handleReset}
                className="px-6 py-3 rounded-xl bg-[#EBF1FF] text-[#002D62] font-semibold hover:bg-[#d9e4ff] transition"
              >
                Reset Filter
              </button>

              <button
                onClick={handleSubmit}
                className="px-6 py-3 rounded-xl bg-[#002D62] text-white font-semibold hover:bg-[#001A40] shadow-lg transition"
              >
                Apply Filter
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ProgramFilter;
