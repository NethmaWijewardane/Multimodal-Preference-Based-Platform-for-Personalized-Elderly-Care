import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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

const activitiesList = [
  "Walking",
  "Cooking",
  "Crafts",
  "Reading",
  "Gardening",
  "Games",
  "TV",
];

function FindCaregiver() {
  const navigate = useNavigate();

  const [elderlyName, setElderlyName] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);

  const [languageFilters, setLanguageFilters] = useState([]);
  const [activityFilters, setActivityFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [maxRate, setMaxRate] = useState(2000);

  useEffect(() => {
    // ✅ Get current logged-in elderly
    const elderlyUser =
      JSON.parse(localStorage.getItem("loggedInElderly")) || {};
    setElderlyName(elderlyUser.name || "Elderly User");

    // Get caregivers
    const storedCaregivers =
      JSON.parse(localStorage.getItem("caregivers")) || [];

    const enrichedCaregivers = storedCaregivers.map((cg) => ({
      ...cg,
      languages: cg.languages || ["English"],
      activities: cg.activities || ["Walking", "Reading"],
      rate: cg.rate || 800,
      experience: cg.experience || "3 years",
    }));

    setCaregivers(enrichedCaregivers);
    setFilteredCaregivers(enrichedCaregivers);
  }, []);

  // Apply filters
  useEffect(() => {
    let result = caregivers;

    if (languageFilters.length > 0) {
      result = result.filter((cg) =>
        languageFilters.some((lang) => cg.languages.includes(lang))
      );
    }

    if (activityFilters.length > 0) {
      result = result.filter((cg) =>
        activityFilters.some((act) => cg.activities.includes(act))
      );
    }

    if (locationFilters.length > 0) {
      result = result.filter((cg) => locationFilters.includes(cg.location));
    }

    result = result.filter((cg) => cg.rate <= maxRate);

    setFilteredCaregivers(result);
  }, [caregivers, languageFilters, activityFilters, locationFilters, maxRate]);

  const toggleFilter = (value, setFn) => {
    setFn((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("loggedInElderly");
    navigate("/elderly/signin");
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1>Find a Caregiver</h1>
          <p>
            Welcome, <strong>{elderlyName}</strong>
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            border: "1px solid #e5e7eb",
            background: "#fff",
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: "flex", gap: "24px" }}>
        {/* FILTERS */}
        <div
          style={{
            width: "280px",
            padding: "16px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            height: "fit-content",
          }}
        >
          <h3>Filters</h3>

          <p><strong>Languages</strong></p>
          {["Sinhala", "English", "Tamil"].map((lang) => (
            <div key={lang}>
              <input
                type="checkbox"
                onChange={() => toggleFilter(lang, setLanguageFilters)}
              />{" "}
              {lang}
            </div>
          ))}

          <p style={{ marginTop: "16px" }}><strong>Activities</strong></p>
          {activitiesList.map((activity) => (
            <div key={activity}>
              <input
                type="checkbox"
                onChange={() => toggleFilter(activity, setActivityFilters)}
              />{" "}
              {activity}
            </div>
          ))}

          <p style={{ marginTop: "16px" }}><strong>Locations</strong></p>
          <div style={{ maxHeight: "160px", overflowY: "auto" }}>
            {sriLankaCities.map((city) => (
              <div key={city}>
                <input
                  type="checkbox"
                  onChange={() => toggleFilter(city, setLocationFilters)}
                />{" "}
                {city}
              </div>
            ))}
          </div>

          <p style={{ marginTop: "16px" }}>
            <strong>Max Hourly Rate: Rs. {maxRate}</strong>
          </p>
          <input
            type="range"
            min="500"
            max="3000"
            step="100"
            value={maxRate}
            onChange={(e) => setMaxRate(Number(e.target.value))}
            style={{ width: "100%" }}
          />
        </div>

        {/* CAREGIVERS */}
        <div style={{ flex: 1 }}>
          <h2>{filteredCaregivers.length} Caregivers Found</h2>

          {filteredCaregivers.map((cg, index) => (
            <div
              key={index}
              style={{
                marginTop: "16px",
                padding: "16px",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
              }}
            >
              <h3>{cg.name || "Caregiver"}</h3>
              <p>📍 {cg.location}</p>
              <p>🕒 {cg.experience}</p>
              <p>💬 {cg.languages.join(", ")}</p>
              <p>🧩 {cg.activities.join(", ")}</p>
              <p>💰 Rs. {cg.rate}/hr</p>

              <div style={{ marginTop: "12px" }}>
                <button style={{ marginRight: "12px" }}>View Profile</button>
                <button>Send Request</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FindCaregiver;
