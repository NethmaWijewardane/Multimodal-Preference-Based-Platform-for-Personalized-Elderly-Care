import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ViewCaregiverProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const elderlyUser = JSON.parse(localStorage.getItem("elderlyUser")) || {};
  const [caregiver, setCaregiver] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);

  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const fetchCaregiver = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `http://localhost:5000/api/users/caregivers/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!res.ok) {
          navigate(-1);
          return;
        }

        const data = await res.json();
        setCaregiver(data);

        const reqRes = await fetch("http://localhost:5000/api/requests/my", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const reqData = await reqRes.json();

        setRequests(reqData);

        const myRequest = reqData.find(
          (r) => r.caregiver?._id === data._id
        );

        setRequestStatus(myRequest ? myRequest.status : null);

        const allFeedbacks =
          JSON.parse(localStorage.getItem("feedbacks")) || {};

        setFeedbacks(allFeedbacks[data.email] || []);

      } catch (err) {
        console.error("Error:", err);
        navigate(-1);
      }
    };

    fetchCaregiver();
  }, [id, navigate]);

  const sendRequest = async () => {
    try {
      const token = localStorage.getItem("token");
      const now = new Date();

      const res = await fetch("http://localhost:5000/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          caregiverId: caregiver._id,
          serviceNumber: requests.length + 1,
          requestDate: now.toLocaleDateString(),
          requestTime: now.toLocaleTimeString(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message);
      }

      setRequests((prev) => [...prev, data]);
      setRequestStatus("pending");

    } catch (err) {
      console.error("Request failed:", err);
      alert("Failed to send request");
    }
  };

  if (!caregiver) return null;

  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "auto" }}>
      <button onClick={() => navigate(-1)}>← Back</button>

      <div
        style={{
          marginTop: "24px",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
        }}
      >
        <h2> 👤 {caregiver.name}</h2>

        <p><strong> 📧 Email:</strong> {caregiver.email}</p>
        <p><strong> 📞 Phone:</strong> {caregiver.phone || "N/A"}</p>
        <p><strong> 📍 Location:</strong> {caregiver.location}</p>
        <p><strong> 🧠 Experience:</strong> {caregiver.experience || "N/A"}</p>
        <p><strong> 💰 Hourly Rate:</strong> Rs. {caregiver.hourlyRate}/hr</p>

        <p>
          <strong> 🗣 Languages:</strong>{" "}
          {caregiver.languages?.length
            ? caregiver.languages.join(", ")
            : "N/A"}
        </p>

        <p>
          <strong> 🎯 Activities:</strong>{" "}
          {caregiver.activities?.length
            ? caregiver.activities.join(", ")
            : "N/A"}
        </p>

        <p>
          <strong> 🕒 Working Hours:</strong>{" "}
          {caregiver.workingHours &&
          (caregiver.workingHours.start?.trim() ||
            caregiver.workingHours.end?.trim())
            ? `${caregiver.workingHours.start || "--"} - ${
                caregiver.workingHours.end || "--"
              }`
            : "N/A"}
        </p>
      </div>

      {/* REQUESTS */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      >
        <h3>Requests</h3>

        <div style={{ marginTop: "15px" }}>
          {requests
            .filter((r) => r.caregiver?._id === caregiver._id)
            .map((req, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ccc",
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 8,
                }}
              >
                <p><b>Service Number:</b> {req.serviceNumber}</p>
                <p><b>Date:</b> {req.requestDate}</p>
                <p><b>Time:</b> {req.requestTime}</p>

                <p>
                  <b>Status:</b>{" "}
                  <span
                    style={{
                      color:
                        req.status === "accepted"
                          ? "green"
                          : req.status === "declined"
                          ? "red"
                          : "darkgoldenrod",
                      fontWeight: "bold",
                      textTransform: "capitalize",
                    }}
                  >
                    {req.status}
                  </span>
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* FEEDBACKS */}
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "10px",
        }}
      >
        <h3>Feedbacks</h3>

        {feedbacks.length === 0 ? (
          <p>No feedback available</p>
        ) : (
          feedbacks.map((fb, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <strong>{fb.name}</strong>
              <p>{fb.comment}</p>
              <hr />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ViewCaregiverProfile;