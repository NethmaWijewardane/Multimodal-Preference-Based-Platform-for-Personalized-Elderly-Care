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

  const [requests, setRequests] = useState([]);

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

        setWorkingHours(
          data.workingHours && typeof data.workingHours === "object"
            ? `${data.workingHours.start || ""} - ${data.workingHours.end || ""}`
            : data.workingHours || ""
        );

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

  const fetchRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(
        "http://localhost:5000/api/requests/caregiver",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setRequests(res.data);
    } catch (err) {
      console.error("Fetch requests error:", err);
    }
  };

  useEffect(() => {
    if (activeTab === "requests") {
      fetchRequests();
    }
  }, [activeTab]);

  const handleAccept = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/requests/${id}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDecline = async (id) => {
    try {
      const token = localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/requests/${id}/decline`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      fetchRequests();
    } catch (err) {
      console.error(err);
    }
  };

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

  const handleDeleteProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
        return;
      }

      await axios.delete(
        "http://localhost:5000/api/users/delete-profile",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      localStorage.removeItem("token");
      alert("Profile deleted successfully");
      navigate("/caregiver/signin");

    } catch (err) {
      console.error(err);
      alert("Failed to delete profile");
    }
  };

  const handleSaveProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const updated = {
      name,
      email,
      phone,
      location,
      workingHours: {
        start: workingHours.split("-")[0]?.trim() || "",
        end: workingHours.split("-")[1]?.trim() || ""
      },
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
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );

    console.log("UPDATE RESPONSE:", res.data);

    const updatedUser =
      res.data?.user ||
      res.data?.updatedUser ||
      res.data;

    if (!updatedUser || !updatedUser.name) {
      const refresh = await axios.get(
        "http://localhost:5000/api/auth/me",
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCaregiver(refresh.data);
    } else {
      setCaregiver(updatedUser);
    }

    setEditMode(false);

  } catch (err) {
    console.error("UPDATE ERROR:", err.response?.data || err.message);

    alert(
      err.response?.data?.message ||
      "Failed to update profile"
    );
  }
};

  if (!caregiver) return <p>Loading dashboard...</p>;

  return (
    <div className="dashboard-container">

      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <img
            src={profileImage || caregiver?.profileImage || "https://via.placeholder.com/50"}
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
        <div style={{ lineHeight: "1.8", marginBottom: "15px" }}>
          <h2><strong>Name:</strong> {caregiver.name}</h2>
          <p><b><strong>📞 Phone:</strong></b> {caregiver.phone}</p>
          <p><b><strong>📍 Location:</strong></b> {caregiver.location}</p>
          <p><b><strong>🧠 Experience:</strong></b> {caregiver.experience}</p>
          <p><b><strong>🗣 Languages:</strong></b> {caregiver.languages?.join(", ")}</p>
          <p><b><strong>🕊 Patience:</strong></b> {caregiver.patience}</p>
          <p><b><strong>💰 Hourly Rate:</strong></b> Rs. {caregiver.hourlyRate}</p>
          <p><b><strong>🎯 Activities:</strong></b> {caregiver.activities?.join(", ")}</p>
          <p>
            <b><strong>🕒 Working Hours:</strong></b>{" "}
            {typeof caregiver.workingHours === "object"
              ? `${caregiver.workingHours?.start || ""} - ${caregiver.workingHours?.end || ""}`
              : caregiver.workingHours}
          </p>
        </div>

        <div style={{ marginTop: "20px" }}>
          <button
            onClick={() => setEditMode(true)}
            style={{
              backgroundColor: "#add8e6",
              border: "none",
              padding: "8px 16px",
              marginRight: "12px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Edit Profile
          </button>

          <button
            onClick={handleDeleteProfile}
            style={{
              backgroundColor: "#f8b6b6",
              border: "none",
              padding: "8px 16px",
              borderRadius: "6px",
              cursor: "pointer"
            }}
          >
            Delete Profile
          </button>
        </div>
      </>
    ) : (
            <div className="form-layout">

              <h3>Edit Profile</h3>

              <div style={{ textAlign: "center", marginBottom: "20px" }}>
                <img
                  src={profileImage || caregiver?.profileImage || "https://via.placeholder.com/120"}
                  alt="Profile"
                  style={{
                    width: "120px",
                    height: "120px",
                    borderRadius: "50%",
                    objectFit: "cover"
                  }}
                />
                <br />
                <input type="file" onChange={handleImageChange} />
                {profileImage && (
                  <button onClick={handleRemoveImage}>Remove Image</button>
                )}
              </div>

              <label>Full Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} />

              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />

              <label>Location</label>
              <select value={location} onChange={(e) => setLocation(e.target.value)}>
                {sriLankaCities.map(c => (
                  <option key={c}>{c}</option>
                ))}
              </select>

              <label>Experience</label>
              <select value={experience} onChange={(e) => setExperience(Number(e.target.value))}>
                {[...Array(10)].map((_, i) => (
                  <option key={i+1} value={i+1}>{i+1} year</option>
                ))}
              </select>

              <label>Patience: {patience}</label>
              <input type="range" min="1" max="5"
                value={patience}
                onChange={(e) => setPatience(Number(e.target.value))}
              />

              <label>Hourly Rate: Rs. {hourlyRate}</label>
              <input type="range" min="500" max="3000"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
              />

              <label>Working Hours</label>
              <input value={workingHours} onChange={(e) => setWorkingHours(e.target.value)} />

              <label>Activities</label>
              {activitiesList.map(a => (
                <label key={a}>
                  <input
                    type="checkbox"
                    checked={selectedActivities.includes(a)}
                    onChange={() => toggleActivity(a)}
                  />
                  {a}
                </label>
              ))}

              <label>Languages</label>
              {languagesList.map(l => (
                <label key={l}>
                  <input
                    type="checkbox"
                    checked={selectedLanguages.includes(l)}
                    onChange={() => toggleLanguage(l)}
                  />
                  {l}
                </label>
              ))}

              <button
                onClick={handleSaveProfile}
                style={{
                  backgroundColor: "#cce6ff",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Save
              </button>

              <button
                onClick={() => setEditMode(false)}
                style={{
                  backgroundColor: "#ffd6d6",
                  border: "none",
                  padding: "8px 14px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                Cancel
              </button>

            </div>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="profile-card">
          <h3>Requests</h3>

          {requests.length === 0 ? (
            <p>No requests found</p>
          ) : (
            requests.map((req) => (
              <div key={req._id} style={{ padding: "10px", borderBottom: "1px solid #ddd" }}>
                <p><strong>Service Number:</strong> {req.serviceNumber}</p>
                <p><strong>Date:</strong> {req.requestDate}</p>
                <p><strong>Time:</strong> {req.requestTime}</p>
                <p><strong>Status:</strong> {req.status}</p>

                <button
                  onClick={() => handleAccept(req._id)}
                  style={{
                    backgroundColor: "#add8e6",
                    border: "none",
                    padding: "6px 12px",
                    marginRight: "10px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Accept
                </button>

                <button
                  onClick={() => handleDecline(req._id)}
                  style={{
                    backgroundColor: "#f8b6b6",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "5px",
                    cursor: "pointer"
                  }}
                >
                  Decline
                </button>
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
}

export default CaregiverDashboard;