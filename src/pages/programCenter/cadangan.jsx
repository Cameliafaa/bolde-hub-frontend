import React, { useState, useEffect } from "react";
import axios from "axios";
import { X } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ApiRequest } from "../../../services/apiRequest";
import CustomDropdown from "../../programCenter/addProgram/form/customDropdown";

const AddEmployeeModal = ({ open, onClose, onSuccess }) => {

    const [form, setForm] = useState({
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
    });

    const [areas, setAreas] = useState([]);
    const [roles, setRoles] = useState([]);
    const [positions, setPositions] = useState([]);
    const [approvalLines, setApprovalLines] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [selectedFile, setSelectedFile] = useState(null);

    const setField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
        setError("");
    };

    const generateUserCode = () =>
        `USR${Math.floor(1000 + Math.random() * 9000)}`;

    // ==========================================================
    // FETCH USERS → APPROVAL LINE LIST
    // ==========================================================
    const fetchApprovalLines = async () => {
        try {
            const res = await ApiRequest({ url: "/users/all", method: "GET" });

            const users = Array.isArray(res?.data) ? res.data : [];

            const supervisors = users.filter((u) => u.role_id !== 1);

            const approvalList = supervisors.map((u) => ({
                id: u.user_id,
                name: `${u.full_name} - ${u.role_name || "No Role"}`,
            }));

            setApprovalLines(approvalList);

        } catch (err) {
        }
    };

    // ==========================================================
    // FETCH ROLES, POSITIONS, AREAS
    // ==========================================================
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
            console.error( err);
        }
    };

    useEffect(() => {
        if (!open) return;
        fetchApprovalLines();
        fetchRolesPositionsAreas();
    }, [open]);

    // ==========================================================
    // FORM INPUT HANDLER
    // ==========================================================
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setField(name, value);
    };

    // ==========================================================
    // SUBMIT CREATE USER
    // ==========================================================
    const handleSubmit = async () => {

        if (!form.full_name ||
            !form.username ||
            !form.password ||
            !form.role ||
            !form.position ||
            !form.area_id ||
            !form.approvalLine
        ) {
            setError("Please fill all required fields (*)");
            return;
        }
        const payload = {
            full_name: form.full_name,
            username: form.username,
            email: form.email,
            phone: form.phone,
            password: form.password,

            user_role_id: form.role?.id || null,
            position_id: form.position?.id || null,
            approval_line_id: form.approvalLine?.id || null,
            area_id: form.area_id || null,

            user_code: generateUserCode(),
            is_active: true,

            user_details: {
                birth_date: form.birth_date
                    ? new Date(form.birth_date).toISOString()
                    : null,

                gender: form.gender?.id || "",
                address: form.address,
                city: form.city,
                province: form.province,
                country: form.country,
                postal_code: form.postal_code,
            },
        };

        setLoading(true);

        try {
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
            console.error("❌ API ERROR:", err);
            setError("Server error.");
        } finally {
            setLoading(false);
        }
    };

    // ==========================================================
    // RESET FORM
    // ==========================================================
    const resetForm = () => {
        setForm({
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
        });

        setSelectedFile(null);
        setError("");
    };

    // ==========================================================
    // RENDER UI
    // ==========================================================
    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-2xl shadow-lg relative">

                {/* CLOSE BUTTON */}
                <button
                    onClick={() => {
                        resetForm();
                        onClose();
                    }}
                    className="absolute right-6 top-6 text-gray-400 hover:text-gray-600"
                >
                    <X size={22} />
                </button>

                <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                    Add User
                </h2>

                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                {/* FORM */}
                <div className="grid grid-cols-2 gap-6 max-h-[400px] mt-5 overflow-y-auto pb-4">

                    {/* FULL NAME */}
                    <div className="col-span-2">
                        <label className="text-[#6B7280] font-semibold">Full Name</label>
                        <input
                            name="full_name"
                            value={form.full_name}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* USERNAME */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Username</label>
                        <input
                            name="username"
                            value={form.username}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* EMAIL */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* PHONE */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Phone</label>
                        <input
                            name="phone"
                            value={form.phone}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* PASSWORD */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* ROLE */}
                    <div>
                        <CustomDropdown
                            label="Role"
                            value={form.role}
                            options={roles}
                            placeholder="Select Role"
                            onChange={(opt) => setField("role", opt)}
                        />
                    </div>

                    {/* POSITION */}
                    <div>
                        <CustomDropdown
                            label="Position"
                            value={form.position}
                            options={positions}
                            placeholder="Select Position"
                            onChange={(opt) => setField("position", opt)}
                        />
                    </div>

                    {/* APPROVAL LINE */}
                    <div>
                        <CustomDropdown
                            label="Approval Line"
                            value={form.approvalLine}
                            options={approvalLines}
                            placeholder="Select Approval Line"
                            onChange={(opt) => setField("approvalLine", opt)}
                        />
                    </div>

                    {/* BIRTH DATE */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Birth Date</label>
                        <DatePicker
                            selected={form.birth_date}
                            onChange={(date) => setField("birth_date", date)}
                            dateFormat="dd/MM/yyyy"
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* GENDER */}
                    <div>
                        <CustomDropdown
                            label="Gender"
                            value={form.gender}
                            options={[
                                { id: "Male", name: "Male" },
                                { id: "Female", name: "Female" },
                            ]}
                            placeholder="Select Gender"
                            onChange={(opt) => setField("gender", opt)}
                        />
                    </div>

                    {/* AREA */}
                    <div>
                        <CustomDropdown
                            label="Area"
                            value={areas.find((a) => a.id === form.area_id) || null}
                            options={areas}
                            placeholder="Select Area"
                            onChange={(opt) => setField("area_id", opt.id)}
                        />
                    </div>

                    {/* ADDRESS */}
                    <div className="col-span-2">
                        <label className="text-[#6B7280] font-semibold">Address</label>
                        <input
                            name="address"
                            value={form.address}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* CITY */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">City</label>
                        <input
                            name="city"
                            value={form.city}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* PROVINCE */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Province</label>
                        <input
                            name="province"
                            value={form.province}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* COUNTRY */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Country</label>
                        <input
                            name="country"
                            value={form.country}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>

                    {/* POSTAL CODE */}
                    <div>
                        <label className="text-[#6B7280] font-semibold">Postal Code</label>
                        <input
                            name="postal_code"
                            value={form.postal_code}
                            onChange={handleInputChange}
                            className="w-full p-3 border rounded-xl"
                        />
                    </div>
                </div>

                {/* SAVE BUTTON */}
                <div className="flex justify-end mt-6">
                    <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="bg-[#002D62] text-white px-6 py-3 rounded-xl hover:opacity-90"
                    >
                        {loading ? "Saving..." : "Save User"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddEmployeeModal;
