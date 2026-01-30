import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../components/AuthLayout";
import AuthForm from "../../components/AuthForm";

function CaregiverSignIn() {
  const navigate = useNavigate();

  useEffect(() => {
    const loggedIn = JSON.parse(localStorage.getItem("loggedInCaregiver"));
    if (loggedIn) {
      navigate("/caregiver/dashboard");
    }
  }, [navigate]);

  const handleLoginSuccess = (userData) => {
    localStorage.setItem(
      "loggedInCaregiver",
      JSON.stringify({
        ...userData,
        activities: userData.activities || [],
      })
    );

    navigate("/caregiver/dashboard");
  };

  return (
    <AuthLayout title="Sign In" subtitle="Welcome back! Please sign in to continue.">
      <AuthForm
        type="signin"
        defaultRole="caregiver"
        onSuccess={handleLoginSuccess}
      />
    </AuthLayout>
  );
}

export default CaregiverSignIn;
