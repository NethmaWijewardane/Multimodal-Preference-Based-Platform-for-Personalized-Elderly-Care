import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

const activitiesList = ["Walking","Cooking","Crafts","Reading","Gardening","Games","TV"];
const sriLankaCities = [
  "Colombo","Sri Jayawardenepura Kotte","Dehiwala-Mount Lavinia","Moratuwa",
  "Negombo","Kandy","Galle","Jaffna","Trincomalee","Batticaloa","Kalmunai",
  "Vavuniya","Anuradhapura","Matara","Ratnapura","Kurunegala","Puttalam",
  "Kalutara","Nuwara Eliya","Dambulla","Polonnaruwa","Badulla","Hambantota",
  "Matale"
];

function CaregiverDashboard() {
  const navigate = useNavigate();
  const [caregiver, setCaregiver] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [editMode, setEditMode] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [location, setLocation] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [experience, setExperience] = useState(3);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("loggedInCaregiver"));
    if (!data) navigate("/caregiver/signin");
    else {
      const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
      const caregiverRequests = allRequests[data.email] || [];

      const formattedRequests = caregiverRequests.map(r => ({
        elderlyName: r.name,
        elderlyEmail: r.email,
        sentAt: r.sentAt,
        status: r.status || "pending"
      }));

      const caregiverWithRequests = { 
        ...data, 
        requests: formattedRequests,
        experience: data.experience || 3
      };

      setCaregiver(caregiverWithRequests);
      setName(caregiverWithRequests.name || "");
      setEmail(caregiverWithRequests.email || "");
      setLocation(caregiverWithRequests.location || "");
      setSelectedActivities(caregiverWithRequests.activities || []);
      setProfilePic(caregiverWithRequests.profilePic || null);
      setExperience(caregiverWithRequests.experience || 3);

      const allFeedbacks = JSON.parse(localStorage.getItem("caregiverFeedbacks")) || {};
      setFeedbacks(allFeedbacks[data.email] || []);
    }
  }, [navigate]);

  const toggleActivity = (activity) => {
    setSelectedActivities(prev => prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]);
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
      experience 
    };
    setCaregiver(updatedCaregiver);
    localStorage.setItem("loggedInCaregiver", JSON.stringify(updatedCaregiver));

    const allCaregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
    const updatedCaregivers = allCaregivers.map(cg => cg.email === caregiver.email ? updatedCaregiver : cg);
    localStorage.setItem("caregivers", JSON.stringify(updatedCaregivers));

    setEditMode(false);
  };

  const handleDeleteProfilePic = () => {
    setProfilePic(null);
    const updatedCaregiver = { ...caregiver, profilePic: null };
    setCaregiver(updatedCaregiver);
    localStorage.setItem("loggedInCaregiver", JSON.stringify(updatedCaregiver));
  };

  const handleDeleteProfile = () => {
    if (window.confirm("Are you sure you want to delete your profile? This cannot be undone.")) {
      const allCaregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
      const updatedCaregivers = allCaregivers.filter(cg => cg.email !== caregiver.email);
      localStorage.setItem("caregivers", JSON.stringify(updatedCaregivers));
      localStorage.removeItem("loggedInCaregiver");
      navigate("/caregiver/signin");
    }
  };

  const handleRequestAction = (index, action) => {
    const updatedRequests = [...(caregiver.requests || [])];
    updatedRequests[index].status = action;

    const updatedCaregiver = { ...caregiver, requests: updatedRequests };
    setCaregiver(updatedCaregiver);
    localStorage.setItem("loggedInCaregiver", JSON.stringify(updatedCaregiver));

    const allCaregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
    const updatedCaregivers = allCaregivers.map(cg => cg.email === caregiver.email ? updatedCaregiver : cg);
    localStorage.setItem("caregivers", JSON.stringify(updatedCaregivers));

    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    const caregiverRequests = allRequests[caregiver.email] || [];
    caregiverRequests[index].status = action;
    allRequests[caregiver.email] = caregiverRequests;
    localStorage.setItem("caregiverRequests", JSON.stringify(allRequests));
  };

  const avgRating = feedbacks.length
    ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
    : null;

  if (!caregiver) return null;

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {profilePic && <img src={profilePic} alt="Profile" className="profile-image" />}
          <div>
            <h2>Caregiver Dashboard</h2>
            <p>Welcome, <strong>{caregiver.name}</strong></p>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>

      <div className="dashboard-tabs">
        <button className={activeTab === "profile" ? "active" : ""} onClick={() => setActiveTab("profile")}>Profile</button>
        <button className={activeTab === "requests" ? "active" : ""} onClick={() => setActiveTab("requests")}>Requests</button>
      </div>

      {activeTab === "profile" && (
        <div className="profile-card">
          {!editMode ? (
            <>
              <h3>Profile Details</h3>
              <p><strong>Name:</strong> {caregiver.name}</p>
              <p><strong>Email:</strong> {caregiver.email}</p>
              <p><strong>Location:</strong> {caregiver.location}</p>
              <p><strong>Experience:</strong> {caregiver.experience} years</p>
              <p><strong>Activities:</strong> {caregiver.activities && caregiver.activities.length ? caregiver.activities.join(", ") : "Not specified"}</p>
              {avgRating && <p>⭐ Average Rating: {avgRating} / 5 ({feedbacks.length} feedbacks)</p>}

              {/* Feedback section with requested order */}
              {feedbacks.length > 0 && (
                <div style={{ marginTop: "12px" }}>
                  <p style={{ textDecoration: "underline", margin: "0" }}>Feedbacks about the Services</p>
                  {feedbacks.map((f, idx) => (
                    <div key={idx} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>
                      <p><strong>Elderly person's name:</strong> {f.from}</p>
                      <p><strong>Feedback:</strong> {f.feedback}</p>
                      <p><strong>Rating:</strong> ⭐ {f.rating} / 5</p>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                <button className="delete-btn" onClick={handleDeleteProfile} style={{ background: "#e74c3c", color: "#fff" }}>Delete Profile</button>
              </div>
            </>
          ) : (
            <>
              <h3>Edit Profile</h3>
              <div className="form-group">
                <label>Profile Picture</label>
                <input type="file" accept="image/*" onChange={e => {
                  const file = e.target.files[0];
                  if (file) setProfilePic(URL.createObjectURL(file));
                }} />
                {profilePic && (
                  <>
                    <img src={profilePic} alt="Preview" className="profile-image-preview" />
                    <button type="button" className="delete-btn" onClick={handleDeleteProfilePic}>Delete Picture</button>
                  </>
                )}
              </div>
              <div className="form-group"><label>Name</label><input value={name} onChange={e => setName(e.target.value)} /></div>
              <div className="form-group"><label>Email</label><input value={email} onChange={e => setEmail(e.target.value)} /></div>
              <div className="form-group"><label>Location</label>
                <select value={location} onChange={e => setLocation(e.target.value)}>
                  <option value="">Select your city</option>
                  {sriLankaCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Experience (Years)</label>
                <input type="number" min="1" max="50" value={experience} onChange={e => setExperience(Number(e.target.value))} />
              </div>
              <div className="filter-section">
                <label>Activities</label>
                <div className="checkbox-grid">
                  {activitiesList.map(a => (
                    <label key={a}>
                      <input type="checkbox" checked={selectedActivities.includes(a)} onChange={() => toggleActivity(a)} />
                      {a}
                    </label>
                  ))}
                </div>
              </div>
              <button className="save-btn" onClick={handleSaveProfile}>Save Changes</button>
              <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
            </>
          )}
        </div>
      )}

      {activeTab === "requests" && (
        <div className="profile-card">
          <h3>Requests</h3>
          {(!caregiver.requests || caregiver.requests.length === 0) && <p>No requests yet.</p>}
          {caregiver.requests && caregiver.requests.map((req, index) => (
            <div key={index} style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
              <p><strong>{req.elderlyName}</strong> - Status: {req.status}</p>
              {req.status === "pending" && (
                <div>
                  <button onClick={() => handleRequestAction(index, "accepted")} style={{ marginRight: "8px" }}>Accept</button>
                  <button onClick={() => handleRequestAction(index, "declined")}>Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CaregiverDashboard;
