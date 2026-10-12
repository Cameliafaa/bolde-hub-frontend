import React, { useState, useEffect } from "react";
import CustomDropdown from "../../../common/customDropdown";
import { ApiRequest } from "../../../../services/apiRequest";
import { fetchAllStores } from "../../../../services/store/storeServices";

const StepRequestInfo = ({ data = {}, onNext }) => {
  const [form, setForm] = useState({
    title: data.title || "",
    tag: data.tag || null,
    submission_type: data.submission_type || null,
    area: data.area || null,
    province: data.province || null,
    channel: data.channel || null,
    store: data.store || null,
    asm_id: data.asm_id || null,
    asm_name: data.asm_name || "",
  });

  const [errors, setErrors] = useState({});

  const [areas, setAreas] = useState([]);
  const [channels, setChannels] = useState([]);
  const [tags, setTags] = useState([]);

  const [allProvinces, setAllProvinces] = useState([]);
  const [provinces, setProvinces] = useState([]);

  const [allStores, setAllStores] = useState([]);
  const [stores, setStores] = useState([]);
  const [storeLoading, setStoreLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [profile, a, p, c, t] = await Promise.all([
          ApiRequest({ url: "/profile/me", method: "GET" }),
          ApiRequest({ url: "/areas/all", method: "GET" }),
          ApiRequest({ url: "/provinces?page=1&limit=200", method: "GET" }),
          ApiRequest({ url: "/channels/all", method: "GET" }),
          ApiRequest({ url: "/tags?page=1&limit=100", method: "GET" }),
        ]);

        const stores = await fetchAllStores();

        setForm((prev) => ({
          ...prev,
          asm_id: prev.asm_id || profile?.data?.user_id || null,
          asm_name: prev.asm_name || profile?.data?.full_name || "",
        }));

        setAreas(
          (a.data || []).map((x) => ({
            id: Number(x.area_id),
            name: x.name,
          })),
        );

        setChannels(
          (c.data || []).map((x) => ({
            id: Number(x.channel_id),
            name: x.name,
          })),
        );

        const provinceMapped = (p.data || []).map((x) => ({
          id: Number(x.province_id),
          name: x.name,
          area_id: Number(x.area_id),
        }));

        setAllProvinces(provinceMapped);
        setProvinces(provinceMapped);

        setAllStores(stores || []);
        setStores(stores || []);

        setTags(
          (t.data || []).map((x) => ({
            id: Number(x.tag_id),
            name: x.name,
          })),
        );
      } catch (err) {
        console.error("Failed load master data:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!form.area) {
      setProvinces(allProvinces);
      return;
    }

    const areaId = Number(form.area.id);
    const filtered = allProvinces.filter((p) => p.area_id === areaId);

    setProvinces(filtered);

    setForm((prev) => ({
      ...prev,
      province: filtered.some((p) => p.id === prev.province?.id)
        ? prev.province
        : null,
      store: null,
    }));
  }, [form.area, allProvinces]);

  useEffect(() => {
    if (!allStores.length) return;

    setStoreLoading(true);

    const provinceId = form.province?.id ? Number(form.province.id) : null;
    const channelId = form.channel?.id ? Number(form.channel.id) : null;

    const filtered = allStores.filter((s) => {
      const provinceMatch = !provinceId || s.province_id === provinceId;
      const channelMatch = !channelId || s.channel_id === channelId;
      return provinceMatch && channelMatch;
    });

    setStores(filtered);

    setForm((prev) => ({
      ...prev,
      store: filtered.some((s) => s.id === prev.store?.id) ? prev.store : null,
    }));

    setStoreLoading(false);
  }, [form.province, form.channel, allStores]);

  const requiredLabel = (label) => (
    <span>
      {label} <span className="text-red-500">*</span>
    </span>
  );

  const clearError = (name) => {
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  const handleChange = (name, value) => {
    clearError(name);

    if (!value) {
      setForm((prev) => ({ ...prev, [name]: null }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      [name]: {
        id: value.id,
        name: value.name,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!form.title.trim()) {
      newErrors.title = "Title Project wajib diisi.";
    }

    if (!form.tag) {
      newErrors.tag = "Tag wajib dipilih.";
    }

    if (!form.submission_type) {
      newErrors.submission_type = "Submission Type wajib dipilih.";
    }

    if (!form.area) {
      newErrors.area = "Area wajib dipilih.";
    }

    if (!form.province) {
      newErrors.province = "Province wajib dipilih.";
    }

    if (!form.channel) {
      newErrors.channel = "Channel wajib dipilih.";
    }

    if (!form.store) {
      newErrors.store = "Store wajib dipilih.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (!validate()) return;
    onNext(form);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-10">
        {/* TITLE */}
        <div>
          <label className="font-semibold text-text-secondary">
            {requiredLabel("Title Project")}
          </label>

          <input
            value={form.title}
            onChange={(e) => {
              clearError("title");
              setForm((prev) => ({ ...prev, title: e.target.value }));
            }}
            placeholder="Input Title"
            className={`w-full p-4 border rounded-xl outline-none focus:ring-2 focus:ring-brand-first ${
              errors.title ? "border-red-400" : "border-text-light"
            }`}
          />

          {errors.title && (
            <p className="mt-1 text-xs text-red-500">{errors.title}</p>
          )}
        </div>

        {/* TAG */}
        <div>
          <CustomDropdown
            label={requiredLabel("Tag")}
            value={form.tag}
            onChange={(v) => handleChange("tag", v)}
            options={tags}
            placeholder="Select Tag"
          />
          {errors.tag && (
            <p className="mt-1 text-xs text-red-500">{errors.tag}</p>
          )}
        </div>

        {/* SUBMISSION TYPE */}
        <div>
          <CustomDropdown
            label={requiredLabel("Submission Type")}
            value={form.submission_type}
            onChange={(v) => handleChange("submission_type", v)}
            options={[
              { id: "New", name: "New" },
              { id: "Revision", name: "Revision" },
            ]}
            placeholder="Select Submission"
          />
          {errors.submission_type && (
            <p className="mt-1 text-xs text-red-500">
              {errors.submission_type}
            </p>
          )}
        </div>

        {/* AREA */}
        <div>
          <CustomDropdown
            label={requiredLabel("Area")}
            value={form.area}
            onChange={(v) => handleChange("area", v)}
            options={areas}
            placeholder="Select Area"
          />
          {errors.area && (
            <p className="mt-1 text-xs text-red-500">{errors.area}</p>
          )}
        </div>

        {/* PROVINCE */}
        <div>
          <CustomDropdown
            label={requiredLabel("Province")}
            value={form.province}
            onChange={(v) => handleChange("province", v)}
            options={provinces}
            placeholder={form.area ? "Select Province" : "All Province"}
          />
          {errors.province && (
            <p className="mt-1 text-xs text-red-500">{errors.province}</p>
          )}
        </div>

        {/* ASM NAME */}
        <div>
          <label className="font-semibold text-text-secondary">ASM Name</label>
          <input
            value={form.asm_name}
            disabled
            className="w-full p-4 border rounded-xl bg-surface-border"
          />
        </div>

        {/* CHANNEL */}
        <div>
          <CustomDropdown
            label={requiredLabel("Channel")}
            value={form.channel}
            onChange={(v) => handleChange("channel", v)}
            options={channels}
            placeholder="Select Channel"
          />
          {errors.channel && (
            <p className="mt-1 text-xs text-red-500">{errors.channel}</p>
          )}
        </div>

        {/* STORE */}
        <div>
          <CustomDropdown
            label={requiredLabel("Store")}
            value={form.store}
            onChange={(v) => handleChange("store", v)}
            options={stores}
            disabled={storeLoading}
            placeholder={
              storeLoading
                ? "Loading store..."
                : !form.province && !form.channel
                  ? "Select Province or Channel first"
                  : stores.length
                    ? "Select Store"
                    : "No Store Found"
            }
          />
          {errors.store && (
            <p className="mt-1 text-xs text-red-500">{errors.store}</p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleNext}
          className="px-8 py-3 bg-brand-first text-surface-background rounded-xl"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default StepRequestInfo;
