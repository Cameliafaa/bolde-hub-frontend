import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ApiRequest } from "../../../../services/apiRequest";
import CustomDropdown from "../../../common/customDropdown";

const EditProvince = ({ open, onClose, onSuccess, data }) => {
  const [form, setForm] = useState({
    province_code: "",
    name: "",
    area: null,
    allocation_percent: "",
  });

  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  /* =========================
     FETCH AREA
  ========================= */
  useEffect(() => {
    if (!open) return;

    const fetchAreas = async () => {
      try {
        const res = await ApiRequest({
          url: "/areas/all",
          method: "GET",
        });

        const formatted = (res?.data || []).map((a) => ({
          id: a.area_id,
          name: a.name,
        }));

        setAreas(formatted);

        // set default area dari data lama
        if (data?.area_id) {
          const found = formatted.find(
            (a) => a.id === data.area_id
          );
          setForm((p) => ({ ...p, area: found || null }));
        }
      } catch (err) {
        console.error("FETCH AREA ERROR:", err);
      }
    };

    fetchAreas();
  }, [open, data]);

  /* =========================
     SET DATA LAMA
  ========================= */
  useEffect(() => {
    if (!data) return;

    setForm((p) => ({
      ...p,
      province_code: data.province_code || "",
      name: data.name || "",
      allocation_percent: data.allocation_percent || "",
    }));
  }, [data]);

  if (!open || !data) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const handleSubmit = async () => {
    if (!form.province_code || !form.name) {
      setError("Province Code dan Name wajib diisi");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await ApiRequest({
        url: `/provinces/${data.province_id}`,
        method: "PUT",
        data: {
          province_code: form.province_code,
          name: form.name,
          area_id: form.area?.id || null,
          allocation_percent: Number(form.allocation_percent) || 0,
        },
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      console.error("EDIT PROVINCE ERROR:", err);
      setError("Gagal memperbarui Province");
    } finally {
      setLoading(false);
    }
  };

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
        {/* CLOSE */}
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
            Edit Province
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-sm font-medium mb-4">
            {error}
          </p>
        )}

        <div className="space-y-5 flex-1 overflow-y-auto">
          {/* AREA */}
          <CustomDropdown
            label="Area"
            placeholder="Select Area"
            options={areas}
            searchable
            value={form.area}
            onChange={(opt) =>
              setForm((f) => ({ ...f, area: opt }))
            }
          />

          {/* PROVINCE CODE */}
          <div>
            <label className="text-[#6B7280] font-semibold">
              Province Code
            </label>
            <input
              name="province_code"
              value={form.province_code}
              onChange={handleChange}
              className="w-full p-4 border rounded-2xl mt-1"
            />
          </div>

          {/* NAME */}
          <div>
            <label className="text-[#6B7280] font-semibold">
              Province Name
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full p-4 border rounded-2xl mt-1"
            />
          </div>

          <div>
            <label className="text-[#6B7280] font-semibold">
              Allocation Percent
            </label>
            <input
              type="number"
              name="allocation_percent"
              value={form.allocation_percent}
              onChange={handleChange}
              className="w-full p-4 border rounded-2xl mt-1"
            />
          </div>
        </div>

        {/* ACTION */}
        <div className="flex justify-end mt-6 gap-3 pt-4 border-t">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-[#002D62] text-white px-6 py-2 rounded-lg hover:opacity-90"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProvince;
