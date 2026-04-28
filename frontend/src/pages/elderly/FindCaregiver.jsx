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

  /* ---------------- LOAD CAREGIVERS FROM MONGODB ---------------- */
  const loadCaregivers = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/users/caregivers");
      const data = await res.json();

      const enriched = data.map((cg) => ({
        ...cg,
        languages: cg.languages || ["English"],
        activities: cg.activities || ["Walking", "Reading"],
        rate: cg.hourlyRate || 800,
        experience: cg.experience || "3 years",
        patience: cg.patience || 3,
      }));

      setCaregivers(enriched);
      setFilteredCaregivers(enriched);

    } catch (err) {
      console.error("❌ Error loading caregivers:", err);
    }
  };

  /* ---------------- INIT USER ---------------- */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("elderlyUser"));

    if (user) {
      setElderlyName(user.name);
      setElderlyEmail(user.email);
    } else {
      navigate("/elderly/signin");
    }

    loadCaregivers();
  }, [navigate]);

  /* ---------------- FILTER LOGIC ---------------- */
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

  /* ---------------- TOGGLE FILTER ---------------- */
  const toggleFilter = (value, setFn) => {
    setFn((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  /* ---------------- LOGOUT ---------------- */
  const handleLogout = () => {
    localStorage.removeItem("elderlyUser");
    navigate("/elderly/signin");
  };

  return (
    <div style={{ padding: 24 }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <h2>Find a Caregiver</h2>

        <button onClick={handleLogout}>
          Logout <ArrowRight size={16} />
        </button>
      </div>

      <p>Welcome, {elderlyName}</p>

      {/* ================= 3 COLUMN LAYOUT ================= */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr 280px",
          gap: "24px",
          marginTop: 20
        }}
      >

        {/* ================= FILTERS ================= */}
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>

          <h3>Filters</h3>

          {/* Activities */}
          <p><b>Activities</b></p>
          {activitiesList.map((act) => (
            <div key={act}>
              <input
                type="checkbox"
                onChange={() => toggleFilter(act, setActivityFilters)}
              /> {act}
            </div>
          ))}

          {/* Languages */}
          <p style={{ marginTop: 12 }}><b>Languages</b></p>
          {["Sinhala","English","Tamil"].map((lang) => (
            <div key={lang}>
              <input
                type="checkbox"
                onChange={() => toggleFilter(lang, setLanguageFilters)}
              /> {lang}
            </div>
          ))}

          {/* Locations */}
          <p style={{ marginTop: 12 }}><b>📍 Locations</b></p>

          <div style={{ maxHeight: 180, overflowY: "auto", border: "1px solid #eee", padding: 6 }}>
            {sriLankaCities.map((city) => (
              <div key={city}>
                <input
                  type="checkbox"
                  onChange={() => toggleFilter(city, setLocationFilters)}
                /> {city}
              </div>
            ))}
          </div>

          {/* SLIDER 1 */}
          <p style={{ marginTop: 16 }}>
            <b>💰 Max Hourly Rate: Rs {maxRate}</b>
          </p>
          <input
            type="range"
            min="500"
            max="5000"
            step="100"
            value={maxRate}
            onChange={(e) => setMaxRate(Number(e.target.value))}
            style={{ width: "100%" }}
          />

          {/* SLIDER 2 */}
          <p style={{ marginTop: 16 }}>
            <b>🕊 Min Patience Level: {minPatience}/5</b>
          </p>
          <input
            type="range"
            min="1"
            max="5"
            step="1"
            value={minPatience}
            onChange={(e) => setMinPatience(Number(e.target.value))}
            style={{ width: "100%" }}
          />

        </div>

        {/* ================= CAREGIVERS ================= */}
        <div>
          <h3>{filteredCaregivers.length} Caregiver(s) Found</h3>

          {filteredCaregivers.map((cg, i) => (
            <div
              key={i}
              style={{
                border: "1px solid #ddd",
                padding: 12,
                marginBottom: 12,
                borderRadius: 10
              }}
            >
              <h3>{cg.name}</h3>
              <p>📍 {cg.location}</p>
              <p>💰 Rs {cg.rate}/hr</p>
              <p>🕊 Patience: {cg.patience}/5</p>

              <button onClick={() => alert("Request sent")}>
                Send Request
              </button>
            </div>
          ))}
        </div>

        {/* ================= SERVICE HISTORY ================= */}
        <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 10 }}>
          <h3>Service History</h3>
          <p>No service history yet.</p>
        </div>

      </div>
    </div>
  );
}

export default FindCaregiver;