import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

  const [elderlyName, setElderlyName] = useState("");
  const [elderlyEmail, setElderlyEmail] = useState("");

  const [caregivers, setCaregivers] = useState([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);

  const [languageFilters, setLanguageFilters] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState("");
  const [activityFilters, setActivityFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);

  const [maxRate, setMaxRate] = useState(2000);
  const [minPatience, setMinPatience] = useState(1);

  const [requests, setRequests] = useState([]);

  // ✅ FIXED ENDPOINT HERE
  const loadRequests = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch("http://localhost:5000/api/requests/my", {
        headers: { Authorization: `Bearer ${token}` }
      });

      const data = await res.json();

      // 🔥 FIX: prevent crash when backend returns 401 object
      if (!Array.isArray(data)) {
        console.error("Requests API error:", data);
        setRequests([]);
        return;
      }

      setRequests(data);

    } catch (err) {
      console.error("❌ Error loading requests:", err);
    }
  };

  const formatWorkingHours = (wh) => {
    if (!wh) return { start: "", end: "" };

    if (typeof wh === "string") {
      const parts = wh.split("-");
      return {
        start: parts[0]?.trim() || "",
        end: parts[1]?.trim() || ""
      };
    }

    return {
      start: wh.start || "",
      end: wh.end || ""
    };
  };

  const loadCaregivers = async () => {
    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch(
        "http://localhost:5000/api/users/caregivers",
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store"
        }
      );

      const data = await res.json();

      // 🔥 FIX: prevent crash when backend returns 401 object
      if (!Array.isArray(data)) {
        console.error("Caregivers API error:", data);
        setCaregivers([]);
        setFilteredCaregivers([]);
        return;
      }

      const enriched = data.map((cg) => ({
        ...cg,
        name: cg.name || "Unnamed Caregiver",
        location: cg.location || "Unknown",
        rate: cg.hourlyRate || 800,
        languages: cg.languages || [],
        activities: cg.activities || [],
        experience: cg.experience || 0,
        patience: cg.patience || 0,
        workingHours: formatWorkingHours(cg.workingHours)
      }));

      setCaregivers([...enriched]);
      setFilteredCaregivers([...enriched]);

    } catch (err) {
      console.error("❌ Error loading caregivers:", err);
    }
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("elderlyUser"));

    if (user) {
      setElderlyName(user.name);
      setElderlyEmail(user.email);
    } else {
      navigate("/elderly/signin");
    }

    loadCaregivers();
    loadRequests();

    const interval = setInterval(() => {
      loadCaregivers();
      loadRequests();
    }, 3000);

    const onFocus = () => {
      loadCaregivers();
      loadRequests();
    };

    window.addEventListener("focus", onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };

  }, [navigate]);

  useEffect(() => {
    let result = caregivers;

    if (languageFilters.length > 0) {
      result = result.filter((cg) =>
        languageFilters.some((l) => cg.languages.includes(l))
      );
    }

    if (experienceFilter) {
      result = result.filter((cg) =>
        parseInt(cg.experience) === parseInt(experienceFilter)
      );
    }

    if (activityFilters.length > 0) {
      result = result.filter((cg) =>
        activityFilters.some((a) => cg.activities.includes(a))
      );
    }

    if (locationFilters.length > 0) {
      result = result.filter((cg) =>
        locationFilters.includes(cg.location)
      );
    }

    result = result.filter((cg) => cg.rate <= maxRate);
    result = result.filter((cg) => (cg.patience || 1) >= minPatience);

    setFilteredCaregivers(result);

  }, [
    caregivers,
    languageFilters,
    experienceFilter,
    activityFilters,
    locationFilters,
    maxRate,
    minPatience
  ]);

  const toggleFilter = (value, setFn) => {
    setFn((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleSendRequest = async (cg) => {
    const now = new Date();

    try {
      const token = localStorage.getItem("token");

      if (!token) return;

      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          caregiverId: cg._id || cg.id,
          serviceNumber: requests.length + 1,
          requestDate: now.toLocaleDateString(),
          requestTime: now.toLocaleTimeString()
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to send request");
      }

      const newRequest = {
        serviceNumber: data.serviceNumber || requests.length + 1,
        name: cg.name,
        status: data.status || "pending",
        date: data.requestDate || now.toLocaleDateString(),
        time: data.requestTime || now.toLocaleTimeString()
      };

      setRequests((prev) => [...prev, newRequest]);

      alert(`Request sent to ${cg.name}`);

    } catch (err) {
      console.error("❌ Request error:", err);
      alert("Failed to send request. Check backend.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("elderlyUser");
    localStorage.removeItem("token");
    navigate("/elderly/signin");
  };

  return (
    <div style={{ padding: 24 }}>

      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Find a Caregiver</h2>

        <button onClick={handleLogout}>
          Logout <ArrowRight size={16} />
        </button>
      </div>

      <p>Welcome, {elderlyName}</p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "280px 1fr 280px",
        gap: "24px",
        marginTop: 20
      }}>

        {/* LEFT FILTERS */}
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
          <h3>Filters</h3>

          <p><b>💰Max Rate (Rs {maxRate})</b></p>
          <input
            type="range"
            min="500"
            max="2000"
            step="100"
            value={maxRate}
            onChange={(e) => setMaxRate(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />

          <p style={{ marginTop: 15 }}>
            <b>🕊 Min Patience ({minPatience}/5)</b>
          </p>

          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={minPatience}
            onChange={(e) => setMinPatience(parseInt(e.target.value))}
            style={{ width: "100%" }}
          />

          <p><b>🎯Activities</b></p>
          {activitiesList.map((act) => (
            <div key={act}>
              <input type="checkbox"
                onChange={() => toggleFilter(act, setActivityFilters)}
              /> {act}
            </div>
          ))}

          <p><b>🗣 Languages</b></p>
          {["Sinhala","English","Tamil"].map((lang) => (
            <div key={lang}>
              <input type="checkbox"
                onChange={() => toggleFilter(lang, setLanguageFilters)}
              /> {lang}
            </div>
          ))}

          <p><b>📍Locations</b></p>
          {sriLankaCities.map((city) => (
            <div key={city}>
              <input type="checkbox"
                onChange={() => toggleFilter(city, setLocationFilters)}
              /> {city}
            </div>
          ))}
        </div>

        {/* CAREGIVERS */}
        <div>
          <h3>{filteredCaregivers.length} Caregiver(s) Found</h3>

          {filteredCaregivers.map((cg, i) => (
            <div key={i} style={{
              border: "1px solid #ddd",
              padding: 12,
              marginBottom: 12,
              borderRadius: 10
            }}>
              <h3>👤 {cg.name}</h3>

              <p>📍Location: {cg.location}</p>
              <p>📞 Phone: {cg.phone || "N/A"}</p>
              <p>💰 Hourly Rate: Rs {cg.rate}/hr</p>
              <p>🧠 Experience: {cg.experience}</p>
              <p>🕊 Patience: {cg.patience}/5</p>
              <p>🗣 Languages: {cg.languages.join(", ") || "N/A"}</p>
              <p>🎯 Activities: {cg.activities.join(", ") || "N/A"}</p>

              <div style={{ display: "flex", gap: "10px", marginTop: 10 }}>

                <button
                  onClick={() => navigate(`/elderly/caregiver/${cg._id || cg.id}`)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    backgroundColor: "#d8b4fe",
                    border: "none",
                    borderRadius: "5px"
                  }}
                >
                  View Profile
                </button>

                <button
                  onClick={() => handleSendRequest(cg)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    backgroundColor: "#90ee90",
                    border: "none",
                    borderRadius: "5px"
                  }}
                >
                  Send Request
                </button>

              </div>
            </div>
          ))}
        </div>

        {/* SERVICE HISTORY */}
        <div>
          <h3>Service History</h3>

          {requests.length === 0 ? (
            <p>No requests yet</p>
          ) : (
            requests.map((req, index) => (
              <div key={index} style={{
                border: "1px solid #ccc",
                padding: 10,
                marginBottom: 10,
                borderRadius: 8
              }}>
                <p><b>Service Number: </b> {req.serviceNumber}</p>

                <p><b>Caregiver's Name: </b> 
                  {req.caregiverName || req.caregiver?.name || "N/A"}
                </p>

                <p><b>Date: </b> 
                  {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : "N/A"}
                </p>

                <p><b>Time: </b> 
                  {req.createdAt ? new Date(req.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}
                </p>

                <p><b>Status: </b> 
                  <span style={{ color: "orange" }}>{req.status}</span>
                </p>

              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default FindCaregiver;