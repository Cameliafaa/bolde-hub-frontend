import React, { useEffect, useMemo, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CustomDropdown from "../../../../common/customDropdown";
import MultiSelectDropdown from "../../../../common/multiSelectDropdown";
import { ApiRequest } from "../../../../../services/apiRequest";
import { fetchAllStores } from "../../../../../services/store/storeServices";

const StepSpecialProgramInfo = ({ data = {}, onNext, onCategoryChange }) => {
  const currentUrl = "/program-center";

  const [form, setForm] = useState({
    programCategory: data.programCategory || null,
    programType: data.programType || null,
    namaProgram: data.namaProgram || "",
    channel: data.channel || [],
    province: data.province || [],
    area: data.area || [],
    store: data.store || [],
    store_targets: data.store_targets || [], // 🔥 special
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  const paginatedTargets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return (form.store_targets || []).slice(start, end);
  }, [form.store_targets, currentPage]);

  const formatIDR = (val) => `Rp ${Number(val || 0).toLocaleString("id-ID")}`;
  const parseToNumber = (raw) => {
    const digits = String(raw).replace(/[^\d]/g, "");
    return digits ? Number(digits) : 0;
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const markTouched = (name) =>
    setTouched((prev) => ({ ...prev, [name]: true }));

  const errText = (name) =>
    touched[name] && errors[name] ? (
      <p className="text-xs text-red-500 mt-1">{errors[name]}</p>
    ) : null;

  // 1) approval_menu_id
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
          approval_menu_id: found.approval_menu_id,
        }));
      }
      return found ? found.approval_menu_id : null;
    } catch {
      return null;
    }
  };

  // 2) approval flow
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
      setForm((prev) => ({ ...prev, approvalLine: approvers }));
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

  // master data
  useEffect(() => {
    (async () => {
      try {
        const [t, c, a, p, cat] = await Promise.all([
          ApiRequest({ url: "/types/all", method: "GET" }),
          ApiRequest({ url: "/channels/all?page=1&limit=100", method: "GET" }),
          ApiRequest({ url: "/areas/all?page=1&limit=100", method: "GET" }),
          ApiRequest({ url: "/provinces?page=1&limit=100", method: "GET" }),
          ApiRequest({ url: "/program-categories/all", method: "GET" }),
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
          setProvinces(mapped);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    const loadStores = async () => {
      try {
        const all = await fetchAllStores();
        setAllStores(all);
        setStores(all);
      } catch (err) {
        console.error("Failed load stores", err);
      }
    };

    loadStores();
  }, []);

  // filtering province by area
  useEffect(() => {
    if (!form.area.length) {
      setProvinces(allProvinces);
      return;
    }
    const areaIds = form.area.map((a) => a.id);
    const filtered = allProvinces.filter((p) => areaIds.includes(p.area_id));
    setProvinces(filtered);

    setForm((prev) => ({
      ...prev,
      province: prev.province.filter((p) =>
        filtered.some((fp) => fp.id === p.id),
      ),
    }));
  }, [form.area, allProvinces]);

  // filtering store by channel/province (tetap sama)
  useEffect(() => {
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

    // reset selected store yang tidak valid + sync table targets
    setForm((prev) => {
      const validSelected = prev.store.filter((st) =>
        filtered.some((fs) => fs.id === st.id),
      );
      const validTargets = (prev.store_targets || []).filter((t) =>
        validSelected.some((st) => st.id === t.store_id),
      );
      return { ...prev, store: validSelected, store_targets: validTargets };
    });
  }, [form.channel, form.province, allStores]);

  // 🔥 Sync store_targets ketika store berubah
  useEffect(() => {
    setCurrentPage(1);

    setForm((prev) => {
      const currentTargets = prev.store_targets || [];

      const nextTargets = prev.store.map((st) => {
        const found = currentTargets.find((t) => t.store_id === st.id);
        return found
          ? found
          : {
              store_id: st.id,
              store_name: st.name,
              target_selling_num: 0,
            };
      });

      // ⛔️ jangan update kalau sama (hindari re-render loop)
      if (JSON.stringify(nextTargets) === JSON.stringify(currentTargets)) {
        return prev;
      }

      return { ...prev, store_targets: nextTargets };
    });
  }, [form.store]);

  const updateTarget = (store_id, raw) => {
    const num = parseToNumber(raw);
    setForm((prev) => ({
      ...prev,
      store_targets: (prev.store_targets || []).map((t) =>
        t.store_id === store_id ? { ...t, target_selling_num: num } : t,
      ),
    }));
  };

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

    // 🔥 special: store wajib dipilih + target wajib > 0
    if (!form.store.length) e.store = "Store is required";
    const hasZeroTarget = (form.store_targets || []).some(
      (t) => !Number(t.target_selling_num || 0),
    );
    if (form.store.length && hasZeroTarget)
      e.store_targets = "Target selling per store is required";

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleNextClick = () => {
    setTouched({
      programCategory: true,
      programType: true,
      namaProgram: true,
      startDate: true,
      endDate: true,
      approvalLine: true,
      store: true,
      store_targets: true,
    });

    if (!validateForm()) return;
    onNext(form);
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div>
          <CustomDropdown
            label="Program Category"
            value={form.programCategory}
            onChange={(v) => {
              handleChange("programCategory", v);
              if (onCategoryChange) onCategoryChange(v); // 🔥 sama seperti regular
            }}
            onBlur={() => markTouched("programCategory")}
            options={programCategories}
            placeholder="Select Program Category"
          />{" "}
          {errText("programCategory")}
        </div>

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
          <label className="text-gray-500 font-semibold mb-2">
            Nama Program
          </label>
          <input
            value={form.namaProgram}
            onChange={(e) => handleChange("namaProgram", e.target.value)}
            onBlur={() => markTouched("namaProgram")}
            placeholder="Input Program Name"
            className={`p-4 border rounded-xl ${
              touched.namaProgram && errors.namaProgram
                ? "border-red-500"
                : "border-gray-200"
            }`}
          />
          {errText("namaProgram")}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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
        </div>

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
        </div>

        <div>
          <MultiSelectDropdown
            label="Province"
            values={form.province}
            onChange={(v) => handleChange("province", v)}
            options={provinces}
            searchable
            placeholder="Select Province"
          />
        </div>

        {/* 🔥 SPECIAL: Store tetap dropdown, tapi nanti isi target via table */}
        <div>
          <MultiSelectDropdown
            label="Store"
            values={form.store}
            onChange={(v) => handleChange("store", v)}
            onBlur={() => markTouched("store")}
            options={stores}
            searchable
            placeholder="Select Store"
          />
          {errText("store")}
        </div>
      </div>

      {/* Date Picker */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="text-gray-500 font-semibold">Start Date</label>
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
          <label className="text-gray-500 font-semibold">End Date</label>
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

      {/* 🔥 TABLE TARGET PER STORE */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-[#002D62]">
            Target Selling per Store
          </h3>
          <div className="text-sm text-gray-500">
            Total Store: {form.store_targets?.length || 0}
          </div>
        </div>

        {touched.store_targets && errors.store_targets && (
          <p className="text-xs text-red-500 mb-3">{errors.store_targets}</p>
        )}

        <div className="w-full overflow-x-auto">
          <table className="min-w-[900px] w-full text-sm">
            <thead className="bg-gray-50 text-[#002D62]">
              <tr className="border-t">
                <th className="px-4 py-3 text-left font-semibold">Store</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Target Selling Num
                </th>
              </tr>
            </thead>

            <tbody>
              {(form.store_targets || []).length === 0 ? (
                <tr>
                  <td colSpan={2} className="text-center py-6 text-gray-400">
                    Select store first
                  </td>
                </tr>
              ) : (
                paginatedTargets.map((t) => (
                  <tr key={t.store_id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">
                      {t.store_name}
                    </td>
                    <td className="px-4 py-3">
                      <input
                        value={formatIDR(t.target_selling_num)}
                        onChange={(e) =>
                          updateTarget(t.store_id, e.target.value)
                        }
                        className="w-full p-3 border rounded-xl border-gray-300"
                        placeholder="Rp 0"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {form.store_targets?.length > pageSize && (
            <div className="flex justify-end items-center gap-4 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Prev
              </button>

              <span className="text-sm text-gray-600">
                Page {currentPage} of{" "}
                {Math.ceil(form.store_targets.length / pageSize)}
              </span>

              <button
                disabled={
                  currentPage >= Math.ceil(form.store_targets.length / pageSize)
                }
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1 border rounded disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNextClick}
          className="bg-[#002D62] text-white px-8 py-3 rounded-xl font-semibold"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepSpecialProgramInfo;
