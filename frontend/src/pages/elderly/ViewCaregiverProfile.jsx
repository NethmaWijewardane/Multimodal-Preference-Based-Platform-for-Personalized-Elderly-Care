import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ViewCaregiverProfile() {
  const { email } = useParams();
  const navigate = useNavigate();

  const elderlyUser = JSON.parse(localStorage.getItem("elderlyUser")) || {};
  const [caregiver, setCaregiver] = useState(null);
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const caregivers =
      JSON.parse(localStorage.getItem("caregivers")) || [];
    const found = caregivers.find(cg => cg.email === email);

    if (!found) navigate(-1);
    else setCaregiver(found);

    setRequests(
      JSON.parse(localStorage.getItem("elderlyRequests")) || []
    );
  }, [email, navigate]);

  if (!caregiver) return null;

  const existingRequest = requests.find(
    r =>
      r.elderlyEmail === elderlyUser.email &&
      r.caregiverEmail === caregiver.email
  );

  const sendRequest = () => {
    const newRequest = {
      id: Date.now().toString(),
      elderlyName: elderlyUser.name,
      elderlyEmail: elderlyUser.email,
      caregiverName: caregiver.name,
      caregiverEmail: caregiver.email,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    const updated = [...requests, newRequest];
    localStorage.setItem(
      "elderlyRequests",
      JSON.stringify(updated)
    );
    setRequests(updated);
  };

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
        <h2>{caregiver.name}</h2>

        {caregiver.profilePic && (
          <img
            src={caregiver.profilePic}
            alt="Profile"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "16px",
            }}
          />
        )}

        <p><strong>Email:</strong> {caregiver.email}</p>
        <p><strong>Location:</strong> {caregiver.location}</p>
        <p><strong>Experience:</strong> {caregiver.experience || "N/A"}</p>
        <p><strong>Hourly Rate:</strong> Rs. {caregiver.rate}/hr</p>
        <p>
          <strong>Languages:</strong>{" "}
          {caregiver.languages?.join(", ") || "N/A"}
        </p>
        <p>
          <strong>Activities:</strong>{" "}
          {caregiver.activities?.join(", ") || "N/A"}
        </p>

        <div style={{ marginTop: "20px" }}>
          {existingRequest ? (
            <strong
              style={{
                color:
                  existingRequest.status === "accepted"
                    ? "green"
                    : existingRequest.status === "declined"
                    ? "red"
                    : "#f39c12",
              }}
            >
              REQUEST {existingRequest.status.toUpperCase()}
            </strong>
          ) : (
            <button onClick={sendRequest}>Send Request</button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ViewCaregiverProfile;
