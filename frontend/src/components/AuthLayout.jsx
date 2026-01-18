import "../styles/auth.css";
import { Heart } from "lucide-react";

function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <Heart size={40} color="#4f46e5" />
          </div>
          <h1 className="auth-title">{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
