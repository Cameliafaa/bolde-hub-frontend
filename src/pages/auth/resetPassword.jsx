import { useState } from "react";
import { X } from "lucide-react";
import logo from "../../assets/images/logo.png"; 

const ResetPassword = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);

    const handleResetPassword = () => {
        setLoading(true);
        setError("");

        setTimeout(() => {
            setLoading(false);
            setShowModal(true);
        }, 1200);
    };

    const handleBackToLogin = () => {
        setShowModal(false);
        window.location.href = "/";
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-white relative">
            {/* Logo */}
            <img
                src={logo}
                alt="Marketing Labs"
                className="w-52 mb-10 select-none"
            />

            {/* Login Box */}
            <div className="w-full max-w-md space-y-5">
                {error && (
                    <p className="text-red-600 text-sm font-medium text-left -mb-2">
                        {error}
                    </p>
                )}
                {/* Email Input */}
                <div>
                    <input
                        type="email"
                        // value={identity}
                        // onChange={(e) => setIdentity(e.target.value)}
                        placeholder="E-Mail"
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-400"
                    />
                </div>

                {/* Buttons */}
                <div className="flex items-center justify-end gap-3">
                    <button
                        className="bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white px-6 py-2 rounded-2xl shadow-md hover:shadow-lg transition font-medium"
                        onClick={handleResetPassword}
                        disabled={loading}
                    >
                        Lupa Password
                    </button>
                </div>
            </div>

            {/* Footer */}
            <p className="absolute bottom-6 text-sm text-gray-400">
                Version Update 1.0
            </p>

            {/* Pop Up Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 relative text-center">
                        <button
                        onClick={() => setShowModal(false)}
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        >
                            <X size={22} />
                        </button>

                        <h2 className="text-lg font-semibold text-[#0F4C81] mb-3">
                            Password Terkirim
                        </h2>
                        <p className="text-sm text-gray-600 mb-6">
                            Password baru sudah dikirim melalui email.
                            <br />
                            Silahkan cek kotak masuk atau folder spam Anda.
                        </p>

                        <button
                        onClick={handleBackToLogin}
                        className="bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] text-white px-5 py-2 rounded-2xl shadow-md hover:shadow-lg transition font-medium w-full"
                        >
                            Back to Login
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResetPassword;
