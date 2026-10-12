import { useState } from "react";
import { CheckCircle2, Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

import logo from "../../assets/images/logo-2.png";
import { publicApi } from "../../services/api/publicApi";
import Button from "../../components/common/button";

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
          ...form,
        },
      });

      if (res?.status === "success") {
        setIsSuccess(true);
      } else {
        setError(res?.message || "Registrasi gagal.");
      }
    } catch (err) {
      setError("Terjadi kesalahan pada server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-md">
        {/* LOGO */}
        <div className="mb-10 text-center">
          <img
            src={logo}
            alt="BOLDe Hub"
            className="object-contain w-16 mx-auto"
          />
        </div>

        {/* FORM */}
        <form onSubmit={handleSignUp} className="space-y-4">
          {error && (
            <div className="px-4 py-3 text-sm rounded-xl bg-red-50 text-status-danger">
              {error}
            </div>
          )}

          {/* NAMA LENGKAP */}
          <input
            type="text"
            name="full_name"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Nama Lengkap"
            className="w-full px-4 py-3 text-base transition bg-white border outline-none rounded-2xl border-surface-border text-text-primary placeholder:text-text-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />

          {/* USERNAME */}
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full px-4 py-3 text-base transition bg-white border outline-none rounded-2xl border-surface-border text-text-primary placeholder:text-text-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />

          {/* EMAIL */}
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="E-Mail"
            className="w-full px-4 py-3 text-base transition bg-white border outline-none rounded-2xl border-surface-border text-text-primary placeholder:text-text-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 pr-12 text-base transition bg-white border outline-none rounded-2xl border-surface-border text-text-primary placeholder:text-text-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute -translate-y-1/2 right-4 top-1/2 text-text-secondary"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* ACTION */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="text-sm font-medium text-brand-primary hover:underline"
            >
              Sudah punya akun? Login
            </button>

            <Button type="submit" variant="primary" size="md" loading={loading}>
              Sign Up
            </Button>
          </div>
        </form>
      </div>

      {/* VERSION */}
      <p className="absolute text-sm bottom-7 text-text-light">
        Version Update 2.0
      </p>

      {/* SUCCESS MODAL */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-overlay">
          <div className="relative w-full max-w-sm text-center bg-white shadow-xl p-7 rounded-2xl">
            <CheckCircle2 size={52} className="mx-auto text-status-success" />

            <h2 className="mt-4 text-lg font-semibold text-text-primary">
              Registrasi berhasil
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Akun Anda berhasil dibuat. Silakan login untuk mulai menggunakan
              BOLDe Hub.
            </p>

            <div className="mt-6">
              <Button
                type="button"
                variant="primary"
                size="md"
                fullWidth
                onClick={() => navigate("/")}
              >
                Login Sekarang
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SignUp;
