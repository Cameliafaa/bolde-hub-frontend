import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../services/apiRequest";
import CustomDropdown from "../common/customDropdown";

const CircularLetterFilter = ({ onClose, onApply }) => {
  const [form, setForm] = useState({
    letter_type_id: "",
    area_id: "",
    channel_id: "",
    startDate: "",
    endDate: "",
    expSoonType: "", // "", H7-H2, H1
  });

  const [letterTypeList, setLetterTypeList] = useState([]);
  const [areaList, setAreaList] = useState([]);
  const [channelList, setChannelList] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ================= FETCH OPTIONS ================= */
  const fetchFilterOptions = async () => {
    try {
      const [letterTypesRes, areasRes, channelsRes] = await Promise.all([
        ApiRequest({ url: "/circular-letter/types", method: "GET" }),
        ApiRequest({ url: "/areas/all", method: "GET" }),
        ApiRequest({ url: "/channels/all", method: "GET" }),
      ]);

      if (letterTypesRes.status === "success")
        setLetterTypeList(letterTypesRes.data);

      if (areasRes.status === "success") setAreaList(areasRes.data);
      if (channelsRes.status === "success") setChannelList(channelsRes.data);
    } catch (err) {
      console.error("Failed load circular letter filters:", err);
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

  /* ================= APPLY NORMAL FILTER ================= */
  const handleSubmit = () => {
    onApply({
      filterType: "circular",
      letter_type_id: form.letter_type_id,
      area_id: form.area_id,
      channel_id: form.channel_id,
      startDate: form.startDate,
      endDate: form.endDate,
    });
    onClose();
  };

  /* ================= APPLY EXP SOON ================= */
  const handleApplyExpSoon = () => {
    onApply({
      filterType: "expSoon",
      expSoonType: form.expSoonType,
    });
    onClose();
  };

  /* ================= RESET ================= */
  const handleReset = () => {
    setForm({
      letter_type_id: "",
      area_id: "",
      channel_id: "",
      startDate: "",
      endDate: "",
      expSoonType: "",
    });

    onApply({ filterType: "resetCircular" });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center">

      {/* CONTAINER */}
      <div
        className="
        bg-surface-card
        w-full
        sm:max-w-lg
        rounded-t-3xl sm:rounded-3xl
        shadow-xl
        relative

        p-6 sm:p-8 lg:p-10

        max-h-[90vh]
        overflow-y-auto
      "
      >

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="
          absolute top-4 right-4 sm:top-6 sm:right-6
          bg-surface-background
          p-2 rounded-full
          text-text-secondary
          hover:bg-surface-border
          transition
        "
        >
          <X size={20} />
        </button>

        {/* ================= EXP SOON ================= */}
        <div className="mb-6">
          <label className="block text-sm text-text-secondary mb-3 font-medium">
            Expired Soon Category
          </label>

          <div className="flex gap-3 flex-wrap">
            {[
              { label: "All", value: "" },
              { label: "H-7 to H-2", value: "H7-H2" },
              { label: "H-1", value: "H1" },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => handleChange("expSoonType", item.value)}
                className={`
                px-4 py-2 rounded-xl border text-sm font-semibold transition
                ${form.expSoonType === item.value
                    ? "bg-brand-first text-white border-brand-first"
                    : "bg-brand-soft text-brand-first border-brand-soft hover:bg-surface-background"
                  }
              `}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleApplyExpSoon}
              className="
              px-6 py-2 rounded-xl
              bg-brand-first text-white font-semibold
              hover:bg-brand-secondary
              transition
            "
            >
              Filter
            </button>
          </div>
        </div>

        {/* TITLE */}
        <h2 className="text-lg sm:text-xl font-semibold text-text-primary mb-6">
          Circular Letter Filter
        </h2>

        {loading ? (
          <p className="text-text-light text-sm text-center">
            Loading filters...
          </p>
        ) : (
          <>
            {/* LETTER TYPE */}
            <div className="mb-5">
              <CustomDropdown
                label="Select Letter Type"
                value={
                  letterTypeList
                    .map((l) => ({ id: l.id, name: l.name }))
                    .find((l) => l.id === Number(form.letter_type_id)) ||
                  { id: "", name: "All Letter" }
                }
                onChange={(val) => handleChange("letter_type_id", val.id)}
                options={[
                  { id: "", name: "All Letter" },
                  ...letterTypeList.map((l) => ({
                    id: l.id,
                    name: l.name,
                  })),
                ]}
              />
            </div>

            {/* AREA */}
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

            {/* CHANNEL */}
            <div className="mb-5">
              <CustomDropdown
                label="Select Channel"
                value={
                  channelList
                    .map((c) => ({ id: c.channel_id, name: c.name }))
                    .find((c) => c.id === Number(form.channel_id)) ||
                  { id: "", name: "All Channel" }
                }
                onChange={(val) => handleChange("channel_id", val.id)}
                options={[
                  { id: "", name: "All Channel" },
                  ...channelList.map((c) => ({
                    id: c.channel_id,
                    name: c.name,
                  })),
                ]}
              />
            </div>

            {/* DATE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
              {/* START DATE */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={form.startDate}
                  onChange={(e) => handleChange("startDate", e.target.value)}
                  className="
        w-full
        p-3
        border border-surface-border
        rounded-2xl
        bg-surface-card
        text-text-primary
        focus:outline-none
        focus:ring-2 focus:ring-brand-primary
        transition
      "
                />
              </div>
              {/* END DATE */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={form.endDate}
                  onChange={(e) => handleChange("endDate", e.target.value)}
                  className="
        w-full
        p-3
        border border-surface-border
        rounded-2xl
        bg-surface-card
        text-text-primary
        focus:outline-none
        focus:ring-2 focus:ring-brand-primary
        transition
      "
                />
              </div>            </div>

            {/* ACTION */}
            <div className="flex flex-col sm:flex-row justify-end gap-3 border-t border-surface-border pt-6">

              <button
                onClick={handleReset}
                className="
                w-full sm:w-auto
                px-6 py-3 rounded-xl
                bg-brand-soft text-brand-first
                font-semibold
                hover:bg-surface-background
                transition
              "
              >
                Reset
              </button>

              <button
                onClick={handleSubmit}
                className="
                w-full sm:w-auto
                px-6 py-3 rounded-xl
                bg-brand-first text-white
                font-semibold
                hover:bg-brand-secondary
                transition
              "
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

export default CircularLetterFilter;
