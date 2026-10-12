import React, { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";

const ChangePassword = () => {
    const navigate = useNavigate();

    // Show/hide per field
    const [showOld, setShowOld] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const [form, setForm] = useState({
        old_password: "",
        new_password: "",
        confirm_password: ""
    });

    const [loading, setLoading] = useState(false);

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async () => {
        if (!form.old_password || !form.new_password || !form.confirm_password) {
            alert("Semua field wajib diisi!");
            return;
        }

        if (form.new_password !== form.confirm_password) {
            alert("Password baru dan konfirmasi tidak cocok!");
            return;
        }

        try {
            setLoading(true);

            await ApiRequest({
                url: "/profile/change-password",
                method: "PUT",
                data: {
                    old_password: form.old_password,
                    new_password: form.new_password,
                }
            });
            navigate("/profile");
        } catch (err) {
            alert(err.message || "Gagal mengubah password.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <ArrowLeft
                    size={18}
                    className="text-[#0F4C81] cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <p className="text-sm text-[#0F4C81]/80">Back to Profile</p>
            </div>

            <h1 className="text-2xl font-semibold text-[#002D62] mb-5">Change Password</h1>

            <div className="bg-white p-6 rounded-xl shadow space-y-4">

                {/* Old Password */}
                <div className="relative">
                    <InputPassword
                        label="Old Password"
                        type={showOld ? "text" : "password"}
                        value={form.old_password}
                        onChange={(e) => updateField("old_password", e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-[50px] -translate-y-[45%] text-gray-400 hover:text-gray-600"
                        onClick={() => setShowOld(!showOld)}
                    >
                        {showOld ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* New Password */}
                <div className="relative">
                    <InputPassword
                        label="New Password"
                        type={showNew ? "text" : "password"}
                        value={form.new_password}
                        onChange={(e) => updateField("new_password", e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-[50px] -translate-y-[45%] text-gray-400 hover:text-gray-600"
                        onClick={() => setShowNew(!showNew)}
                    >
                        {showNew ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>

                {/* Confirm Password */}
                <div className="relative">
                    <InputPassword
                        label="Confirm New Password"
                        type={showConfirm ? "text" : "password"}
                        value={form.confirm_password}
                        onChange={(e) => updateField("confirm_password", e.target.value)}
                    />
                    <button
                        type="button"
                        className="absolute right-4 top-[50px] -translate-y-[45%] text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirm(!showConfirm)}
                    >
                        {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end mt-4">
                <button
                    disabled={loading}
                    onClick={handleSubmit}
                    className="bg-[#002D62] text-white px-6 py-3 rounded-xl hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? "Processing..." : "Save Changes"}
                </button>
            </div>
        </div>
    );
};

const InputPassword = ({ label, type, ...props }) => (
    <div>
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <input
            type={type}
            {...props}
            className="w-full p-3 border rounded-xl"
        />
    </div>
);

export default ChangePassword;
