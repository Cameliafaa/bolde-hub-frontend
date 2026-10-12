import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../common/customDropdown";
import { fetchAllStores } from "../../../services/store/storeServices";

const AddEmployeeModal = ({ open, onClose, onSuccess }) => {
  const initialForm = {
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    birth_date: null,
    address: "",
    city: "",
    province: "",
    country: "",
    postal_code: "",
    area_id: null,
    role: null,
    position: null,
    approvalLine: null,
    gender: null,
    province_id: null,
    channel_id: null,
    store_id: null,
  };

  const [form, setForm] = useState(initialForm);

  const [areas, setAreas] = useState([]);
  const [roles, setRoles] = useState([]);
  const [positions, setPositions] = useState([]);
  const [approvalLines, setApprovalLines] = useState([]);
  const [provinces, setProvinces] = useState([]);
  const [channels, setChannels] = useState([]);
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [allProvinces, setAllProvinces] = useState([]);
  const [allStores, setAllStores] = useState([]);
  const [storeSearch, setStoreSearch] = useState("");

  const setField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  const generateUserCode = () =>
    `USR${Math.floor(1000 + Math.random() * 9000)}`;

  const toNumberOrZero = (val) => {
    const n = Number(val);
    return Number.isFinite(n) ? n : 0;
  };

  const fetchApprovalLines = async () => {
    try {
      const res = await ApiRequest({ url: "/users/all", method: "GET" });

      const users = Array.isArray(res?.data) ? res.data : [];

      const supervisors = users.filter(
        (u) => Number(u.user_id) > 0 && Number(u.user_role_id) !== 1,
      );

      const approvalList = supervisors.map((u) => ({
        id: Number(u.user_id),
        name: `${u.full_name} (${u.role_name || "No Role"})`,
      }));

      setApprovalLines(approvalList);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRolesPositionsAreas = async () => {
    try {
      const [roleRes, posRes, areaRes] = await Promise.all([
        ApiRequest({ url: "/roles/all", method: "GET" }),
        ApiRequest({ url: "/positions/all", method: "GET" }),
        ApiRequest({ url: "/areas/all", method: "GET" }),
      ]);

      const roleList = (roleRes?.data || []).map((r) => ({
        id: r.user_role_id,
        name: r.name,
      }));

      const posList = (posRes?.data || []).map((p) => ({
        id: p.position_id,
        name: p.name,
      }));

      const areaList = (areaRes?.data || []).map((a) => ({
        id: a.area_id,
        name: a.name,
      }));

      setRoles(roleList);
      setPositions(posList);
      setAreas(areaList);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchProvinceChannelStore = async () => {
    try {
      const [provRes, chRes, allStoreRes] = await Promise.all([
        ApiRequest({ url: `/provinces?limit=100`, method: "GET" }),
        ApiRequest({ url: "/channels/all", method: "GET" }),
        fetchAllStores(),
      ]);

      if (chRes?.data) {
        setChannels(
          chRes.data.map((c) => ({
            id: c.channel_id,
            name: c.name,
          })),
        );
      }

      if (provRes?.data) {
        const mapped = provRes.data.map((p) => ({
          id: p.province_id,
          name: p.name,
          area_id: p.area_id,
        }));

        setAllProvinces(mapped);
        setProvinces(mapped);
      }

      setAllStores(Array.isArray(allStoreRes) ? allStoreRes : []);
      setStores(Array.isArray(allStoreRes) ? allStoreRes.slice(0, 50) : []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let filtered = allStores;

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
      filtered = filtered.filter((s) =>
        String(s.name || "")
          .toLowerCase()
          .includes(storeSearch.toLowerCase()),
      );
    }

    setStores(filtered.slice(0, 50));

    if (
      form.store_id &&
      !filtered.some((s) => Number(s.id) === Number(form.store_id))
    ) {
      setField("store_id", null);
    }
  }, [form.channel_id, form.province_id, storeSearch, allStores]);

  useEffect(() => {
    if (!form.area_id) {
      setProvinces(allProvinces);

      setForm((prev) => ({
        ...prev,
        province_id: null,
        store_id: null,
      }));

      return;
    }

    const filtered = allProvinces.filter(
      (p) => Number(p.area_id) === Number(form.area_id),
    );

    setProvinces(filtered);

    setForm((prev) => ({
      ...prev,
      province_id: null,
      store_id: null,
    }));
  }, [form.area_id, allProvinces]);

  useEffect(() => {
    if (!open) return;

    fetchApprovalLines();
    fetchRolesPositionsAreas();
    fetchProvinceChannelStore();
  }, [open]);

  const handleInputChange = (e) => {
    setField(e.target.name, e.target.value);
  };

  const handleSubmit = async () => {
    if (
      !form.full_name ||
      !form.username ||
      !form.email ||
      !form.phone ||
      !form.password ||
      !form.role ||
      !form.position ||
      !form.birth_date ||
      !form.gender ||
      !form.area_id
    ) {
      setError("Please fill all required fields (*)");
      return;
    }

    const payload = {
      full_name: form.full_name,
      username: form.username,
      email: form.email || "",
      phone: form.phone || "",
      password: form.password,

      user_role_id: Number(form.role?.id),
      position_id: Number(form.position?.id),
      approval_line_id: form.approvalLine?.id
        ? Number(form.approvalLine.id)
        : null,

      user_code: generateUserCode(),
      is_active: true,

      birth_date: form.birth_date
        ? form.birth_date.toISOString().split("T")[0]
        : null,

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

    try {
      setLoading(true);

      const res = await ApiRequest({
        url: "/users/create",
        method: "POST",
        data: payload,
      });

      if (res.status === "success") {
        resetForm();
        onSuccess?.();
        onClose?.();
      } else {
        setError(res.message || "Failed to add user.");
      }
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || "Server error.");
    } finally {
      setLoading(false);
    }
  };

  const handleImportExcel = async () => {
    if (!selectedFile) {
      setError("Please upload an Excel file first.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      setLoading(true);

      const res = await axios.post(
        process.env.REACT_APP_API_BASE_URL + "/users/import",
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        },
      );

      if (res.data.status === "success") {
        resetForm();
        onSuccess?.();
        onClose?.();
      } else {
        setError(res.data.message || "Import failed.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to import Excel.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const res = await axios.get(
        process.env.REACT_APP_API_BASE_URL + "/users/import/template",
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );

      const url = window.URL.createObjectURL(res.data);
      const a = document.createElement("a");
      a.href = url;
      a.download = "Users_Template.xlsx";
      a.click();
    } catch (err) {
      console.error(err);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedFile(null);
    setError("");
    setStoreSearch("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center">
      <div className="relative w-full p-6 overflow-y-auto bg-white shadow-xl sm:max-w-lg rounded-t-3xl sm:rounded-2xl sm:p-8 max-h-[95vh] animate-slideUpMobile sm:animate-none">
        <div className="sticky top-0 z-20 flex items-center justify-between pb-3 mb-4 bg-white border-b">
          <h2 className="text-xl font-semibold text-gray-800 sm:text-2xl">
            Add User
          </h2>

          <button
            onClick={() => {
              resetForm();
              onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={22} />
          </button>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error}</p>}

        <div className="hidden sm:block">
          <div className="col-span-2 mt-2">
            <label className="font-semibold text-[#6B7280]">
              Import from Excel
            </label>
            <input
              type="file"
              accept=".xlsx"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="w-full p-3 bg-white border rounded-xl"
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleDownloadTemplate}
              disabled={loading}
              className="px-6 py-3 mr-3 text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:opacity-60"
            >
              Download Template
            </button>

            <button
              onClick={handleImportExcel}
              disabled={loading}
              className="px-6 py-3 text-white bg-[#002D62] rounded-xl hover:bg-[#002D62] disabled:opacity-60"
            >
              Import Excel
            </button>
          </div>
        </div>

        <div className="mb-4">
          <details className="sm:hidden">
            <summary className="font-semibold text-gray-600 cursor-pointer">
              Import from Excel
            </summary>

            <div className="mt-3 space-y-3">
              <input
                type="file"
                accept=".xlsx"
                onChange={(e) => setSelectedFile(e.target.files[0])}
                className="w-full p-3 border rounded-xl"
              />

              <div className="flex gap-2">
                <button
                  onClick={handleDownloadTemplate}
                  disabled={loading}
                  className="flex-1 py-2 text-white bg-blue-600 rounded-xl disabled:opacity-60"
                >
                  Template
                </button>
                <button
                  onClick={handleImportExcel}
                  disabled={loading}
                  className="flex-1 py-2 text-white bg-[#002D62] rounded-xl disabled:opacity-60"
                >
                  Import
                </button>
              </div>
            </div>
          </details>
        </div>

        <div className="grid grid-cols-1 gap-4 pb-6 mt-5 overflow-y-auto sm:grid-cols-2 sm:gap-6 max-h-[calc(100vh-220px)] sm:max-h-[400px]">
          <div>
            <label className="font-semibold text-[#6B7280]">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              name="full_name"
              value={form.full_name}
              onChange={handleInputChange}
              placeholder="Enter full name"
              className="w-full p-4 mt-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">
              Username <span className="text-red-500">*</span>
            </label>
            <input
              name="username"
              value={form.username}
              onChange={handleInputChange}
              placeholder="Enter username"
              className="w-full p-4 mt-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="Enter email"
              className="w-full p-4 mt-3 border rounded-xl"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">
              Phone <span className="text-red-500">*</span>
            </label>
            <input
              name="phone"
              value={form.phone}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Enter +62"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">
              Password <span className="text-red-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Bolde123"
            />
          </div>

          <div>
            <CustomDropdown
              label={
                <>
                  Role <span className="text-red-500">*</span>
                </>
              }
              value={form.role}
              options={roles}
              placeholder="Select Role"
              onChange={(opt) => setField("role", opt)}
            />
          </div>

          <div>
            <CustomDropdown
              label={
                <>
                  Position <span className="text-red-500">*</span>
                </>
              }
              value={form.position}
              options={positions}
              placeholder="Select Position"
              onChange={(opt) => setField("position", opt)}
            />
          </div>

          <div>
            <CustomDropdown
              label="Approval Line"
              value={form.approvalLine}
              options={approvalLines}
              placeholder="Select Approval Line"
              onChange={(opt) => setField("approvalLine", opt)}
              clearable
              onClear={() => setField("approvalLine", null)}
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label className="font-semibold text-[#6B7280]">
              Birth Date <span className="text-red-500">*</span>
            </label>
            <DatePicker
              selected={form.birth_date}
              onChange={(date) => setField("birth_date", date)}
              dateFormat="dd/MM/yyyy"
              placeholderText="dd/mm/yyyy"
              className="w-full p-4 border rounded-xl"
              showYearDropdown
              scrollableYearDropdown
              yearDropdownItemNumber={120}
            />
          </div>

          <div>
            <CustomDropdown
              label={
                <>
                  Gender <span className="text-red-500">*</span>
                </>
              }
              value={
                form.gender
                  ? {
                      id: form.gender,
                      name: form.gender === 1 ? "Male" : "Female",
                    }
                  : null
              }
              options={[
                { id: 1, name: "Male" },
                { id: 2, name: "Female" },
              ]}
              placeholder="Select Gender"
              onChange={(opt) => setField("gender", opt.id)}
            />
          </div>

          <div>
            <CustomDropdown
              label={
                <>
                  Area <span className="text-red-500">*</span>
                </>
              }
              searchable
              value={
                form.area_id ? areas.find((a) => a.id === form.area_id) : null
              }
              options={areas}
              placeholder="Select Area"
              onChange={(opt) => setField("area_id", opt.id)}
            />
          </div>

          <CustomDropdown
            label="Province"
            searchable
            value={
              form.province_id
                ? provinces.find((p) => p.id === form.province_id)
                : null
            }
            options={provinces}
            placeholder="Select Province"
            disabled={!form.area_id}
            onChange={(opt) => setField("province_id", opt.id)}
          />

          <CustomDropdown
            label="Channel"
            searchable
            value={
              form.channel_id
                ? channels.find((c) => c.id === form.channel_id)
                : null
            }
            options={channels}
            placeholder="Select Channel"
            onChange={(opt) => setField("channel_id", opt.id)}
          />

          <CustomDropdown
            label="Store"
            searchable
            value={stores.find((s) => s.id === form.store_id) || null}
            options={stores}
            placeholder="Select Store"
            onSearch={setStoreSearch}
            disabled={!form.channel_id || !form.province_id}
            onChange={(opt) => setField("store_id", opt.id)}
          />

          <div className="col-span-1 sm:col-span-2">
            <label className="font-semibold text-[#6B7280]">Address</label>
            <input
              name="address"
              value={form.address}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Enter address"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">City</label>
            <input
              name="city"
              value={form.city}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Enter city"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">Province</label>
            <input
              name="province"
              value={form.province}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Enter province"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">Country</label>
            <input
              name="country"
              value={form.country}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Enter country"
            />
          </div>

          <div>
            <label className="font-semibold text-[#6B7280]">Postal Code</label>
            <input
              name="postal_code"
              value={form.postal_code}
              onChange={handleInputChange}
              className="w-full p-4 mt-3 border rounded-xl"
              placeholder="Enter postal code"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-6 py-3 text-white bg-[#002D62] rounded-xl hover:opacity-90 disabled:opacity-60"
          >
            {loading ? "Saving..." : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEmployeeModal;
