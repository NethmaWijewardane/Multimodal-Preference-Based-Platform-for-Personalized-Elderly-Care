import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart } from "lucide-react";
import "../styles/auth.css";

function AuthForm({ type = "signup", defaultRole = "elderly" }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(defaultRole);
  const isSignUp = type === "signup";

  const handleTabClick = (role) => {
    setActiveTab(role);
    if (isSignUp) {
      navigate(role === "elderly" ? "/elderly/signup" : "/caregiver/signup");
    } else {
      navigate(role === "elderly" ? "/elderly/signin" : "/caregiver/signin");
    }
  };

  return (
    <>
      {/* Tabs */}
      <div className="tabs">
        <div
          className={`tab ${activeTab === "elderly" ? "active" : ""}`}
          onClick={() => handleTabClick("elderly")}
        >
          <Users size={16} /> Elderly
        </div>
        <div
          className={`tab ${activeTab === "caregiver" ? "active" : ""}`}
          onClick={() => handleTabClick("caregiver")}
        >
          <Heart size={16} /> Caregiver
        </div>
      </div>

      {/* Form Fields */}
      {isSignUp && (
        <>
          <div className="form-group">
            <label>Full Name</label>
            <input placeholder="Enter your name" />
          </div>
          <div className="form-group">
            <label>Location</label>
            <input placeholder="Colombo, Kandy, Galle" />
          </div>
        </>
      )}

      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="Enter your email" />
      </div>

      <div className="form-group">
        <label>Password</label>
        <input type="password" placeholder="Enter your password" />
      </div>

      <button className="auth-button">
        {isSignUp ? "Create Account" : "Sign In"}
      </button>

      <div
        className="switch-link"
        onClick={() =>
          navigate(
            isSignUp
              ? activeTab === "elderly"
                ? "/elderly/signin"
                : "/caregiver/signin"
              : activeTab === "elderly"
              ? "/elderly/signup"
              : "/caregiver/signup"
          )
        }
      >
        {isSignUp
          ? "Already have an account? Sign in"
          : "Don't have an account? Sign up"}
      </div>
    </>
  );
}

export default AuthForm;
