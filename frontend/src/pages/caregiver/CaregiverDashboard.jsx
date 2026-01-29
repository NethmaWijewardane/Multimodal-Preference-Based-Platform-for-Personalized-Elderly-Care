import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const activitiesList = [
  "Walking",
  "Cooking",
  "Crafts",
  "Reading",
  "Gardening",
  "Games",
  "TV",
];

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

function CaregiverDashboard() {
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  // Editable fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [profilePic, setProfilePic] = useState(null);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("loggedInCaregiver"));
    if (!data) navigate("/caregiver/signin");

    setCaregiver(data);
    if (data) {
      setName(data.name || "");
      setEmail(data.email || "");
      setLocation(data.location || "");
      setSelectedActivities(data.activities || []);
      setProfilePic(data.profilePic || null);
    }
  }, [navigate]);

  const toggleActivity = (activity) => {
    setSelectedActivities((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInCaregiver");
    navigate("/caregiver/signin");
  };

  const handleSaveProfile = () => {
    const updatedCaregiver = {
      ...caregiver,
      name,
      email,
      location,
      activities: selectedActivities,
      profilePic,
    };
    localStorage.setItem("loggedInCaregiver", JSON.stringify(updatedCaregiver));
    setCaregiver(updatedCaregiver);
    setEditMode(false);
  };

  if (!caregiver) return null;

  return (
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {profilePic && (
            <img
              src={profilePic}
              alt="Profile"
              className="profile-image"
            />
          )}
          <div>
            <h2>Caregiver Dashboard</h2>
            <p>
              Welcome, <strong>{caregiver.name}</strong>
            </p>
          </div>
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

      {/* PROFILE TAB */}
      {activeTab === "profile" && (
        <div className="profile-card">
          {!editMode ? (
            <>
              <h3>Profile Details</h3>
              <p><strong>Name:</strong> {caregiver.name}</p>
              <p><strong>Email:</strong> {caregiver.email}</p>
              <p><strong>Location:</strong> {caregiver.location}</p>
              <p><strong>Activities:</strong> {caregiver.activities.join(", ")}</p>

              <button className="edit-btn" onClick={() => setEditMode(true)}>
                Edit Profile
              </button>
            </>
          ) : (
            <>
              <h3>Edit Profile</h3>

              <div className="form-group">
                <label>Profile Picture</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) setProfilePic(URL.createObjectURL(file));
                  }}
                />
                {profilePic && (
                  <img
                    src={profilePic}
                    alt="Preview"
                    className="profile-image-preview"
                  />
                )}
              </div>

              <div className="form-group">
                <label>Name</label>
                <input value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>

              <div className="form-group">
                <label>Location</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select your city</option>
                  {sriLankaCities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-section">
                <label>Activities</label>
                <div className="checkbox-grid">
                  {activitiesList.map((activity) => (
                    <label key={activity}>
                      <input
                        type="checkbox"
                        checked={selectedActivities.includes(activity)}
                        onChange={() => toggleActivity(activity)}
                      />
                      {activity}
                    </label>
                  ))}
                </div>
              </div>

              <button className="save-btn" onClick={handleSaveProfile}>
                Save Changes
              </button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </>
          )}
        </div>
      )}

      {/* REQUESTS TAB */}
      {activeTab === "requests" && (
        <div className="profile-card">
          <h3>Requests</h3>
          <p>Requests feature will be added next.</p>
        </div>
      )}
    </div>
  );
}

export default CaregiverDashboard;
