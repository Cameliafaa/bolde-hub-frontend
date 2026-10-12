import { useState } from "react";
import { CheckCircle, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { publicApi } from "../../services/api/publicApi";

const SignUp = () => {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const [form, setForm] = useState({
    full_name: "",
    username: "",
    email: "",
    password: "",
    user_role_id: 3,
  });

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");

    const { full_name, username, email, password } = form;

    if (!full_name || !username || !email || !password) {
      setError("Semua field wajib diisi.");
      return;
    }

    try {
      setLoading(true);

      const res = await publicApi({
        url: "/register",
        method: "POST",
        data: {
          ...form, // includes user_role_id: 3
        },
      });

      if (res?.status === "success") {
        setIsSuccess(true);
      } else {
        setError(res?.message || "Registrasi gagal");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <img src={logo} alt="Marketing Labs" className="w-52 mb-10" />

      <form
        onSubmit={handleSignUp}
        className="w-full max-w-md space-y-4"
      >
        {error && (
          <p className="text-red-600 text-sm font-medium">{error}</p>
        )}

        <input
          name="full_name"
          placeholder="Nama Lengkap"
          value={form.full_name}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-2xl"
        />

        <input
          name="username"
          placeholder="Username"
          value={form.username}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-2xl"
        />

        <input
          type="email"
          name="email"
          placeholder="E-Mail"
          value={form.email}
          onChange={handleChange}
          className="w-full px-4 py-3 border rounded-2xl"
        />

        {/* ROLE (READ ONLY) */}
        {/* <div className="w-full px-4 py-3 border rounded-2xl bg-gray-50 text-gray-600 text-sm">
          Role: Supervisor
        </div> */}

        {/* PASSWORD */}
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 border rounded-2xl pr-12"
          />
          <button
            type="button"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
            onClick={() => setShowPassword((prev) => !prev)}
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* ACTION */}
        <div className="flex justify-between items-center pt-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-blue-700 hover:underline"
          >
            Sudah punya akun? Login
          </button>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-[#2D9CDB] to-[#0F4C81] 
                       text-white px-6 py-2 rounded-2xl
                       disabled:opacity-60"
          >
            {loading ? "Loading..." : "Sign Up"}
          </button>
        </div>
      </form>

      {/* SUCCESS MODAL */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* BACKDROP */}
          <div className="absolute inset-0 bg-black/40" />

          {/* MODAL */}
          <div className="relative bg-white w-full max-w-md mx-4 rounded-2xl shadow-xl p-10 text-center animate-scaleIn">
            <CheckCircle className="text-green-500 mx-auto mb-4" size={64} />

            <h2 className="text-[20px] font-semibold text-[#001A40] mb-2">
              Registration Successful
            </h2>

            <p className="text-sm text-gray-600 mb-8">
              Your account has been successfully created.
              Please log in to start using the app.
            </p>

            <button
              onClick={() => navigate("/")}
              className="bg-[#002D62] hover:bg-[#001A40]
                   text-white font-semibold px-10 py-3
                   rounded-xl shadow-md transition"
            >
              Login Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
