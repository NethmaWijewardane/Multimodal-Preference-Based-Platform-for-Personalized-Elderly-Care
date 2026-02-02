import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function ViewCaregiverProfile() {
  const { email } = useParams();
  const navigate = useNavigate();

  const elderlyUser = JSON.parse(localStorage.getItem("elderlyUser")) || {};
  const [caregiver, setCaregiver] = useState(null);
  const [requestStatus, setRequestStatus] = useState(null);

  useEffect(() => {
    const caregivers =
      JSON.parse(localStorage.getItem("caregivers")) || [];
    const found = caregivers.find(cg => cg.email === email);

    if (!found) {
      navigate(-1);
      return;
    }

    setCaregiver(found);

    const allRequests =
      JSON.parse(localStorage.getItem("caregiverRequests")) || {};

    const caregiverRequests = allRequests[email] || [];
    const myRequest = caregiverRequests.find(
      r => r.email === elderlyUser.email
    );

    setRequestStatus(myRequest ? myRequest.status : null);
  }, [email, elderlyUser.email, navigate]);

  const sendRequest = () => {
    const allRequests =
      JSON.parse(localStorage.getItem("caregiverRequests")) || {};

    if (!allRequests[caregiver.email]) {
      allRequests[caregiver.email] = [];
    }

    const existing = allRequests[caregiver.email].find(
      r => r.email === elderlyUser.email
    );

    if (!existing || existing.status === "declined") {
      if (existing) {
        existing.status = "pending";
        existing.sentAt = new Date().toISOString();
      } else {
        allRequests[caregiver.email].push({
          name: elderlyUser.name,
          email: elderlyUser.email,
          status: "pending",
          sentAt: new Date().toISOString(),
        });
      }

      localStorage.setItem(
        "caregiverRequests",
        JSON.stringify(allRequests)
      );

      setRequestStatus("pending");
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
          {requestStatus ? (
            <strong
              style={{
                color:
                  requestStatus === "accepted"
                    ? "green"
                    : requestStatus === "declined"
                    ? "red"
                    : "#f39c12",
              }}
            >
              REQUEST {requestStatus.toUpperCase()}
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
