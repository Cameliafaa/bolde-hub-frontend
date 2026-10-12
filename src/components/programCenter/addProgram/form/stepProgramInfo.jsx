import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApiRequest } from "../../../../services/apiRequest";
import CustomDropdown from "../../../common/customDropdown";
import MultiSelectDropdown from "../../../common/multiSelectDropdown";

const StepProgramInfo = ({ data = {}, onNext, onCategoryChange }) => {
  const currentUrl = "/program-center";

  const [form, setForm] = useState({
    programCategory: data.programCategory || null,
    programType: data.programType || null,
    namaProgram: data.namaProgram || "",
    channel: data.channel || [],
    province: data.province || [],
    area: data.area || [],
    store: data.store || [],
    approvalLine: data.approvalLine || [],
    approval_menu_id: data.approval_menu_id || null,
    startDate: data.startDate ? new Date(data.startDate) : null,
    endDate: data.endDate ? new Date(data.endDate) : null,
  });

  const [programTypes, setProgramTypes] = useState([]);
  const [channels, setChannels] = useState([]);
  const [areas, setAreas] = useState([]);
  const [approvalOptions, setApprovalOptions] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [stores, setStores] = useState([]);

  const [allProvinces, setAllProvinces] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [programCategories, setProgramCategories] = useState([]);

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // 1. Ambil approval_menu_id berdasarkan url_path
  const fetchApprovalMenuID = async () => {
    try {
      const res = await ApiRequest({
        url: "/approval/menu/all",
        method: "GET",
      });
      const found = (res.data || []).find((m) => m.url_path === currentUrl);

      if (found) {
        setForm((prev) => ({
          ...prev,
          approval_menu_id: found.approval_menu_id, // 🔥 SIMPAN
        }));
      }

      return found ? found.approval_menu_id : null;
    } catch {
      return null;
    }
  };

  // 2. Ambil approval flow berdasarkan menu_id
  const fetchApprovalLine = async (menuId) => {
    try {
      const res = await ApiRequest({
        url: `/approval/menu/detail/${menuId}`,
        method: "GET",
      });

      const flows = res?.data?.flows || [];
      const approvers = flows
        .sort((a, b) => a.step_order - b.step_order)
        .map((f) => ({
          id: f.user_id,
          name: f.user_name,
          order: f.step_order,
        }));

      setApprovalOptions(approvers);

      setForm((prev) => ({
        ...prev,
        approvalLine: approvers, // Auto isi
      }));
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    (async () => {
      const menuId = await fetchApprovalMenuID();
      if (menuId) fetchApprovalLine(menuId);
    })();
  }, []);

  // fetch master data
  useEffect(() => {
    (async () => {
      try {
        const [t, c, a, p, s, cat] = await Promise.all([
          ApiRequest({ url: "/types/all", method: "GET" }),
          ApiRequest({
            url: "/channels/all?page=1&limit=100",
            method: "GET",
          }),
          ApiRequest({
            url: "/areas/all?page=1&limit=100",
            method: "GET",
          }),
          ApiRequest({
            url: "/provinces?page=1&limit=100",
            method: "GET",
          }),
          ApiRequest({
            url: "/stores?page=1&limit=100",
            method: "GET",
          }),
          ApiRequest({
            url: "/program-categories/all",
            method: "GET",
          }),
        ]);

        if (cat.status === "success")
          setProgramCategories(
            cat.data.map((x) => ({ id: x.program_category_id, name: x.name })),
          );

        if (t.status === "success")
          setProgramTypes(t.data.map((x) => ({ id: x.type_id, name: x.name })));

        if (c.status === "success")
          setChannels(c.data.map((x) => ({ id: x.channel_id, name: x.name })));

        if (a.status === "success")
          setAreas(a.data.map((x) => ({ id: x.area_id, name: x.name })));

        if (p.status === "success") {
          const mapped = p.data.map((x) => ({
            id: x.province_id,
            name: x.name,
            area_id: x.area_id,
          }));

          setAllProvinces(mapped);
          setProvinces(mapped); // default awal
        }

        if (s.status === "success") {
          const mapped = s.data.map((x) => ({
            id: x.store_id,
            name: x.store_name,
            province_id: x.province_id,
            channel_id: x.channel_id,
          }));
          setAllStores(mapped);
          setStores(mapped); // default awal
        }
      } catch {}
    })();
  }, []);

  // filtering province
  useEffect(() => {
    if (!form.area.length) {
      setProvinces(allProvinces);
      return;
    }

    const areaIds = form.area.map((a) => a.id);

    const filtered = allProvinces.filter((p) => areaIds.includes(p.area_id));

    setProvinces(filtered);

    // optional: reset province kalau sudah tidak valid
    setForm((prev) => ({
      ...prev,
      province: prev.province.filter((p) =>
        filtered.some((fp) => fp.id === p.id),
      ),
    }));
  }, [form.area, allProvinces]);

  // filtering store
  useEffect(() => {
    if (!form.channel.length && !form.province.length) {
      setStores(allStores);
      return;
    }

    const channelIds = form.channel.map((c) => c.id);
    const provinceIds = form.province.map((p) => p.id);

    const filtered = allStores.filter((s) => {
      const channelMatch =
        !channelIds.length || channelIds.includes(s.channel_id);

      const provinceMatch =
        !provinceIds.length || provinceIds.includes(s.province_id);

      return channelMatch && provinceMatch;
    });

    setStores(filtered);

    // optional: reset store kalau tidak valid
    setForm((prev) => ({
      ...prev,
      store: prev.store.filter((s) => filtered.some((fs) => fs.id === s.id)),
    }));
  }, [form.channel, form.province, allStores]);

  const isAll = (values = [], options = []) => {
    // ALL jika:
    // 1. kosong (default ALL)
    // 2. Select All (jumlah sama dengan options)
    return (
      values.length === 0 ||
      (options.length > 0 && values.length === options.length)
    );
  };

  const isAllChannel = isAll(form.channel, channels);
  const isAllArea = isAll(form.area, areas);
  const isAllProvince = isAll(form.province, provinces);

  const isAllScope = isAllChannel && isAllArea && isAllProvince;

  useEffect(() => {
    const isAllChannel = form.channel.length === 0;
    const isAllProvince = form.province.length === 0;

    const channelIds = form.channel.map((c) => c.id);
    const provinceIds = form.province.map((p) => p.id);

    const filtered = allStores.filter((s) => {
      const channelMatch = isAllChannel || channelIds.includes(s.channel_id);

      const provinceMatch =
        isAllProvince || provinceIds.includes(s.province_id);

      return channelMatch && provinceMatch;
    });

    setStores(filtered);
  }, [form.channel, form.province, allStores]);

  const validateForm = () => {
    const e = {};
    if (!form.programCategory) e.programCategory = "Required";
    if (!form.programType) e.programType = "Required";
    if (!form.namaProgram.trim()) e.namaProgram = "Required";
    if (!form.startDate) e.startDate = "Required";
    if (!form.endDate) e.endDate = "Required";
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = "End date must be after start date";

    if (!form.approvalLine.length)
      e.approvalLine = "Approval flow not found for this menu";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextClick = () => {
    setTouched({
      programCategory: true,
      programType: true,
      namaProgram: true,
      channel: true,
      area: true,
      startDate: true,
      endDate: true,
      approvalLine: true,
    });

    if (!validateForm()) return;

    onNext(form);
  };

  // harusnya onNext(form), diatas untuk sementara

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const markTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const errText = (name) =>
    touched[name] && errors[name] ? (
      <p className="mt-1 text-xs text-red-500">{errors[name]}</p>
    ) : null;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
        {/* Program Type */}
        <div>
          <CustomDropdown
            label="Program Category"
            value={form.programCategory}
            onChange={(v) => {
              handleChange("programCategory", v);
              if (onCategoryChange) onCategoryChange(v); // 🔥 INI KUNCI
            }}
            onBlur={() => markTouched("programCategory")}
            options={programCategories}
            placeholder="Select Program Category"
          />{" "}
          {errText("programCategory")}
        </div>

        {/* Program Type */}
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

        {/* Nama Program */}
        <div className="flex flex-col">
          {/* <label className="mb-2 font-semibold text-gray-500">
            Nama Program
          </label> */}
          <div>
            <label className="mb-2 font-semibold text-gray-500">
              Nama Program
            </label>
            <input
              value={form.namaProgram}
              onChange={(e) => handleChange("namaProgram", e.target.value)}
              onBlur={() => markTouched("namaProgram")}
              placeholder="Input Program Name"
              className={`w-full p-4 rounded-xl border ${
                touched.namaProgram && errors.namaProgram
                  ? "border-red-500"
                  : "border-gray-200"
              }`}
            />
            {errText("namaProgram")}
          </div>{" "}
          {errText("namaProgram")}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Channel */}
        <div>
          <MultiSelectDropdown
            label="Channel"
            values={form.channel}
            onChange={(v) => handleChange("channel", v)}
            onBlur={() => markTouched("channel")}
            options={channels}
            searchable
            placeholder="Select Channel"
          />
          {errText("channel")}
        </div>

        {/* Area */}
        <div>
          <MultiSelectDropdown
            label="Area"
            values={form.area}
            onChange={(v) => handleChange("area", v)}
            onBlur={() => markTouched("area")}
            options={areas}
            searchable
            placeholder="Select Area"
          />
          {errText("area")}
        </div>

        {/* Province */}
        <div>
          <MultiSelectDropdown
            label="Province"
            values={form.province}
            onChange={(v) => handleChange("province", v)}
            options={provinces}
            searchable={!isAllArea}
            placeholder={isAllArea ? "All Province" : "Select Province"}
            disabled={false}
          />
        </div>

        {/* Store */}
        <div>
          <MultiSelectDropdown
            label="Store"
            values={isAllScope ? [] : form.store}
            onChange={(v) => handleChange("store", v)}
            options={stores}
            searchable={!isAllScope}
            placeholder={isAllScope ? "All Store" : "Select Store"}
            disabled={isAllScope}
          />
        </div>
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="flex flex-col">
          <label className="font-semibold text-gray-500">Start Date</label>
          <DatePicker
            selected={form.startDate}
            onChange={(d) => handleChange("startDate", d)}
            onBlur={() => markTouched("startDate")}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className={`w-full p-3 border rounded-xl ${
              touched.startDate && errors.startDate
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errText("startDate")}
        </div>

        <div className="flex flex-col">
          <label className="font-semibold text-gray-500">End Date</label>
          <DatePicker
            selected={form.endDate}
            onChange={(d) => handleChange("endDate", d)}
            onBlur={() => markTouched("endDate")}
            dateFormat="dd/MM/yyyy"
            placeholderText="dd/mm/yyyy"
            className={`w-full p-3 border rounded-xl ${
              touched.endDate && errors.endDate
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />
          {errText("endDate")}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNextClick}
          className="px-8 py-3 font-semibold text-white bg-[#002D62] rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepProgramInfo;
