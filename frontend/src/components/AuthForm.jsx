import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart } from "lucide-react";
import "../styles/auth.css";

const sriLankaCities = [
  "Colombo","Sri Jayawardenepura Kotte","Dehiwala-Mount Lavinia","Moratuwa",
  "Negombo","Kandy","Galle","Jaffna","Trincomalee","Batticaloa","Kalmunai",
  "Vavuniya","Anuradhapura","Matara","Ratnapura","Kurunegala","Puttalam",
  "Kalutara","Nuwara Eliya","Dambulla","Polonnaruwa","Badulla","Hambantota",
  "Matale"
];

function AuthForm({ type = "signin", defaultRole = "elderly", onSuccess }) {
  const navigate = useNavigate();
  const isSignUp = type === "signup";

  const [activeTab, setActiveTab] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [locationValue, setLocationValue] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleTabClick = (role) => {
    setError("");
    setSuccess("");
    setActiveTab(role);
    navigate(isSignUp ? `/${role}/signup` : `/${role}/signin`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (!email.endsWith("@gmail.com")) {
      setError("Email must be a valid @gmail.com address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (isSignUp && !locationValue) {
      setError("Please select your location");
      return;
    }

    const userData = {
      name: name || email.split("@")[0],
      email,
      password,
      location: locationValue || "Colombo",
      token: "dummy-token",
    };

    /* ---------------- SIGN UP ---------------- */
    if (isSignUp) {
      if (activeTab === "caregiver") {
        const storedCaregivers =
          JSON.parse(localStorage.getItem("caregivers")) || [];

        storedCaregivers.push({
          ...userData,
          activities: [],
          languages: ["English"],
          rate: 800,
          experience: "1 year",
          profilePic: null,
        });

        localStorage.setItem("caregivers", JSON.stringify(storedCaregivers));
      }

      setSuccess("Account created successfully! Redirecting to Sign In...");
      setTimeout(() => {
        navigate(`/${activeTab}/signin`);
      }, 1000);

      return;
    }

    /* ---------------- SIGN IN ---------------- */
    if (activeTab === "caregiver") {
      const storedCaregivers =
        JSON.parse(localStorage.getItem("caregivers")) || [];

      const matchedUser = storedCaregivers.find(
        (u) => u.email === email && u.password === password
      );

      if (!matchedUser) {
        setError("Invalid email or password");
        return;
      }

      if (onSuccess) onSuccess(matchedUser);
      return;
    }

    /* ---------------- ELDERLY SIGN IN ---------------- */
    if (onSuccess) {
      onSuccess({
        name: email.split("@")[0],
        email,
        token: "dummy-token",
      });
    }
  };

  return (
    <>
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

      <form onSubmit={handleSubmit}>
        {isSignUp && (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-group">
              <label>Location</label>
              <select
                value={locationValue}
                onChange={(e) => setLocationValue(e.target.value)}
              >
                <option value="">Select your city</option>
                {sriLankaCities.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@gmail.com"
          />
        </div>

        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
          />
        </div>

        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <button className="auth-button" type="submit">
          {isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

      <div
        className="switch-link"
        onClick={() =>
          navigate(isSignUp
            ? `/${activeTab}/signin`
            : `/${activeTab}/signup`)
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
