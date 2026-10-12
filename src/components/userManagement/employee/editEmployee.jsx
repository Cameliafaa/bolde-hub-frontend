import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";

import { fetchAllStores } from "../../../services/store/storeServices";
import { fetchAllUsers } from "../../../services/users/userService";
import { fetchAllPositions } from "../../../services/position/positionServices";

const EditEmployeeModal = ({ open, onClose, data, onSuccess }) => {
  const [form, setForm] = useState({});

  const [roles, setRoles] = useState([]);

  // POSITION
  const [positions, setPositions] = useState([]);
  const [allPositions, setAllPositions] = useState([]);
  const [positionSearch, setPositionSearch] = useState("");

  const [approvalLines, setApprovalLines] = useState([]);

  const [areas, setAreas] = useState([]);

  const [provinces, setProvinces] = useState([]);
  const [allProvinces, setAllProvinces] = useState([]);

  const [channels, setChannels] = useState([]);

  // STORE
  const [stores, setStores] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ============================
  // PREFILL DATA
  // ============================
  useEffect(() => {
    if (!data) return;

    const details = data.user_details || {};

    setForm({
      full_name: data.full_name || "",
      username: data.username || "",
      email: data.email || "",
      phone: data.phone || "",
      password: "",

      user_role_id: data.user_role_id || "",
      position_id: data.position_id || "",
      approval_line_id: data.approval_line_id || "",

      area_id: data.area_id ?? null,
      province_id: data.province_id ?? null,
      channel_id: data.channel_id ?? null,
      store_id: data.store_id ?? null,

      birth_date: details.birth_date ? new Date(details.birth_date) : null,

      gender: details.gender || "Male",

      address: details.address || "",
      city: details.city || "",
      province: details.province || "",
      country: details.country || "",
      postal_code: details.postal_code || "",
    });
  }, [data]);

  // ============================
  // LOAD DROPDOWN UTAMA
  // ============================
  const loadDropdowns = async () => {
    // =================================
    // BASIC DROPDOWNS
    // =================================
    try {
      const [allUsers, roleRes, areaRes, provinceRes, channelRes] =
        await Promise.all([
          fetchAllUsers(),

          ApiRequest({
            url: "/roles/all",
            method: "GET",
          }),

          ApiRequest({
            url: "/areas/all",
            method: "GET",
          }),

          ApiRequest({
            url: "/provinces?limit=100",
            method: "GET",
          }),

          ApiRequest({
            url: "/channels/all",
            method: "GET",
          }),
        ]);

      // ROLE
      setRoles(roleRes?.data || []);

      // APPROVAL LINE
      setApprovalLines(
        (allUsers || []).map((u) => ({
          id: Number(u.user_id),
          name: `${u.full_name} - ${u.role_name || u.role?.name || "No Role"}`,
        })),
      );

      // AREA
      setAreas(areaRes?.data || []);

      // PROVINCE
      const provinceMapped = (provinceRes?.data || []).map((p) => ({
        id: Number(p.province_id),
        name: p.name,
        area_id: Number(p.area_id),
      }));

      setAllProvinces(provinceMapped);
      setProvinces(provinceMapped);

      // CHANNEL
      setChannels(
        (channelRes?.data || []).map((c) => ({
          id: Number(c.channel_id),
          name: c.name,
        })),
      );
    } catch (err) {
      console.error("Main dropdown load failed:", err);
    }

    // =================================
    // POSITION - FETCH ALL PAGE
    // =================================
    try {
      const positionRes = await fetchAllPositions();

      const positionData = Array.isArray(positionRes)
        ? positionRes
        : Array.isArray(positionRes?.data)
          ? positionRes.data
          : [];

      const positionMapped = positionData.map((p) => ({
        id: Number(p.position_id ?? p.id),
        name: p.name,
      }));

      setAllPositions(positionMapped);
      setPositions(positionMapped);
    } catch (err) {
      console.error("Position load failed:", err);

      setAllPositions([]);
      setPositions([]);
    }

    // =================================
    // STORE - FETCH ALL PAGE
    // =================================
    try {
      const storeRes = await fetchAllStores();

      const storeData = Array.isArray(storeRes) ? storeRes : [];

      setAllStores(storeData);
      setStores(storeData.slice(0, 50));
    } catch (err) {
      console.error("Store load failed:", err);

      setAllStores([]);
      setStores([]);
    }
  };

  useEffect(() => {
    loadDropdowns();
  }, []);

  // ============================
  // SEARCH POSITION
  // ============================
  useEffect(() => {
    if (!positionSearch.trim()) {
      setPositions(allPositions);
      return;
    }

    const keyword = positionSearch.trim().toLowerCase();

    const filtered = allPositions.filter((p) =>
      String(p.name || "")
        .toLowerCase()
        .includes(keyword),
    );

    setPositions(filtered);
  }, [positionSearch, allPositions]);

  // ============================
  // AREA → PROVINCE
  // ============================
  useEffect(() => {
    if (!form.area_id) {
      setProvinces(allProvinces);

      return;
    }

    const filtered = allProvinces.filter(
      (p) => Number(p.area_id) === Number(form.area_id),
    );

    setProvinces(filtered);
  }, [form.area_id, allProvinces]);

  // ============================
  // STORE FILTER
  // CHANNEL + PROVINCE + SEARCH
  // ============================
  useEffect(() => {
    let filtered = [...allStores];

    if (form.province_id) {
      filtered = filtered.filter(
        (s) => Number(s.province_id) === Number(form.province_id),
      );
    }

    if (form.channel_id) {
      filtered = filtered.filter(
        (s) => Number(s.channel_id) === Number(form.channel_id),
      );
    }

    if (storeSearch.trim()) {
      const keyword = storeSearch.trim().toLowerCase();

      filtered = filtered.filter((s) =>
        String(s.name || "")
          .toLowerCase()
          .includes(keyword),
      );
    }

    setStores(filtered.slice(0, 50));
  }, [form.channel_id, form.province_id, storeSearch, allStores]);

  // ============================
  // HANDLERS
  // ============================
  const handleInput = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleDateChange = (date) => {
    setForm((prev) => ({
      ...prev,
      birth_date: date,
    }));
  };

  // ============================
  // SUBMIT UPDATE
  // ============================
  const handleSubmit = async () => {
    if (!form.full_name || !form.username || !form.user_role_id) {
      setError("Full Name, Username, and Role are required!");
      return;
    }

    const toNumberOrZero = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);

    const payload = {
      full_name: form.full_name,
      username: form.username,
      email: form.email,
      phone: form.phone,

      password: form.password || undefined,

      user_role_id: form.user_role_id,

      position_id: toNumberOrZero(form.position_id),

      approval_line_id: toNumberOrZero(form.approval_line_id),

      birth_date: form.birth_date
        ? form.birth_date.toISOString().split("T")[0]
        : "",

      gender: form.gender === 2 ? "Female" : "Male",

      address: form.address || "",

      city: form.city || "",

      province: form.province || "",

      country: form.country || "",

      postal_code: form.postal_code || "",

      area_id: toNumberOrZero(form.area_id),

      province_id: toNumberOrZero(form.province_id),

      channel_id: toNumberOrZero(form.channel_id),

      store_id: toNumberOrZero(form.store_id),
    };

    if (Number(form.area_id) > 0) {
      payload.area_id = Number(form.area_id);
    }

    if (Number(form.position_id) > 0) {
      payload.position_id = Number(form.position_id);
    }

    if (Number(form.approval_line_id) > 0) {
      payload.approval_line_id = Number(form.approval_line_id);
    }

    if (Number(form.province_id) > 0) {
      payload.province_id = Number(form.province_id);
    }

    if (Number(form.channel_id) > 0) {
      payload.channel_id = Number(form.channel_id);
    }

    if (Number(form.store_id) > 0) {
      payload.store_id = Number(form.store_id);
    }

    setLoading(true);
    setError("");

    try {
      const res = await ApiRequest({
        url: `/users/update/${data.user_id}`,
        method: "PUT",
        data: payload,
      });

      if (res.status === "success") {
        onSuccess();
        onClose();
      } else {
        setError(res.message || "Failed to update employee");
      }
    } catch (err) {
      console.error("UPDATE ERROR:", err);

      setError("Server error while updating employee");
    } finally {
      setLoading(false);
    }
  };

  if (!open || !data) {
    return null;
  }

  // ============================
  // SELECTED OPTIONS
  // ============================

  const selectedPosition =
    allPositions.find((p) => Number(p.id) === Number(form.position_id)) || null;

  const selectedStore =
    allStores.find((s) => Number(s.id) === Number(form.store_id)) || null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl sm:max-w-lg rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        {/* HEADER */}
        <div className="sticky top-0 z-20 flex items-center justify-between pb-3 mb-4 bg-white border-b">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
            Edit User
          </h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        {/* FORM */}
        <div className="grid grid-cols-1 gap-4 pb-6 mt-5 overflow-y-auto sm:grid-cols-2 sm:gap-6 max-h-[calc(100vh-220px)] sm:max-h-[400px]">
          {/* FULL NAME */}
          <div>
            <label className="mb-2 font-semibold text-gray-500">
              Full Name
            </label>

            <input
              name="full_name"
              value={form.full_name || ""}
              onChange={handleInput}
              className="w-full p-4 mt-2 border rounded-xl"
            />
          </div>

          {/* USERNAME */}
          <div>
            <label className="mb-2 font-semibold text-gray-500">Username</label>

            <input
              name="username"
              value={form.username || ""}
              onChange={handleInput}
              className="w-full p-4 mt-2 border rounded-xl"
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="mb-2 font-semibold text-gray-500">Email</label>

            <input
              name="email"
              value={form.email || ""}
              onChange={handleInput}
              className="w-full p-4 mt-2 border rounded-xl"
            />
          </div>

          {/* PHONE */}
          <div>
            <label className="mb-2 font-semibold text-gray-500">Phone</label>

            <input
              name="phone"
              value={form.phone || ""}
              onChange={handleInput}
              className="w-full p-4 mt-2 border rounded-xl"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="mb-2 font-semibold text-gray-500">Password</label>

            <input
              name="password"
              value={form.password || ""}
              onChange={handleInput}
              placeholder="(Optional) Enter new password"
              className="w-full p-4 mt-2 border rounded-xl"
            />
          </div>

          {/* ROLE */}
          <div>
            <CustomDropdown
              label="Role"
              value={
                roles
                  .map((r) => ({
                    id: Number(r.user_role_id),
                    name: r.name,
                  }))
                  .find((r) => Number(r.id) === Number(form.user_role_id)) ||
                null
              }
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  user_role_id: v.id,
                }))
              }
              options={roles.map((r) => ({
                id: Number(r.user_role_id),
                name: r.name,
              }))}
              placeholder="Select Role"
            />
          </div>

          {/* POSITION */}
          <div>
            <CustomDropdown
              label="Position"
              searchable
              value={selectedPosition}
              options={positions}
              placeholder="Select Position"
              onSearch={setPositionSearch}
              onChange={(opt) =>
                setForm((prev) => ({
                  ...prev,
                  position_id: opt.id,
                }))
              }
              clearable
              onClear={() => {
                setPositionSearch("");

                setForm((prev) => ({
                  ...prev,
                  position_id: 0,
                }));
              }}
            />
          </div>

          {/* APPROVAL LINE */}
          <div>
            <CustomDropdown
              label="Approval Line"
              value={
                approvalLines.find(
                  (a) => Number(a.id) === Number(form.approval_line_id),
                ) || null
              }
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  approval_line_id: v.id,
                }))
              }
              options={approvalLines}
              placeholder="Select Approval Line"
            />
          </div>

          {/* AREA */}
          <CustomDropdown
            label="Area"
            value={
              form.area_id > 0
                ? {
                    id: Number(form.area_id),
                  }
                : null
            }
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                area_id: v.id,

                province_id: 0,
                store_id: 0,
              }))
            }
            options={areas.map((a) => ({
              id: Number(a.area_id),
              name: a.name || "All Area",
            }))}
            placeholder="Select Area"
            clearable
            onClear={() =>
              setForm((prev) => ({
                ...prev,
                area_id: 0,
                province_id: 0,
                store_id: 0,
              }))
            }
          />

          {/* PROVINCE */}
          <CustomDropdown
            label="Province"
            value={
              provinces.find(
                (p) => Number(p.id) === Number(form.province_id),
              ) || null
            }
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                province_id: v.id,
                store_id: 0,
              }))
            }
            options={provinces}
            placeholder="Select Province"
            clearable
            onClear={() =>
              setForm((prev) => ({
                ...prev,
                province_id: 0,
                store_id: 0,
              }))
            }
          />

          {/* CHANNEL */}
          <CustomDropdown
            label="Channel"
            value={
              channels.find((c) => Number(c.id) === Number(form.channel_id)) ||
              null
            }
            onChange={(v) =>
              setForm((prev) => ({
                ...prev,
                channel_id: v.id,
                store_id: 0,
              }))
            }
            options={channels}
            placeholder="Select Channel"
            clearable
            onClear={() =>
              setForm((prev) => ({
                ...prev,
                channel_id: 0,
                store_id: 0,
              }))
            }
          />

          {/* STORE */}
          <CustomDropdown
            label="Store"
            searchable
            value={selectedStore}
            options={stores}
            placeholder="Select Store"
            onSearch={setStoreSearch}
            onChange={(opt) =>
              setForm((prev) => ({
                ...prev,
                store_id: opt.id,
              }))
            }
            clearable
            onClear={() => {
              setStoreSearch("");

              setForm((prev) => ({
                ...prev,
                store_id: 0,
              }));
            }}
          />

          {/* BIRTHDATE */}
          <div className="flex flex-col space-y-2">
            <label className="font-medium text-gray-700">Birth Date</label>

            <DatePicker
              selected={form.birth_date || null}
              onChange={handleDateChange}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="w-full p-3 border rounded-xl"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={120}
            />
          </div>

          {/* GENDER */}
          <div>
            <CustomDropdown
              label="Gender"
              value={
                [
                  {
                    id: 1,
                    name: "Male",
                  },
                  {
                    id: 2,
                    name: "Female",
                  },
                ].find((g) => Number(g.id) === Number(form.gender)) ||
                (form.gender === "Female"
                  ? {
                      id: 2,
                      name: "Female",
                    }
                  : {
                      id: 1,
                      name: "Male",
                    })
              }
              onChange={(v) =>
                setForm((prev) => ({
                  ...prev,
                  gender: v.id,
                }))
              }
              options={[
                {
                  id: 1,
                  name: "Male",
                },
                {
                  id: 2,
                  name: "Female",
                },
              ]}
              placeholder="Select Gender"
            />
          </div>

          {/* ADDRESS */}
          <div className="col-span-1 sm:col-span-2">
            <label className="font-medium text-gray-700">Address</label>

            <input
              name="address"
              value={form.address || ""}
              onChange={handleInput}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* CITY */}
          <div>
            <label className="font-medium text-gray-700">City</label>

            <input
              name="city"
              value={form.city || ""}
              onChange={handleInput}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* PROVINCE TEXT */}
          <div>
            <label className="font-medium text-gray-700">Province</label>

            <input
              name="province"
              value={form.province || ""}
              onChange={handleInput}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* COUNTRY */}
          <div>
            <label className="font-medium text-gray-700">Country</label>

            <input
              name="country"
              value={form.country || ""}
              onChange={handleInput}
              className="w-full p-3 border rounded-xl"
            />
          </div>

          {/* POSTAL CODE */}
          <div>
            <label className="font-medium text-gray-700">Postal Code</label>

            <input
              name="postal_code"
              value={form.postal_code || ""}
              onChange={handleInput}
              className="w-full p-3 border rounded-xl"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="flex justify-end mt-8">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 text-white bg-[#002D62] rounded-xl hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditEmployeeModal;
