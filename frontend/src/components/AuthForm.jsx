import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Heart } from "lucide-react";
import "../styles/auth.css";

const sriLankaCities = [
  "Colombo",
  "Sri Jayawardenepura Kotte",
  "Dehiwala-Mount Lavinia",
  "Moratuwa",
  "Negombo",
  "Kandy",
  "Galle",
  "Jaffna",
  "Trincomalee",
  "Batticaloa",
  "Kalmunai",
  "Vavuniya",
  "Anuradhapura",
  "Matara",
  "Ratnapura",
  "Kurunegala",
  "Puttalam",
  "Kalutara",
  "Nuwara Eliya",
  "Dambulla",
  "Polonnaruwa",
  "Badulla",
  "Hambantota",
  "Matale",
];

function AuthForm({ type = "signup", defaultRole = "elderly" }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState(defaultRole);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [location, setLocation] = useState("");
  const [error, setError] = useState("");

  const isSignUp = type === "signup";

  const handleTabClick = (role) => {
    setActiveTab(role);
    setError("");

    navigate(
      isSignUp
        ? role === "elderly"
          ? "/elderly/signup"
          : "/caregiver/signup"
        : role === "elderly"
        ? "/elderly/signin"
        : "/caregiver/signin"
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Basic validation
    if (!email.endsWith("@gmail.com")) {
      setError("Email must be a valid @gmail.com address");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    if (isSignUp && !location) {
      setError("Please select your location");
      return;
    }

    // -------------------
    // SIGN-UP FLOW
    // -------------------
    if (isSignUp) {
      const userData = { name, email, password, location, role: activeTab };

      // Caregiver signup → dashboard
      if (activeTab === "caregiver") {
        const caregiverData = { ...userData, activities: [] };
        localStorage.setItem("loggedInCaregiver", JSON.stringify(caregiverData));

        // Save all caregivers
        const caregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
        caregivers.push(caregiverData);
        localStorage.setItem("caregivers", JSON.stringify(caregivers));

        navigate("/caregiver/dashboard");
        return;
      }

      // Elderly signup → find caregiver page
      if (activeTab === "elderly") {
        const elderlyUsers = JSON.parse(localStorage.getItem("elderlyUsers")) || [];
        elderlyUsers.push(userData);
        localStorage.setItem("elderlyUsers", JSON.stringify(elderlyUsers));

        // Save current logged-in elderly
        localStorage.setItem("loggedInElderly", JSON.stringify(userData));

        navigate("/elderly/find-caregiver");
        return;
      }
    }

    // -------------------
    // SIGN-IN FLOW
    // -------------------
    if (!isSignUp) {
      // Caregiver signin
      if (activeTab === "caregiver") {
        const caregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
        const match = caregivers.find(
          (user) => user.email === email && user.password === password
        );
        if (match) {
          localStorage.setItem("loggedInCaregiver", JSON.stringify(match));
          navigate("/caregiver/dashboard");
        } else {
          setError("Invalid caregiver credentials");
        }
        return;
      }

      // Elderly signin
      if (activeTab === "elderly") {
        const elderlyUsers = JSON.parse(localStorage.getItem("elderlyUsers")) || [];
        const match = elderlyUsers.find(
          (user) => user.email === email && user.password === password
        );
        if (match) {
          localStorage.setItem("loggedInElderly", JSON.stringify(match));
          navigate("/elderly/find-caregiver");
        } else {
          setError("Invalid elderly credentials");
        }
        return;
      }
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

      <form onSubmit={handleSubmit}>
        {/* SIGN-UP FIELDS */}
        {isSignUp && (
          <>
            <div className="form-group">
              <label>Full Name</label>
              <input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Location for BOTH elderly and caregiver */}
            <div className="form-group">
              <label>Location</label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">Select your city</option>
                {sriLankaCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Minimum 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {/* SIGN-IN FIELDS */}
        {!isSignUp && (
          <>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </>
        )}

        {error && <p className="error-text">{error}</p>}

        <button className="auth-button" type="submit">
          {isSignUp ? "Create Account" : "Sign In"}
        </button>
      </form>

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
