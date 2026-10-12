import React, { useState, useEffect } from "react";
import { ApiRequest } from "../../services/apiRequest";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EditImage from "../../assets/images/icons/editProfile.png";
import CustomDropdown from "../../components/common/customDropdown";
import DatePicker from "react-datepicker";

const EditProfile = ({ onClose }) => {
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const [loading, setLoading] = useState(false);

    // FORM STATE
    const [form, setForm] = useState({
        full_name: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        country: "",
        province: "",
        postal_code: "",
        birth_date: "",
        gender: "",
    });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await ApiRequest({
                url: "profile/me",
                method: "GET",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.status === "success") {
                const p = res.data;
                setProfile(p);

                setForm({
                    full_name: p.full_name || "",
                    phone: p.phone || "",
                    email: p.email || "",
                    address: p.user_details?.address || "",
                    city: p.user_details?.city || "",
                    country: p.user_details?.country || "",
                    province: p.user_details?.province || "",
                    postal_code: p.user_details?.postal_code || "",
                    birth_date: p.user_details?.birth_date
                        ? new Date(p.user_details.birth_date)
                        : null,
                    gender: p.user_details?.gender || "",
                });
            }
        } catch (err) {
            console.error("Error:", err);
        }
    };


    const handleSave = async () => {
        try {
            const token = localStorage.getItem("token");

            // Convert DATE to string
            const formattedBirthDate = form.birth_date
                ? form.birth_date.toISOString().split("T")[0]
                : null;

            const payload = {
                full_name: form.full_name,
                phone: form.phone,
                email: form.email,
                address: form.address,
                city: form.city,
                province: form.province,
                country: form.country,
                postal_code: form.postal_code,
                birth_date: formattedBirthDate,
                gender: form.gender,
            };

            // UPDATE PROFILE (always JSON)
            await ApiRequest({
                url: "profile/update",
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                data: payload,
            });
            // Upload image jika ada
            if (imageFile) {
                const fd = new FormData();
                fd.append("image", imageFile);

                await ApiRequest({
                    url: "profile/update-image",
                    method: "PUT",
                    data: fd,
                    isFormData: true,
                });
            }
            navigate(-1);
        } catch (err) {
            console.error("Save error:", err);
            alert("Failed to update profile.");
        }
    };

    const updateField = (field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    if (!profile) return <p>Loading...</p>;

    return (
        <div className="space-y-6">
            {/* HEADER */}
            <div className="flex items-center gap-2 mb-4">
                <ArrowLeft
                    size={18}
                    className="text-[#0F4C81] cursor-pointer"
                    onClick={() => navigate(-1)}
                />
                <p className="text-sm text-[#0F4C81]/80">Back to Profile</p>
            </div>

            <div>
                <h1 className="text-2xl font-semibold text-[#002D62]">Edit Profile</h1>
            </div>

            {/* Avatar Section */}
            <div className="flex flex-col items-center">

                {/* Wrapper untuk avatar + tombol camera */}
                <div className="relative group">

                    {/* Avatar Image */}
                    <img
                        src={previewImage || profile.image_url}
                        alt="avatar"
                        className="w-32 h-32 rounded-full object-cover border shadow-sm"
                    />

                    {/* Camera Button */}
                    <button
                        onClick={() => document.getElementById("photoInput").click()}
                        className="absolute bottom-1 right-1 text-white transition"
                    >
                        <img
                            src={EditImage}
                            alt="image"
                        />
                    </button>

                    {/* Hidden Input */}
                    <input
                        id="photoInput"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                            const file = e.target.files[0];
                            setImageFile(file);
                            setPreviewImage(URL.createObjectURL(file));
                        }}
                    />
                </div>

                {/* Label Text */}
                <p className="text-gray-500 font-medium text-sm">Change Photo</p>
            </div>

            {/* PERSONAL FORM */}
            <Section title="Personal Information">
                <Input label="Full Name" value={form.full_name} onChange={(e) => updateField("full_name", e.target.value)} />
                <Input label="Email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
                <Input label="Phone" value={form.phone} onChange={(e) => updateField("phone", e.target.value)} />
                <div className="flex flex-col space-y-2">
                    <p className="text-gray-500 text-sm mb-1">Birth Date</p>
                    <DatePicker
                        selected={form.birth_date}
                        onChange={(date) => updateField("birth_date", date)}
                        dateFormat="dd/MM/yyyy"
                        placeholderText="dd/mm/yyyy"
                        className="w-full p-3 border rounded-xl"
                        showYearDropdown
                        scrollableYearDropdown
                        yearDropdownItemNumber={120}
                    />
                </div>
                <div>
                    <p className="text-gray-500 text-sm mb-1">Gender</p>
                    <CustomDropdown
                        // label="Gender"
                        value={{ id: form.gender, name: form.gender }}   // supaya dropdown bisa membaca value
                        options={[
                            { id: "Male", name: "Male" },
                            { id: "Female", name: "Female" },
                        ]}
                        placeholder="Select Gender"
                        onChange={(opt) => updateField("gender", opt.id)}  // simpan id sebagai string
                    />
                </div>
                <Input label="Address" value={form.address} onChange={(e) => updateField("address", e.target.value)} />
                <Input label="City" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
                <Input label="Province" value={form.province} onChange={(e) => updateField("province", e.target.value)} />
                <Input label="Country" value={form.country} onChange={(e) => updateField("country", e.target.value)} />
                <Input label="Postal Code" value={form.postal_code} onChange={(e) => updateField("postal_code", e.target.value)} />
            </Section>

            {/* SAVE BUTTON */}
            <div className="flex justify-end">
                <button
                    onClick={handleSave}
                    disabled={loading}

                    className="bg-[#002D62] text-white px-6 py-3 rounded-xl hover:opacity-90"                >
                    Save Changes
                </button>
            </div>
        </div>
    );
};

/* COMPONENTS */
const Section = ({ title, children }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {children}
    </div>
);

const Input = ({ label, ...props }) => (
    <div>
        <p className="text-gray-500 text-sm mb-1">{label}</p>
        <input
            {...props}
            className="w-full p-3 border rounded-xl"
        />
    </div>
);

export default EditProfile;
