import "../styles/auth.css";
import { Heart } from "lucide-react";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Heart size={40} color="#4f46e5" />
          </div>

          <h1 className="brand-title">Multimodal Preference Based Platform for Personalized Elderly Care</h1>
          <p className="brand-subtitle">
            Connecting caregivers with those who need care
          </p>

          <h2 className="auth-title">{title}</h2>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
