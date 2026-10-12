import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import logo from "../../assets/images/logo-2.png";
import { useNavigate } from "react-router-dom";
import { ApiRequest } from "../../services/apiRequest";
import Button from "../../components/common/button";

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
        data: {
          identity,
          password,
        },
      });

      const status = res?.status?.toString().toLowerCase();

      if (status === "success") {
        const { token } = res.data;

        localStorage.clear();
        localStorage.setItem("token", token);

        const refresh = await ApiRequest({
          url: "/users/refresh-menu",
          method: "GET",
        });

        localStorage.setItem("userData", JSON.stringify(refresh.data.user));

        navigate("/overview");
      } else {
        let msg =
          res.message?.toLowerCase() || "Terjadi kesalahan pada server.";

        if (msg.includes("user not found")) {
          msg = "Pengguna tidak ditemukan.";
        } else if (msg.includes("invalid password")) {
          msg = "Kata sandi salah.";
        }

        setError(msg);
      }
    } catch (err) {
      let msg = "";

      if (err.response?.data?.message) {
        msg = err.response.data.message.toLowerCase();
      } else {
        msg = err.message?.toLowerCase() || "";
      }

      if (msg.includes("user not found")) {
        msg = "Pengguna tidak ditemukan.";
      } else if (msg.includes("invalid")) {
        msg = "Kata sandi salah.";
      } else {
        msg = "Terjadi kesalahan pada server.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex items-center justify-center min-h-screen px-4 bg-white">
      <div className="w-full max-w-lg">
        {/* LOGO */}
        <div className="mb-10 text-center">
          <img
            src={logo}
            alt="BOLDe Hub"
            className="object-contain w-16 mx-auto"
          />
        </div>

        {/* FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
          {error && (
            <div className="px-4 py-3 text-sm rounded-xl bg-red-50 text-status-danger">
              {error}
            </div>
          )}

          {/* EMAIL */}
          <input
            type="text"
            value={identity}
            onChange={(e) => setIdentity(e.target.value)}
            placeholder="E-Mail"
            className="w-full px-4 py-3 text-base transition bg-white border outline-none rounded-2xl border-surface-border text-text-primary placeholder:text-text-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />

          {/* PASSWORD */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          <div className="flex flex-col gap-4 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <button
              type="button"
              onClick={() => navigate("/reset-password")}
              className="text-sm font-medium text-left text-brand-primary hover:underline"
            >
              Lupa kata sandi
            </button>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => navigate("/signup")}
              >
                Sign Up
              </Button>

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={loading}
              >
                Login
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* VERSION */}
      <p className="absolute text-sm bottom-7 text-text-light">
        Version Update 2.0
      </p>
    </div>
  );
};

export default Login;
