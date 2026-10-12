import { useState } from "react";
import { ArrowLeft, CheckCircle2, Mail, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/images/logo-2.png";
import Button from "../../components/common/button";

const ResetPassword = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleResetPassword = () => {
    setError("");

    if (!email.trim()) {
      setError("Email wajib diisi.");
      return;
    }

    setLoading(true);

    // Dummy sementara sampai API reset password tersedia
    setTimeout(() => {
      setLoading(false);
      setShowModal(true);
    }, 1000);
  };

  const handleBackToLogin = () => {
    setShowModal(false);
    navigate("/");
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
        <div className="space-y-4">
          {error && (
            <div className="px-4 py-3 text-sm rounded-xl bg-red-50 text-status-danger">
              {error}
            </div>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="E-Mail"
            className="w-full px-4 py-3 text-base transition bg-white border outline-none rounded-2xl border-surface-border text-text-primary placeholder:text-text-light focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          />

          <div className="flex items-center justify-end pt-1">
            <Button
              type="button"
              variant="primary"
              size="md"
              loading={loading}
              onClick={handleResetPassword}
            >
              Lupa Password
            </Button>
          </div>
        </div>
      </div>

      {/* VERSION */}
      <p className="absolute text-sm bottom-7 text-text-light">
        Version Update 2.0
      </p>

      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-overlay">
          <div className="relative w-full max-w-sm p-6 text-center bg-white shadow-xl rounded-2xl">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute transition right-4 top-4 text-text-light hover:text-text-primary"
            >
              <X size={20} />
            </button>

            <CheckCircle2 size={52} className="mx-auto text-status-success" />

            <h2 className="mt-4 text-lg font-semibold text-text-primary">
              Email berhasil dikirim
            </h2>

            <p className="mt-2 text-sm leading-6 text-text-secondary">
              Silakan cek kotak masuk atau folder spam untuk melanjutkan proses
              reset password.
            </p>

            <button
              type="button"
              onClick={handleBackToLogin}
              className="w-full px-5 mt-6 text-sm font-semibold text-white transition py-2.5 rounded-xl bg-gradient-to-r from-brand-gradientFrom via-brand-gradientVia to-brand-gradientTo hover:brightness-95"
            >
              Kembali ke Login
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResetPassword;
