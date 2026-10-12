import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/images/logo.png";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [identity, setIdentity] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError("");

    if (!identity || !password) {
      setError("Email dan kata sandi wajib diisi.");
      setLoading(false);
      return;
    }

    try {
      const res = await ApiRequest({
        url: "/login",
        method: "POST",
        data: { identity, password },
      });

      // Backend kamu MUNGKIN tidak mengirim status lowercase
      const status = res?.status?.toString().toLowerCase();

      if (status === "success") {
        const { token } = res.data;

        // 🔥 SIMPAN TOKEN DULU (dipakai refresh-menu)
        localStorage.clear();
        localStorage.setItem("token", token);

        // 🔥 AMBIL DATA TERBARU + PERMISSION
        const refresh = await ApiRequest({
          url: "/users/refresh-menu",
          method: "GET",
        });

        // 🔥 SIMPAN DATA DARI REFRESH-MENU
        localStorage.setItem("userData", JSON.stringify(refresh.data.user));

        navigate("/overview");
      } else {
        let msg =
          res.message?.toLowerCase() || "Terjadi kesalahan pada server.";
        if (msg.includes("user not found")) msg = "Pengguna tidak ditemukan.";
        else if (msg.includes("invalid password")) msg = "Kata sandi salah.";

        setError(msg);
      }
    } catch (err) {
      let msg = "";

      if (err.response?.data?.message) {
        msg = err.response.data.message.toLowerCase();
      } else {
        msg = err.message?.toLowerCase() || "";
      }

      if (msg.includes("user not found")) msg = "Pengguna tidak ditemukan.";
      else if (msg.includes("invalid")) msg = "Kata sandi salah.";
      else msg = "Terjadi kesalahan pada server.";

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 bg-white sm:px-6 lg:px-8">
      <div className="flex flex-col items-center w-full">
        <img
          src={logo}
          alt="Marketing Labs"
          className="w-40 mb-8 select-none sm:w-44 md:w-48 lg:w-52 sm:mb-10"
        />

        <div className="w-full max-w-sm space-y-4 sm:max-w-md lg:max-w-lg sm:space-y-5">
          {error && (
            <p className="-mb-2 text-sm font-medium text-left text-red-600">
              {error}
            </p>
          )}

          {/* Email */}
          <div>
            <input
              type="email"
              value={identity}
              onChange={(e) => setIdentity(e.target.value)}
              placeholder="E-Mail"
              className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-primary"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-[45%] text-text-secondary hover:text-text-primary"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-4 mt-4">
            <button
              className="text-sm text-brand-secondary hover:underline"
              onClick={() => navigate("/reset-password")}
            >
              Lupa kata sandi
            </button>

            <div className="flex items-center gap-3">
              <button
                className="px-5 py-2 font-medium text-gray-600 transition border border-gray-300 rounded-2xl hover:bg-gray-50"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </button>
              <button
                className="px-6 py-2 font-medium text-white transition shadow-md bg-gradient-to-r from-brand-primary to-brand-secondary rounded-2xl hover:shadow-lg"
                onClick={handleLogin}
                disabled={loading}
              >
                Login
              </button>
            </div>
          </div>
        </div>
      </div>

      <p className="absolute text-sm text-gray-400 bottom-6">
        Version Update 1.0
      </p>
    </div>
  );
};

export default Login;
