import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const sriLankaCities = [
  "Colombo","Sri Jayawardenepura Kotte","Dehiwala-Mount Lavinia","Moratuwa",
  "Negombo","Kandy","Galle","Jaffna","Trincomalee","Batticaloa",
  "Kalmunai","Vavuniya","Anuradhapura","Matara","Ratnapura","Kurunegala",
  "Puttalam","Kalutara","Nuwara Eliya","Dambulla","Polonnaruwa",
  "Badulla","Hambantota","Matale",
];

const activitiesList = ["Walking","Cooking","Crafts","Reading","Gardening","Games","TV"];

function FindCaregiver() {
  const navigate = useNavigate();
  const params = useParams();

  const [elderlyName, setElderlyName] = useState("");
  const [elderlyEmail, setElderlyEmail] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState({});

  const [languageFilters, setLanguageFilters] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState("");
  const [activityFilters, setActivityFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [maxRate, setMaxRate] = useState(2000);
  const [minPatience, setMinPatience] = useState(1);

  const [feedbackPanelOpen, setFeedbackPanelOpen] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);

  const loadCaregivers = () => {
    const storedCaregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
    const enrichedCaregivers = storedCaregivers.map((cg) => ({
      ...cg,
      languages: cg.languages || ["English"],
      activities: cg.activities || ["Walking","Reading"],
      rate: cg.hourlyRate || 800,
      experience: cg.experience || "3 years",
      patience: cg.patience || 3,
      phone: cg.phone || "",
      workingHours: cg.workingHours || "Not specified"
    }));
    setCaregivers(enrichedCaregivers);
    setFilteredCaregivers(enrichedCaregivers);
  };

  useEffect(() => {
    const elderlyUser = JSON.parse(localStorage.getItem("elderlyUser"));
    if (elderlyUser && elderlyUser.name && elderlyUser.email) {
      setElderlyName(elderlyUser.name);
      setElderlyEmail(elderlyUser.email);
    } else {
      alert("Elderly user data not found! Please login again.");
      navigate("/elderly/signin");
    }

    loadCaregivers();
  }, [navigate]);

  useEffect(() => {
    let result = caregivers;

    if (languageFilters.length > 0) {
      result = result.filter((cg) => languageFilters.some((lang) => cg.languages.includes(lang)));
    }
    if (experienceFilter) {
      result = result.filter((cg) => parseInt(cg.experience) === parseInt(experienceFilter));
    }
    if (activityFilters.length > 0) {
      result = result.filter((cg) => activityFilters.some((act) => cg.activities.includes(act)));
    }
    if (locationFilters.length > 0) {
      result = result.filter((cg) => locationFilters.includes(cg.location));
    }
    result = result.filter((cg) => cg.rate <= maxRate);
    result = result.filter((cg) => (cg.patience || 1) >= minPatience);

    setFilteredCaregivers(result);
  }, [caregivers, languageFilters, experienceFilter, activityFilters, locationFilters, maxRate, minPatience]);

  useEffect(() => {
    const interval = setInterval(() => {
      const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
      const statuses = {};
      caregivers.forEach(cg => {
        const requests = allRequests[cg.email] || [];
        const userRequests = requests.filter(r => r.email === elderlyEmail);
        if (userRequests.length > 0) {
          const latestRequest = userRequests.sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt))[0];
          statuses[cg.email] = latestRequest.status;
        }
      });
      setRequestStatuses(statuses);
    }, 1000);
    return () => clearInterval(interval);
  }, [caregivers, elderlyEmail]);

  const toggleFilter = (value, setFn) => {
    setFn(prev => prev.includes(value) ? prev.filter(v => v !== value) : [...prev, value]);
  };

  const handleLogout = () => {
    localStorage.removeItem("elderlyUser");
    navigate("/elderly/signin");
  };

  const sendRequest = (caregiver) => {
    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    const caregiverEmail = caregiver.email;

    if (!allRequests[caregiverEmail]) allRequests[caregiverEmail] = [];

    allRequests[caregiverEmail].push({
      name: elderlyName,
      email: elderlyEmail,
      caregiverName: caregiver.name,
      sentAt: new Date().toISOString(),
      status: "pending",
    });

    localStorage.setItem("caregiverRequests", JSON.stringify(allRequests));
    setRequestStatuses(prev => ({ ...prev, [caregiverEmail]: "pending" }));
    alert(`Request sent to ${caregiver.name}`);
  };

  const updateRequestStatus = (caregiverEmail, newStatus) => {
    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    if (!allRequests[caregiverEmail]) return;

    allRequests[caregiverEmail] = allRequests[caregiverEmail].map(r => {
      if (r.email === elderlyEmail && r.status === "pending") {
        return { ...r, status: newStatus };
      }
      return r;
    });

    localStorage.setItem("caregiverRequests", JSON.stringify(allRequests));
    setRequestStatuses(prev => ({ ...prev, [caregiverEmail]: newStatus }));
  };

  const getStatusForProfile = (cgEmail) => {
    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    const requests = allRequests[cgEmail] || [];
    const userRequests = requests.filter(r => r.email === elderlyEmail);
    if (userRequests.length === 0) return null;
    const latestRequest = userRequests.sort((a,b)=> new Date(b.sentAt) - new Date(a.sentAt))[0];
    return latestRequest.status;
  };

  const handleSubmitFeedback = (cgEmail) => {
    if (!feedbackText || feedbackRating === 0) {
      alert("Please provide a rating and feedback");
      return;
    }

    const allFeedbacks = JSON.parse(localStorage.getItem("caregiverFeedbacks")) || {};
    if (!allFeedbacks[cgEmail]) allFeedbacks[cgEmail] = [];

    allFeedbacks[cgEmail].push({
      from: elderlyName,
      email: elderlyEmail,
      rating: feedbackRating,
      feedback: feedbackText,
      createdAt: new Date().toISOString(),
    });
    localStorage.setItem("caregiverFeedbacks", JSON.stringify(allFeedbacks));

    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    if (allRequests[cgEmail]) {
      allRequests[cgEmail] = allRequests[cgEmail].map(r => {
        if (r.email === elderlyEmail && r.status === "accepted") {
          return { ...r, status: "completed" };
        }
        return r;
      });
    }
    localStorage.setItem("caregiverRequests", JSON.stringify(allRequests));

    setFeedbackPanelOpen(null);
    setFeedbackText("");
    setFeedbackRating(0);
    alert("Feedback submitted successfully");
  };

  const getFeedbacks = (cgEmail) => {
    const allFeedbacks = JSON.parse(localStorage.getItem("caregiverFeedbacks")) || {};
    return allFeedbacks[cgEmail] || [];
  };

  const getAllServiceHistory = () => {
    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    let history = [];

    Object.keys(allRequests).forEach(cgEmail => {
      allRequests[cgEmail].forEach(r => {
        if (r.email === elderlyEmail) {
          history.push({
            caregiverEmail: cgEmail,
            caregiverName: r.caregiverName,
            sentAt: r.sentAt,
            status: r.status
          });
        }
      });
    });

    history.sort((a,b) => new Date(b.sentAt) - new Date(a.sentAt));
    return history;
  };

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2>Find a Caregiver</h2>
        <div style={{ display: "flex", alignItems: "center" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "4px",
              padding: "8px 12px",
              borderRadius: "8px",
              border: "1px solid #ccc",
              cursor: "pointer",
            }}
          >
            Logout <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <p style={{ marginBottom: "24px" }}>Welcome, {elderlyName}</p>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* Filters */}
        <div style={{ width: "280px", padding: "16px", border: "1px solid #e5e7eb", borderRadius:"12px", height:"fit-content" }}>
          <h3>Filters</h3>
          <p><strong>Languages</strong></p>
          {["Sinhala","English","Tamil"].map(lang => (
            <div key={lang}><input type="checkbox" onChange={() => toggleFilter(lang,setLanguageFilters)} /> {lang}</div>
          ))}

          <p style={{marginTop:"16px"}}><strong>Experience (Years)</strong></p>
          <select value={experienceFilter} onChange={(e)=>setExperienceFilter(e.target.value)} style={{width:"100%",padding:"4px"}}>
            <option value="">Any</option>
            {[...Array(10)].map((_,i)=> <option key={i+1} value={i+1}>{i+1} years</option>)}
          </select>

          <p style={{marginTop:"16px"}}><strong>Activities</strong></p>
          {activitiesList.map(act => (
            <div key={act}><input type="checkbox" onChange={()=>toggleFilter(act,setActivityFilters)} /> {act}</div>
          ))}

          <p style={{marginTop:"16px"}}><strong>Locations</strong></p>
          <div style={{maxHeight:"160px",overflowY:"auto"}}>
            {sriLankaCities.map(city=>(<div key={city}><input type="checkbox" onChange={()=>toggleFilter(city,setLocationFilters)} /> {city}</div>))}
          </div>

          <p style={{marginTop:"16px"}}><strong>Max Hourly Rate: Rs. {maxRate}</strong></p>
          <input type="range" min="500" max="3000" step="100" value={maxRate} onChange={(e)=>setMaxRate(Number(e.target.value))} style={{width:"100%"}} />

          <p style={{marginTop:"16px"}}><strong>Min Patience Level: {minPatience}/5</strong></p>
          <input type="range" min="1" max="5" step="1" value={minPatience} onChange={(e)=>setMinPatience(Number(e.target.value))} style={{width:"100%"}} />
        </div>

        {/* Caregiver List */}
        <div style={{flex:1}}>
          <h2>{filteredCaregivers.length} Caregiver(s) Found</h2>
          {filteredCaregivers.map((cg,index)=>{
            const status = getStatusForProfile(cg.email);
            const feedbacks = getFeedbacks(cg.email);
            const avgRating = feedbacks.length ? (feedbacks.reduce((sum,f)=>sum+f.rating,0)/feedbacks.length).toFixed(1) : null;

            return (
              <div key={index} style={{marginTop:"16px"}}>

                {/* Profile Card */}
                <div style={{padding:"16px",border:"1px solid #e5e7eb",borderRadius:"12px"}}>
                  <h3>{cg.name || "Caregiver"}</h3>
                  <p>📍Location: {cg.location}</p>
                  <p>📞Phone: {cg.phone || "Not provided"}</p>
                  <p>🕒Experience: {cg.experience}</p>
                  <p>🕰 Working Hour(s): {cg.workingHours}</p>
                  <p>💬Languages: {cg.languages.join(", ")}</p>
                  <p>🧩Activities: {cg.activities.join(", ")}</p>
                  <p>💰Cost per Hour: Rs. {cg.rate}/hr</p>
                  <p>🕊 Patience Level: {cg.patience}/5</p>
                  {avgRating && <p>⭐ Average Rating: {avgRating} / 5 ({feedbacks.length} feedbacks)</p>}

                  <div style={{marginTop:"12px"}}>
                    <button style={{marginRight:"12px"}} onClick={()=>navigate(`/elderly/caregiver/${cg.email}`)}>View Profile</button>
                    <button onClick={()=>sendRequest(cg)} style={{marginRight:"8px"}}>Send Request</button>
                    {status && <span style={{marginLeft:"8px"}}>Current Status: {status}</span>}
                    {status === "accepted" && <button onClick={()=>setFeedbackPanelOpen(cg.email)} style={{marginLeft:"8px"}}>Give Feedback</button>}
                  </div>

                  {feedbackPanelOpen === cg.email && (
                    <div style={{marginTop:"12px",padding:"12px",border:"1px solid #ccc",borderRadius:"8px"}}>
                      <textarea placeholder="Write your feedback..." value={feedbackText} onChange={(e)=>setFeedbackText(e.target.value)} style={{width:"100%",marginBottom:"8px",padding:"8px"}} />
                      <div style={{marginBottom:"8px"}}>
                        {Array.from({length:5},(_,i)=>(<span key={i} style={{fontSize:"20px",cursor:"pointer",color: feedbackRating>i ? "#f39c12" : "#ccc"}} onClick={()=>setFeedbackRating(i+1)}>★</span>))}
                      </div>
                      <button onClick={()=>handleSubmitFeedback(cg.email)}>Submit Feedback</button>
                      <button onClick={()=>setFeedbackPanelOpen(null)} style={{marginLeft:"8px"}}>Cancel</button>
                    </div>
                  )}
                </div>

                {feedbacks.length > 0 && (
                  <div style={{marginTop:"12px",padding:"16px",border:"1px solid #e5e7eb",borderRadius:"12px"}}>
                    <p style={{fontWeight:"bold",textDecoration:"underline"}}>Feedbacks About Services</p>
                    {feedbacks.map((f,idx)=>(<div key={idx} style={{padding:"6px 0",borderBottom:"1px solid #eee"}}>
                      <p><strong>Name:</strong> {f.from}</p>
                      <p><strong>Feedback:</strong> {f.feedback}</p>
                      <p><strong>Rating:</strong> ⭐ {f.rating}/5</p>
                    </div>))}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Service History */}
        <div style={{width:"280px",padding:"16px",border:"1px solid #e5e7eb",borderRadius:"12px",height:"fit-content"}}>
          <h3>Service History</h3>
          {getAllServiceHistory().length === 0 && <p>No service history yet.</p>}
          {getAllServiceHistory().map((s, idx) => (
            <div key={idx} style={{marginBottom:"12px",padding:"8px",border:"1px solid #ccc",borderRadius:"8px"}}>
              <p style={{fontWeight:"bold"}}>Service {idx+1}</p>
              <p><strong>Caregiver Name:</strong> {s.caregiverName}</p>
              <p><strong>Status:</strong> {s.status}</p>
              <p><strong>Date & Time:</strong> {new Date(s.sentAt).toLocaleString()}</p>

              {/* Simulate caregiver actions for testing */}
              {s.status === "pending" && (
                <div style={{marginTop:"8px"}}>
                  <button onClick={() => updateRequestStatus(s.caregiverEmail, "accepted")} style={{marginRight:"8px"}}>Accept</button>
                  <button onClick={() => updateRequestStatus(s.caregiverEmail, "declined")}>Decline</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FindCaregiver;
