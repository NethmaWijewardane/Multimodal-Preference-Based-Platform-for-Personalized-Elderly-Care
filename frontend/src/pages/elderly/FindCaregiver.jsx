import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

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
  const params = useParams(); // For viewing individual caregiver profile

  const [elderlyName, setElderlyName] = useState("");
  const [elderlyEmail, setElderlyEmail] = useState("");
  const [caregivers, setCaregivers] = useState([]);
  const [filteredCaregivers, setFilteredCaregivers] = useState([]);
  const [requestStatuses, setRequestStatuses] = useState({}); // tracks request status

  const [languageFilters, setLanguageFilters] = useState([]);
  const [experienceFilter, setExperienceFilter] = useState(""); // NEW filter
  const [activityFilters, setActivityFilters] = useState([]);
  const [locationFilters, setLocationFilters] = useState([]);
  const [maxRate, setMaxRate] = useState(2000);

  // Feedback state
  const [feedbackPanelOpen, setFeedbackPanelOpen] = useState(null); // email of caregiver
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);

  // Load caregivers and elderly info
  useEffect(() => {
    const elderlyUser = JSON.parse(localStorage.getItem("elderlyUser")) || {};
    setElderlyName(elderlyUser.name || "Elderly User");
    setElderlyEmail(elderlyUser.email || "");

    const storedCaregivers = JSON.parse(localStorage.getItem("caregivers")) || [];
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

  // Update filtered caregivers on filter change
  useEffect(() => {
    let result = caregivers;

    if (languageFilters.length > 0) {
      result = result.filter((cg) =>
        languageFilters.some((lang) => cg.languages.includes(lang))
      );
    }

    if (experienceFilter) {
      result = result.filter((cg) => {
        const years = parseInt(cg.experience) || 0;
        return years === parseInt(experienceFilter);
      });
    }

    if (activityFilters.length > 0) {
      result = result.filter((cg) =>
        activityFilters.some((act) => cg.activities.includes(act))
      );
    }

    if (locationFilters.length > 0) {
      result = result.filter((cg) =>
        locationFilters.includes(cg.location)
      );
    }

    result = result.filter((cg) => cg.rate <= maxRate);

    setFilteredCaregivers(result);
  }, [caregivers, languageFilters, experienceFilter, activityFilters, locationFilters, maxRate]);

  // Poll localStorage every 1s to get latest statuses
  useEffect(() => {
    const interval = setInterval(() => {
      const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
      const statuses = {};
      caregivers.forEach(cg => {
        const requests = allRequests[cg.email] || [];
        const myRequest = requests.find(r => r.email === elderlyEmail);
        if (myRequest) statuses[cg.email] = myRequest.status || "pending";
      });
      setRequestStatuses(statuses);
    }, 1000);

    return () => clearInterval(interval);
  }, [caregivers, elderlyEmail]);

  const toggleFilter = (value, setFn) => {
    setFn((prev) =>
      prev.includes(value)
        ? prev.filter((v) => v !== value)
        : [...prev, value]
    );
  };

  const handleLogout = () => {
    localStorage.removeItem("elderlyUser");
    navigate("/elderly/signin");
  };

  const sendRequest = (caregiver) => {
    const elderlyUser = { name: elderlyName, email: elderlyEmail };
    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    const caregiverEmail = caregiver.email;

    if (!allRequests[caregiverEmail]) allRequests[caregiverEmail] = [];

    const existingRequest = allRequests[caregiverEmail].find(
      (r) => r.email === elderlyUser.email
    );

    if (!existingRequest || existingRequest.status === "declined") {
      if (existingRequest) {
        existingRequest.status = "pending";
        existingRequest.sentAt = new Date().toISOString();
      } else {
        allRequests[caregiverEmail].push({
          name: elderlyUser.name,
          email: elderlyUser.email,
          sentAt: new Date().toISOString(),
          status: "pending",
        });
      }
      localStorage.setItem("caregiverRequests", JSON.stringify(allRequests));
      setRequestStatuses((prev) => ({ ...prev, [caregiverEmail]: "pending" }));
      alert(`Request sent to ${caregiver.name}`);
    } else {
      alert("You already sent a request to this caregiver");
    }
  };

  const getStatusForProfile = (cgEmail) => {
    const allRequests = JSON.parse(localStorage.getItem("caregiverRequests")) || {};
    const requests = allRequests[cgEmail] || [];
    const myRequest = requests.find(r => r.email === elderlyEmail);
    return myRequest ? myRequest.status : null;
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
    setFeedbackPanelOpen(null);
    setFeedbackText("");
    setFeedbackRating(0);
    alert("Feedback submitted successfully");
  };

  const getFeedbacks = (cgEmail) => {
    const allFeedbacks = JSON.parse(localStorage.getItem("caregiverFeedbacks")) || {};
    return allFeedbacks[cgEmail] || [];
  };

  return (
    <div style={{ padding: "24px" }}>
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
                onChange={() =>
                  toggleFilter(lang, setLanguageFilters)
                }
              />{" "}
              {lang}
            </div>
          ))}

          <p style={{ marginTop: "16px" }}><strong>Experience (Years)</strong></p>
          <select
            value={experienceFilter}
            onChange={(e) => setExperienceFilter(e.target.value)}
            style={{ width: "100%", padding: "4px" }}
          >
            <option value="">Any</option>
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1} years</option>
            ))}
          </select>

          <p style={{ marginTop: "16px" }}><strong>Activities</strong></p>
          {activitiesList.map((activity) => (
            <div key={activity}>
              <input
                type="checkbox"
                onChange={() =>
                  toggleFilter(activity, setActivityFilters)
                }
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
                  onChange={() =>
                    toggleFilter(city, setLocationFilters)
                  }
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

          {filteredCaregivers.map((cg, index) => {
            const status = getStatusForProfile(cg.email);
            const feedbacks = getFeedbacks(cg.email);
            const avgRating = feedbacks.length
              ? (feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1)
              : null;

            return (
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
                <p>📍Location: {cg.location}</p>
                <p>🕒Years of Experience: {cg.experience}</p>
                <p>💬Languages: {cg.languages.join(", ")}</p>
                <p>🧩Activities: {cg.activities.join(", ")}</p>
                <p>💰Cost per Hour: Rs. {cg.rate}/hr</p>
                {avgRating && <p>⭐ Average Rating: {avgRating} / 5 ({feedbacks.length} feedbacks)</p>}
                
                <div style={{ marginTop: "12px" }}>
                  <button
                    style={{ marginRight: "12px" }}
                    onClick={() =>
                      navigate(`/elderly/caregiver/${cg.email}`)
                    }
                  >
                    View Profile
                  </button>

                  {status && status !== "declined" ? (
                    <>
                      <button disabled style={{ marginRight: "8px" }}>
                        {status === "pending"
                          ? "Request Pending"
                          : "Request Accepted"}
                      </button>
                      {status === "accepted" && (
                        <button
                          onClick={() =>
                            setFeedbackPanelOpen(cg.email)
                          }
                        >
                          Give Feedback
                        </button>
                      )}
                    </>
                  ) : (
                    <button onClick={() => sendRequest(cg)}>Send Request</button>
                  )}
                </div>

                {/* Feedback Panel */}
                {feedbackPanelOpen === cg.email && (
                  <div style={{ marginTop: "12px", padding: "12px", border: "1px solid #ccc", borderRadius: "8px" }}>
                    <textarea
                      placeholder="Write your feedback..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      style={{ width: "100%", marginBottom: "8px", padding: "8px" }}
                    />
                    <div style={{ marginBottom: "8px" }}>
                      {Array.from({ length: 5 }, (_, i) => (
                        <span
                          key={i}
                          style={{
                            fontSize: "20px",
                            cursor: "pointer",
                            color: feedbackRating > i ? "#f39c12" : "#ccc"
                          }}
                          onClick={() => setFeedbackRating(i + 1)}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                    <button onClick={() => handleSubmitFeedback(cg.email)}>Submit Feedback</button>
                    <button onClick={() => setFeedbackPanelOpen(null)} style={{ marginLeft: "8px" }}>Cancel</button>
                  </div>
                )}

                {/* Show existing feedbacks */}
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
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default FindCaregiver;
