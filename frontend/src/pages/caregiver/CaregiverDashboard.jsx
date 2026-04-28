import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/dashboard.css";

const activitiesList = [
  "Walking","Cooking","Crafts","Reading","Gardening","Games","TV"
];

const sriLankaCities = [
  "Colombo","Sri Jayawardenepura Kotte","Dehiwala-Mount Lavinia","Moratuwa",
  "Negombo","Kandy","Galle","Jaffna","Trincomalee","Batticaloa",
  "Kalmunai","Vavuniya","Anuradhapura","Matara","Ratnapura","Kurunegala",
  "Puttalam","Kalutara","Nuwara Eliya","Dambulla","Polonnaruwa",
  "Badulla","Hambantota","Matale"
];

function CaregiverDashboard() {
  const navigate = useNavigate();

  const [caregiver, setCaregiver] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [workingHours, setWorkingHours] = useState("");
  const [experience, setExperience] = useState(3);
  const [patience, setPatience] = useState(3);
  const [hourlyRate, setHourlyRate] = useState(1000);
  const [selectedActivities, setSelectedActivities] = useState([]);

  /* ---------------- JWT LOAD ---------------- */
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/caregiver/signin");
        return;
      }

      try {
        const res = await axios.get(
          "http://localhost:5000/api/auth/me",
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const data = res.data;

        setCaregiver(data);
        setName(data.name || "");
        setEmail(data.email || "");
        setPhone(data.phone || "");
        setLocation(data.location || "");
        setWorkingHours(data.workingHours || "");
        setExperience(data.experience || 3);
        setPatience(data.patience || 3);
        setHourlyRate(data.hourlyRate || 1000);
        setSelectedActivities(data.activities || []);

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/caregiver/signin");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  /* ---------------- TOGGLE ACTIVITY ---------------- */
  const toggleActivity = (act) => {
    setSelectedActivities(prev =>
      prev.includes(act)
        ? prev.filter(a => a !== act)
        : [...prev, act]
    );
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/caregiver/signin");
  };

  /* ---------------- SAVE PROFILE ---------------- */
  const handleSaveProfile = () => {
    const updated = {
      ...caregiver,
      name,
      email,
      phone,
      location,
      workingHours,
      experience,
      patience,
      hourlyRate,
      activities: selectedActivities
    };

    setCaregiver(updated);
    setEditMode(false);
  };

  if (!caregiver) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">

      {/* HEADER */}
      <div className="dashboard-header">
        <div>
          <h2>Caregiver Dashboard</h2>
          <p>Welcome, <strong>{caregiver.name}</strong></p>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

      {/* TABS */}
      <div className="dashboard-tabs">
        <button
          className={activeTab === "profile" ? "active" : ""}
          onClick={() => setActiveTab("profile")}
        >
          Profile
        </button>

        <button
          className={activeTab === "requests" ? "active" : ""}
          onClick={() => setActiveTab("requests")}
        >
          Requests
        </button>
      </div>

      {/* ================= PROFILE ================= */}
      {activeTab === "profile" && (
        <div className="profile-card">

          {!editMode ? (
            <>
              <p><strong>Name:</strong> {caregiver.name}</p>
              <p><strong>Email:</strong> {caregiver.email}</p>
              <p><strong>Phone:</strong> {caregiver.phone}</p>
              <p><strong>Location:</strong> {caregiver.location}</p>
              <p><strong>Experience:</strong> {caregiver.experience} years</p>
              <p><strong>Patience:</strong> {caregiver.patience}/5</p>
              <p><strong>Hourly Rate:</strong> Rs. {caregiver.hourlyRate}</p>
              <p><strong>Working Hours:</strong> {caregiver.workingHours}</p>
              <p><strong>Activities:</strong> {caregiver.activities?.join(", ")}</p>

              <button onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" />

              {/* Location */}
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Select Location</option>
                {sriLankaCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} placeholder="Working Hours" />

              {/* EXPERIENCE */}
              <label>Experience: {experience} years</label>
              <input type="range" min="1" max="10" value={experience}
                onChange={(e) => setExperience(Number(e.target.value))} />

              {/* PATIENCE */}
              <label>Patience: {patience}/5</label>
              <input type="range" min="1" max="5" value={patience}
                onChange={(e) => setPatience(Number(e.target.value))} />

              {/* RATE */}
              <label>Hourly Rate: Rs {hourlyRate}</label>
              <input type="range" min="500" max="5000" step="100"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))} />

              {/* ACTIVITIES */}
              <p><b>Activities</b></p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {activitiesList.map(act => (
                  <label key={act}>
                    <input
                      type="checkbox"
                      checked={selectedActivities.includes(act)}
                      onChange={() => toggleActivity(act)}
                    />
                    {act}
                  </label>
                ))}
              </div>

              <button onClick={handleSaveProfile}>Save</button>
              <button onClick={() => setEditMode(false)}>Cancel</button>
            </>
          )}
        </div>
      )}

      {/* ================= REQUESTS ================= */}
      {activeTab === "requests" && (
        <div className="profile-card">
          <h3>Requests</h3>
          <p>Requests will be loaded from backend.</p>
        </div>
      )}

    </div>
  );
}

export default CaregiverDashboard;