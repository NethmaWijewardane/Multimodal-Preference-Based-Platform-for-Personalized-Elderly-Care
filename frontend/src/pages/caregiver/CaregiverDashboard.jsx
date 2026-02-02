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
  const [phone, setPhone] = useState(""); 
  const [location, setLocation] = useState("");
  const [selectedActivities, setSelectedActivities] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [experience, setExperience] = useState(3);
  const [feedbacks, setFeedbacks] = useState([]);
  const [patience, setPatience] = useState(3);
  const [workingHours, setWorkingHours] = useState(""); 
  const [hourlyRate, setHourlyRate] = useState(1000); 

  // Load caregiver and requests
  useEffect(() => {
    const data = JSON.parse(localStorage.getItem("loggedInCaregiver"));
    if (!data) {
      navigate("/caregiver/signin");
      return;
    }

    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    const caregiverRequests = allRequests[data.email] || [];

    const caregiverData = {
      ...data,
      requests: caregiverRequests.map(r => ({
        elderlyName: r.name || r.elderlyName || "Unknown",
        elderlyEmail: r.email || "",
        sentAt: r.sentAt || new Date().toISOString(),
        status: r.status || "pending",
      })),
      experience: data.experience || 3,
      patience: data.patience || 3,
      workingHours: data.workingHours || "",
      hourlyRate: data.hourlyRate || 1000,
    };

    setCaregiver(caregiverData);
    setName(caregiverData.name || "");
    setEmail(caregiverData.email || "");
    setPhone(caregiverData.phone || ""); 
    setLocation(caregiverData.location || "");
    setSelectedActivities(caregiverData.activities || []);
    setProfilePic(caregiverData.profilePic || null);
    setExperience(caregiverData.experience || 3);
    setPatience(caregiverData.patience || 3);
    setWorkingHours(caregiverData.workingHours || "");
    setHourlyRate(caregiverData.hourlyRate || 1000);

    const allFeedbacks = JSON.parse(localStorage.getItem("caregiverFeedbacks")) || {};
    setFeedbacks(allFeedbacks[caregiverData.email] || []);
  }, [navigate]);

  const toggleActivity = (activity) => {
    setSelectedActivities(prev => prev.includes(activity) ? prev.filter(a => a !== activity) : [...prev, activity]);
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInCaregiver");
    navigate("/caregiver/signin");
  };

  const handleSaveProfile = () => {
    if (!/^0\d{9}$/.test(phone)) {
      alert("Phone number must be 10 digits starting with 0.");
      return;
    }

    const updatedCaregiver = { 
      ...caregiver, 
      name, 
      email, 
      phone, 
      location, 
      activities: selectedActivities, 
      profilePic, 
      experience,
      patience,
      workingHours,
      hourlyRate
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

    updatedRequests[index] = {
      ...updatedRequests[index],
      status: action,
      name: updatedRequests[index].elderlyName,
      email: updatedRequests[index].elderlyEmail,
      caregiverName: caregiver.name,
      sentAt: updatedRequests[index].sentAt || new Date().toISOString(),
    };

    const updatedCaregiver = { ...caregiver, requests: updatedRequests };
    setCaregiver(updatedCaregiver);
    localStorage.setItem("loggedInCaregiver", JSON.stringify(updatedCaregiver));

    const allCaregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
    const updatedCaregivers = allCaregivers.map(cg => cg.email === caregiver.email ? updatedCaregiver : cg);
    localStorage.setItem("caregivers", JSON.stringify(updatedCaregivers));

    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    allRequests[caregiver.email] = updatedRequests;
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
        <>
          {!editMode ? (
            <div className="profile-card">
              <h3>Profile Details</h3>
              <p><strong>Name:</strong> {caregiver.name}</p>
              <p><strong>Email:</strong> {caregiver.email}</p>
              <p><strong>Phone:</strong> {caregiver.phone}</p>
              <p><strong>Location:</strong> {caregiver.location}</p>
              <p><strong>Experience:</strong> {caregiver.experience} years</p>
              <p><strong>Patience Level:</strong> {caregiver.patience}/5</p>
              <p><strong>Hourly Rate:</strong> Rs. {caregiver.hourlyRate}</p>
              <p><strong>Working Hour(s):</strong> {caregiver.workingHours || "Not specified"}</p>
              <p><strong>Activities:</strong> {caregiver.activities && caregiver.activities.length ? caregiver.activities.join(", ") : "Not specified"}</p>
              {avgRating && <p>⭐ Average Rating: {avgRating} / 5 ({feedbacks.length} feedbacks)</p>}

              <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
                <button className="edit-btn" onClick={() => setEditMode(true)}>Edit Profile</button>
                <button className="delete-btn" onClick={handleDeleteProfile} style={{ background: "#e74c3c", color: "#fff" }}>Delete Profile</button>
              </div>
            </div>
          ) : (
            <div className="profile-card">
              <h3>Edit Profile</h3>

              {/* Profile Picture */}
              <div style={{ marginBottom: "12px" }}>
                {profilePic ? (
                  <>
                    <img src={profilePic} alt="Profile" className="profile-image" />
                    <button type="button" onClick={handleDeleteProfilePic} style={{ marginLeft: "8px" }}>Delete Picture</button>
                  </>
                ) : (
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setProfilePic(reader.result);
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                )}
              </div>

              {/* Full Name */}
              <div className="form-group">
                <label>Full Name:</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                />
              </div>

              {/* Phone */}
              <div className="form-group">
                <label>Phone (10 digits starting with 0):</label>
                <input 
                  type="text" 
                  value={phone} 
                  maxLength={10}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/, ""))} 
                />
              </div>

              {/* Location Dropdown */}
              <div className="form-group">
                <label>Location:</label>
                <select value={location} onChange={(e) => setLocation(e.target.value)}>
                  <option value="">Select Location</option>
                  {sriLankaCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>

              {/* Experience Dropdown */}
              <div className="form-group">
                <label>Experience (Years):</label>
                <select value={experience} onChange={(e) => setExperience(Number(e.target.value))}>
                  {[...Array(10)].map((_, i) => (
                    <option key={i+1} value={i+1}>{i+1} year{ i > 0 ? "s" : ""}</option>
                  ))}
                </select>
              </div>

              {/* Patience Slider */}
              <div className="form-group">
                <label>Patience Level: {patience}</label>
                <input 
                  type="range" 
                  min={1} max={5} 
                  step={1} 
                  value={patience} 
                  onChange={(e) => setPatience(Number(e.target.value))} 
                />
              </div>

              {/* Hourly Rate Slider */}
              <div className="form-group">
                <label>Hourly Rate: Rs. {hourlyRate}</label>
                <input 
                  type="range" 
                  min={500} max={3000} 
                  step={50} 
                  value={hourlyRate} 
                  onChange={(e) => setHourlyRate(Number(e.target.value))} 
                />
              </div>

              {/* Working Hours */}
              <div className="form-group">
                <label>Working Hours:</label>
                <input 
                  type="text" 
                  value={workingHours} 
                  onChange={(e) => setWorkingHours(e.target.value)} 
                  placeholder="e.g., 9:00 AM - 5:00 PM"
                />
              </div>

              {/* Activities Checkboxes */}
              <div className="form-group">
                <label>Activities:</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {["TV", "Gardening", "Gaming", "Grocery Shopping", "Crafting", "Walking", "Reading", "Cooking"].map(act => (
                    <label key={act}>
                      <input 
                        type="checkbox" 
                        checked={selectedActivities.includes(act)} 
                        onChange={() => {
                          setSelectedActivities(prev => prev.includes(act) 
                            ? prev.filter(a => a !== act) 
                            : [...prev, act]
                          );
                        }} 
                      />
                      {act}
                    </label>
                  ))}
                </div>
              </div>

              {/* Languages Checkboxes */}
              <div className="form-group">
                <label>Languages:</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["English", "Sinhala", "Tamil"].map(lang => (
                    <label key={lang}>
                      <input 
                        type="checkbox" 
                        checked={caregiver.languages?.includes(lang)} 
                        onChange={() => {
                          const langs = caregiver.languages || [];
                          if (langs.includes(lang)) {
                            setCaregiver({...caregiver, languages: langs.filter(l => l !== lang)});
                          } else {
                            setCaregiver({...caregiver, languages: [...langs, lang]});
                          }
                        }} 
                      />
                      {lang}
                    </label>
                  ))}
                </div>
              </div>

              {/* Save & Cancel Buttons */}
              <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                <button className="save-btn" onClick={handleSaveProfile}>Save</button>
                <button className="cancel-btn" onClick={() => setEditMode(false)}>Cancel</button>
              </div>
            </div>
          )}

          {feedbacks.length > 0 && (
            <div className="profile-card" style={{ marginTop: "16px" }}>
              <p style={{ textDecoration: "underline", fontWeight: "bold" }}>Feedback(s) About the Services</p>
              {feedbacks.map((f, idx) => (
                <div key={idx} style={{ padding: "6px 0", borderBottom: "1px solid #eee" }}>
                  <p><strong>Elderly person's name:</strong> {f.from}</p>
                  <p><strong>Feedback:</strong> {f.feedback}</p>
                  <p><strong>Rating:</strong> ⭐ {f.rating} / 5</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "requests" && (
        <div className="profile-card">
          <h3>Requests</h3>
          {(!caregiver.requests || caregiver.requests.length === 0) && <p>No requests yet.</p>}
          {caregiver.requests && caregiver.requests.map((req, index) => {
            const requestDate = new Date(req.sentAt).toLocaleString();
            return (
              <div key={index} style={{ padding: "10px", borderBottom: "1px solid #ccc" }}>
                <p><strong>Elderly Person's Name:</strong> {req.elderlyName}</p>
                <p><strong>Status of the Request:</strong> {req.status}</p>
                <p><strong>Date & Time of Request:</strong> {requestDate}</p>
                {req.status === "pending" && (
                  <div>
                    <button onClick={() => handleRequestAction(index, "accepted")} style={{ marginRight: "8px" }}>Accept</button>
                    <button onClick={() => handleRequestAction(index, "declined")}>Decline</button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  );
}

export default CaregiverDashboard;
