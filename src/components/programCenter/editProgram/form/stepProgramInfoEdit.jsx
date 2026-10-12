import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApiRequest } from "../../../../services/apiRequest";
import CustomDropdown from "../../../common/customDropdown";
import MultiSelectDropdown from "../../../common/multiSelectDropdown";
import { fetchAllAreas } from "../../../../services/area/area";
import { fetchAllChannels } from "../../../../services/channel/channel";
import { fetchAllProvinces } from "../../../../services/province/province";
import { fetchAllStores } from "../../../../services/store/storeServices";

const StepProgramInfoEdit = ({ data = {}, onNext }) => {
  /* =========================
     FORM STATE (SAMA ADD)
  ========================= */
  const [form, setForm] = useState({
    programType: data.programType || null,
    namaProgram: data.namaProgram || "",
    channel: data.channel || [],
    area: data.area || [],
    province: data.province || [],
    store: data.store || [],
    approvalLine: data.approvalLine || [], // 🔒 readonly
    approval_menu_id: data.approval_menu_id || null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  });

  /* =========================
     MASTER DATA (SAMA ADD)
  ========================= */
  const [programTypes, setProgramTypes] = useState([]);
  const [channels, setChannels] = useState([]);
  const [areas, setAreas] = useState([]);

  const [allProvinces, setAllProvinces] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [allStores, setAllStores] = useState([]);
  const [stores, setStores] = useState([]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  /* =========================
     LOAD MASTER DATA
  ========================= */
  useEffect(() => {
    const loadMasterData = async () => {
      try {
        const [typeRes, channelData, areaData, provinceData, storeData] =
          await Promise.all([
            ApiRequest({
              url: "/types/all",
              method: "GET",
            }),

            fetchAllChannels(),
            fetchAllAreas(),
            fetchAllProvinces(),
            fetchAllStores(),
          ]);

        // PROGRAM TYPE
        if (typeRes?.status === "success") {
          setProgramTypes(
            (typeRes.data || []).map((x) => ({
              id: Number(x.type_id),
              name: x.name,
            })),
          );
        }

        // CHANNEL
        setChannels(channelData || []);

        // AREA
        setAreas(areaData || []);

        // PROVINCE
        setAllProvinces(provinceData || []);
        setProvinces(provinceData || []);

        // STORE
        setAllStores(storeData || []);
        setStores(storeData || []);
      } catch (err) {
        console.error("Load master data error:", err);
      }
    };

    loadMasterData();
  }, []);

  /* =========================
     FILTER PROVINCE BY AREA
  ========================= */
  useEffect(() => {
    if (!allProvinces.length) return;

    if (!form.area.length) {
      setProvinces(allProvinces);
      return;
    }

    const areaIds = form.area.map((a) => Number(a.id));

    const filtered = allProvinces.filter((p) =>
      areaIds.includes(Number(p.area_id)),
    );

    setProvinces(filtered);
  }, [form.area, allProvinces]);

  /* =========================
     FILTER STORE
  ========================= */
  useEffect(() => {
    if (!allStores.length) return;

    if (!form.channel.length && !form.province.length) {
      setStores(allStores);
      return;
    }

    const channelIds = form.channel.map((c) => Number(c.id));
    const provinceIds = form.province.map((p) => Number(p.id));

    const filtered = allStores.filter((s) => {
      const channelMatch =
        !channelIds.length || channelIds.includes(Number(s.channel_id));

      const provinceMatch =
        !provinceIds.length || provinceIds.includes(Number(s.province_id));

      return channelMatch && provinceMatch;
    });

    setStores(filtered);
  }, [form.channel, form.province, allStores]);

  useEffect(() => {
    if (!allProvinces.length) return;

    setForm((prev) => ({
      ...prev,
      province: (prev.province || [])
        .map((selected) => {
          const master = allProvinces.find(
            (p) => Number(p.id) === Number(selected.id),
          );

          return master || selected;
        })
        .filter(Boolean),
    }));
  }, [allProvinces]);

  useEffect(() => {
    if (!allStores.length) return;

    setForm((prev) => ({
      ...prev,
      store: (prev.store || [])
        .map((selected) => {
          const master = allStores.find(
            (s) => Number(s.id) === Number(selected.id),
          );

          return master || selected;
        })
        .filter(Boolean),
    }));
  }, [allStores]);

  /* =========================
     ALL LOGIC (SAMA ADD)
  ========================= */
  const isAll = (values = [], options = []) =>
    values.length === 0 ||
    (options.length > 0 && values.length === options.length);

  const isAllChannel = isAll(form.channel, channels);
  const isAllArea = isAll(form.area, areas);
  const isAllProvince = isAll(form.province, provinces);

  const isAllScope = isAllChannel && isAllArea && isAllProvince;

  /* =========================
     VALIDATION (SAMA ADD)
  ========================= */
  const validateForm = () => {
    const e = {};
    if (!form.programType) e.programType = "Required";
    if (!form.namaProgram.trim()) e.namaProgram = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (form.startDate && form.endDate < form.startDate)
      e.endDate = "End date must be after start date";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextClick = (e) => {
    e?.preventDefault();
    e?.stopPropagation();

    setTouched({
      programType: true,
      namaProgram: true,
      channel: true,
      area: true,
      province: true,
      store: true,
      startDate: true,
      endDate: true,
    });

    const valid = validateForm();

    if (!valid) return;

    onNext(form);
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const markTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const errText = (name) =>
    touched[name] && errors[name] ? (
      <p className="mt-1 text-xs text-status-danger">{errors[name]}</p>
    ) : null;

  /* =========================
     RENDER (LAYOUT = ADD)
  ========================= */
  return (
    <div className="space-y-8">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <CustomDropdown
            label="Program Type"
            value={form.programType}
            onChange={(v) => handleChange("programType", v)}
            onBlur={() => markTouched("programType")}
            options={programTypes}
            placeholder="Select Program Type"
          />
          {errText("programType")}
        </div>

        <div className="flex flex-col">
          <label className="mb-2 font-semibold text-text-secondary">
            Nama Program
          </label>
          <input
            value={form.namaProgram}
            onChange={(e) => handleChange("namaProgram", e.target.value)}
            onBlur={() => markTouched("namaProgram")}
            placeholder="Input Program Name"
            className={`p-4 border rounded-xl bg-surafce-background ${
              errors.namaProgram
                ? "border-status-danger"
                : "border-surface-border"
            }`}
          />
          {errText("namaProgram")}
        </div>
      </div>

      {/* ROW 2 – DISTRIBUTION */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <MultiSelectDropdown
          label="Channel"
          values={form.channel}
          onChange={(v) => handleChange("channel", v)}
          options={channels}
          searchable
          placeholder="Select Channel"
        />

        <MultiSelectDropdown
          label="Area"
          values={form.area}
          onChange={(v) => handleChange("area", v)}
          options={areas}
          searchable
          placeholder="Select Area"
        />

        <MultiSelectDropdown
          label="Province"
          values={form.province}
          onChange={(v) => handleChange("province", v)}
          options={provinces}
          searchable={!isAllArea}
          placeholder={isAllArea ? "All Province" : "Select Province"}
        />

        <MultiSelectDropdown
          label="Store"
          values={isAllScope ? [] : form.store}
          onChange={(v) => handleChange("store", v)}
          options={stores}
          searchable={!isAllScope}
          disabled={isAllScope}
          placeholder={isAllScope ? "All Store" : "Select Store"}
        />
      </div>

      {/* ROW 3 – DATE */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col">
          <label className="font-semibold text-text-light">Start Date</label>
          <DatePicker
            selected={form.startDate}
            onChange={(d) => handleChange("startDate", d)}
            onBlur={() => markTouched("startDate")}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className="w-full p-3 border rounded-xl"
          />
          {errText("startDate")}
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-text-secondary">End Date</label>
          <DatePicker
            selected={form.endDate}
            onChange={(d) => handleChange("endDate", d)}
            onBlur={() => markTouched("endDate")}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className="w-full p-3 border rounded-xl"
          />
          {errText("endDate")}
        </div>
      </div>

      {/* ACTION */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNextClick}
          className="px-8 py-3 font-semibold bg-brand-first text-surface-background rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgramInfoEdit;
