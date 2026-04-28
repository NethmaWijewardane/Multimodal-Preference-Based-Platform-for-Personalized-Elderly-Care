import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/dashboard.css";

const activitiesList = [
  "Walking", "Cooking", "Crafts", "Reading", "Gardening", "Games", "TV"
];

const sriLankaCities = [
  "Colombo","Sri Jayawardenepura Kotte","Dehiwala-Mount Lavinia","Moratuwa",
  "Negombo","Kandy","Galle","Jaffna","Trincomalee","Batticaloa",
  "Kalmunai","Vavuniya","Anuradhapura","Matara","Ratnapura","Kurunegala",
  "Puttalam","Kalutara","Nuwara Eliya","Dambulla","Polonnaruwa",
  "Badulla","Hambantota","Matale"
];

const languagesList = ["Sinhala", "English", "Tamil"];

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
  const [selectedLanguages, setSelectedLanguages] = useState([]);

  const [profileImage, setProfileImage] = useState(null);

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
        setSelectedLanguages(data.languages || []);
        setProfileImage(data.profileImage || null);

      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/caregiver/signin");
        }
      }
    };

    fetchUser();
  }, [navigate]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setProfileImage(null);
  };

  const toggleActivity = (act) => {
    setSelectedActivities(prev =>
      prev.includes(act)
        ? prev.filter(a => a !== act)
        : [...prev, act]
    );
  };

  const toggleLanguage = (lang) => {
    setSelectedLanguages(prev =>
      prev.includes(lang)
        ? prev.filter(l => l !== lang)
        : [...prev, lang]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/caregiver/signin");
  };

  const handleSaveProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      const updated = {
        name,
        email,
        phone,
        location,
        workingHours,
        experience,
        patience,
        hourlyRate,
        activities: selectedActivities,
        languages: selectedLanguages,
        profileImage
      };

      const res = await axios.put(
        "http://localhost:5000/api/users/update-profile",
        updated,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedUser = res.data;

      setCaregiver(updatedUser);
      setName(updatedUser.name || "");
      setPhone(updatedUser.phone || "");
      setLocation(updatedUser.location || "");
      setWorkingHours(updatedUser.workingHours || "");
      setExperience(updatedUser.experience || 3);
      setPatience(updatedUser.patience || 3);
      setHourlyRate(updatedUser.hourlyRate || 1000);
      setSelectedActivities(updatedUser.activities || []);
      setSelectedLanguages(updatedUser.languages || []);
      setProfileImage(updatedUser.profileImage || null);

      setEditMode(false);
      alert("Profile updated successfully!");

    } catch (err) {
      console.error(err);
      alert("Failed to update profile");
    }
  };

  if (!caregiver) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">

      {/* ✅ FIXED HEADER ONLY */}
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>

          <img
            src={
              profileImage ||
              caregiver?.profileImage ||
              "https://via.placeholder.com/50"
            }
            alt="Profile"
            className="profile-image"
          />

          <div>
            <h2>Caregiver Dashboard</h2>
            <p>Welcome, <strong>{caregiver.name}</strong></p>
          </div>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>

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

      {activeTab === "profile" && (
        <div className="profile-card">

          {!editMode ? (
            <>
              {profileImage && (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="profile-image-preview"
                />
              )}

              <p><strong>Name:</strong> {caregiver.name}</p>
              <p><strong>Email:</strong> {caregiver.email}</p>
              <p><strong>Phone:</strong> {caregiver.phone}</p>
              <p><strong>Location:</strong> {caregiver.location}</p>
              <p><strong>Experience:</strong> {caregiver.experience} years</p>
              <p><strong>Patience:</strong> {caregiver.patience}/5</p>
              <p><strong>Hourly Rate:</strong> Rs. {caregiver.hourlyRate}</p>
              <p><strong>Working Hours:</strong> {caregiver.workingHours}</p>
              <p><strong>Activities:</strong> {caregiver.activities?.join(", ")}</p>
              <p><strong>Languages:</strong> {caregiver.languages?.join(", ")}</p>

              <button className="primary-btn" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            </>
          ) : (
            <div className="form-layout">

              <div className="form-group">
                <label>Profile Image</label>

                {profileImage && (
                  <img
                    src={profileImage}
                    alt="Preview"
                    className="profile-image-preview"
                  />
                )}

                <input type="file" accept="image/*" onChange={handleImageChange} />

                {profileImage && (
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={handleRemoveImage}
                  >
                    Remove Image
                  </button>
                )}
              </div>

              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />

              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />

              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                <option value="">Select Location</option>
                {sriLankaCities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>

              <label>Working Hours</label>
              <input
                placeholder="e.g., 9:00 AM - 5:00 PM"
                value={workingHours}
                onChange={(e) => setWorkingHours(e.target.value)}
              />

              <div className="slider-group">
                <label>Experience: {experience} years</label>
                <input type="range" min="1" max="10"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <label>Patience Level: {patience}</label>
                <input type="range" min="1" max="5"
                  value={patience}
                  onChange={(e) => setPatience(Number(e.target.value))}
                />
              </div>

              <div className="slider-group">
                <label>Hourly Rate: Rs. {hourlyRate}</label>
                <input type="range" min="500" max="2000" step="100"
                  value={hourlyRate}
                  onChange={(e) => setHourlyRate(Number(e.target.value))}
                />
              </div>

              <label>Activities</label>
              <div className="checkbox-group">
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

              <label>Languages</label>
              <div className="checkbox-group">
                {languagesList.map(lang => (
                  <label key={lang}>
                    <input
                      type="checkbox"
                      checked={selectedLanguages.includes(lang)}
                      onChange={() => toggleLanguage(lang)}
                    />
                    {lang}
                  </label>
                ))}
              </div>

              <div className="form-buttons">
                <button className="save-btn" onClick={handleSaveProfile}>
                  Save
                </button>
                <button className="cancel-btn" onClick={() => setEditMode(false)}>
                  Cancel
                </button>
              </div>

            </div>
          )}
        </div>
      )}

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